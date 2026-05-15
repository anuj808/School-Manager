const { ReportCard, Mark, Student, Exam, Class, Subject, User, db } = require('../models');
const puppeteer = require('puppeteer');
const { sendEmail } = require('../services/notifications.service');

exports.generateReportCards = async (req, res) => {
  try {
    const { examId, classId } = req.params;
    
    // Fetch all marks for this exam and class
    const marks = await Mark.findAll({
      where: { exam_id: examId, school_id: req.schoolId },
      include: [
        { model: Student, where: { class_id: classId } }
      ]
    });

    if(marks.length === 0) return res.status(400).json({ success: false, message: 'No marks found for this exam/class combination.' });

    // Group marks by student
    const studentData = {};
    marks.forEach(m => {
      const sId = m.student_id;
      if (!studentData[sId]) {
        studentData[sId] = { student_id: sId, total_marks: 0, obtained_marks: 0, hasFailed: false };
      }
      studentData[sId].total_marks += parseFloat(m.max_marks || 100);
      studentData[sId].obtained_marks += parseFloat(m.marks_obtained || 0);
      if (m.grade === 'F') studentData[sId].hasFailed = true;
    });

    // Calculate percentage and rank
    const reportCardsArray = Object.values(studentData).map(sd => {
      const percentage = (sd.obtained_marks / sd.total_marks) * 100;
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';

      return {
        school_id: req.schoolId,
        student_id: sd.student_id,
        exam_id: examId,
        total_marks: sd.total_marks,
        obtained_marks: sd.obtained_marks,
        percentage: percentage.toFixed(2),
        grade,
        result: sd.hasFailed ? 'fail' : 'pass',
        remarks: sd.hasFailed ? 'Needs Improvement' : 'Excellent Performance'
      };
    });

    // Sort to assign ranks
    reportCardsArray.sort((a, b) => b.percentage - a.percentage);
    reportCardsArray.forEach((rc, idx) => rc.rank = idx + 1);

    // Delete existing report cards for this exam
    await ReportCard.destroy({ where: { exam_id: examId, school_id: req.schoolId } });

    // Bulk insert
    const createdCards = await ReportCard.bulkCreate(reportCardsArray);

    // Notify students/parents
    for (let rc of createdCards) {
      const student = await Student.findOne({ where: { id: rc.student_id }, include: [User] });
      if (student && student.User?.email) {
        await sendEmail(
          student.User.email, 
          'Report Card Generated', 
          `<p>Dear Student/Parent,</p><p>The report card for <strong>${student.full_name}</strong> has been generated.</p>`
        );
      }
    }

    res.json({ success: true, message: `Report cards generated for ${reportCardsArray.length} students.` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishExam = async (req, res) => {
  try {
    const { examId } = req.params;
    await Exam.update({ is_published: true }, { where: { id: examId, school_id: req.schoolId } });
    res.json({ success: true, message: 'Exam results published successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReportCardsList = async (req, res) => {
  try {
    // If student/parent, fetch only theirs
    const whereClause = { school_id: req.schoolId };
    
    // We get the student id from the user somehow, but since user context might be just 'student',
    // let's fetch based on user role. For now, fetch all if admin, or filter by student.
    if (['student', 'parent'].includes(req.user.role)) {
       // Mock: in real app, user model linked to student
       const userStudent = await Student.findOne({ where: { user_id: req.user.userId } });
       if(userStudent) whereClause.student_id = userStudent.id;
    }

    const cards = await ReportCard.findAll({
      where: whereClause,
      include: [
        { model: Exam, include: [{ model: Class, attributes: ['name', 'section']}] },
        { model: Student, attributes: ['full_name', 'admission_no'] }
      ]
    });
    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const rc = await ReportCard.findOne({
      where: { id, school_id: req.schoolId },
      include: [
        { model: Exam, include: [{ model: Class }] },
        { model: Student }
      ]
    });

    if (!rc) return res.status(404).json({ success: false, message: 'Not found' });

    // Fetch marks for this student for this exam
    const marks = await Mark.findAll({
      where: { exam_id: rc.exam_id, student_id: rc.student_id },
      include: [{ model: Subject }]
    });

    // Create HTML string
    let marksRows = marks.map(m => `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd;">${m.Subject?.subject_name}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${m.max_marks}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${m.is_absent ? 'Absent' : m.marks_obtained}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${m.grade}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .school-name { font-size: 28px; font-weight: bold; margin: 0; color: #1e3a8a; }
            .school-address { font-size: 14px; color: #666; margin-top: 5px; }
            .report-title { text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px;}
            .info-table { width: 100%; margin-bottom: 30px; }
            .info-table td { padding: 5px 0; }
            .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .marks-table th { background: #f3f4f6; padding: 10px; border: 1px solid #ddd; text-align: left; }
            .summary { display: flex; justify-content: space-between; background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; }
            .signatures { display: flex; justify-content: space-between; margin-top: 80px; text-align: center; }
            .sig-line { border-top: 1px solid #000; width: 200px; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">Global International School</h1>
            <p class="school-address">123 Education Lane, Tech City | www.globalinternationalschool.edu</p>
          </div>
          <div class="report-title">Academic Report Card</div>
          
          <table class="info-table">
            <tr>
              <td><strong>Student Name:</strong> ${rc.Student?.full_name}</td>
              <td><strong>Admission No:</strong> ${rc.Student?.admission_no}</td>
            </tr>
            <tr>
              <td><strong>Class:</strong> ${rc.Exam?.Class?.name} - ${rc.Exam?.Class?.section}</td>
              <td><strong>Examination:</strong> ${rc.Exam?.exam_name}</td>
            </tr>
          </table>

          <table class="marks-table">
            <thead>
              <tr><th>Subject</th><th>Max Marks</th><th>Marks Obtained</th><th>Grade</th></tr>
            </thead>
            <tbody>
              ${marksRows}
            </tbody>
          </table>

          <div class="summary">
            <div><strong>Total Marks:</strong> ${rc.obtained_marks} / ${rc.total_marks}</div>
            <div><strong>Percentage:</strong> ${rc.percentage}%</div>
            <div><strong>Overall Grade:</strong> ${rc.grade}</div>
            <div><strong>Class Rank:</strong> ${rc.rank}</div>
          </div>

          <p style="margin-top: 20px;"><strong>Result:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${rc.result === 'pass' ? 'green' : 'red'};">${rc.result}</span></p>
          <p><strong>Remarks:</strong> ${rc.remarks}</p>

          <div class="signatures">
            <div>
              <div class="sig-line">Class Teacher Signature</div>
            </div>
            <div>
              <div class="sig-line">Principal Signature</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ReportCard_${rc.Student?.admission_no}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
