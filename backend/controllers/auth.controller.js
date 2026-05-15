const { School, User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { school_id, username, password } = req.body;

  try {
    const school = await School.findOne({ where: { school_code: school_id, is_active: true } });
    if (!school) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive school ID' });
    }

    const user = await User.findOne({ where: { school_id: school.id, username, is_active: true } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check lockout
    if (user.locked_until && new Date() < user.locked_until) {
      return res.status(403).json({ success: false, message: 'Account is locked. Try again later.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const attempts = user.failed_login_attempts + 1;
      let lockedUntil = null;
      if (attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }
      await user.update({ failed_login_attempts: attempts, locked_until: lockedUntil });
      
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Success - reset attempts
    await user.update({ failed_login_attempts: 0, locked_until: null, last_login: new Date() });

    const payload = { userId: user.id, schoolId: school.id, role: user.role, username: user.username };
    
    // Default fallback secrets if env vars are missing during tests
    const accessSecret = process.env.JWT_SECRET || 'test_secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';
    
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, accessToken });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/v1/auth/refresh-token
exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const refreshToken = cookies.jwt;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';
  
  jwt.verify(refreshToken, refreshSecret, async (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Forbidden' });
    
    // We should fetch the user to get the latest username/role, but decoded has the old ones.
    const payload = { userId: decoded.userId, schoolId: decoded.schoolId, role: decoded.role, username: decoded.username || 'User' };
    const accessSecret = process.env.JWT_SECRET || 'test_secret';
    
    const accessToken = jwt.sign(payload, accessSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
    res.json({ success: true, accessToken });
  });
};

// POST /api/v1/auth/logout
exports.logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); 
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true, message: 'Logged out successfully' });
};

// POST /api/v1/auth/change-password
exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: hashed });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
