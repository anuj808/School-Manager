const { School } = require('../models');
const { validationResult } = require('express-validator');

exports.verifySchool = async (req, res) => {
  const { school_code } = req.params;
  try {
    const school = await School.findOne({
      where: { school_code, is_active: true },
      attributes: ['id', 'school_code', 'name', 'logo_url']
    });
    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found or inactive' });
    }
    res.json({ success: true, school });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.createSchool = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const newSchool = await School.create(req.body);
    res.status(201).json({ success: true, data: newSchool });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, message: 'School code must be unique' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.updateSchool = async (req, res) => {
  try {
    // School Admin can only update their own school
    if (req.user.role === 'school_admin' && req.schoolId !== parseInt(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Cannot update other schools' });
    }

    const school = await School.findByPk(req.params.id);
    if (!school) return res.status(404).json({ success: false, message: 'School not found' });

    await school.update(req.body);
    res.json({ success: true, data: school });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
