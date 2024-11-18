const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'warden', 'coordinator', 'hod', 'security', 'rootAdmin'], required: true },
  isVerified: { type: Boolean, default: false },
  mustChangePassword: { type: Boolean, default: true },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// userSchema.pre('save', async function(next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    
    throw error;
  }
};

// Department Schema
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Class Schema
const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Student Schema
const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rollNo: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: false },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: false },
  warden: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  security: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }],
  year: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  parentInfo: {
    fatherName: String,
    fatherPhone: String,
    motherName: String,
    motherPhone: String,
    emergencyContact: String
  }
});

// Staff Schema (for HOD, Warden, Coordinator)
const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  staffId: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  designation: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Outpass Schema
const outpassSchema = new mongoose.Schema({
  outpassType: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  destination: { type: String, required: true },
  reason: { type: String, required: true },
  dateOfGoing: { type: Date, required: true },
  timeOfGoing: { type: String, required: true },
  dateOfArrival: { type: Date, required: true },
  timeOfArrival: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Completed'], 
    default: 'Pending' 
  },
  securityCheckpoints: {
    exitScan: {
      scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
      status: { 
        type: String, 
        enum: ['Pending', 'Completed'], 
        default: 'Pending' 
      }
    },
    entryScan: {
      scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
      status: { 
        type: String, 
        enum: ['Pending', 'Completed'], 
        default: 'Pending' 
      }
    }
  },
  qrCode: {
    exit: String,
    entry: String
  },
  currentApprover: { 
    type: String, 
    enum: ['coordinator', 'warden', 'hod', 'security'], 
    default: 'coordinator' 
  },
  coordinatorApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: Date,
    remarks: String
  },
  wardenApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: Date,
    remarks: String
  },
  hodApproval: {
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    timestamp: Date,
    remarks: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warden: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hod: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

// Middleware to populate coordinator, warden, and hod from student schema
outpassSchema.pre('save', async function(next) {
  if (this.isNew) {
    const student = await Student.findById(this.student).populate('coordinator warden hod');
    if (student) {
      this.coordinator = student.coordinator;
      this.warden = student.warden;
      this.hod = student.hod;
    }
  }
  next();
});

// Message Schema (Sub-document for Chat)
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  attachments: [{ 
    type: { type: String, enum: ['image', 'document', 'audio'] },
    url: String
  }]
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Branch Schema
const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  year: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  coordinator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);
const Department = mongoose.model('Department', departmentSchema);
const Class = mongoose.model('Class', classSchema);
const Student = mongoose.model('Student', studentSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Outpass = mongoose.model('Outpass', outpassSchema);
const Message = mongoose.model('Message', messageSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Branch = mongoose.model('Branch', branchSchema);

module.exports = { User, Department, Class, Student, Staff, Outpass, Message, Chat, Notification, Branch };