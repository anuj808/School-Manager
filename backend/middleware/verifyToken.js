const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  const accessSecret = process.env.JWT_SECRET || 'test_secret';

  jwt.verify(token, accessSecret, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = {
      userId: decoded.userId,
      schoolId: decoded.schoolId,
      role: decoded.role
    };
    next();
  });
};

module.exports = verifyToken;
