const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(verifyToken);
router.use(authorizeRoles('super_admin'));

router.get('/schools/:schoolId/users', adminController.getSchoolUsers);
router.post('/schools/:schoolId/users', adminController.createSchoolUser);
router.post('/schools/:schoolId/users/seed', adminController.seedSchoolUsers);
router.post('/schools', adminController.createSchool);

router.get('/users', adminController.getAllPlatformUsers);
router.put('/users/:id/deactivate', adminController.deactivateUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);

router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

module.exports = router;
