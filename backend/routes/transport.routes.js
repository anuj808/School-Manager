const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/routes', authorizeRoles('school_admin', 'principal'), transportController.getRoutes);
router.post('/routes', authorizeRoles('school_admin', 'principal'), transportController.addRoute);

router.get('/allocations', authorizeRoles('school_admin', 'principal'), transportController.getAllocations);
router.post('/assign', authorizeRoles('school_admin', 'principal'), transportController.assignStudent);

router.get('/my-route', authorizeRoles('student', 'parent'), transportController.getMyRoute);

module.exports = router;
