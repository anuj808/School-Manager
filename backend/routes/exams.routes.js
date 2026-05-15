const express = require('express');
const router = express.Router();
const examsController = require('../controllers/exams.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// Exams
router.get('/', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), examsController.getExams);
router.get('/:id', authorizeRoles('school_admin', 'principal', 'teacher'), examsController.getExamById);
router.post('/', authorizeRoles('school_admin', 'principal'), examsController.createExam);
router.put('/:id', authorizeRoles('school_admin', 'principal'), examsController.updateExam);
router.delete('/:id', authorizeRoles('school_admin', 'principal'), examsController.deleteExam);

// Marks
router.get('/marks/data', authorizeRoles('school_admin', 'principal', 'teacher'), examsController.getMarks);
router.post('/marks/bulk', authorizeRoles('school_admin', 'principal', 'teacher'), examsController.bulkSubmitMarks);
router.get('/:id/results', authorizeRoles('school_admin', 'principal', 'teacher'), examsController.getExamResults);

module.exports = router;
