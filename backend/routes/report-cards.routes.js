const express = require('express');
const router = express.Router();
const rcController = require('../controllers/report-cards.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// Admin actions
router.post('/generate/:examId/:classId', authorizeRoles('school_admin', 'principal'), rcController.generateReportCards);
router.post('/publish/:examId', authorizeRoles('school_admin', 'principal'), rcController.publishExam);

// General viewing
router.get('/', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), rcController.getReportCardsList);
router.get('/:id/pdf', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), rcController.generatePdf);

module.exports = router;
