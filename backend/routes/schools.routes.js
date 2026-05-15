const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const schoolsController = require('../controllers/schools.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

// Public route for login step 1
router.get('/verify/:school_code', schoolsController.verifySchool);

// Protected Routes
router.use(verifyToken);

// Super Admin can see all schools
router.get('/', authorizeRoles('super_admin'), schoolsController.getAllSchools);

// Super Admin can create new schools
router.post('/', authorizeRoles('super_admin'), [
  body('school_code').notEmpty().withMessage('School code is required'),
  body('name').notEmpty().withMessage('School name is required')
], schoolsController.createSchool);

// Both Super Admin and School Admin can update school details
router.put('/:id', authorizeRoles('super_admin', 'school_admin'), enforceSchoolScope, schoolsController.updateSchool);

module.exports = router;
