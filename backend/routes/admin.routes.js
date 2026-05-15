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

module.exports = router;
