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
    console.log('[OUTPASS] Request received:', JSON.stringify(req.body))
    const {
      outpassType,
      reason,
      destination,
      contactNumber,
      dateOfGoing,
      timeOfGoing,
      dateOfArrival,
      timeOfArrival,
      student
    } = req.body

    console.log('[OUTPASS] Validating student fields:', JSON.stringify(student))
    if (!student.userId || !student.class || !student.department || 
        !student.coordinator || !student.hod) {
      console.log('[OUTPASS] Validation failed - Missing fields:', {
        userId: !student.userId,
        class: !student.class,
        department: !student.department,
        coordinator: !student.coordinator,
        hod: !student.hod
      })
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in student info'
      })
    }

    console.log('[OUTPASS] Looking up existing student with userId:', student.userId)
    let existingStudent = await Student.findOne({ user: student.userId })

    if (!existingStudent) {
      console.log('[OUTPASS] Creating new student record')
      existingStudent = new Student({
        user: student.userId,
        name: student.name,
        rollNo: student.rollNo,
        class: student.class,
        department: student.department,
        coordinator: student.coordinator,
        hod: student.hod,
        year: student.year,
        phoneNumber: student.phoneNumber,
        parentInfo: student.parentInfo
      })
      console.log('[OUTPASS] Saving new student:', JSON.stringify(existingStudent))
      await existingStudent.save()
      console.log('[OUTPASS] New student saved successfully')
    }

    console.log('[OUTPASS] Creating outpass record')
    const outpass = new Outpass({
      outpassType,
      student: existingStudent._id,
      destination,
      reason,
      dateOfGoing: new Date(`${dateOfGoing}T${timeOfGoing}`),
      timeOfGoing,
      dateOfArrival: new Date(`${dateOfArrival}T${timeOfArrival}`),
      timeOfArrival,
      status: 'Pending',
      currentApprover: 'warden',
      wardenApproval: { status: 'Pending', timestamp: new Date() },
      coordinatorApproval: { status: 'Pending' },
      hodApproval: { status: 'Pending' }
    })

    console.log('[OUTPASS] Saving outpass:', JSON.stringify(outpass))
    await outpass.save()
    console.log('[OUTPASS] Outpass saved successfully')

    res.status(201).json({
      success: true,
      message: 'Outpass created successfully',
      data: outpass
    })
  } catch (error) {
    console.error('[OUTPASS] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    console.error('[OUTPASS] Request body at time of error:', JSON.stringify(req.body))
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating outpass'
    })
  }
})

app.post('/api/register-email', registerEmail);

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    let userDetails = {
      _id: user._id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };

    // If user is a student, fetch their details
    if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id })
        .populate('department')
        .populate('class')
        .populate('coordinator')
        .populate('hod');

      if (student) {
        userDetails = {
          ...userDetails,
          departmentId: student.department?._id || null,
          classId: student.class?._id || null,
          coordinatorId: student.coordinator?._id || null,
          hodId: student.hod?._id || null,
          studentDetails: {
            name: student.name,
            rollNo: student.rollNo,
            year: student.year,
            phoneNumber: student.phoneNumber
          }
        };
      } else {
        // Create placeholder student record if not exists
        const defaultDepartment = await Department.findOne();
        const defaultClass = await Class.findOne({ department: defaultDepartment?._id });
        const coordinator = await User.findOne({ role: 'coordinator' });
        const hod = await User.findOne({ role: 'hod' });

        const newStudent = new Student({
          user: user._id,
          name: email.split('@')[0], // Temporary name from email
          rollNo: 'NOT_ASSIGNED',
          department: defaultDepartment?._id,
          class: defaultClass?._id,
          coordinator: coordinator?._id,
          hod: hod?._id,
          year: new Date().getFullYear().toString(),
          phoneNumber: 'NOT_ASSIGNED'
        });

        await newStudent.save();

        userDetails = {
          ...userDetails,
          departmentId: defaultDepartment?._id || null,
          classId: defaultClass?._id || null,
          coordinatorId: coordinator?._id || null,
          hodId: hod?._id || null,
          studentDetails: {
            name: newStudent.name,
            rollNo: newStudent.rollNo,
            year: newStudent.year,
            phoneNumber: newStudent.phoneNumber
          }
        };
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      success: true,
      token,
      user: userDetails
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (error) => {
  console.error('Error starting server:', error);
});