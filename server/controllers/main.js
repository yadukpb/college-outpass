// // outpass/server/controllers/outpassController.js

// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail');

// // ... other controller functions ...

// // outpass/server/controllers/outpassController.js


// exports.addUsers = async (req, res) => {
//     try {
//       const { users } = req.body;
//       if (!Array.isArray(users) || users.length === 0) {
//         return res.status(400).json({ message: 'Please provide an array of user objects' });
//       }
//       const results = [];
//       for (const user of users) {
//         const { email, role } = user;
//         if (!email || !role) {
//           results.push({ email, status: 'Invalid data' });
//           continue;
//         }
//         let existingUser = await User.findOne({ email });
//         if (existingUser) {
//           results.push({ email, status: 'Already exists' });
//           continue;
//         }
//         const tempPassword = crypto.randomBytes(8).toString('hex');
//         const tempToken = crypto.randomBytes(32).toString('hex');
//         const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
//         const hashedPassword = await bcrypt.hash(tempPassword, 12);
//         const newUser = new User({
//           email,
//           password: hashedPassword,
//           role,
//           isVerified: false,
//           tempToken,
//           tempTokenExpires: tokenExpiration
//         });
//         await newUser.save();
//         const tempLink = `${process.env.FRONTEND_URL}/complete-registration/${tempToken}`;
//         const emailSubject = `${role.charAt(0).toUpperCase() + role.slice(1)} Account Created`;
//         const emailText = `Your ${role} account has been created.\nYour temporary password is: ${tempPassword}\nYou can also use this link to complete your registration: ${tempLink}\nThis link and password will expire in 24 hours. Please log in and change your password immediately.`;
//         const emailHtml = `
//           <h1>${role.charAt(0).toUpperCase() + role.slice(1)} Account Created</h1>
//           <p>Your ${role} account has been created.</p>
//           <p>Your temporary password is: <strong>${tempPassword}</strong></p>
//           <p>You can also use this link to complete your registration: <a href="${tempLink}">${tempLink}</a></p>
//           <p>This link and password will expire in 24 hours. Please log in and change your password immediately.</p>
//         `;
//         await sendEmail(email, emailSubject, emailText, emailHtml);
//         results.push({ email, status: 'Added successfully', role });
//       }
//       res.status(201).json({
//         message: 'User accounts processed',
//         results
//       });
//     } catch (error) {
//       console.error('Error adding users:', error);
//       res.status(500).json({ message: 'Error adding users', error: error.message });
//     }
//   };

//   // outpass/server/middleware/auth.js

// router.post('/login', loginLimiter, [
//     body('email').isEmail().normalizeEmail(),
//     body('password').isLength({ min: 6 }).trim().escape(),
//     body('token').optional().isString()
//   ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
  
//     try {
//       const { email, password, token } = req.body;
//       let user;
  
//       if (token) {
//         // If a token is provided, try to find a user with this token
//         user = await User.findOne({
//           email,
//           tempToken: token,
//           tempTokenExpires: { $gt: Date.now() }
//         });
  
//         if (!user) {
//           return res.status(401).json({ message: 'Invalid or expired token' });
//         }
//       } else {
//         // If no token, use regular password authentication
//         user = await User.findOne({ email });
//         if (!user || !(await bcrypt.compare(password, user.password))) {
//           return res.status(401).json({ message: 'Invalid credentials' });
//         }
//       }
  
//       // Generate JWT token
//       const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
//       res.json({ 
//         token: jwtToken, 
//         user: { 
//           id: user._id, 
//           email: user.email, 
//           role: user.role,
//           mustChangePassword: !user.isVerified || user.mustChangePassword
//         } 
//       });
//     } catch (error) {
//       res.status(500).json({ message: 'Error logging in', error: error.message });
//     }
//   });