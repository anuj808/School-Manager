const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// Teacher marks attendance
router.post('/mark', authorizeRoles('school_admin', 'principal', 'teacher'), attendanceController.markAttendance);

// View specific class date
router.get('/:classId/:date', authorizeRoles('school_admin', 'principal', 'teacher'), attendanceController.getAttendanceByClass);

// View student history (Student/Parent can view their own)
router.get('/student/:id', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), attendanceController.getStudentHistory);

// View aggregated reports
router.get('/report', authorizeRoles('school_admin', 'principal'), attendanceController.getReport);

module.exports = router;
