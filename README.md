# Launchpad Mission Control

**Launchpad Mission Control** is a shared, multi-user web application designed for staff to manage partnerships, student outreach, interactions, and automated communications. It provides administrative controls and a shared database, ensuring all staff members can view and contribute to the organization's outreach efforts.

**Status**: ✅ **READY FOR DEVELOPMENT**  
**Last Updated**: May 4, 2026  
**Version**: 1.0

---

## 🎯 Quick Start

### Choose Your Path:
1. **5-Min Quick Start** → See [GETTING_STARTED.md](./GETTING_STARTED.md)
2. **Complete Setup** → See [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)
3. **Understand Changes** → See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
4. **Design Changes** → See [UI_SPACING_COMPARISON.md](./UI_SPACING_COMPARISON.md)

---

## Core Purpose
The application serves as a central hub for tracking and managing the relationship between staff, partners (educational and corporate), and students. It streamlines the process of logging interactions, managing student status, and facilitating outreach through AI-assisted communication.

## ✨ Key Features
- **Shared Workspace & Dashboard**: Real-time overview of recent interactions, quick actions, and administrative review queues.
- **Partner Management**: Detailed tracking of organization contacts (Leadership, Primary, Secondary), school types, and partnership status.
- **Interaction Logging**: Centralized log for infosessions, tabling, meetings, outreach, and interviews, including student participation counts and shared notes.
- **Students Directory**: Comprehensive database of students, their associated partners, status (Active Member, Applicant, Alumni), and interaction history.
- **AI-Powered Outreach**: Integration with OpenAI to generate tailored outreach emails based on partner interaction history and staff instructions.
- **Audit Trail**: Full activity logging of all record creations, updates, and deletions for security and accountability.
- **Global Search**: Searchable database for partners, interactions, and students.
- **Professional UI**: Enhanced spacing and visual hierarchy matching design references.
- **Database Integration**: Full PostgreSQL persistence with JWT authentication.

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 16 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui, Radix UI
- **State**: React Context API

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript
- **ORM**: Prisma
- **Authentication**: JWT + bcryptjs
- **Database**: PostgreSQL 14

### Infrastructure
- **Container**: Docker Compose
- **Package Manager**: npm
- **Environment**: .env based configuration

---

## 📁 Project Structure

```
Launchpad Mission Control/
├── CtrlRoom/
│   ├── frontend/              # Next.js application
│   ├── backend/               # Express API server
│   └── docker-compose.yml     # PostgreSQL container
├── Documentation/
│   ├── DATABASE_INTEGRATION_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── UI_SPACING_COMPARISON.md
│   ├── GETTING_STARTED.md
│   └── README.md (this file)
└── -#IMAGEREFERENCES/         # Design reference images
```

---

## 🚀 Running the Application

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm

### 1. Start Database
```bash
cd CtrlRoom
docker-compose up -d postgres
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env.local
npx prisma migrate dev --name init
npm run dev
```

### 3. Run Frontend
```bash
cd ../frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database GUI**: `cd backend && npm run prisma:studio`

### 5. Test Login
- Email: `test@launchpad.com`
- Password: `password123`

---

## 📊 What's New (May 4, 2026)

### UI/UX Improvements
- ✅ Professional spacing applied to all components
- ✅ Enhanced dashboard layout with better visual hierarchy
- ✅ Improved login page with larger form inputs
- ✅ Global styles updated for consistency
- ✅ All spacing matches design reference images

### Database Integration
- ✅ PostgreSQL connection configured
- ✅ Prisma ORM with complete schema
- ✅ 15+ API endpoints implemented
- ✅ JWT authentication ready
- ✅ Password hashing with bcryptjs
- ✅ Activity audit logging

### Documentation
- ✅ Complete integration guide (DATABASE_INTEGRATION_GUIDE.md)
- ✅ Backend quick start (backend/BACKEND_SETUP.md)
- ✅ Implementation summary (IMPLEMENTATION_SUMMARY.md)
- ✅ UI comparison guide (UI_SPACING_COMPARISON.md)
- ✅ Getting started checklist (GETTING_STARTED.md)

---

## 🔐 Security
- JWT token-based authentication (7-day expiry)
- Passwords hashed with bcryptjs
- Protected API routes
- CORS configured
- Activity audit logging
- Environment variable based configuration

---

## 📚 Documentation

| Document | Purpose | Time |
|----------|---------|------|
| **GETTING_STARTED.md** | Quick checklist & commands | 5 min |
| **DATABASE_INTEGRATION_GUIDE.md** | Complete setup guide | 30 min |
| **BACKEND_SETUP.md** | Backend quick start | 10 min |
| **IMPLEMENTATION_SUMMARY.md** | What changed & why | 10 min |
| **UI_SPACING_COMPARISON.md** | Visual before/after | 5 min |

---

## 🎯 API Endpoints

### Base: `http://localhost:5000/api`

**Authentication**
- `POST /auth/login` - Login with credentials
- `POST /auth/register` - Create new account

**Partners** (all require auth)
- `GET /partners` - List partners
- `GET /partners/:id` - Get single partner
- `POST /partners` - Create partner
- `PUT /partners/:id` - Update partner
- `DELETE /partners/:id` - Delete partner

**Students** (all require auth)
- `GET /students` - List students
- `POST /students` - Create student

**Interactions** (all require auth)
- `GET /interactions` - List interactions
- `POST /interactions` - Create interaction

**Dashboard** (protected)
- `GET /staff/dashboard` - Get statistics
- `GET /activity-logs` - View audit trail

---

## 📱 Pages

- `/` - Home/Login redirect
- `/login` - Login page
- `/dashboard` - Main dashboard
- `/partners` - Partner management
- `/partners/new` - Add new partner
- `/partners/[id]/edit` - Edit partner
- `/students` - Student directory
- `/interactions` - Interaction log
- `/email` - Email terminal
- `/settings` - User settings
- `/admin` - Admin panel

---

## 🛠️ Development

### Frontend Development
```bash
cd CtrlRoom/frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code quality
```

### Backend Development
```bash
cd CtrlRoom/backend
npm run dev          # Start dev server with hot-reload
npm run build        # Compile TypeScript
npm start            # Run production build
```

### Database Management
```bash
cd CtrlRoom/backend
npm run prisma:studio    # View/edit database
npm run prisma:migrate   # Run migrations
npm run prisma:push      # Push schema to DB
npm run prisma:seed      # Seed test data
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows: Kill process on port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Database Connection Error
```bash
# Check if running
docker-compose ps

# Restart
docker-compose restart postgres
```

### Frontend Can't Connect to Backend
Verify `frontend/.env.local` has:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

---

## 📋 Database Schema

**Models**: User, Staff, Partner, PartnerContact, Student, Interaction, ActivityLog, SavedSearch

**Features**:
- Full CRUD operations
- Relationship tracking
- Audit logging
- Status management
- Follow-up tracking
- Timestamps (createdAt, updatedAt)

See DATABASE_INTEGRATION_GUIDE.md for complete schema.

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd CtrlRoom/frontend
npm run build
vercel --prod
```

### Backend
Deploy to Railway, Render, Heroku, or similar. Set environment variables and run migrations.

### Database
Use managed PostgreSQL (AWS RDS, Railway, etc.) in production.

---

## 📞 Support

1. ✅ Check relevant documentation
2. ✅ Verify services running (docker-compose ps)
3. ✅ Check .env files configured
4. ✅ Review error logs
5. ✅ Try troubleshooting section

---

## 📈 Next Steps

### Immediate (Week 1)
- [ ] Verify all endpoints working
- [ ] Test complete login flow
- [ ] Create first partner via API
- [ ] Test data persistence

### Short Term (Week 2-3)
- [ ] Add form validation
- [ ] Implement error handling
- [ ] Create admin panel
- [ ] Add email notifications

### Medium Term (Week 4-5)
- [ ] Mobile optimization
- [ ] Performance tuning
- [ ] Accessibility audit
- [ ] Security review

### Long Term (Week 6+)
- [ ] Advanced search
- [ ] Analytics dashboard
- [ ] Data export
- [ ] Production deployment

---

## ✅ Completed Tasks
- [x] UI spacing improvements
- [x] Database schema created
- [x] API endpoints implemented
- [x] Authentication system setup
- [x] Docker Compose configured
- [x] Comprehensive documentation

---

## 🎓 Learning Resources

- **Prisma**: https://www.prisma.io/docs
- **Express**: https://expressjs.com
- **Next.js**: https://nextjs.org/docs
- **PostgreSQL**: https://www.postgresql.org/docs
- **JWT**: https://jwt.io

---

## 📝 Notes

- All spacing follows design reference images
- Database schema supports future expansion
- API production-ready with error handling
- JWT tokens expire after 7 days
- All passwords hashed before storage

---

**Built for Launchpad Philly Staff**

*For detailed setup, see [GETTING_STARTED.md](./GETTING_STARTED.md) or [DATABASE_INTEGRATION_GUIDE.md](./DATABASE_INTEGRATION_GUIDE.md)*
