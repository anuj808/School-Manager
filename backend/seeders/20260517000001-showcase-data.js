'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const schoolId = 1; // From the SCH-DEMO-001 created earlier
    const academicYear = '2026-2027';

    // 1. Create 5 Classes
    const classesData = [
      { school_id: schoolId, name: 'Class 8', section: 'A', academic_year: academicYear, max_students: 30, room_no: '101', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, name: 'Class 8', section: 'B', academic_year: academicYear, max_students: 30, room_no: '102', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, name: 'Class 9', section: 'A', academic_year: academicYear, max_students: 35, room_no: '201', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, name: 'Class 10', section: 'A', academic_year: academicYear, max_students: 40, room_no: '301', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, name: 'Class 10', section: 'B', academic_year: academicYear, max_students: 40, room_no: '302', createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('classes', classesData, {});

    // Fetch the inserted classes to get their IDs
    const [classes] = await queryInterface.sequelize.query(
      `SELECT id FROM classes WHERE school_id = ${schoolId} ORDER BY id DESC LIMIT 5;`
    );
    // Reverse to match the insertion order
    const classIds = classes.map(c => c.id).reverse();

    // 2. Create 10 Users for Students
    const studentUsersData = Array.from({ length: 10 }).map((_, index) => ({
      school_id: schoolId,
      username: `student_demo_${index + 1}`,
      email: `student${index + 1}@demo.com`,
      password_hash: passwordHash,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('users', studentUsersData, {});

    const [studentUsers] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE role = 'student' AND username LIKE 'student_demo_%' ORDER BY id ASC;`
    );

    // 3. Create 10 Students and assign them to the classes
    const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ananya', 'Diya', 'Kavya', 'Ishita'];
    const lastNames = ['Sharma', 'Verma', 'Singh', 'Patel', 'Kumar', 'Reddy', 'Rao', 'Das', 'Joshi', 'Nair'];
    
    const studentsData = studentUsers.map((user, index) => {
      // Assign 2 students to each of the 5 classes
      const classIdIndex = Math.floor(index / 2);
      
      return {
        school_id: schoolId,
        class_id: classIds[classIdIndex],
        user_id: user.id,
        admission_no: `ADM-2026-${1000 + index}`,
        full_name: `${firstNames[index]} ${lastNames[index]}`,
        dob: new Date(2010, index % 12, (index * 2) + 1),
        gender: index >= 6 ? 'Female' : 'Male',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    await queryInterface.bulkInsert('students', studentsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('students', null, {});
    await queryInterface.bulkDelete('users', { role: 'student', username: { [Sequelize.Op.like]: 'student_demo_%' } }, {});
    await queryInterface.bulkDelete('classes', null, {});
  }
};
