const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { User } = require('./models/model');
const { sendEmail } = require('./controllers/sendEmail');

const registerEmail = async (req, res) => {
  console.log('Starting registration process with payload:', { emails: req.body.emails });
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    console.log('Validation failed:', { emails });
    return res.status(400).json({ message: 'No emails provided' });
  }

  try {
    const createdUsers = [];
    console.log(`Processing ${emails.length} emails`);

    for (const email of emails) {
      console.log(`Processing email: ${email}`);
      
      const tempPassword = crypto.randomBytes(8).toString('hex');
      console.log('Generated temporary password:', tempPassword);
      
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      console.log('Password hashing:', {
        originalPassword: tempPassword,
        hashedLength: hashedPassword.length
      });
      
      const tempToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiration = Date.now() + 24 * 60 * 60 * 1000;
      console.log('Token generated:', { tempToken, expires: new Date(tokenExpiration) });

      const existingUser = await User.findOne({ email });
      console.log('Existing user check:', { email, exists: !!existingUser });
      if (existingUser) {
        console.log(`Skipping existing user: ${email}`);
        continue;
      }

      let rollNo;
      let rollNoExists;
      let attempts = 0;
      do {
        rollNo = `21bcs${Math.floor(Math.random() * 10000)}`;
        rollNoExists = await User.findOne({ rollNo });
        attempts++;
        console.log('Roll number generation attempt:', { rollNo, exists: !!rollNoExists, attempt: attempts });
      } while (rollNoExists);

      const newUser = new User({
        email,
        password: hashedPassword,
        role: 'student',
        isVerified: false,
        tempToken,
        tempTokenExpires: tokenExpiration,
        rollNo,
      });
      console.log('New user object created:', { email, rollNo });

      await newUser.save();
      console.log('User saved successfully:', { email, rollNo });
      createdUsers.push(newUser);

      const tempLink = `${process.env.FRONTEND_URL}/complete-registration/${tempToken}`;
      console.log('Registration link generated:', { tempLink });

      const emailSubject = 'Complete Your Registration -  Outpass System';
      const emailText = `Welcome to IIIT Dharwad Outpass System!
Your temporary password is: ${tempPassword}
Please complete your registration by clicking on this link: ${tempLink}
This link will expire in 24 hours.`;

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
        <h1 style="color: #1a73e8; margin: 0; font-size: 28px;">Welcome to Amrita Outpass System</h1>
      </div>
      
      <div style="margin-bottom: 30px;">
        <p style="font-size: 16px; color: #333; line-height: 1.5;">Your account has been successfully created. Here are your login credentials:</p>
        
        <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><span style="color: #666;">Roll Number:</span> <strong style="color: #333;">${rollNo}</strong></p>
          <p style="margin: 0;"><span style="color: #666;">Temporary Password:</span> <strong style="color: #333;">${tempPassword}</strong></p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Please click the button below to complete your registration:</p>
        <a href="${tempLink}" style="display: inline-block; background-color: #1a73e8; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Complete Registration</a>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
        <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="color: #1a73e8; word-break: break-all; font-size: 14px;">${tempLink}</p>
      </div>

      <div style="margin-top: 30px;">
        <p style="color: #666; font-size: 14px; margin: 0;">This link will expire in 24 hours.</p>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #666; font-size: 12px;">© ${new Date().getFullYear()} Amrita Outpass System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

      console.log('Sending email to:', email);
      await sendEmail(email, emailSubject, emailText, emailHtml);
      console.log('Email sent successfully to:', email);
    }

    console.log('Registration process completed successfully:', { createdUsersCount: createdUsers.length });
    return res.status(201).json({ message: 'Users created and emails sent successfully', users: createdUsers });
  } catch (error) {
    console.error('Error in registration process:', {
      error: error.message,
      stack: error.stack,
      phase: error.phase || 'unknown'
    });
    return res.status(500).json({ message: 'Error registering emails' });
  }
};

module.exports = registerEmail;