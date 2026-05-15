# School ERP System

A complete Enterprise Resource Planning (ERP) platform for educational institutions.

## Features

- **Multi-Role Dashboards**: Custom interfaces for Super Admin, School Admin, Principal, Teacher, Student, and Parent.
- **Robust Security**: JWT Auth, Helmet.js, rate limiting, and aggressive input sanitization.
- **Audit Logging**: Immutable system mutation logs across core tables.
- **Data Isolation**: Multi-tenant architecture securely separating distinct school branches using `school_id`.

---

## 🚀 Production Deployment Setup

This project uses a highly optimized, multi-stage Docker deployment.

### 1. Prerequisites
Ensure you have `docker` and `docker-compose` installed on your production server.

### 2. Environment Setup
Create a `.env` file in the root directory:
```bash
DB_ROOT_PASSWORD=strong_root_password
DB_NAME=school_erp
DB_USER=erp_user
DB_PASSWORD=strong_erp_password
JWT_SECRET=generate_a_strong_random_string_here
JWT_REFRESH_SECRET=generate_another_strong_string
CORS_ORIGIN=https://your-domain.com
```

### 3. Launching the App
Run the following command to build the optimized containers and start the network:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```
*Note: The frontend is built locally in a Node Alpine container and served via a lightning-fast Nginx instance which also proxies `/api/*` securely to the backend.*

### 4. Database Backup (Cron Job)
A backup script is provided in `/scripts/db-backup.sh`. 
To automatically run it daily at 2:00 AM, edit your crontab (`crontab -e`) and add:
```bash
0 2 * * * /path/to/school-erp/scripts/db-backup.sh
```

---

## 🔑 Test Credentials & Seeding

For testing, use the following provisioned accounts. All test accounts belong to `School ID: SCH-DEMO-001`. The universal test password is `password123`.

| Role | Username | Password |
|------|----------|----------|
| **Super Admin** | `superadmin` | `password123` |
| **School Admin** | `admin_demo` | `password123` |
| **Principal** | `principal_demo` | `password123` |
| **Teacher** | `teacher_demo` | `password123` |
| **Student** | `student_demo` | `password123` |
| **Parent** | `parent_demo` | `password123` |

To apply these seeds to a fresh database, run:
```bash
docker exec -it school-erp-backend-1 npm run seed
```

---
*Built with ❤️ utilizing React, Recharts, Express, Sequelize, and Docker.*
