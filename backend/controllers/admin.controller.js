const { User, School } = require('../models');
const bcrypt = require('bcryptjs');

exports.getSchoolUsers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const users = await User.findAll({
      where: { school_id: schoolId },
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching school users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createSchoolUser = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { full_name, username, password, role, email, phone } = req.body;

    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      school_id: schoolId,
      username,
      password_hash,
      role,
      email,
      // note: full_name and phone might not be in User model directly based on earlier inspection, 
      // let's just put what we can in User model, we'll check the User model structure next.
    });

    res.status(201).json({ success: true, data: { id: user.id, username: user.username, role: user.role, email: user.email } });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.seedSchoolUsers = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findByPk(schoolId);
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const usersToSeed = [
      { role: 'principal', username: 'principal', password: 'Principal@123' },
      { role: 'teacher', username: 'teacher1', password: 'Teacher@123' },
      { role: 'student', username: 'student1', password: 'Student@123' },
      { role: 'parent', username: 'parent1', password: 'Parent@123' }
    ];

    const createdUsers = [];

    for (let u of usersToSeed) {
      const existing = await User.findOne({ where: { username: u.username } });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(u.password, salt);
        const created = await User.create({
          school_id: schoolId,
          username: u.username,
          password_hash,
          role: u.role
        });
        createdUsers.push(created);
      }
    }

    res.status(201).json({ success: true, message: 'Seed complete', data: createdUsers });
  } catch (error) {
    console.error('Error seeding users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
