import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// AUTH MIDDLEWARE
// ============================================

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============================================
// AUTH ROUTES
// ============================================

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        title: user.title,
        accessLevel: user.accessLevel,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        fullName,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ============================================
// PARTNERS ROUTES
// ============================================

app.get('/api/partners', verifyToken, async (req: Request, res: Response) => {
  try {
    const partners = await prisma.partner.findMany({
      include: {
        contacts: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

app.get('/api/partners/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        contacts: true,
        interactions: true,
      },
    });

    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

app.post('/api/partners', verifyToken, async (req: Request, res: Response) => {
  try {
    const { organizationName, schoolType, websiteUrl, courseNumber, earlyReleaseForSeniors, tags, contacts } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const partner = await prisma.partner.create({
      data: {
        organizationName,
        schoolType,
        websiteUrl,
        courseNumber: courseNumber ? parseInt(courseNumber) : null,
        earlyReleaseForSeniors: earlyReleaseForSeniors || false,
        tags: tags || [],
        createdById: req.user.id,
      },
      include: { contacts: true },
    });

    // Create contacts if provided
    if (contacts && Array.isArray(contacts)) {
      await Promise.all(
        contacts.map((contact: any) =>
          prisma.contact.create({
            data: {
              partnerId: partner.id,
              name: contact.name,
              email: contact.email,
              title: contact.title,
              contactType: contact.contactType || 'SECONDARY',
            },
          })
        )
      );
    }

    res.status(201).json(partner);
  } catch (error: any) {
    console.error('Error creating partner:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Organization name already exists' });
    }
    res.status(500).json({ error: 'Failed to create partner' });
  }
});

app.put('/api/partners/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { organizationName, schoolType, websiteUrl, courseNumber, earlyReleaseForSeniors, tags } = req.body;

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        organizationName,
        schoolType,
        websiteUrl,
        courseNumber: courseNumber ? parseInt(courseNumber) : null,
        earlyReleaseForSeniors,
        tags,
        updatedAt: new Date(),
      },
      include: { contacts: true },
    });

    res.json(partner);
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ error: 'Failed to update partner' });
  }
});

app.delete('/api/partners/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.partner.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ error: 'Failed to delete partner' });
  }
});

// ============================================
// STUDENTS ROUTES
// ============================================

app.get('/api/students', verifyToken, async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: { addedDate: 'desc' },
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', verifyToken, async (req: Request, res: Response) => {
  try {
    const { fullName, email, partnerId, status, cohort, earlyReleaseEligible, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const student = await prisma.student.create({
      data: {
        fullName,
        email,
        partnerId,
        status: status || 'PENDING',
        cohort,
        earlyReleaseEligible: earlyReleaseEligible || false,
        notes,
        addedById: req.user.id,
      },
    });

    res.status(201).json(student);
  } catch (error: any) {
    console.error('Error creating student:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// ============================================
// INTERACTIONS ROUTES
// ============================================

app.get('/api/interactions', verifyToken, async (req: Request, res: Response) => {
  try {
    const interactions = await prisma.interaction.findMany({
      include: {
        partner: true,
        staff: true,
      },
      orderBy: { date: 'desc' },
    });
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

app.post('/api/interactions', verifyToken, async (req: Request, res: Response) => {
  try {
    const { partnerId, interactionType, date, studentCount, sharedNotes, needsFollowup, followupDueDate } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const interaction = await prisma.interaction.create({
      data: {
        partnerId,
        interactionType,
        staffId: req.user.id,
        date: new Date(date),
        studentCount: studentCount || 0,
        sharedNotes,
        needsFollowup: needsFollowup || false,
        followupDueDate: followupDueDate ? new Date(followupDueDate) : null,
      },
    });

    res.status(201).json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

// ============================================
// DASHBOARD ROUTE
// ============================================

app.get('/api/staff/dashboard', verifyToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const recentInteractions = await prisma.interaction.findMany({
      take: 5,
      where: { staffId: req.user.id },
      orderBy: { date: 'desc' },
      include: {
        partner: true,
      },
    });

    const pendingFollowups = await prisma.interaction.count({
      where: {
        staffId: req.user.id,
        needsFollowup: true,
        followupDueDate: { lte: new Date() },
      },
    });

    const totalPartners = await prisma.partner.count();
    const totalStudents = await prisma.student.count();

    res.json({
      recentInteractions,
      pendingFollowups,
      stats: {
        totalPartners,
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ============================================
// ACTIVITY LOG
// ============================================

app.get('/api/activity-logs', verifyToken, async (req: Request, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
  console.log(`
  ✅ Launchpad Mission Control Backend
  📍 http://localhost:${PORT}
  🗄️  Database: PostgreSQL
  🔒 Authentication: JWT
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit();
});

export default app;
