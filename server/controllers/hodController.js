// const Outpass = require('../models/Outpass');
// const generateQRCode = require('../utils/qrCodeGenerator');

// exports.getPendingOutpasses = async (req, res) => {
//   try {
//     const pendingOutpasses = await Outpass.find({ status: 'pending_hod' }).populate('student');
//     res.json(pendingOutpasses);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching pending outpasses', error });
//   }
// };

// exports.approveOutpass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;
    
//     const outpass = await Outpass.findById(id);
//     if (!outpass) {
//       return res.status(404).json({ message: 'Outpass not found' });
//     }
    
//     const qrCode = await generateQRCode(outpass._id.toString());
//     if (!qrCode) {
//       return res.status(500).json({ message: 'Error generating QR code' });
//     }
    
//     outpass.status = 'approved';
//     outpass.hodApproval = { status: 'approved', comment, date: Date.now() };
//     outpass.qrCode = qrCode;
    
//     await outpass.save();
    
//     res.json(outpass);
//   } catch (error) {
//     res.status(500).json({ message: 'Error approving outpass', error });
//   }
// };

// exports.rejectOutpass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     const outpass = await Outpass.findByIdAndUpdate(id, {
//       status: 'rejected',
//       hodApproval: { status: 'rejected', comment, date: Date.now() }
//     }, { new: true });

//     res.json(outpass);
//   } catch (error) {
//     res.status(500).json({ message: 'Error rejecting outpass', error });
//   }
// };

// exports.getStats = async (req, res) => {
//   try {
//     const totalPending = await Outpass.countDocuments({ status: 'pending_hod' });
//     const totalApproved = await Outpass.countDocuments({ 'hodApproval.status': 'approved' });
//     const totalRejected = await Outpass.countDocuments({ 'hodApproval.status': 'rejected' });
//     const lastDayRequests = await Outpass.countDocuments({
//       createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
//     });

//     res.json({ totalPending, totalApproved, totalRejected, lastDayRequests });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching stats', error });
//   }
// };