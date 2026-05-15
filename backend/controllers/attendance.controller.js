const { Attendance, Student, Class, User, db } = require('../models');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/notifications.service');

exports.markAttendance = async (req, res) => {
  const t = await Attendance.sequelize.transaction();
  try {
    const { classId, date, records } = req.body;
    
    // Check if attendance already marked for this class/date
    const existing = await Attendance.findOne({ where: { class_id: classId, date, school_id: req.schoolId } });
    if (existing) {
      // If exists, delete old and insert new (or update)
      await Attendance.destroy({ where: { class_id: classId, date, school_id: req.schoolId }, transaction: t });
    }

    const attendanceData = records.map(r => ({
      school_id: req.schoolId,
      student_id: r.studentId,
      class_id: classId,
      date,
      status: r.status,
      marked_by: req.user.userId
    }));

    await Attendance.bulkCreate(attendanceData, { transaction: t });
    await t.commit();

    // Auto-email alert if absent 3 days in a row
    for (let att of attendanceData) {
      if (att.status === 'absent') {
        const student = await Student.findOne({ where: { id: att.student_id }, include: [User] });
        if (student && student.User?.email) {
          const past = await Attendance.findAll({
            where: { student_id: att.student_id, school_id: req.schoolId, date: { [Op.lt]: date } },
            order: [['date', 'DESC']],
            limit: 2
          });
          if (past.length === 2 && past[0].status === 'absent' && past[1].status === 'absent') {
            await sendEmail(student.User.email, 'Attendance Alert', `<p>Dear Parent,</p><p>This is an automated alert. Your child <strong>${student.full_name}</strong> has been absent for 3 consecutive days, including ${date}.</p><p>Please contact the school office.</p>`);
          }
        }
      }
    }

    res.json({ success: true, message: `Attendance marked for ${records.length} students` });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAttendanceByClass = async (req, res) => {
  try {
    const { classId, date } = req.params;
    const records = await Attendance.findAll({
      where: { class_id: classId, date, school_id: req.schoolId },
      include: [{ model: Student, attributes: ['id', 'full_name', 'admission_no'] }]
    });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const records = await Attendance.findAll({
      where: { student_id: id, school_id: req.schoolId },
      order: [['date', 'DESC']]
    });

    const presentCount = records.filter(r => r.status === 'present').length;
    const totalCount = records.filter(r => r.status !== 'holiday').length;
    const percentage = totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

    res.json({ success: true, data: { records, summary: { present: presentCount, total: totalCount, percentage } } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { month, year, classId } = req.query; // YYYY-MM
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const whereClause = { school_id: req.schoolId, date: { [Op.between]: [startDate, endDate] } };
    if (classId) whereClause.class_id = classId;

    const records = await Attendance.findAll({
      where: whereClause,
      include: [{ model: Student, attributes: ['id', 'full_name'] }, { model: Class, attributes: ['name', 'section'] }]
    });

    // Simple aggregation
    const report = {};
    records.forEach(r => {
      if (!report[r.student_id]) {
        report[r.student_id] = { name: r.Student?.full_name, class: `${r.Class?.name}-${r.Class?.section}`, present: 0, absent: 0, late: 0, holiday: 0 };
      }
      report[r.student_id][r.status]++;
    });

    res.json({ success: true, data: Object.values(report) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
