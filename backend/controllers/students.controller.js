const { Student, User, Parent, Class } = require('../models');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

exports.getStudents = async (req, res) => {
  try {
    const { classId, search, page = 1, limit = 25 } = req.query;
    const offset = (page - 1) * limit;

    const where = { school_id: req.schoolId };
    if (classId) where.class_id = classId;
    if (search) {
      where.full_name = { [Op.like]: `%${search}%` };
    }

    const students = await Student.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'Class', attributes: ['name', 'section'] },
        { model: Parent, as: 'ParentInfo', attributes: ['father_name', 'phone'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['full_name', 'ASC']]
    });

    res.json({
      success: true,
      data: students.rows,
      meta: {
        total: students.count,
        page: parseInt(page),
        pages: Math.ceil(students.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const t = await Student.sequelize.transaction();
  try {
    const { 
      admission_no, full_name, dob, gender, blood_group, admission_date, address,
      class_id, father_name, mother_name, phone, parent_email
    } = req.body;

    // Create User for Student
    const studentPassword = await bcrypt.hash(admission_no, 10);
    const studentUser = await User.create({
      school_id: req.schoolId,
      username: admission_no,
      password_hash: studentPassword,
      role: 'student'
    }, { transaction: t });

    // Create User for Parent
    const parentUsername = 'P' + admission_no;
    const parentPassword = await bcrypt.hash(parentUsername, 10);
    const parentUser = await User.create({
      school_id: req.schoolId,
      username: parentUsername,
      email: parent_email,
      password_hash: parentPassword,
      role: 'parent'
    }, { transaction: t });

    // Create Student
    const student = await Student.create({
      school_id: req.schoolId,
      user_id: studentUser.id,
      class_id: class_id || null,
      admission_no,
      full_name,
      dob,
      gender,
      blood_group,
      admission_date,
      address,
      status: 'active'
    }, { transaction: t });

    // Create Parent Profile
    await Parent.create({
      school_id: req.schoolId,
      student_id: student.id,
      user_id: parentUser.id,
      father_name,
      mother_name,
      phone,
      email: parent_email,
      address
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: { id: req.params.id, school_id: req.schoolId },
      include: [
        { model: Class, as: 'Class' },
        { model: Parent, as: 'ParentInfo' }
      ]
    });
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { id: req.params.id, school_id: req.schoolId } });
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    
    await student.update(req.body);
    
    if (req.body.ParentInfo) {
      const parent = await Parent.findOne({ where: { student_id: student.id } });
      if (parent) await parent.update(req.body.ParentInfo);
    }
    
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { id: req.params.id, school_id: req.schoolId } });
    if (!student) return res.status(404).json({ success: false, message: 'Not found' });
    
    await student.destroy();
    await User.update({ is_active: false }, { where: { id: student.user_id } });
    
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentSummary = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        attendance_percentage: 85.5,
        fee_status: 'Paid',
        latest_result: 'A Grade'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
