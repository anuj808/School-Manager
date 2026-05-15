const express = require('express');
const router = express.Router();
const homeworkController = require('../controllers/homework.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/', authorizeRoles('teacher', 'student', 'parent'), homeworkController.getHomeworks);
router.post('/', authorizeRoles('teacher'), homeworkController.createHomework);

router.post('/submit', authorizeRoles('student'), homeworkController.submitHomework);
router.get('/:homeworkId/submissions', authorizeRoles('teacher'), homeworkController.getSubmissions);

module.exports = router;
