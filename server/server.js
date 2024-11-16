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
  console.log('[STAFF-REGISTER] Received request:', { name: req.body.name, email: req.body.email, role: req.body.role, department: req.body.department, branch: req.body.branch })
  const { name, email, role, department, branch } = req.body

  try {
    const tempPassword = crypto.randomBytes(8).toString('hex')
    console.log('[STAFF-REGISTER] Generated temporary password:', tempPassword)

    const hashedPassword = await bcrypt.hash(tempPassword, 12)
    console.log('[STAFF-REGISTER] Hashed password generated')
    
    console.log('[STAFF-REGISTER] Checking for existing user with email:', email)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('[STAFF-REGISTER] User already exists with email:', email)
      return res.status(400).json({ message: 'Email already registered' })
    }

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role.toLowerCase(),
      isVerified: false
    }
    console.log('[STAFF-REGISTER] Created user data object:', { ...userData, password: 'HIDDEN' })

    if (role.toLowerCase() === 'hod') {
      userData.department = department
      console.log('[STAFF-REGISTER] Added HOD department:', department)
    } else if (role.toLowerCase() === 'coordinator') {
      userData.department = department
      userData.branch = branch
      console.log('[STAFF-REGISTER] Added coordinator details:', { department, branch })
    }

    const newStaff = new User(userData)
    console.log('[STAFF-REGISTER] Created new staff instance')
    
    await newStaff.save()
    console.log('[STAFF-REGISTER] Saved new staff to database with ID:', newStaff._id)

    const emailSubject = `Welcome to Outpass System - ${role}`
    const emailText = `Welcome to the Outpass System! Your temporary password is: ${tempPassword}`
    console.log('[STAFF-REGISTER] Prepared email content for:', email)

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
        <p style="font-size: 16px; color: #333; line-height: 1.5;">Your account has been created as ${role}. Here are your login credentials:</p>
        
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

    console.log('[STAFF-REGISTER] Sending welcome email to:', email)
    await sendEmail(email, emailSubject, emailText, emailHtml)
    console.log('[STAFF-REGISTER] Welcome email sent successfully')

    console.log('[STAFF-REGISTER] Registration completed successfully')
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
    console.error('[STAFF-REGISTER] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    console.error('[STAFF-REGISTER] Request body at time of error:', req.body)
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
    const { outpassId } = req.params
    const { approverRole, status, remarks } = req.body

    const outpass = await Outpass.findById(outpassId)
    if (!outpass) {
      return res.status(404).json({ success: false, message: 'Outpass not found' })
    }

    if (outpass.currentApprover !== approverRole) {
      return res.status(400).json({ success: false, message: 'Invalid approver for current stage' })
    }

    outpass[`${approverRole}Approval`] = {
      status,
      timestamp: new Date(),
      remarks
    }

    if (status === 'Rejected') {
      outpass.status = 'Rejected'
    } else if (status === 'Approved' && approverRole === 'hod') {
      outpass.status = 'Approved'
      // Generate unique QR codes
      outpass.qrCode = {
        exit: crypto.randomBytes(32).toString('hex'),
        entry: crypto.randomBytes(32).toString('hex')
      }
    } else if (status === 'Approved') {
      if (approverRole === 'coordinator') {
        outpass.currentApprover = 'warden'
      } else if (approverRole === 'warden') {
        outpass.currentApprover = 'hod'
      }
    }

    await outpass.save()
    res.json({ success: true, data: outpass })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

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
    const outpasses = await Outpass.find({
      currentApprover: approverRole,
      status: 'Pending',
      [`${approverRole}Approval.status`]: 'Pending'
    })
    .populate({
      path: 'student',
      match: { [approverRole]: approverId }
    })
    .sort({ createdAt: -1 })

    const filteredOutpasses = outpasses.filter(o => o.student !== null)
    res.json({ success: true, data: filteredOutpasses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

app.post('/api/register-email', registerEmail);

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

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
      }
    }

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    })

  } catch (error) {
    res.status(500).json({ message: 'Server error during login' })
  }
})

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

    // Verify security guard
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

    // Find outpass by QR code
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

    // Update security checkpoint
    outpass.securityCheckpoints[`${scanType}Scan`] = {
      scannedBy: securityId,
      timestamp: new Date(),
      status: 'Completed'
    }

    // Update outpass status
    if (scanType === 'exit') {
      outpass.status = 'Active'
    } else if (scanType === 'entry') {
      outpass.status = 'Completed'
    }

    await outpass.save()

    // Create notification for student
    const notification = new Notification({
      user: outpass.student.user,
      title: `Outpass ${scanType} Scan Completed`,
      message: `Your outpass has been ${scanType === 'exit' ? 'checked out' : 'checked in'} by security at ${new Date().toLocaleString()}`
    })
    await notification.save()

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

    // Return appropriate QR code based on outpass status
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

    const tempPassword = crypto.randomBytes(8).toString('hex')
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(tempPassword, salt)
    
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

    await sendEmail(email, emailSubject, emailText, emailHtml)

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
});