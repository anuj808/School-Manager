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

// ✅ CRITICAL — trust Render's proxy (fixes rate-limit X-Forwarded-For error)
app.set('trust proxy', 1);

// ✅ CORS — must be before everything
const allowedOrigins = [
  'https://school-manager-cm47.vercel.app',
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (
      origin.includes('school-manager') &&
      origin.includes('vercel.app')
    ) {
      return callback(null, true);
    }
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
app.options('*', cors(corsOptions));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: [
          "'self'",
          "https://school-manager-kdu1.onrender.com"
        ]
      }
    },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    noSniff: true
  })
);

// ✅ Input sanitization
app.use(sanitizeInput);
app.use(validateMimeType);

// ✅ Rate limiters
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' }
});

app.use(globalLimiter);

// ✅ Health check
app.get('/api/health', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    res.json({ status: 'ok', db: 'connected', timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: error.message });
  }
});

// ✅ Debug route (remove after confirming everything works)
app.get('/api/debug/db', async (req, res) => {
  try {
    const { sequelize } = require('./models');
    await sequelize.authenticate();
    const [results] = await sequelize.query('SHOW TABLES');
    res.json({
      status: 'connected',
      tables: results,
      db_host: process.env.DB_HOST,
      db_name: process.env.DB_NAME,
      node_env: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'failed',
      error: error.message,
      code: error.original?.code
    });
  }
});

// ✅ Root
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

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS policy violation' });
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
  const { Umzug, SequelizeStorage } = require('umzug');
  const path = require('path');

  const umzug = new Umzug({
    migrations: {
      glob: path.join(__dirname, 'migrations/*.js'),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  sequelize.authenticate()
    .then(async () => {
      console.log('✅ Database connected');
      
      // Auto-run pending migrations
      const pending = await umzug.pending();
      if (pending.length > 0) {
        console.log(`🔄 Running ${pending.length} pending migrations...`);
        await umzug.up();
        console.log('✅ Migrations completed');
      } else {
        console.log('✅ No pending migrations');
      }

      app.listen(port, () => {
        console.log(`✅ Server running on port ${port}`);
        console.log(`✅ Environment: ${process.env.NODE_ENV}`);
      });
    })
    .catch((err) => {
      console.error('❌ Startup failed:', err.message);
      process.exit(1);
    });
}