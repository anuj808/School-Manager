const { User, School, PlatformSetting } = require('../models');
const { Op } = require('sequelize');
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

exports.createSchool = async (req, res) => {
  try {
    const { name, city, state, contact_email, contact_phone, academic_year, admin_username, admin_password, plan } = req.body;
    
    const count = await School.count();
    const school_code = `SCH-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;
    
    const school = await School.create({
      school_code,
      name,
      address: `${city}, ${state}`,
      contact: contact_phone,
      academic_year: academic_year || '2026-2027',
    });

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(admin_password, salt);

    await User.create({
      school_id: school.id,
      username: admin_username,
      password_hash,
      role: 'school_admin',
      email: contact_email
    });

    res.status(201).json({ success: true, message: `School ${school_code} created successfully!`, data: school });
  } catch (error) {
    console.error('Error creating school:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllPlatformUsers = async (req, res) => {
  try {
    const { search, role, schoolId, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.username = { [Op.like]: `%${search}%` };
    }
    if (role) {
      where.role = role;
    }
    if (schoolId) {
      where.school_id = schoolId;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{ model: School, attributes: ['name', 'school_code'] }],
      attributes: { exclude: ['password_hash'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, data: rows, total: count, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Error fetching platform users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.is_active = false;
    await user.save();
    
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(tempPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password reset successfully', tempPassword });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSetting.findAll();
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    res.json({ success: true, data: settingsMap });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePlatformSettings = async (req, res) => {
  try {
    const settingsToUpdate = req.body;
    for (const [key, value] of Object.entries(settingsToUpdate)) {
      await PlatformSetting.upsert({
        key,
        value: String(value),
        updated_by: req.user.id
      });
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
