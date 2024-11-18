const crypto = require('crypto');
const { User } = require('./models/model');
const { sendEmail } = require('./controllers/sendEmail');

const registerEmail = async (req, res) => {
  const { emails } = req.body;

  console.log('Received emails:', emails);

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    console.log('No valid emails provided');
    return res.status(400).json({ message: 'No emails provided' });
  }

  try {
    const createdUsers = [];

    for (const email of emails) {
      console.log('Processing email:', email);
      const tempPassword = 'helloworld';
      
      const existingUser = await User.findOne({ email });
      console.log('Existing user:', existingUser);
      if (existingUser) {
        console.log('User already exists, skipping:', email);
        continue;
      }

      const newUser = new User({
        email,
        password: tempPassword,
        role: 'student',
        isVerified: false,
      });

      try {
        await newUser.save();
        console.log('User created:', newUser);
        createdUsers.push(newUser);
      } catch (saveError) {
        console.log('Error saving user:', saveError);
        continue;
      }
    }

    console.log('Users created successfully:', createdUsers);
    return res.status(201).json({ message: 'Users created successfully', users: createdUsers });
  } catch (error) {
    console.log('Error during registration:', error);
    return res.status(500).json({ message: 'Error registering emails' });
  }
};

module.exports = registerEmail;