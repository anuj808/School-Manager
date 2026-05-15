const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/students.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/', authorizeRoles('school_admin', 'principal', 'teacher'), studentsController.getStudents);
router.get('/:id', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), studentsController.getStudentById);
router.get('/:id/summary', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), studentsController.getStudentSummary);

router.post('/', authorizeRoles('school_admin'), studentsController.createStudent);
router.put('/:id', authorizeRoles('school_admin', 'principal'), studentsController.updateStudent);
router.delete('/:id', authorizeRoles('school_admin'), studentsController.deleteStudent);

module.exports = router;
