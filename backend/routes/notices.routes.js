const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/notices.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/', noticesController.getNotices);
router.post('/', authorizeRoles('school_admin', 'principal'), noticesController.createNotice);

module.exports = router;
