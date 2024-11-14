// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.header('Authorization');
//     if (!authHeader) {
//       return res.status(401).send({ error: 'Authorization header missing' });
//     }

//     const token = authHeader.replace('Bearer ', '');
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findOne({ _id: decoded.id, isVerified: true });
//     if (!user) {
//       return res.status(401).send({ error: 'User not found or not verified' });
//     }

//     req.token = token;
//     req.user = user;
//     next();
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).send({ error: 'Token expired' });
//     }
//     res.status(401).send({ error: 'Please authenticate' });
//   }
// };

// module.exports = authMiddleware;