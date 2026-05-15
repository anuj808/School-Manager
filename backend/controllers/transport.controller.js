const { TransportRoute, TransportAllocation, Student, Class, FeeStructure, db } = require('../models');

exports.getRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.findAll({ where: { school_id: req.schoolId } });
    res.json({ success: true, data: routes });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.addRoute = async (req, res) => {
  try {
    const route = await TransportRoute.create({ ...req.body, school_id: req.schoolId });
    res.json({ success: true, data: route });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.assignStudent = async (req, res) => {
  try {
    const { student_id, route_id, stop_name, fee_amount } = req.body;
    
    // Destroy existing allocation
    await TransportAllocation.destroy({ where: { student_id, school_id: req.schoolId } });

    const alloc = await TransportAllocation.create({
      school_id: req.schoolId,
      student_id,
      route_id,
      stop_name,
      fee_amount
    });

    // Optionally auto-add to fee structure if we want.
    // Easiest is just treating it as a new FeeStructure for that student exclusively,
    // but the system is currently class-based fee structures.
    // For now, we just save it in TransportAllocation.

    res.json({ success: true, data: alloc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllocations = async (req, res) => {
  try {
    // Admin sees all
    const allocs = await TransportAllocation.findAll({
      where: { school_id: req.schoolId },
      include: [
        { model: Student, include: [Class] },
        { model: TransportRoute }
      ]
    });
    res.json({ success: true, data: allocs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMyRoute = async (req, res) => {
  try {
    let student = await Student.findOne({ where: { user_id: req.user.userId } });
    if (!student && req.user.role === 'student') {
      student = await Student.create({
        school_id: req.schoolId,
        user_id: req.user.userId,
        admission_no: `ADM-${req.user.userId}`,
        full_name: 'Demo Student',
        status: 'active'
      });
    }
    if(!student) return res.json({ success: true, data: null });

    const alloc = await TransportAllocation.findOne({
      where: { student_id: student.id, school_id: req.schoolId },
      include: [TransportRoute]
    });

    res.json({ success: true, data: alloc });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
