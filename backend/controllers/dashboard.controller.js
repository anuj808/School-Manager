const { Student, Staff, Attendance, FeePayment, FeeStructure, Notice, Class, LeaveRequest, Homework, db } = require('../models');
const { Op } = require('sequelize');

exports.getSummary = async (req, res) => {
  try {
    const role = req.user.role;
    const schoolId = req.schoolId;

    let data = {};

    if (['school_admin', 'principal'].includes(role)) {
      const totalStudents = await Student.count({ where: { school_id: schoolId } });
      const totalTeachers = await Staff.count({ where: { school_id: schoolId, designation: { [Op.like]: '%Teacher%' } } });
      
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await Attendance.findAll({ where: { school_id: schoolId, date: today } });
      const presentCount = todayAttendance.filter(a => ['present', 'late'].includes(a.status)).length;
      const attendancePercent = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;

      const firstDay = new Date();
      firstDay.setDate(1);
      const payments = await FeePayment.findAll({ where: { school_id: schoolId, payment_date: { [Op.gte]: firstDay } } });
      const feeCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);

      const pendingLeaves = await LeaveRequest.count({ where: { school_id: schoolId, status: 'pending' } });
      const activeNotices = await Notice.count({ where: { school_id: schoolId, is_active: true } });

      data = {
        kpis: { totalStudents, totalTeachers, attendancePercent, feeCollected, pendingLeaves, activeNotices },
        charts: {
          attendanceData: [
             { name: 'Mon', percent: 92 }, { name: 'Tue', percent: 95 }, 
             { name: 'Wed', percent: 89 }, { name: 'Thu', percent: 94 }, { name: 'Fri', percent: 96 }
          ],
          feeData: [
            { name: 'Paid', value: feeCollected },
            { name: 'Pending', value: 50000 } // Mocked pending
          ]
        }
      };
    } 
    else if (role === 'teacher') {
      const staff = await Staff.findOne({ where: { user_id: req.user.userId } });
      
      const hwDue = await Homework.findAll({ 
        where: { teacher_id: staff?.id || 0, due_date: { [Op.gte]: new Date() } },
        order: [['due_date', 'ASC']],
        limit: 5
      });
      
      data = {
        homeworkDue: hwDue,
        timetable: [
          { time: '09:00 AM', subject: 'Math', class: '10-A' },
          { time: '11:00 AM', subject: 'Physics', class: '10-A' }
        ]
      };
    }
    else if (['student', 'parent'].includes(role)) {
      const student = await Student.findOne({ where: { user_id: req.user.userId } });
      if (!student) {
         data = { attendancePercent: 0, pendingHomework: [], feeStatus: { paid: 0, due: 0 } };
      } else {
         const attendance = await Attendance.findAll({ where: { student_id: student.id } });
         const presentCount = attendance.filter(a => ['present', 'late'].includes(a.status)).length;
         const attendancePercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;
         
         const hwDue = await Homework.findAll({ 
           where: { class_id: student.class_id || 0, due_date: { [Op.gte]: new Date() } }
         });

         data = {
           attendancePercent,
           pendingHomework: hwDue,
           feeStatus: { due: 2500, paid: 5000 }, // Mock
           recentNotices: await Notice.findAll({ limit: 3, order: [['createdAt', 'DESC']] })
         };
      }
    }

    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
