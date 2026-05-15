const { Homework, HomeworkSubmission, Class, Subject, Staff, Student, db } = require('../models');

exports.createHomework = async (req, res) => {
  try {
    let teacher = await Staff.findOne({ where: { user_id: req.user.userId } });
    if (!teacher) {
      teacher = await Staff.create({
        school_id: req.schoolId,
        user_id: req.user.userId,
        employee_id: `EMP-${req.user.userId}`,
        full_name: 'Demo Teacher',
        designation: 'Senior Teacher',
        department: 'Teaching',
        salary_basic: 50000
      });
    }

    const hw = await Homework.create({ ...req.body, teacher_id: teacher.id, school_id: req.schoolId });
    res.json({ success: true, data: hw });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getHomeworks = async (req, res) => {
  try {
    let whereClause = { school_id: req.schoolId };
    
    if (req.user.role === 'teacher') {
      let teacher = await Staff.findOne({ where: { user_id: req.user.userId } });
      if (!teacher) {
        teacher = await Staff.create({
          school_id: req.schoolId,
          user_id: req.user.userId,
          employee_id: `EMP-${req.user.userId}`,
          full_name: 'Demo Teacher',
          designation: 'Senior Teacher',
          department: 'Teaching',
          salary_basic: 50000
        });
      }
      whereClause.teacher_id = teacher.id;
    } else if (['student', 'parent'].includes(req.user.role)) {
      let student = await Student.findOne({ where: { user_id: req.user.userId } });
      if (!student && req.user.role === 'student') {
        student = await Student.create({
          school_id: req.schoolId,
          user_id: req.user.userId,
          admission_no: `ADM-${req.user.userId}`,
          full_name: 'Demo Student',
          status: 'active'
        });
      }
      if (student && student.class_id) {
        whereClause.class_id = student.class_id;
      }
    }

    const homeworks = await Homework.findAll({
      where: whereClause,
      include: [Class, Subject, { model: Staff, attributes: ['full_name'] }],
      order: [['due_date', 'DESC']]
    });

    // If student, attach submission status
    if (['student', 'parent'].includes(req.user.role)) {
      const student = await Student.findOne({ where: { user_id: req.user.userId } });
      if (!student) return res.json({ success: true, data: [] });

      const submissions = await HomeworkSubmission.findAll({ where: { student_id: student.id } });
      
      const mapped = homeworks.map(hw => {
        const sub = submissions.find(s => s.homework_id === hw.id);
        return { ...hw.toJSON(), my_submission: sub || null };
      });
      return res.json({ success: true, data: mapped });
    }

    res.json({ success: true, data: homeworks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.submitHomework = async (req, res) => {
  try {
    let student = await Student.findOne({ where: { user_id: req.user.userId } });
    if (!student) {
      student = await Student.create({
        school_id: req.schoolId,
        user_id: req.user.userId,
        admission_no: `ADM-${req.user.userId}`,
        full_name: 'Demo Student',
        status: 'active'
      });
    }

    const sub = await HomeworkSubmission.create({
      school_id: req.schoolId,
      student_id: student.id,
      homework_id: req.body.homework_id,
      file_url: req.body.file_url,
      feedback: req.body.text_content, // using feedback field for text submission
      submitted_at: new Date()
    });
    res.json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await HomeworkSubmission.findAll({
      where: { homework_id: req.params.homeworkId, school_id: req.schoolId },
      include: [Student]
    });
    res.json({ success: true, data: submissions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
