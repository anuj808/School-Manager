const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/library.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/books', authorizeRoles('school_admin', 'principal', 'teacher', 'student', 'parent'), libraryController.getBooks);
router.post('/books', authorizeRoles('school_admin', 'principal'), libraryController.addBook);

router.post('/issue', authorizeRoles('school_admin', 'principal'), libraryController.issueBook);
router.post('/return/:id', authorizeRoles('school_admin', 'principal'), libraryController.returnBook);
router.get('/issues', authorizeRoles('school_admin', 'principal', 'student', 'parent'), libraryController.getIssues);

module.exports = router;
