const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models Definition
db.School = sequelize.define('School', {
  school_code: { type: DataTypes.STRING, unique: true, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT },
  contact: { type: DataTypes.STRING },
  logo_url: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  academic_year: { type: DataTypes.STRING }
}, { tableName: 'schools' });

db.User = sequelize.define('User', {
  school_id: { type: DataTypes.INTEGER },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent'), allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  failed_login_attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  locked_until: { type: DataTypes.DATE },
  last_login: { type: DataTypes.DATE }
}, { tableName: 'users' });

db.Staff = sequelize.define('Staff', {
  school_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  employee_id: { type: DataTypes.STRING },
  full_name: { type: DataTypes.STRING, allowNull: false },
  designation: { type: DataTypes.STRING },
  department: { type: DataTypes.STRING },
  doj: { type: DataTypes.DATE },
  qualification: { type: DataTypes.STRING },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  bank_account: { type: DataTypes.STRING },
  pan: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'staff', paranoid: true });

db.Class = sequelize.define('Class', {
  school_id: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING },
  class_teacher_id: { type: DataTypes.INTEGER },
  academic_year: { type: DataTypes.STRING },
  max_students: { type: DataTypes.INTEGER },
  room_no: { type: DataTypes.STRING }
}, { tableName: 'classes' });

db.Student = sequelize.define('Student', {
  school_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  admission_no: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATE },
  gender: { type: DataTypes.STRING },
  photo_url: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  blood_group: { type: DataTypes.STRING },
  admission_date: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'inactive', 'transferred', 'graduated'), defaultValue: 'active' }
}, { tableName: 'students', paranoid: true });

db.Parent = sequelize.define('Parent', {
  school_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  father_name: { type: DataTypes.STRING },
  mother_name: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  occupation: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  emergency_contact: { type: DataTypes.STRING }
}, { tableName: 'parents' });

db.Subject = sequelize.define('Subject', {
  school_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  teacher_id: { type: DataTypes.INTEGER },
  subject_name: { type: DataTypes.STRING, allowNull: false },
  subject_code: { type: DataTypes.STRING },
  is_optional: { type: DataTypes.BOOLEAN, defaultValue: false },
  max_marks: { type: DataTypes.INTEGER },
  passing_marks: { type: DataTypes.INTEGER }
}, { tableName: 'subjects' });

db.Attendance = sequelize.define('Attendance', {
  school_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'holiday'), allowNull: false },
  marked_by: { type: DataTypes.INTEGER },
  remarks: { type: DataTypes.STRING }
}, { tableName: 'attendance' });

db.StaffAttendance = sequelize.define('StaffAttendance', {
  school_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  check_in_time: { type: DataTypes.TIME },
  check_out_time: { type: DataTypes.TIME },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'half_day', 'holiday'), allowNull: false },
  leave_type: { type: DataTypes.STRING },
  remarks: { type: DataTypes.STRING }
}, { tableName: 'staff_attendance' });

db.Timetable = sequelize.define('Timetable', {
  school_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
  day_of_week: { type: DataTypes.STRING },
  period_number: { type: DataTypes.INTEGER },
  start_time: { type: DataTypes.TIME },
  end_time: { type: DataTypes.TIME },
  teacher_id: { type: DataTypes.INTEGER },
  room_no: { type: DataTypes.STRING },
  academic_year: { type: DataTypes.STRING }
}, { tableName: 'timetable' });

db.Exam = sequelize.define('Exam', {
  school_id: { type: DataTypes.INTEGER },
  exam_name: { type: DataTypes.STRING, allowNull: false },
  exam_type: { type: DataTypes.STRING },
  academic_year: { type: DataTypes.STRING },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  class_id: { type: DataTypes.INTEGER },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'exams' });

db.Mark = sequelize.define('Mark', {
  school_id: { type: DataTypes.INTEGER },
  exam_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
  marks_obtained: { type: DataTypes.DECIMAL(5, 2) },
  max_marks: { type: DataTypes.DECIMAL(5, 2) },
  grade: { type: DataTypes.STRING },
  is_absent: { type: DataTypes.BOOLEAN, defaultValue: false },
  entered_by: { type: DataTypes.INTEGER },
  entered_at: { type: DataTypes.DATE }
}, { tableName: 'marks' });

db.ReportCard = sequelize.define('ReportCard', {
  school_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  exam_id: { type: DataTypes.INTEGER },
  total_marks: { type: DataTypes.DECIMAL(6, 2) },
  obtained_marks: { type: DataTypes.DECIMAL(6, 2) },
  percentage: { type: DataTypes.DECIMAL(5, 2) },
  grade: { type: DataTypes.STRING },
  rank: { type: DataTypes.INTEGER },
  result: { type: DataTypes.ENUM('pass', 'fail', 'promoted', 'withheld') },
  remarks: { type: DataTypes.TEXT },
  issued_at: { type: DataTypes.DATE },
  pdf_url: { type: DataTypes.STRING }
}, { tableName: 'report_cards' });

db.FeeStructure = sequelize.define('FeeStructure', {
  school_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  fee_head: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  term: { type: DataTypes.STRING },
  academic_year: { type: DataTypes.STRING },
  due_date: { type: DataTypes.DATEONLY },
  late_fine_per_day: { type: DataTypes.DECIMAL(10, 2) }
}, { tableName: 'fee_structures' });

db.FeePayment = sequelize.define('FeePayment', {
  school_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  fee_structure_id: { type: DataTypes.INTEGER },
  amount_paid: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  payment_date: { type: DataTypes.DATEONLY, allowNull: false },
  payment_mode: { type: DataTypes.STRING },
  receipt_no: { type: DataTypes.STRING },
  discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  fine: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  paid_by: { type: DataTypes.INTEGER }
}, { tableName: 'fee_payments' });

db.Payroll = sequelize.define('Payroll', {
  school_id: { type: DataTypes.INTEGER },
  staff_id: { type: DataTypes.INTEGER },
  month: { type: DataTypes.INTEGER },
  year: { type: DataTypes.INTEGER },
  basic: { type: DataTypes.DECIMAL(10, 2) },
  allowances: { type: DataTypes.DECIMAL(10, 2) },
  deductions: { type: DataTypes.DECIMAL(10, 2) },
  net_salary: { type: DataTypes.DECIMAL(10, 2) },
  payment_date: { type: DataTypes.DATEONLY },
  payment_mode: { type: DataTypes.STRING },
  payslip_url: { type: DataTypes.STRING }
}, { tableName: 'payroll' });

db.Leave = sequelize.define('Leave', {
  school_id: { type: DataTypes.INTEGER },
  staff_id: { type: DataTypes.INTEGER },
  leave_type: { type: DataTypes.STRING },
  from_date: { type: DataTypes.DATEONLY },
  to_date: { type: DataTypes.DATEONLY },
  days: { type: DataTypes.DECIMAL(4, 1) },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
  approved_by: { type: DataTypes.INTEGER },
  remarks: { type: DataTypes.STRING }
}, { tableName: 'leaves' });

db.LibraryBook = sequelize.define('LibraryBook', {
  school_id: { type: DataTypes.INTEGER },
  isbn: { type: DataTypes.STRING },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING },
  publisher: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  copies_total: { type: DataTypes.INTEGER, defaultValue: 1 },
  copies_available: { type: DataTypes.INTEGER, defaultValue: 1 },
  shelf_no: { type: DataTypes.STRING }
}, { tableName: 'library_books' });

db.BookIssue = sequelize.define('BookIssue', {
  school_id: { type: DataTypes.INTEGER },
  book_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  issue_date: { type: DataTypes.DATEONLY },
  due_date: { type: DataTypes.DATEONLY },
  return_date: { type: DataTypes.DATEONLY },
  fine_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('issued', 'returned', 'lost'), defaultValue: 'issued' },
  issued_by: { type: DataTypes.INTEGER }
}, { tableName: 'book_issues' });

db.TransportRoute = sequelize.define('TransportRoute', {
  school_id: { type: DataTypes.INTEGER },
  route_name: { type: DataTypes.STRING, allowNull: false },
  bus_no: { type: DataTypes.STRING },
  driver_name: { type: DataTypes.STRING },
  driver_phone: { type: DataTypes.STRING },
  stops: { type: DataTypes.JSON },
  fee_amount: { type: DataTypes.DECIMAL(10, 2) }
}, { tableName: 'transport_routes' });

db.Homework = sequelize.define('Homework', {
  school_id: { type: DataTypes.INTEGER },
  class_id: { type: DataTypes.INTEGER },
  subject_id: { type: DataTypes.INTEGER },
  teacher_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  due_date: { type: DataTypes.DATEONLY },
  attachment_url: { type: DataTypes.STRING }
}, { tableName: 'homework' });

db.HomeworkSubmission = sequelize.define('HomeworkSubmission', {
  school_id: { type: DataTypes.INTEGER },
  homework_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  submitted_at: { type: DataTypes.DATE },
  file_url: { type: DataTypes.STRING },
  marks: { type: DataTypes.DECIMAL(5, 2) },
  feedback: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('submitted', 'graded', 'late'), defaultValue: 'submitted' }
}, { tableName: 'homework_submissions' });

db.Notice = sequelize.define('Notice', {
  school_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT },
  target_role: { type: DataTypes.STRING },
  target_class_id: { type: DataTypes.INTEGER },
  published_by: { type: DataTypes.INTEGER },
  publish_date: { type: DataTypes.DATEONLY },
  attachment_url: { type: DataTypes.STRING },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'notices' });

db.AuditLog = sequelize.define('AuditLog', {
  school_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  action: { type: DataTypes.STRING },
  table_name: { type: DataTypes.STRING },
  record_id: { type: DataTypes.INTEGER },
  old_value: { type: DataTypes.JSON },
  new_value: { type: DataTypes.JSON },
  ip_address: { type: DataTypes.STRING }
}, { tableName: 'audit_logs', updatedAt: false });

// Setup Associations dynamically
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Relationships
db.School.hasMany(db.User, { foreignKey: 'school_id' });
db.School.hasMany(db.Student, { foreignKey: 'school_id' });
db.User.belongsTo(db.School, { foreignKey: 'school_id' });
db.Student.belongsTo(db.School, { foreignKey: 'school_id' });

db.Student.belongsTo(db.Class, { foreignKey: 'class_id', as: 'Class' });
db.Class.hasMany(db.Student, { foreignKey: 'class_id' });

db.AuditLog.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasMany(db.AuditLog, { foreignKey: 'user_id' });

db.Student.hasOne(db.Parent, { foreignKey: 'student_id', as: 'ParentInfo' });
db.Parent.belongsTo(db.Student, { foreignKey: 'student_id' });

db.Student.belongsTo(db.User, { foreignKey: 'user_id' });
db.User.hasOne(db.Student, { foreignKey: 'user_id' });

db.Class.belongsTo(db.Staff, { foreignKey: 'class_teacher_id', as: 'ClassTeacher' });
db.Staff.hasMany(db.Class, { foreignKey: 'class_teacher_id' });

db.Class.hasMany(db.Subject, { foreignKey: 'class_id', as: 'Subjects' });
db.Subject.belongsTo(db.Class, { foreignKey: 'class_id' });

db.Subject.belongsTo(db.Staff, { foreignKey: 'teacher_id', as: 'SubjectTeacher' });

db.Class.hasMany(db.Timetable, { foreignKey: 'class_id', as: 'TimetableSlots' });
db.Timetable.belongsTo(db.Class, { foreignKey: 'class_id' });

db.Timetable.belongsTo(db.Subject, { foreignKey: 'subject_id', as: 'Subject' });
db.Timetable.belongsTo(db.Staff, { foreignKey: 'teacher_id', as: 'Teacher' });

db.Attendance.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.Attendance, { foreignKey: 'student_id' });

db.Attendance.belongsTo(db.Class, { foreignKey: 'class_id' });
db.Class.hasMany(db.Attendance, { foreignKey: 'class_id' });

db.Exam.belongsTo(db.Class, { foreignKey: 'class_id' });
db.Class.hasMany(db.Exam, { foreignKey: 'class_id' });

db.Mark.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Mark.belongsTo(db.Exam, { foreignKey: 'exam_id' });
db.Mark.belongsTo(db.Subject, { foreignKey: 'subject_id' });
db.Exam.hasMany(db.Mark, { foreignKey: 'exam_id' });

db.ReportCard.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.ReportCard, { foreignKey: 'student_id' });
db.ReportCard.belongsTo(db.Exam, { foreignKey: 'exam_id' });
db.Exam.hasMany(db.ReportCard, { foreignKey: 'exam_id' });

db.FeeStructure.belongsTo(db.Class, { foreignKey: 'class_id' });
db.Class.hasMany(db.FeeStructure, { foreignKey: 'class_id' });

db.FeePayment.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.FeePayment, { foreignKey: 'student_id' });
db.FeePayment.belongsTo(db.FeeStructure, { foreignKey: 'fee_structure_id' });

db.Payroll.belongsTo(db.Staff, { foreignKey: 'staff_id' });
db.Staff.hasMany(db.Payroll, { foreignKey: 'staff_id' });

db.Leave.belongsTo(db.Staff, { foreignKey: 'staff_id' });
db.Staff.hasMany(db.Leave, { foreignKey: 'staff_id' });

db.BookIssue.belongsTo(db.LibraryBook, { foreignKey: 'book_id' });
db.BookIssue.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.BookIssue, { foreignKey: 'student_id' });

db.Homework.belongsTo(db.Class, { foreignKey: 'class_id' });
db.Homework.belongsTo(db.Subject, { foreignKey: 'subject_id' });
db.Homework.belongsTo(db.Staff, { foreignKey: 'teacher_id' });

db.HomeworkSubmission.belongsTo(db.Homework, { foreignKey: 'homework_id' });
db.Homework.hasMany(db.HomeworkSubmission, { foreignKey: 'homework_id' });
db.HomeworkSubmission.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasMany(db.HomeworkSubmission, { foreignKey: 'student_id' });

db.TransportAllocation = sequelize.define('TransportAllocation', {
  school_id: { type: DataTypes.INTEGER },
  student_id: { type: DataTypes.INTEGER },
  route_id: { type: DataTypes.INTEGER },
  stop_name: { type: DataTypes.STRING },
  fee_amount: { type: DataTypes.DECIMAL(10, 2) }
}, { tableName: 'transport_allocations' });

db.TransportAllocation.belongsTo(db.Student, { foreignKey: 'student_id' });
db.Student.hasOne(db.TransportAllocation, { foreignKey: 'student_id' });
db.TransportAllocation.belongsTo(db.TransportRoute, { foreignKey: 'route_id' });
db.TransportRoute.hasMany(db.TransportAllocation, { foreignKey: 'route_id' });

db.PlatformSetting = sequelize.define('PlatformSetting', {
  key: { type: DataTypes.STRING, unique: true, allowNull: false },
  value: { type: DataTypes.TEXT },
  updated_by: { type: DataTypes.INTEGER }
}, { tableName: 'platform_settings' });

module.exports = db;

