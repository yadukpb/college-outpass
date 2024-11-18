require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const registerEmail = require('./register-email');
const { User, Department, Class, Student, Staff, Outpass, Message, Chat, Notification } = require('./models/model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sendEmail } = require('./controllers/sendEmail');
const crypto = require('node:crypto');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['set-cookie']
}));
app.use(express.json());

connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(error => {
  console.error('Database connection failed:', error);
});


app.post('/api/departments', async (req, res) => {
  const { name, hod, branches } = req.body;
  try {
    const department = new Department({ name, hod });
    await department.save();
    if (branches && branches.length > 0) {
      const branchPromises = branches.map(branch => {
        return new Branch({ name: branch.name, department: department._id, year: branch.year, isActive: branch.isActive, coordinator: branch.coordinator }).save();
      });
      await Promise.all(branchPromises);
    }
    res.status(201).json({ message: 'Department and branches created successfully', data: department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Error creating department' });
  }
});


app.post('/api/register-staff', async (req, res) => {
  const { name, email, role, department, branch } = req.body

  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const userData = {
      name,
      email,
      password: 'helloworld',
      role: role.toLowerCase(),
      isVerified: false
    }

    if (role.toLowerCase() === 'hod') {
      userData.department = department
    } else if (role.toLowerCase() === 'coordinator') {
      userData.department = department
      userData.branch = branch
    }

    const newStaff = new User(userData)
    await newStaff.save()

    return res.status(201).json({ 
      message: 'Staff registered successfully',
      staff: {
        id: newStaff._id,
        name,
        email,
        role,
        department,
        branch
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Error registering staff' })
  }
})

app.post('/api/outpass', async (req, res) => {
  try {
    const { outpassType, reason, destination, dateOfGoing, timeOfGoing, dateOfArrival, timeOfArrival, studentId } = req.body

    const student = await Student.findById(studentId)
    if (!student || !student.coordinator || !student.hod || !student.warden) {
      return res.status(400).json({
        success: false,
        message: 'Student must have coordinator, HOD and warden assigned before creating outpass'
      })
    }

    const outpass = new Outpass({
      outpassType,
      student: studentId,
      destination,
      reason,
      dateOfGoing: new Date(`${dateOfGoing}T${timeOfGoing}`),
      timeOfGoing,
      dateOfArrival: new Date(`${dateOfArrival}T${timeOfArrival}`),
      timeOfArrival,
      status: 'Pending',
      currentApprover: 'coordinator'
    })

    await outpass.save()
    res.status(201).json({ success: true, data: outpass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.post('/api/outpass/:outpassId/approve', async (req, res) => {
  try {
    const { outpassId } = req.params;
    const { approverRole, status, remarks } = req.body;

    const outpass = await Outpass.findById(outpassId);
    if (!outpass) {
      return res.status(404).json({ success: false, message: 'Outpass not found' });
    }

    if (outpass.currentApprover !== approverRole) {
      return res.status(400).json({ success: false, message: 'Invalid approver for current stage' });
    }

    outpass[`${approverRole}Approval`] = {
      status,
      timestamp: new Date(),
      remarks
    };

    if (status === 'Rejected') {
      outpass.status = 'Rejected';
    } else if (status === 'Approved') {
      if (approverRole === 'coordinator') {
        outpass.currentApprover = 'warden';
      } else if (approverRole === 'warden') {
        outpass.currentApprover = 'hod';
      } else if (approverRole === 'hod') {
        outpass.status = 'Approved';
        outpass.qrCode = {
          exit: crypto.randomBytes(32).toString('hex'),
          entry: crypto.randomBytes(32).toString('hex')
        };
      }
    }

    await outpass.save();
    res.status(200).json({ success: true, data: outpass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/outpass/student/:studentId', async (req, res) => {
  try {
    const outpasses = await Outpass.find({ student: req.params.studentId })
      .populate('student')
      .sort({ createdAt: -1 })
    res.json({ success: true, data: outpasses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.get('/api/outpass/pending/:approverRole/:approverId', async (req, res) => {
  try {
    const { approverRole, approverId } = req.params

    let query = {
      currentApprover: approverRole,
      status: 'Pending'
    }

    if (approverRole === 'coordinator') {
      query.coordinator = approverId
    } else if (approverRole === 'warden') {
      query.warden = approverId
    } else if (approverRole === 'hod') {
      query.hod = approverId
    }

    const outpasses = await Outpass.find(query)
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 })

    res.json({ 
      success: true, 
      data: outpasses 
    })
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    })
  }
})

app.post('/api/register-email', registerEmail);



// Get HODs
app.get('/api/staff/hods', async (req, res) => {
  try {
    const hodUsers = await User.find({ role: 'hod' })
      .select('_id email')
      .lean();
    
    const hodsWithNames = hodUsers.map(user => ({
      _id: user._id,
      name: user.email.split('@')[0],
      email: user.email
    }));
    
    res.json(hodsWithNames);
  } catch (error) {
    console.error('Error fetching HODs:', error);
    res.status(500).json({ error: 'Failed to fetch HODs' });
  }
});

// Get Coordinators
app.get('/api/staff/coordinators', async (req, res) => {
  try {
    const coordinators = await User.find({ role: 'coordinator' })
      .select('_id email')
      .lean();
    
    const coordinatorsWithNames = coordinators.map(user => ({
      _id: user._id,
      name: user.email.split('@')[0],
      email: user.email
    }));
    
    res.json(coordinatorsWithNames);
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({ error: 'Failed to fetch coordinators' });
  }
});

// Get Wardens
app.get('/api/staff/wardens', async (req, res) => {
  try {
    const wardens = await User.find({ role: 'warden' })
      .select('_id email')
      .lean();
    
    const wardensWithNames = wardens.map(user => ({
      _id: user._id,
      name: user.email.split('@')[0],
      email: user.email
    }));
    
    res.json(wardensWithNames);
  } catch (error) {
    console.error('Error fetching wardens:', error);
    res.status(500).json({ error: 'Failed to fetch wardens' });
  }
});

// Update student's staff mapping
app.post('/api/student/update-staff-mapping', async (req, res) => {
  try {
    const { studentId, staffType, staffId } = req.body;

    if (!studentId || !staffType || !staffId) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== staffType) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid staff member' 
      });
    }

    student[staffType] = staffId;
    await student.save();

    res.json({ 
      success: true,
      message: 'Staff mapping updated successfully',
      updatedStudent: student
    });
  } catch (error) {
    console.error('Error updating staff mapping:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating staff mapping' 
    });
  }
});

// Security scan QR code endpoint
app.post('/api/security/scan-qr', async (req, res) => {
  try {
    const { qrCode, securityId, scanType } = req.body

    const security = await User.findOne({ 
      _id: securityId, 
      role: 'security' 
    })
    if (!security) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized security personnel' 
      })
    }

    const outpass = await Outpass.findOne({
      [`qrCode.${scanType}`]: qrCode,
      status: scanType === 'exit' ? 'Approved' : 'Active'
    }).populate('student')

    if (!outpass) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid or expired QR code' 
      })
    }

    outpass.securityCheckpoints[`${scanType}Scan`] = {
      scannedBy: securityId,
      timestamp: new Date(),
      status: 'Completed'
    }

    if (scanType === 'exit') {
      outpass.status = 'Active'
    } else if (scanType === 'entry') {
      outpass.status = 'Completed'
    }

    await outpass.save()

    res.json({ 
      success: true, 
      message: `${scanType} scan completed successfully`,
      data: outpass 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get QR code for student
app.get('/api/outpass/:outpassId/qr-code', async (req, res) => {
  try {
    const outpass = await Outpass.findById(req.params.outpassId)
      .populate('student')

    if (!outpass || outpass.status !== 'Approved') {
      return res.status(404).json({ 
        success: false, 
        message: 'No approved outpass found' 
      })
    }

    const qrCode = outpass.status === 'Approved' ? 
      outpass.qrCode.exit : 
      outpass.qrCode.entry

    res.json({ 
      success: true, 
      data: { qrCode } 
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      isVerified: user.isVerified
    }

    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('department', 'name')
        .populate('class', 'name')
        .populate('coordinator', 'name email')
        .populate('hod', 'name email')
        .lean()

      if (student) {
        userResponse.student = {
          id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          department: student.department,
          class: student.class,
          coordinator: student.coordinator,
          hod: student.hod,
          year: student.year,
          phoneNumber: student.phoneNumber
        }
        // Store student details in local storage (client-side implementation)
        // localStorage.setItem('student', JSON.stringify(userResponse.student));
      }
    }

    res.status(200).json({
      success: true,
      user: userResponse
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error during login' })
  }
})

app.post('/api/register-student', async (req, res) => {
  try {
    const {
      email,
      name,
      rollNo,
      classId,
      departmentId,
      year,
      phoneNumber,
      parentInfo
    } = req.body

    const hashedPassword = await bcrypt.hash('helloworld', 12)
    
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'student',
      isVerified: false,
      mustChangePassword: true
    })
    await newUser.save()

    const studentData = {
      user: newUser._id,
      name,
      rollNo,
      class: classId,
      department: departmentId,
      year,
      phoneNumber,
      parentInfo
    }

    const newStudent = new Student(studentData)
    await newStudent.save()

    const emailSubject = 'Welcome to Outpass System - Student Registration'
    const emailText = `Welcome to the Outpass System! Your temporary password is: ${tempPassword}`

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 10px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a73e8; margin: 0; font-size: 28px;">Welcome to Outpass System</h1>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #333; line-height: 1.5;">Your student account has been created. Here are your login credentials:</p>
        
        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><span style="color: #666;">Email:</span> <strong style="color: #333;">${email}</strong></p>
          <p style="margin: 0;"><span style="color: #666;">Temporary Password:</span> <strong style="color: #333;">${tempPassword}</strong></p>
        </div>
      </div>

      <div style="margin-top: 30px;">
        <p style="color: #666; font-size: 14px; margin: 0;">Please login and change your password.</p>
      </div>
    </div>
  </div>
</body>
</html>`

    //await sendEmail(email, emailSubject, emailText, emailHtml)

    return res.status(201).json({
      message: 'Student registered successfully',
      student: {
        id: newStudent._id,
        userId: newUser._id,
        name,
        email,
        rollNo,
        year,
        phoneNumber
      }
    })
  } catch (error) {
    console.error('Error registering student:', error)
    return res.status(500).json({ message: 'Error registering student' })
  }
})

app.post('/api/student/complete-profile', async (req, res) => {
  try {
    const {
      userId,
      name,
      rollNo,
      department,
      class: classId,
      year,
      phoneNumber,
      parentInfo,
      hodId,
      wardenId,
      coordinatorId
    } = req.body

    const studentData = {
      user: userId,
      name,
      rollNo,
      department,
      class: classId,
      year,
      phoneNumber,
      parentInfo,
      hod: hodId,
      warden: wardenId,
      coordinator: coordinatorId
    }

    const student = new Student(studentData)
    await student.save()

    res.status(201).json({
      success: true,
      message: 'Profile completed successfully',
      student
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing profile',
      error: error.message
    })
  }
})

app.get('/api/student/profile/:userId', async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.userId })
      .populate('department', 'name')
      .populate('class', 'name')
      .populate('coordinator', 'name email')
      .populate('hod', 'name email')
      .lean();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ success: false, message: 'Error fetching student profile' });
  }
});

app.get('/api/outpass/coordinator/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const outpasses = await Outpass.find({ coordinator: coordinatorId })
      .populate('student', 'name')
      .populate('warden')
      .populate('hod')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: outpasses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/outpass/warden/:wardenId', async (req, res) => {
  try {
    const { wardenId } = req.params;
    const outpasses = await Outpass.find({ warden: wardenId })
      .populate('student', 'name')
      .populate('coordinator')
      .populate('hod')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: outpasses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/outpass/:outpassId/hod-approve', async (req, res) => {
  try {
    const { outpassId } = req.params
    const { status, remarks } = req.body

    const outpass = await Outpass.findById(outpassId)
    if (!outpass) {
      return res.status(404).json({ success: false, message: 'Outpass not found' })
    }

    outpass.hodApproval = {
      status,
      timestamp: new Date(),
      remarks
    }

    if (status === 'Approved') {
      outpass.status = 'Approved'
      const outpassData = {
        id: outpass._id,
        student: outpass.student,
        dateOfGoing: outpass.dateOfGoing,
        dateOfArrival: outpass.dateOfArrival,
        destination: outpass.destination
      }
      
      outpass.qrCode = {
        exit: crypto.createHash('sha256')
          .update(JSON.stringify({ ...outpassData, type: 'exit' }))
          .digest('hex'),
        entry: crypto.createHash('sha256')
          .update(JSON.stringify({ ...outpassData, type: 'entry' }))
          .digest('hex')
      }
      
      outpass.securityCheckpoints = {
        exitScan: { status: 'Pending' },
        entryScan: { status: 'Pending' }
      }
      
      outpass.currentApprover = 'hod'
    } else {
      outpass.status = 'Rejected'
    }

    await outpass.save()
    res.status(200).json({ success: true, data: outpass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.get('/api/outpass/latest/:userId', async (req, res) => {
  try {
    // First find the student document using the userId
    const student = await Student.findOne({ user: req.params.userId });
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Now find the latest approved outpass for this student
    const latestOutpass = await Outpass.findOne({ 
      student: student._id,
      status: 'Approved'
    })
    .sort({ createdAt: -1 })
    .populate('student')
    .populate('coordinator')
    .populate('warden')
    .populate('hod')
    .lean();

    if (!latestOutpass) {
      return res.status(404).json({ 
        success: false, 
        message: 'No approved outpass found' 
      });
    }

    res.json({ 
      success: true, 
      data: latestOutpass
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.put('/api/student/update-profile/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const {
      name,
      rollNo,
      year,
      phoneNumber,
      parentInfo,
      hodId,
      wardenId,
      coordinatorId
    } = req.body

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name,
        rollNo,
        year,
        phoneNumber,
        parentInfo,
        hod: hodId,
        warden: wardenId,
        coordinator: coordinatorId
      },
      { new: true }
    )

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
});