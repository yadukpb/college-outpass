// //const Outpass = require('../models/Outpass');

// exports.createOutpass = async (req, res) => {
//   console.log('createOutpass function called');
//   try {
//     const {
//       outpassType,
//       reason,
//       destination,
//       contactNumber,
//       dateOfLeaving,
//       timeOfLeaving,
//       dateOfReturn,
//       timeOfReturn,
//       personalInfo
//     } = req.body;

//     if (!req.user || !req.user.id) {
//       console.error('User not authenticated or user ID missing');
//       return res.status(401).json({ message: 'User not authenticated' });
//     }

//     const studentId = req.user.id;
//     console.log('Student ID:', studentId);

//     const newOutpass = new Outpass({
//       student: studentId,
//       outpassType,
//       reason,
//       destination,
//       contactNumber,
//       dateOfLeaving,
//       timeOfLeaving,
//       dateOfReturn,
//       timeOfReturn,
//       personalInfo,
//       status: 'pending_warden'
//     });
//     console.log('New Outpass object created:', newOutpass);

//     await newOutpass.save();
//     console.log('Outpass saved successfully');

//     res.status(201).json({ message: 'Outpass created successfully', outpass: newOutpass });
//   } catch (error) {
//     console.error('Error in createOutpass:', error);
//     res.status(500).json({ message: 'Error creating outpass', error: error.message });
//   }
// };

// exports.getOutpassStatus = async (req, res) => {
//   console.log('getOutpassStatus function called');
//   try {
//     const outpassId = req.params.id;
//     console.log('Outpass ID:', outpassId);

//     const outpass = await Outpass.findById(outpassId);
//     console.log('Outpass found:', outpass);

//     if (!outpass) {
//       console.log('Outpass not found');
//       return res.status(404).json({ message: 'Outpass not found' });
//     }

//     res.status(200).json({ 
//       status: outpass.status,
//       wardenApproval: outpass.wardenApproval,
//       coordinatorApproval: outpass.coordinatorApproval,
//       hodApproval: outpass.hodApproval
//     });
//   } catch (error) {
//     console.error('Error in getOutpassStatus:', error);
//     res.status(500).json({ message: 'Error fetching outpass status', error: error.message });
//   }
// };

// exports.getStudentOutpasses = async (req, res) => {
//   console.log('getStudentOutpasses function called');
//   try {
//     const studentId = req.user.id;
//     console.log('Student ID:', studentId);

//     const outpasses = await Outpass.find({ student: studentId }).sort({ createdAt: -1 });
//     console.log('Outpasses found:', outpasses.length);

//     res.status(200).json(outpasses);
//   } catch (error) {
//     console.error('Error in getStudentOutpasses:', error);
//     res.status(500).json({ message: 'Error fetching student outpasses', error: error.message });
//   }
// };