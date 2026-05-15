const express = require('express');
const router = express.Router();
const classesController = require('../controllers/classes.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// All roles can view
router.get('/', classesController.getClasses);
router.get('/:id', classesController.getClassById);
router.get('/:classId/timetable', classesController.getTimetable);

// Only school admin and principal can edit
const canEdit = authorizeRoles('school_admin', 'principal');
router.post('/', canEdit, classesController.createClass);
router.put('/:id', canEdit, classesController.updateClass);
router.post('/:classId/subjects', canEdit, classesController.createSubject);
router.post('/:classId/timetable', canEdit, classesController.assignTimetableSlot);

module.exports = router;
