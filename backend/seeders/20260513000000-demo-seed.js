'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Insert Demo School
    await queryInterface.bulkInsert('schools', [{
      school_code: 'SCH-DEMO-001',
      name: 'Global International School',
      address: '123 Education Lane, Tech City',
      contact: '+1234567890',
      is_active: true,
      academic_year: '2026-2027',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    const schools = await queryInterface.sequelize.query(`SELECT id FROM schools WHERE school_code='SCH-DEMO-001';`);
    const schoolId = schools[0][0].id;

    // 2. Insert Users (one of each role)
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const usersData = [
      { school_id: schoolId, username: 'superadmin', email: 'super@school.com', password_hash: passwordHash, role: 'super_admin', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, username: 'schooladmin', email: 'admin@school.com', password_hash: passwordHash, role: 'school_admin', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, username: 'principal', email: 'principal@school.com', password_hash: passwordHash, role: 'principal', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, username: 'teacher1', email: 'teacher@school.com', password_hash: passwordHash, role: 'teacher', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, username: 'student1', email: 'student@school.com', password_hash: passwordHash, role: 'student', createdAt: new Date(), updatedAt: new Date() },
      { school_id: schoolId, username: 'parent1', email: 'parent@school.com', password_hash: passwordHash, role: 'parent', createdAt: new Date(), updatedAt: new Date() }
    ];

    await queryInterface.bulkInsert('users', usersData);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('schools', null, {});
  }
};
