const express = require('express');
const router = express.Router();
const { AuditLog, User } = require('../models');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const enforceSchoolScope = require('../middleware/enforceSchoolScope');

router.use(verifyToken);
router.use(enforceSchoolScope);

// Only Super Admin or School Admin can view logs
router.get('/', authorizeRoles('super_admin', 'school_admin', 'principal'), async (req, res) => {
  try {
    const { action, table, start_date, end_date } = req.query;
    
    let whereClause = { school_id: req.schoolId };
    if (action) whereClause.action = action;
    if (table) whereClause.table_name = table;
    
    // Add date range filter if provided
    if (start_date || end_date) {
      whereClause.createdAt = {};
      if (start_date) whereClause.createdAt['$gte'] = new Date(start_date);
      if (end_date) whereClause.createdAt['$lte'] = new Date(end_date);
    }

    const logs = await AuditLog.findAll({
      where: whereClause,
      include: [{ model: User, attributes: ['username', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 100 // Prevent massive payloads
    });

    res.json({ success: true, data: logs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
