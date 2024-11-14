// const Outpass = require('../models/Outpass');

// exports.getPendingOutpasses = async (req, res) => {
//   try {
//     const pendingOutpasses = await Outpass.find({ status: 'pending_coordinator' }).populate('student');
//     res.json(pendingOutpasses);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching pending outpasses' });
//   }
// };

// exports.approveOutpass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;
//     const outpass = await Outpass.findByIdAndUpdate(id, {
//       status: 'pending_hod',
//       coordinatorApproval: { status: 'approved', comment, date: Date.now() }
//     }, { new: true });
//     res.json(outpass);
//   } catch (error) {
//     res.status(500).json({ message: 'Error approving outpass' });
//   }
// };

// exports.rejectOutpass = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;
//     const outpass = await Outpass.findByIdAndUpdate(id, {
//       status: 'rejected',
//       coordinatorApproval: { status: 'rejected', comment, date: Date.now() }
//     }, { new: true });
//     res.json(outpass);
//   } catch (error) {
//     res.status(500).json({ message: 'Error rejecting outpass' });
//   }
// };

// exports.getStats = async (req, res) => {
//   try {
//     const totalPending = await Outpass.countDocuments({ status: 'pending_coordinator' });
//     const totalApproved = await Outpass.countDocuments({ 'coordinatorApproval.status': 'approved' });
//     const totalRejected = await Outpass.countDocuments({ 'coordinatorApproval.status': 'rejected' });
//     const lastDayRequests = await Outpass.countDocuments({
//       createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
//     });

//     res.json({ totalPending, totalApproved, totalRejected, lastDayRequests });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching stats' });
//   }
// };