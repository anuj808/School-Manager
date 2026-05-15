const enforceSchoolScope = (req, res, next) => {
  if (!req.user || !req.user.schoolId) {
    return res.status(401).json({ success: false, message: 'School scope missing' });
  }
  // Inject schoolId into req to automatically scope database queries
  req.schoolId = req.user.schoolId;
  next();
};

module.exports = enforceSchoolScope;
