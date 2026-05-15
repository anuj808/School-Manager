const { Staff, Payroll, Leave, User, db } = require('../models');
const puppeteer = require('puppeteer');

// STAFF CRUD
exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({ where: { school_id: req.schoolId } });
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addStaff = async (req, res) => {
  try {
    const staff = await Staff.create({ ...req.body, school_id: req.schoolId });
    res.json({ success: true, data: staff });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PAYROLL
exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const staffList = await Staff.findAll({ where: { school_id: req.schoolId } });
    
    // Destroy existing for this month to allow regeneration
    await Payroll.destroy({ where: { month, year, school_id: req.schoolId } });

    const payrollData = staffList.map(s => {
      const basic = parseFloat(s.salary_basic || 0);
      const allowances = basic * 0.2; // 20% allowance demo
      const deductions = basic * 0.05; // 5% deduction demo
      return {
        school_id: req.schoolId,
        staff_id: s.id,
        month,
        year,
        basic,
        allowances,
        deductions,
        net_salary: basic + allowances - deductions,
        payment_date: new Date()
      };
    });

    await Payroll.bulkCreate(payrollData);
    res.json({ success: true, message: `Generated payslips for ${payrollData.length} staff members` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    let whereClause = { school_id: req.schoolId };
    if (month) whereClause.month = month;
    if (year) whereClause.year = year;

    // If teacher, show only theirs
    if (req.user.role === 'teacher') {
      let staff = await Staff.findOne({ where: { user_id: req.user.userId } });
      if (!staff) {
        staff = await Staff.create({
          school_id: req.schoolId,
          user_id: req.user.userId,
          employee_id: `EMP-${req.user.userId}`,
          full_name: 'Demo Teacher',
          designation: 'Senior Teacher',
          department: 'Teaching',
          salary_basic: 50000
        });
      }
      whereClause.staff_id = staff.id;
    }

    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [{ model: Staff, attributes: ['full_name', 'employee_id', 'designation'] }]
    });
    res.json({ success: true, data: payrolls });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.downloadPayslip = async (req, res) => {
  try {
    const { id } = req.params;
    const slip = await Payroll.findOne({
      where: { id, school_id: req.schoolId },
      include: [Staff]
    });

    if (!slip) return res.status(404).json({ success: false, message: 'Not found' });

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; margin: 0;">Global International School</h1>
            <p style="color: #666; margin-top: 5px;">Salary Slip - ${slip.month}/${slip.year}</p>
          </div>
          
          <table style="width: 100%; margin-bottom: 30px;">
            <tr><td><strong>Employee Name:</strong> ${slip.Staff?.full_name}</td><td style="text-align: right;"><strong>Employee ID:</strong> ${slip.Staff?.employee_id}</td></tr>
            <tr><td><strong>Designation:</strong> ${slip.Staff?.designation}</td><td style="text-align: right;"><strong>Bank A/C:</strong> ${slip.Staff?.bank_account}</td></tr>
          </table>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background: #f3f4f6;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Earnings</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Deductions</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Basic Salary</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(slip.basic).toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">Tax / PF</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(slip.deductions).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">Allowances</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(slip.allowances).toFixed(2)}</td>
              <td style="padding: 10px; border: 1px solid #ddd;"></td>
              <td style="padding: 10px; border: 1px solid #ddd;"></td>
            </tr>
            <tr style="font-weight: bold; background: #e0e7ff;">
              <td style="padding: 10px; border: 1px solid #ddd;" colspan="3">Net Salary</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: #4338ca;">$${parseFloat(slip.net_salary).toFixed(2)}</td>
            </tr>
          </table>
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
      'Content-Disposition': `attachment; filename="Payslip_${slip.Staff?.employee_id}_${slip.month}_${slip.year}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// LEAVE MANAGEMENT
exports.applyLeave = async (req, res) => {
  try {
    let staffId = req.body.staff_id;
    if (req.user.role === 'teacher') {
      let staff = await Staff.findOne({ where: { user_id: req.user.userId } });
      if (!staff) {
        staff = await Staff.create({
          school_id: req.schoolId,
          user_id: req.user.userId,
          employee_id: `EMP-${req.user.userId}`,
          full_name: 'Demo Teacher',
          designation: 'Senior Teacher',
          department: 'Teaching',
          salary_basic: 50000
        });
      }
      staffId = staff.id;
    }

    const leave = await Leave.create({ ...req.body, staff_id: staffId, school_id: req.schoolId });
    res.json({ success: true, data: leave });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getLeaves = async (req, res) => {
  try {
    let whereClause = { school_id: req.schoolId };
    
    if (req.user.role === 'teacher') {
      const staff = await Staff.findOne({ where: { user_id: req.user.userId } });
      if(staff) whereClause.staff_id = staff.id;
    }

    const leaves = await Leave.findAll({
      where: whereClause,
      include: [{ model: Staff, attributes: ['full_name', 'employee_id'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: leaves });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    await Leave.update({ status, remarks, approved_by: req.user.userId }, { where: { id, school_id: req.schoolId } });
    res.json({ success: true, message: `Leave ${status}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
