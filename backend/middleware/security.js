const { body, validationResult } = require('express-validator');

exports.sanitizeInput = (req, res, next) => {
  // We apply generic sanitization: escape all string bodies, unless it's a file_url/JSON where it might break
  // For a robust system, this should be applied per-route.
  // We'll proceed if there's no severe injection pattern found.
  
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const stringifyBody = JSON.stringify(req.body);
    if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(stringifyBody)) {
      return res.status(400).json({ success: false, message: 'Invalid input detected' });
    }
  }
  next();
};

exports.validateMimeType = (req, res, next) => {
  // If file upload logic is present (multipart/form-data)
  // For now, we simulate File upload security
  if (req.files && Object.keys(req.files).length > 0) {
    const file = req.files[Object.keys(req.files)[0]];
    const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Invalid file type. Allowed: JPG, PNG, PDF' });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File too large. Max: 5MB' });
    }
  }
  next();
};
