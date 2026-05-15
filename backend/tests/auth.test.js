const request = require('supertest');
const app = require('../index');
const db = require('../models');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  // Sync DB in memory / test db
  await db.sequelize.sync({ force: true });

  // Create Demo School
  const school = await db.School.create({
    school_code: 'TEST-SCH-01',
    name: 'Test School',
    is_active: true
  });

  // Create User
  const password_hash = await bcrypt.hash('Password123!', 10);
  await db.User.create({
    school_id: school.id,
    username: 'testadmin',
    password_hash,
    role: 'school_admin',
    is_active: true
  });
});

afterAll(async () => {
  await db.sequelize.close();
});

describe('Auth Endpoints', () => {
  it('should fail with invalid school ID', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        school_id: 'INVALID-SCH',
        username: 'testadmin',
        password: 'Password123!'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toMatch(/Invalid or inactive school ID/);
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        school_id: 'TEST-SCH-01',
        username: 'testadmin',
        password: 'Password123!'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toMatch(/jwt=/);
  });

  it('should fail with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        school_id: 'TEST-SCH-01',
        username: 'testadmin',
        password: 'WrongPassword'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toMatch(/Invalid credentials/);
  });

  it('should lock out after 5 failed attempts', async () => {
    // 4 more failed attempts (1 already done above)
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({ school_id: 'TEST-SCH-01', username: 'testadmin', password: 'Wrong' });
    }
    
    // 6th attempt (even with correct password) should fail due to lockout
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ school_id: 'TEST-SCH-01', username: 'testadmin', password: 'Password123!' });
    
    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toMatch(/Account is locked/);
  });
});
