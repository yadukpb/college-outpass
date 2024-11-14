// const Outpass = require('../models/Outpass');
// const generateQRCode = require('../utils/qrCodeGenerator');
// const generatePDF = require('../utils/pdfGenerator');

// exports.createOutpass = async (req, res) => {
//   console.log('studentController.createOutpass called');
//   try {
//     console.log('Request body:', JSON.stringify(req.body, null, 2));
//     console.log('User ID:', req.user.id);
//     const outpassData = { ...req.body, student: req.user.id };
//     console.log('Outpass data:', JSON.stringify(outpassData, null, 2));
//     const newOutpass = new Outpass(outpassData);
//     console.log('New Outpass object created');
//     const savedOutpass = await newOutpass.save();
//     console.log('Outpass saved successfully:', JSON.stringify(savedOutpass, null, 2));
//     res.status(201).json(savedOutpass);
//   } catch (error) {
//     console.error('Error in studentController.createOutpass:', error);
//     res.status(400).json({ message: 'Error creating outpass', error: error.message });
//   }
// };

// exports.getOutpassHistory = async (req, res) => {
//   console.log('studentController.getOutpassHistory called');
//   try {
//     console.log('User ID:', req.user.id);
//     const outpasses = await Outpass.find({ student: req.user.id }).sort({ createdAt: -1 });
//     console.log('Outpasses found:', outpasses.length);
//     res.json(outpasses);
//   } catch (error) {
//     console.error('Error in studentController.getOutpassHistory:', error);
//     res.status(400).json({ message: 'Error fetching outpass history', error: error.message });
//   }
// };

// exports.getLatestOutpass = async (req, res) => {
//   console.log('studentController.getLatestOutpass called');
//   try {
//     console.log('User ID:', req.user.id);
//     const latestOutpass = await Outpass.findOne({ student: req.user.id }).sort({ createdAt: -1 });
//     console.log('Latest outpass:', latestOutpass ? JSON.stringify(latestOutpass, null, 2) : 'Not found');
//     res.json(latestOutpass);
//   } catch (error) {
//     console.error('Error in studentController.getLatestOutpass:', error);
//     res.status(400).json({ message: 'Error fetching latest outpass', error: error.message });
//   }
// };

// exports.downloadOutpassPDF = async (req, res) => {
//   console.log('studentController.downloadOutpassPDF called');
//   try {
//     console.log('Outpass ID:', req.params.id);
//     console.log('User ID:', req.user.id);
//     const outpass = await Outpass.findOne({ _id: req.params.id, student: req.user.id });
//     console.log('Outpass found:', outpass ? JSON.stringify(outpass, null, 2) : 'Not found');
    
//     if (!outpass) {
//       console.log('Outpass not found, sending 404 response');
//       return res.status(404).json({ message: 'Outpass not found' });
//     }

//     if (!outpass.qrCode) {
//       console.log('Generating QR code');
//       outpass.qrCode = await generateQRCode(outpass._id.toString());
//       await outpass.save();
//       console.log('QR code generated and saved');
//     }

//     console.log('Generating PDF');
//     const pdfBuffer = await generatePDF(outpass);
//     console.log('PDF generated successfully');
//     res.contentType('application/pdf');
//     res.send(pdfBuffer);
//   } catch (error) {
//     console.error('Error in studentController.downloadOutpassPDF:', error);
//     res.status(400).json({ message: 'Error generating PDF', error: error.message });
//   }
// };