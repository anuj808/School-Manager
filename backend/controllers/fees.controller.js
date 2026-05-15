const { FeeStructure, FeePayment, Student, Class, User, db } = require('../models');
const { Op } = require('sequelize');
const puppeteer = require('puppeteer');
const { sendEmail } = require('../services/notifications.service');

exports.getStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.findAll({
      where: { school_id: req.schoolId },
      include: [{ model: Class, attributes: ['name', 'section'] }]
    });
    res.json({ success: true, data: structures });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createStructure = async (req, res) => {
  try {
    const struct = await FeeStructure.create({ ...req.body, school_id: req.schoolId });
    res.json({ success: true, data: struct });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.sendFeeReminders = async (req, res) => {
  try {
    const classId = req.body.class_id;
    let whereClause = { school_id: req.schoolId };
    if (classId) whereClause.class_id = classId;

    const structures = await FeeStructure.findAll({ where: whereClause });
    const students = await Student.findAll({ where: whereClause, include: [User] });
    const payments = await FeePayment.findAll({ where: { school_id: req.schoolId } });

    let sentCount = 0;
    for (let student of students) {
      for (let struct of structures) {
        if (student.class_id !== struct.class_id) continue;
        
        const paid = payments.filter(p => p.student_id === student.id && p.fee_structure_id === struct.id)
                             .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        const due = parseFloat(struct.amount) - paid;
        
        if (due > 0 && student.User?.email) {
          await sendEmail(
            student.User.email,
            `Fee Reminder: ${struct.fee_head}`,
            `<p>Dear Parent,</p><p>This is a reminder that a fee of <strong>$${due}</strong> is pending for <strong>${struct.fee_head}</strong>.</p><p>Please pay before the due date: ${struct.due_date}.</p>`
          );
          sentCount++;
        }
      }
    }
    
    res.json({ success: true, message: `Sent ${sentCount} reminders.` });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getPendingDues = async (req, res) => {
  try {
    // Get all students and all structures, then subtract paid.
    const structures = await FeeStructure.findAll({ where: { school_id: req.schoolId } });
    const students = await Student.findAll({ where: { school_id: req.schoolId }, include: [{ model: Class }] });
    const payments = await FeePayment.findAll({ where: { school_id: req.schoolId } });

    const pending = [];

    for (let s of students) {
      // Find applicable structures for this student's class
      const applicable = structures.filter(st => st.class_id === s.class_id);
      let studentPending = 0;
      
      applicable.forEach(st => {
        const amountPaid = payments.filter(p => p.student_id === s.id && p.fee_structure_id === st.id).reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
        let due = parseFloat(st.amount) - amountPaid;
        
        // Auto calculate fine
        if (due > 0 && new Date() > new Date(st.due_date) && st.late_fine_per_day) {
          const daysLate = Math.floor((new Date() - new Date(st.due_date)) / (1000 * 60 * 60 * 24));
          due += (daysLate * parseFloat(st.late_fine_per_day));
        }

        studentPending += due;
      });

      if (studentPending > 0) {
        pending.push({ student: s, pendingAmount: studentPending });
      }
    }

    res.json({ success: true, data: pending });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getStudentStatement = async (req, res) => {
  try {
    const { id } = req.params; // student_id
    const student = await Student.findOne({ where: { id, school_id: req.schoolId }, include: [Class] });
    if (!student) throw new Error('Student not found');

    const structures = await FeeStructure.findAll({ where: { class_id: student.class_id, school_id: req.schoolId } });
    const payments = await FeePayment.findAll({ where: { student_id: id, school_id: req.schoolId } });

    const statement = structures.map(st => {
      const relatedPayments = payments.filter(p => p.fee_structure_id === st.id);
      const amountPaid = relatedPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
      let fine = 0;
      
      let balance = parseFloat(st.amount) - amountPaid;
      if (balance > 0 && new Date() > new Date(st.due_date) && st.late_fine_per_day) {
        const daysLate = Math.floor((new Date() - new Date(st.due_date)) / (1000 * 60 * 60 * 24));
        fine = daysLate * parseFloat(st.late_fine_per_day);
        balance += fine;
      }

      return {
        structure: st,
        payments: relatedPayments,
        total_due: parseFloat(st.amount) + fine,
        amount_paid: amountPaid,
        balance,
        fine
      };
    });

    res.json({ success: true, data: statement });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.collectPayment = async (req, res) => {
  try {
    const { student_id, fee_structure_id, amount_paid, payment_mode } = req.body;
    
    // Check structure
    const st = await FeeStructure.findOne({ where: { id: fee_structure_id, school_id: req.schoolId } });
    if (!st) throw new Error('Fee structure not found');

    // Calc fine
    let fine = 0;
    const payments = await FeePayment.findAll({ where: { student_id, fee_structure_id, school_id: req.schoolId } });
    const previouslyPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const balance = parseFloat(st.amount) - previouslyPaid;

    if (balance > 0 && new Date() > new Date(st.due_date) && st.late_fine_per_day) {
      const daysLate = Math.floor((new Date() - new Date(st.due_date)) / (1000 * 60 * 60 * 24));
      fine = daysLate * parseFloat(st.late_fine_per_day);
    }

    const receipt_no = `RCPT-${req.schoolId}-${Date.now()}`;

    const payment = await FeePayment.create({
      school_id: req.schoolId,
      student_id,
      fee_structure_id,
      amount_paid,
      payment_date: new Date(),
      payment_mode,
      receipt_no,
      fine,
      balance: balance + fine - amount_paid,
      paid_by: req.user.userId
    });

    res.json({ success: true, data: payment, message: 'Payment recorded successfully' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.generateReceiptPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await FeePayment.findOne({
      where: { id, school_id: req.schoolId },
      include: [
        { model: Student, include: [Class] },
        { model: FeeStructure }
      ]
    });

    if (!payment) return res.status(404).json({ success: false, message: 'Receipt not found' });

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin: 0;">Global International School</h1>
            <p style="color: #666; margin-top: 5px;">Fee Receipt</p>
          </div>
          
          <table style="width: 100%; margin-bottom: 30px;">
            <tr><td><strong>Receipt No:</strong> ${payment.receipt_no}</td><td style="text-align: right;"><strong>Date:</strong> ${payment.payment_date}</td></tr>
            <tr><td><strong>Student Name:</strong> ${payment.Student?.full_name}</td><td style="text-align: right;"><strong>Admission No:</strong> ${payment.Student?.admission_no}</td></tr>
            <tr><td><strong>Class:</strong> ${payment.Student?.Class?.name} - ${payment.Student?.Class?.section}</td><td style="text-align: right;"><strong>Mode:</strong> ${payment.payment_mode}</td></tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Particulars</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${payment.FeeStructure?.fee_head} (${payment.FeeStructure?.term})</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${(parseFloat(payment.amount_paid) - parseFloat(payment.fine)).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Late Fine</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(payment.fine).toFixed(2)}</td>
            </tr>
            <tr style="font-weight: bold; background: #f9fafb;">
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Paid</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(payment.amount_paid).toFixed(2)}</td>
            </tr>
          </table>
          <p style="margin-top: 40px; text-align: right;"><strong>Authorized Signature</strong></p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A5', printBackground: true });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${payment.receipt_no}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
