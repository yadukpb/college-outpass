// require('dotenv').config();
// const mongoose = require('mongoose');
// const User = require('../models/User');
// const bcrypt = require('bcrypt');

// const users = [
//   { name: 'Ananthu', rollNo: 'S123', email: 'ananthu@gmail.com', password: 'student123', role: 'student', coordinator: 'coordinator@example.com' },
//   { name: 'Warden', email: 'warden@gmail.com', password: 'warden123', role: 'warden' },
//   { name: 'HOD', email: 'hod@gmail.com', password: 'hod123', role: 'hod', department: 'Computer Science' },
//   { name: 'Coordinator', email: 'coordinator@gmail.com', password: 'coordinator123', role: 'coordinator', batchCode: 'CS2023' },
//   { name: 'Root', email: 'root@gmail.com', password: 'root123', role: 'root' },
// ];

// const createUsers = async () => {
//   try {
//     console.log("Scripts code is running");
//     await mongoose.connect(process.env.MONGO_URI);
//     await User.deleteMany(); // Clear existing users
    
//     for (const user of users) {
//       const hashedPassword = await bcrypt.hash(user.password, 10);
//       const userData = {...user, password: hashedPassword};
      
//       // Only set rollNo for students, remove it for other roles
//       if (user.role !== 'student') {
//         delete userData.rollNo;
//       }
      
//       const newUser = new User(userData);
//       await newUser.save();
//       console.log(`User created: ${user.email}`);
//     }
    
//     console.log('All users created successfully!');
//   } catch (error) {
//     console.error('Error creating users:', error);
//   } finally {
//     await mongoose.connection.close();
//   }
// };

// createUsers();