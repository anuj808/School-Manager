require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const schoolsRoutes = require('./routes/schools.routes');
const studentsRoutes = require('./routes/students.routes');
const classesRoutes = require('./routes/classes.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const examsRoutes = require('./routes/exams.routes');
const reportCardsRoutes = require('./routes/report-cards.routes');
const feesRoutes = require('./routes/fees.routes');
const hrRoutes = require('./routes/hr.routes');
const libraryRoutes = require('./routes/library.routes');
const transportRoutes = require('./routes/transport.routes');
const homeworkRoutes = require('./routes/homework.routes');
const noticesRoutes = require('./routes/notices.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const auditLogsRoutes = require('./routes/audit-logs.routes');
const adminRoutes = require('./routes/admin.routes');
const { sanitizeInput, validateMimeType } = require('./middleware/security');
const auditLog = require('./middleware/auditLog');

const app = express();
app.options('*', cors())
const port = process.env.PORT || 5000;

// Security Middleware
const allowedOrigins = [
  'https://school-manager-cm47.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
]

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true)
    
    // Allow any vercel.app subdomain for this project
    if (origin.includes('school-manager') && origin.includes('vercel.app')) {
      return callback(null, true)
    }
    
    // Allow specific origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}))
app.use(express.json());

// Helmet.js - Security Headers (CSP, X-Frame-Options, X-Content-Type-Options, HSTS)
app.use(helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
  frameguard: { action: 'deny' },
  hsts: { maxAge: 31536000, includeSubDomains: true },
  noSniff: true
}));

// Input sanitization and File Upload security on POST/PUT
app.use(sanitizeInput);
app.use(validateMimeType);
app.use(cookieParser());

// Global Rate Limiter (100 req/min)
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolsRoutes);
app.use('/api/v1/students', auditLog('students'), studentsRoutes);
app.use('/api/v1/classes', classesRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/exams', examsRoutes);
app.use('/api/v1/report-cards', reportCardsRoutes);
app.use('/api/v1/fees', auditLog('fees'), feesRoutes);
app.use('/api/v1/hr', auditLog('staff'), hrRoutes);
app.use('/api/v1/library', libraryRoutes);
app.use('/api/v1/transport', transportRoutes);
app.use('/api/v1/homework', homeworkRoutes);
app.use('/api/v1/notices', noticesRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/audit-logs', auditLogsRoutes);
app.use('/api/v1/admin', adminRoutes);

const { sequelize } = require('./models');

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

app.get('/', (req, res) => {
  res.send('School ERP API is running...');
});

// Export app for testing
module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
