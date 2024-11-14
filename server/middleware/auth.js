// const express = require('express');
// const helmet = require('helmet');
// const router = express.Router();
// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const sendEmail = require('../utils/sendEmail');
// const authMiddleware = require('./authMiddleware');
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');
// const rateLimit = require('express-rate-limit');
// const { body, validationResult } = require('express-validator');
// const crypto = require('crypto');

// const upload = multer({ dest: 'uploads/' });

// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: 'Too many login attempts from this IP, please try again after 15 minutes'
// });

// router.use(helmet());

// router.post('/add-students', authMiddleware, upload.single('file'), async (req, res) => {
//   if (req.user.role !== 'rootAdmin') {
//     return res.status(403).json({ message: 'Unauthorized' });
//   }

//   const results = [];
//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on('data', (data) => results.push(data))
//     .on('end', async () => {
//       try {
//         for (let student of results) {
//           const initialPassword = crypto.randomBytes(8).toString('hex');
//           const hashedPassword = await bcrypt.hash(initialPassword, 12);
//           const user = new User({
//             email: student.email,
//             password: hashedPassword,
//             role: 'student',
//             isVerified: true,
//             mustChangePassword: true
//           });
//           await user.save();
//           await sendEmail(student.email, 'Your Initial Password', `Your initial password is: ${initialPassword}. Please log in and change your password immediately.`);
//         }
//         res.json({ message: 'Students added successfully' });
//       } catch (error) {
//         res.status(500).json({ message: 'Error adding students', error: error.message });
//       }
//       fs.unlinkSync(req.file.path);
//     });
// });

// router.post('/login', loginLimiter, [
//   body('email').isEmail().normalizeEmail(),
//   body('password').isLength({ min: 6 }).trim().escape()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     if (!user.isVerified) {
//       return res.status(401).json({ message: 'Please verify your email before logging in' });
//     }
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
//     user.lastLogin = Date.now();
//     await user.save();
//     res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });
//     res.json({ 
//       user: { id: user._id, email: user.email, role: user.role },
//       mustChangePassword: user.mustChangePassword
//     });
//   } catch (error) {
//     res.status(500).json({ message: 'Error logging in', error: error.message });
//   }
// });

// router.post('/change-password', authMiddleware, [
//   body('currentPassword').isLength({ min: 6 }).trim().escape(),
//   body('newPassword').isLength({ min: 6 }).trim().escape()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { currentPassword, newPassword } = req.body;
//     const user = req.user;
//     if (!(await bcrypt.compare(currentPassword, user.password))) {
//       return res.status(401).json({ message: 'Current password is incorrect' });
//     }
//     user.password = await bcrypt.hash(newPassword, 12);
//     user.mustChangePassword = false;
//     await user.save();
//     res.json({ message: 'Password changed successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error changing password', error: error.message });
//   }
// });

// router.get('/verify-email/:token', async (req, res) => {
//   try {
//     const user = await User.findOne({
//       verificationToken: req.params.token,
//       verificationTokenExpires: { $gt: Date.now() }
//     });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired verification token' });
//     }
//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;
//     await user.save();
//     res.json({ message: 'Email verified successfully. You can now log in.' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error verifying email', error: error.message });
//   }
// });

// router.post('/request-password-reset', [
//   body('email').isEmail().normalizeEmail()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const resetToken = crypto.randomBytes(32).toString('hex');
//     user.passwordResetToken = resetToken;
//     user.passwordResetExpires = Date.now() + 3600000;
//     await user.save();

//     const resetUrl = `https://yourapp.com/reset-password/${resetToken}`;
//     await sendEmail(email, 'Password Reset Request', `Please reset your password by clicking the following link: ${resetUrl}`);

//     res.json({ message: 'Password reset link sent to your email' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error requesting password reset', error: error.message });
//   }
// });

// router.post('/reset-password/:token', [
//   body('newPassword').isLength({ min: 6 }).trim().escape()
// ], async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const user = await User.findOne({
//       passwordResetToken: req.params.token,
//       passwordResetExpires: { $gt: Date.now() }
//     });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid or expired password reset token' });
//     }

//     user.password = await bcrypt.hash(req.body.newPassword, 12);
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save();

//     res.json({ message: 'Password reset successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error resetting password', error: error.message });
//   }
// });

// module.exports = router;