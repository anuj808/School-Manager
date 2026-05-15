const { Notice, Student, db } = require('../models');
const { Op } = require('sequelize');

exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create({
      ...req.body,
      school_id: req.schoolId,
      published_by: req.user.userId,
      publish_date: new Date()
    });
    res.json({ success: true, data: notice });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getNotices = async (req, res) => {
  try {
    const role = req.user.role;
    let classId = null;

    if (['student', 'parent'].includes(role)) {
      const student = await Student.findOne({ where: { user_id: req.user.userId } });
      if (student) classId = student.class_id;
    }

    // Admins see all notices
    let whereClause = { school_id: req.schoolId, is_active: true };

    if (!['school_admin', 'principal'].includes(role)) {
      whereClause = {
        school_id: req.schoolId,
        is_active: true,
        [Op.and]: [
          {
            [Op.or]: [
              { target_role: 'all' },
              { target_role: role }
            ]
          }
        ]
      };

      if (classId) {
        whereClause[Op.and].push({
          [Op.or]: [
            { target_class_id: null },
            { target_class_id: classId }
          ]
        });
      } else {
        whereClause[Op.and].push({ target_class_id: null });
      }
    }

    const notices = await Notice.findAll({
      where: whereClause,
      order: [['publish_date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({ success: true, data: notices });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
