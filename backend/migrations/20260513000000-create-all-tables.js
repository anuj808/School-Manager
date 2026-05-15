'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const commonFields = {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    };
    
    // 1. schools
    await queryInterface.createTable('schools', {
      ...commonFields,
      school_code: { type: Sequelize.STRING, unique: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      address: { type: Sequelize.TEXT },
      contact: { type: Sequelize.STRING },
      logo_url: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      academic_year: { type: Sequelize.STRING }
    });

    // 2. users
    await queryInterface.createTable('users', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      username: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.ENUM('super_admin', 'school_admin', 'principal', 'teacher', 'student', 'parent'), allowNull: false },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      failed_login_attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      locked_until: { type: Sequelize.DATE },
      last_login: { type: Sequelize.DATE }
    });
    
    await queryInterface.addIndex('users', ['school_id']);

    // 3. staff
    await queryInterface.createTable('staff', {
      ...commonFields,
      deletedAt: { type: Sequelize.DATE },
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      employee_id: { type: Sequelize.STRING },
      full_name: { type: Sequelize.STRING, allowNull: false },
      designation: { type: Sequelize.STRING },
      department: { type: Sequelize.STRING },
      doj: { type: Sequelize.DATE },
      qualification: { type: Sequelize.STRING },
      salary: { type: Sequelize.DECIMAL(10, 2) },
      bank_account: { type: Sequelize.STRING },
      pan: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
    await queryInterface.addIndex('staff', ['school_id']);
    await queryInterface.addIndex('staff', ['user_id']);

    // 4. classes
    await queryInterface.createTable('classes', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      section: { type: Sequelize.STRING },
      class_teacher_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'SET NULL' },
      academic_year: { type: Sequelize.STRING },
      max_students: { type: Sequelize.INTEGER },
      room_no: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('classes', ['school_id']);

    // 5. students
    await queryInterface.createTable('students', {
      ...commonFields,
      deletedAt: { type: Sequelize.DATE },
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'SET NULL' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      admission_no: { type: Sequelize.STRING, allowNull: false },
      full_name: { type: Sequelize.STRING, allowNull: false },
      dob: { type: Sequelize.DATE },
      gender: { type: Sequelize.STRING },
      photo_url: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      blood_group: { type: Sequelize.STRING },
      admission_date: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('active', 'inactive', 'transferred', 'graduated'), defaultValue: 'active' }
    });
    await queryInterface.addIndex('students', ['school_id']);
    await queryInterface.addIndex('students', ['class_id']);

    // 6. parents
    await queryInterface.createTable('parents', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      father_name: { type: Sequelize.STRING },
      mother_name: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      email: { type: Sequelize.STRING },
      occupation: { type: Sequelize.STRING },
      address: { type: Sequelize.TEXT },
      emergency_contact: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('parents', ['school_id']);
    await queryInterface.addIndex('parents', ['student_id']);

    // 7. subjects
    await queryInterface.createTable('subjects', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      teacher_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'SET NULL' },
      subject_name: { type: Sequelize.STRING, allowNull: false },
      subject_code: { type: Sequelize.STRING },
      is_optional: { type: Sequelize.BOOLEAN, defaultValue: false },
      max_marks: { type: Sequelize.INTEGER },
      passing_marks: { type: Sequelize.INTEGER }
    });
    await queryInterface.addIndex('subjects', ['school_id']);
    await queryInterface.addIndex('subjects', ['class_id']);

    // 8. attendance
    await queryInterface.createTable('attendance', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      status: { type: Sequelize.ENUM('present', 'absent', 'late', 'holiday'), allowNull: false },
      marked_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      remarks: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('attendance', ['school_id']);
    await queryInterface.addIndex('attendance', ['student_id']);
    await queryInterface.addIndex('attendance', ['class_id']);
    await queryInterface.addIndex('attendance', ['date']);

    // 9. staff_attendance
    await queryInterface.createTable('staff_attendance', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      check_in_time: { type: Sequelize.TIME },
      check_out_time: { type: Sequelize.TIME },
      status: { type: Sequelize.ENUM('present', 'absent', 'late', 'half_day', 'holiday'), allowNull: false },
      leave_type: { type: Sequelize.STRING },
      remarks: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('staff_attendance', ['school_id']);
    await queryInterface.addIndex('staff_attendance', ['date']);

    // 10. timetable
    await queryInterface.createTable('timetable', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      subject_id: { type: Sequelize.INTEGER, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      day_of_week: { type: Sequelize.STRING },
      period_number: { type: Sequelize.INTEGER },
      start_time: { type: Sequelize.TIME },
      end_time: { type: Sequelize.TIME },
      teacher_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'SET NULL' },
      room_no: { type: Sequelize.STRING },
      academic_year: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('timetable', ['school_id']);
    await queryInterface.addIndex('timetable', ['class_id']);

    // 11. exams
    await queryInterface.createTable('exams', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      exam_name: { type: Sequelize.STRING, allowNull: false },
      exam_type: { type: Sequelize.STRING },
      academic_year: { type: Sequelize.STRING },
      start_date: { type: Sequelize.DATEONLY },
      end_date: { type: Sequelize.DATEONLY },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      is_published: { type: Sequelize.BOOLEAN, defaultValue: false }
    });
    await queryInterface.addIndex('exams', ['school_id']);
    await queryInterface.addIndex('exams', ['class_id']);

    // 12. marks
    await queryInterface.createTable('marks', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      exam_id: { type: Sequelize.INTEGER, references: { model: 'exams', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      subject_id: { type: Sequelize.INTEGER, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      marks_obtained: { type: Sequelize.DECIMAL(5, 2) },
      max_marks: { type: Sequelize.DECIMAL(5, 2) },
      grade: { type: Sequelize.STRING },
      is_absent: { type: Sequelize.BOOLEAN, defaultValue: false },
      entered_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      entered_at: { type: Sequelize.DATE }
    });
    await queryInterface.addIndex('marks', ['school_id']);
    await queryInterface.addIndex('marks', ['student_id']);

    // 13. report_cards
    await queryInterface.createTable('report_cards', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      exam_id: { type: Sequelize.INTEGER, references: { model: 'exams', key: 'id' }, onDelete: 'CASCADE' },
      total_marks: { type: Sequelize.DECIMAL(6, 2) },
      obtained_marks: { type: Sequelize.DECIMAL(6, 2) },
      percentage: { type: Sequelize.DECIMAL(5, 2) },
      grade: { type: Sequelize.STRING },
      rank: { type: Sequelize.INTEGER },
      result: { type: Sequelize.ENUM('pass', 'fail', 'promoted', 'withheld') },
      remarks: { type: Sequelize.TEXT },
      issued_at: { type: Sequelize.DATE },
      pdf_url: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('report_cards', ['school_id']);
    await queryInterface.addIndex('report_cards', ['student_id']);

    // 14. fee_structures
    await queryInterface.createTable('fee_structures', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      fee_head: { type: Sequelize.STRING, allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      term: { type: Sequelize.STRING },
      academic_year: { type: Sequelize.STRING },
      due_date: { type: Sequelize.DATEONLY },
      late_fine_per_day: { type: Sequelize.DECIMAL(10, 2) }
    });
    await queryInterface.addIndex('fee_structures', ['school_id']);
    await queryInterface.addIndex('fee_structures', ['class_id']);

    // 15. fee_payments
    await queryInterface.createTable('fee_payments', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      fee_structure_id: { type: Sequelize.INTEGER, references: { model: 'fee_structures', key: 'id' }, onDelete: 'CASCADE' },
      amount_paid: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_date: { type: Sequelize.DATEONLY, allowNull: false },
      payment_mode: { type: Sequelize.STRING },
      receipt_no: { type: Sequelize.STRING },
      discount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      fine: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      balance: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      paid_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' }
    });
    await queryInterface.addIndex('fee_payments', ['school_id']);
    await queryInterface.addIndex('fee_payments', ['student_id']);
    await queryInterface.addIndex('fee_payments', ['payment_date']);

    // 16. payroll
    await queryInterface.createTable('payroll', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      staff_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE' },
      month: { type: Sequelize.INTEGER },
      year: { type: Sequelize.INTEGER },
      basic: { type: Sequelize.DECIMAL(10, 2) },
      allowances: { type: Sequelize.DECIMAL(10, 2) },
      deductions: { type: Sequelize.DECIMAL(10, 2) },
      net_salary: { type: Sequelize.DECIMAL(10, 2) },
      payment_date: { type: Sequelize.DATEONLY },
      payment_mode: { type: Sequelize.STRING },
      payslip_url: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('payroll', ['school_id']);
    await queryInterface.addIndex('payroll', ['staff_id']);

    // 17. leaves
    await queryInterface.createTable('leaves', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      staff_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE' },
      leave_type: { type: Sequelize.STRING },
      from_date: { type: Sequelize.DATEONLY },
      to_date: { type: Sequelize.DATEONLY },
      days: { type: Sequelize.DECIMAL(4, 1) },
      reason: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },
      approved_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      remarks: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('leaves', ['school_id']);

    // 18. library_books
    await queryInterface.createTable('library_books', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      isbn: { type: Sequelize.STRING },
      title: { type: Sequelize.STRING, allowNull: false },
      author: { type: Sequelize.STRING },
      publisher: { type: Sequelize.STRING },
      category: { type: Sequelize.STRING },
      copies_total: { type: Sequelize.INTEGER, defaultValue: 1 },
      copies_available: { type: Sequelize.INTEGER, defaultValue: 1 },
      shelf_no: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('library_books', ['school_id']);

    // 19. book_issues
    await queryInterface.createTable('book_issues', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      book_id: { type: Sequelize.INTEGER, references: { model: 'library_books', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      issue_date: { type: Sequelize.DATEONLY },
      due_date: { type: Sequelize.DATEONLY },
      return_date: { type: Sequelize.DATEONLY },
      fine_amount: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      status: { type: Sequelize.ENUM('issued', 'returned', 'lost'), defaultValue: 'issued' },
      issued_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' }
    });
    await queryInterface.addIndex('book_issues', ['school_id']);

    // 20. transport_routes
    await queryInterface.createTable('transport_routes', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      route_name: { type: Sequelize.STRING, allowNull: false },
      bus_no: { type: Sequelize.STRING },
      driver_name: { type: Sequelize.STRING },
      driver_phone: { type: Sequelize.STRING },
      stops: { type: Sequelize.JSON },
      fee_amount: { type: Sequelize.DECIMAL(10, 2) }
    });
    await queryInterface.addIndex('transport_routes', ['school_id']);

    // 21. homework
    await queryInterface.createTable('homework', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'CASCADE' },
      subject_id: { type: Sequelize.INTEGER, references: { model: 'subjects', key: 'id' }, onDelete: 'CASCADE' },
      teacher_id: { type: Sequelize.INTEGER, references: { model: 'staff', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      due_date: { type: Sequelize.DATEONLY },
      attachment_url: { type: Sequelize.STRING }
    });
    await queryInterface.addIndex('homework', ['school_id']);
    await queryInterface.addIndex('homework', ['class_id']);

    // 22. homework_submissions
    await queryInterface.createTable('homework_submissions', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      homework_id: { type: Sequelize.INTEGER, references: { model: 'homework', key: 'id' }, onDelete: 'CASCADE' },
      student_id: { type: Sequelize.INTEGER, references: { model: 'students', key: 'id' }, onDelete: 'CASCADE' },
      submitted_at: { type: Sequelize.DATE },
      file_url: { type: Sequelize.STRING },
      marks: { type: Sequelize.DECIMAL(5, 2) },
      feedback: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('submitted', 'graded', 'late'), defaultValue: 'submitted' }
    });
    await queryInterface.addIndex('homework_submissions', ['school_id']);
    await queryInterface.addIndex('homework_submissions', ['homework_id']);

    // 23. notices
    await queryInterface.createTable('notices', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      content: { type: Sequelize.TEXT },
      target_role: { type: Sequelize.STRING },
      target_class_id: { type: Sequelize.INTEGER, references: { model: 'classes', key: 'id' }, onDelete: 'SET NULL' },
      published_by: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      publish_date: { type: Sequelize.DATEONLY },
      attachment_url: { type: Sequelize.STRING },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
    await queryInterface.addIndex('notices', ['school_id']);

    // 24. audit_logs
    await queryInterface.createTable('audit_logs', {
      ...commonFields,
      school_id: { type: Sequelize.INTEGER, references: { model: 'schools', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      action: { type: Sequelize.STRING },
      table_name: { type: Sequelize.STRING },
      record_id: { type: Sequelize.INTEGER },
      old_value: { type: Sequelize.JSON },
      new_value: { type: Sequelize.JSON }
    });
    await queryInterface.addIndex('audit_logs', ['school_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order to avoid FK constraints errors
    const tables = [
      'audit_logs', 'notices', 'homework_submissions', 'homework', 'transport_routes',
      'book_issues', 'library_books', 'leaves', 'payroll', 'fee_payments',
      'fee_structures', 'report_cards', 'marks', 'exams', 'timetable',
      'staff_attendance', 'attendance', 'subjects', 'parents', 'students',
      'classes', 'staff', 'users', 'schools'
    ];
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }
  }
};
