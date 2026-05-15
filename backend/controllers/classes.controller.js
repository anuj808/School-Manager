const { Class, Subject, Timetable, Staff, Student } = require('../models');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      where: { school_id: req.schoolId },
      include: [{ model: Staff, as: 'ClassTeacher', attributes: ['full_name'] }]
    });
    res.json({ success: true, data: classes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create({ ...req.body, school_id: req.schoolId });
    res.status(201).json({ success: true, data: newClass });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findOne({
      where: { id: req.params.id, school_id: req.schoolId },
      include: [
        { model: Staff, as: 'ClassTeacher', attributes: ['id', 'full_name'] },
        { model: Subject, as: 'Subjects', include: [{ model: Staff, as: 'SubjectTeacher', attributes: ['full_name'] }] },
        { model: Student, attributes: ['id', 'full_name', 'admission_no'] }
      ]
    });
    if (!classData) return res.status(404).json({ success: false, message: 'Class not found' });
    res.json({ success: true, data: classData });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try {
    const c = await Class.findOne({ where: { id: req.params.id, school_id: req.schoolId } });
    if (!c) return res.status(404).json({ success: false, message: 'Class not found' });
    await c.update(req.body);
    res.json({ success: true, data: c });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createSubject = async (req, res) => {
  try {
    const sub = await Subject.create({ ...req.body, class_id: req.params.classId, school_id: req.schoolId });
    res.status(201).json({ success: true, data: sub });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getTimetable = async (req, res) => {
  try {
    const schedule = await Timetable.findAll({
      where: { class_id: req.params.classId, school_id: req.schoolId },
      include: [
        { model: Subject, as: 'Subject', attributes: ['subject_name'] },
        { model: Staff, as: 'Teacher', attributes: ['full_name'] }
      ]
    });
    res.json({ success: true, data: schedule });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignTimetableSlot = async (req, res) => {
  try {
    const { day_of_week, period_number, start_time, end_time, subject_id, teacher_id } = req.body;
    
    // Conflict Detection
    if (teacher_id) {
      const conflict = await Timetable.findOne({
        where: {
          school_id: req.schoolId,
          teacher_id,
          day_of_week,
          period_number
        }
      });

      if (conflict && conflict.class_id != req.params.classId) {
        const conflictClass = await Class.findByPk(conflict.class_id);
        return res.status(400).json({ 
          success: false, 
          message: `Teacher is already assigned to ${conflictClass ? conflictClass.name : 'another class'} during this period.` 
        });
      }
    }

    let slot = await Timetable.findOne({
      where: { class_id: req.params.classId, school_id: req.schoolId, day_of_week, period_number }
    });

    if (slot) {
      await slot.update({ start_time, end_time, subject_id, teacher_id });
    } else {
      slot = await Timetable.create({
        school_id: req.schoolId, class_id: req.params.classId, day_of_week, period_number,
        start_time, end_time, subject_id, teacher_id
      });
    }
    
    res.json({ success: true, data: slot });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
