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
const port = process.env.PORT || 5000;

// ✅ CORS — must be first, before everything
const allowedOrigins = [
  'https://school-manager-cm47.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile, curl)
    if (!origin) return callback(null, true);

    // Allow any vercel.app subdomain for this project
    if (
      origin.includes('school-manager') &&
      origin.includes('vercel.app')
    ) {
      return callback(null, true);
    }

    // Allow specific whitelisted origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// ✅ Handle preflight requests — after corsOptions is defined
app.options('*', cors(corsOptions));

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Helmet — security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "https://school-manager-kdu1.onrender.com"]
      }
    },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true
  })
);

// ✅ Input sanitization & file upload security
app.use(sanitizeInput);
app.use(validateMimeType);

// ✅ Global rate limiter — 100 requests per minute
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(globalLimiter);

// ✅ Auth rate limiter — stricter, 10 requests per minute
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' }
});

// ✅ Health check — no auth required
app.get('/api/health', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', timestamp: new Date() });
  }
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({ message: 'School ERP API is running...', version: 'v1' });
});

// ✅ All routes
app.use('/api/v1/auth', authLimiter, authRoutes);
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

// ✅ 404 handler — catches unknown routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation', origin: req.headers.origin });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// ✅ Export for testing
module.exports = app;

// ✅ Start server
if (require.main === module) {
  const { sequelize } = require('./models');

  sequelize.authenticate()
    .then(() => {
      console.log('✅ Database connected successfully');
      app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
        console.log(`✅ Environment: ${process.env.NODE_ENV}`);
        console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
      });
    })
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    });
}