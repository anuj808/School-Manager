const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees.controller');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

router.get('/structures', authorizeRoles('school_admin', 'principal'), feesController.getStructures);
router.post('/structures', authorizeRoles('school_admin', 'principal'), feesController.createStructure);

router.get('/pending', authorizeRoles('school_admin', 'principal'), feesController.getPendingDues);
router.post('/reminders', authorizeRoles('school_admin', 'principal'), feesController.sendFeeReminders);
router.post('/collect', authorizeRoles('school_admin', 'principal'), feesController.collectPayment);

router.get('/statement/:id', authorizeRoles('school_admin', 'principal', 'student', 'parent'), feesController.getStudentStatement);
router.get('/receipts/:id', authorizeRoles('school_admin', 'principal', 'student', 'parent'), feesController.generateReceiptPdf);

module.exports = router;
