const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hr.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// Staff Directory
router.get('/staff', authorizeRoles('school_admin', 'principal', 'teacher'), hrController.getStaff);
router.post('/staff', authorizeRoles('school_admin', 'principal'), hrController.addStaff);

// Payroll
router.post('/payroll/generate', authorizeRoles('school_admin', 'principal'), hrController.generatePayroll);
router.get('/payroll', authorizeRoles('school_admin', 'principal', 'teacher'), hrController.getPayroll);
router.get('/payroll/:id/pdf', authorizeRoles('school_admin', 'principal', 'teacher'), hrController.downloadPayslip);

// Leaves
router.post('/leaves', authorizeRoles('school_admin', 'principal', 'teacher'), hrController.applyLeave);
router.get('/leaves', authorizeRoles('school_admin', 'principal', 'teacher'), hrController.getLeaves);
router.put('/leaves/:id', authorizeRoles('school_admin', 'principal'), hrController.updateLeaveStatus);

module.exports = router;
