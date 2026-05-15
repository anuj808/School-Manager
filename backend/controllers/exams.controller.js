const { Exam, Mark, Class, Subject, Student, db } = require('../models');

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      where: { school_id: req.schoolId },
      include: [{ model: Class, attributes: ['name', 'section'] }]
    });
    res.json({ success: true, data: exams });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create({ ...req.body, school_id: req.schoolId });
    res.status(201).json({ success: true, data: exam });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getExamById = async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: { id: req.params.id, school_id: req.schoolId },
      include: [{ model: Class, include: [{ model: Subject, as: 'Subjects' }, { model: Student }] }]
    });
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: exam });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ where: { id: req.params.id, school_id: req.schoolId } });
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    await exam.update(req.body);
    res.json({ success: true, data: exam });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.destroy({ where: { id: req.params.id, school_id: req.schoolId } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// --- MARKS ---
const calculateGrade = (marks, max) => {
  const perc = (marks / max) * 100;
  if (perc >= 90) return 'A+';
  if (perc >= 80) return 'A';
  if (perc >= 70) return 'B';
  if (perc >= 60) return 'C';
  if (perc >= 50) return 'D';
  return 'F';
};

exports.getMarks = async (req, res) => {
  try {
    const { examId, subjectId } = req.query;
    const marks = await Mark.findAll({
      where: { exam_id: examId, subject_id: subjectId, school_id: req.schoolId }
    });
    res.json({ success: true, data: marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.bulkSubmitMarks = async (req, res) => {
  const t = await Mark.sequelize.transaction();
  try {
    const { examId, subjectId, records } = req.body;

    const subject = await Subject.findOne({ where: { id: subjectId, school_id: req.schoolId } });
    if (!subject) throw new Error('Subject not found');

    const maxMarks = subject.max_marks || 100;

    // Delete existing
    await Mark.destroy({ where: { exam_id: examId, subject_id: subjectId, school_id: req.schoolId }, transaction: t });

    const markData = records.map(r => {
      const isAbsent = !!r.is_absent;
      const marksObtained = isAbsent ? 0 : parseFloat(r.marks_obtained || 0);

      if (marksObtained > maxMarks) {
        throw new Error(`Marks cannot exceed ${maxMarks}`);
      }

      return {
        school_id: req.schoolId,
        exam_id: examId,
        subject_id: subjectId,
        student_id: r.studentId,
        marks_obtained: marksObtained,
        max_marks: maxMarks,
        grade: isAbsent ? 'F' : calculateGrade(marksObtained, maxMarks),
        is_absent: isAbsent,
        entered_by: req.user.userId,
        entered_at: new Date()
      };
    });

    await Mark.bulkCreate(markData, { transaction: t });
    await t.commit();
    res.json({ success: true, message: `Marks submitted for ${records.length} students` });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const { id } = req.params;
    const marks = await Mark.findAll({
      where: { exam_id: id, school_id: req.schoolId },
      include: [
        { model: Student, attributes: ['full_name'] },
        { model: Subject, attributes: ['subject_name'] }
      ]
    });

    res.json({ success: true, data: marks });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
