const { AuditLog } = require('../models');

module.exports = (tableName) => {
  return async (req, res, next) => {
    // Only track mutations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const originalSend = res.json;
      
      // Override res.json to intercept the response
      res.json = function (body) {
        res.json = originalSend; // Restore normal execution
        
        // If the request was successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            let recordId = null;
            if (req.params.id) recordId = req.params.id;
            else if (body && body.data && body.data.id) recordId = body.data.id;

            AuditLog.create({
              school_id: req.schoolId || null,
              user_id: req.user ? req.user.userId : null,
              action: req.method,
              table_name: tableName,
              record_id: recordId,
              new_value: req.method !== 'DELETE' ? req.body : null,
              ip_address: req.ip || req.connection.remoteAddress
            }).catch(e => console.error('Audit Log Error:', e));
          } catch (e) {
            console.error('Audit Log Intercept Error:', e);
          }
        }
        
        return res.json(body); // Send response
      };
    }
    next();
  };
};
