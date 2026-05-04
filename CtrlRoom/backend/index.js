const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-supersecret-supersecret';

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
};

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'your-gmail@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Auth Endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role = 'STAFF_USER' } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role
      }
    });
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email,
      role: user.role 
    }, JWT_SECRET, { expiresIn: '7d' });
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.fullName, 
        role: user.role 
      } 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Email Send
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html
    });
    
    res.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Send failed' });
  }
});

// Partners Endpoints
app.get('/api/partners', authenticateToken, async (req, res) => {
  try {
    const partners = await prisma.partner.findMany({
      include: { contacts: true }
    });
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

app.get('/api/partners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { contacts: true, interactions: true }
    });
    res.json(partner);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ error: 'Failed to fetch partner' });
  }
});

app.post('/api/partners', authenticateToken, async (req, res) => {
  const { organizationName, websiteUrl, schoolType, createdById, contacts } = req.body;
  try {
    const partner = await prisma.partner.create({
      data: {
        organizationName,
        websiteUrl,
        schoolType,
        createdBy: { connect: { id: createdById } },
        contacts: {
          create: contacts
        }
      }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'partner',
        targetId: partner.id,
        targetName: partner.organizationName
      }
    });

    res.json(partner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Partner creation failed' });
  }
});

app.put('/api/partners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { organizationName, websiteUrl, schoolType, contacts } = req.body;
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: {
        organizationName,
        websiteUrl,
        schoolType,
        contacts: {
          deleteMany: {},
          create: contacts
        }
      },
      include: { contacts: true }
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EDITED',
        targetType: 'partner',
        targetId: partner.id,
        targetName: partner.organizationName
      }
    });

    res.json(partner);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Partner update failed' });
  }
});

app.delete('/api/partners/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const partner = await prisma.partner.findUnique({ where: { id } });
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        targetType: 'partner',
        targetId: partner.id,
        targetName: partner.organizationName
      }
    });

    await prisma.partner.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Partner deletion failed' });
  }
});

// Staff Endpoints
app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        title: true,
        accessLevel: true,
        lastLogin: true,
        createdAt: true
      }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch staff' });
  }
});

app.post('/api/staff', authenticateToken, async (req, res) => {
  const { email, fullName, role = 'STAFF_USER', title, accessLevel, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password || 'DefaultPassword123!', 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        role,
        title,
        accessLevel,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        title: true,
        accessLevel: true,
        createdAt: true
      }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'user',
        targetId: user.id,
        targetName: user.fullName
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: 'Failed to create staff member' });
  }
});

app.put('/api/staff/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { fullName, role, title, accessLevel } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        role,
        title,
        accessLevel
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        title: true,
        accessLevel: true,
        lastLogin: true,
        createdAt: true
      }
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EDITED',
        targetType: 'user',
        targetId: user.id,
        targetName: user.fullName
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

app.delete('/api/staff/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        targetType: 'user',
        targetId: user.id,
        targetName: user.fullName
      }
    });

    await prisma.user.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete staff member' });
  }
});

// Interactions Endpoints
app.get('/api/interactions', authenticateToken, async (req, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      include: { partner: true, staff: true }
    });
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

app.post('/api/interactions', authenticateToken, async (req, res) => {
  const { partnerId, interactionType, staffId, date, studentCount, sharedNotes, needsFollowup, followupDueDate } = req.body;
  try {
    const interaction = await prisma.interaction.create({
      data: {
        partner: { connect: { id: partnerId } },
        interactionType,
        staff: { connect: { id: staffId } },
        date: new Date(date),
        studentCount,
        sharedNotes,
        needsFollowup,
        followupDueDate: followupDueDate ? new Date(followupDueDate) : null
      },
      include: { partner: true }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'interaction',
        targetId: interaction.id,
        targetName: `Interaction with ${interaction.partner.organizationName || 'Unknown Partner'}`
      }
    });

    res.json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to create interaction' });
  }
});

app.put('/api/interactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { interactionType, date, studentCount, sharedNotes, needsFollowup, followupDueDate } = req.body;
  try {
    const interaction = await prisma.interaction.update({
      where: { id },
      data: {
        interactionType,
        date: new Date(date),
        studentCount,
        sharedNotes,
        needsFollowup,
        followupDueDate: followupDueDate ? new Date(followupDueDate) : null
      },
      include: { partner: true }
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EDITED',
        targetType: 'interaction',
        targetId: interaction.id,
        targetName: `Interaction with ${interaction.partner.organizationName}`
      }
    });

    res.json(interaction);
  } catch (error) {
    console.error('Error updating interaction:', error);
    res.status(500).json({ error: 'Failed to update interaction' });
  }
});

app.delete('/api/interactions/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const interaction = await prisma.interaction.findUnique({ 
      where: { id },
      include: { partner: true }
    });
    if (!interaction) return res.status(404).json({ error: 'Interaction not found' });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        targetType: 'interaction',
        targetId: interaction.id,
        targetName: `Interaction with ${interaction.partner.organizationName}`
      }
    });

    await prisma.interaction.delete({ where: { id } });
    res.json({ success: true, message: 'Interaction deleted' });
  } catch (error) {
    console.error('Error deleting interaction:', error);
    res.status(500).json({ error: 'Failed to delete interaction' });
  }
});

// Students Endpoints
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { partner: true }
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', authenticateToken, async (req, res) => {
  const { fullName, email, partnerId, status, cohort, earlyReleaseEligible, addedById } = req.body;
  try {
    const student = await prisma.student.create({
      data: {
        fullName,
        email,
        partner: { connect: { id: partnerId } },
        status,
        cohort,
        earlyReleaseEligible,
        addedBy: { connect: { id: addedById } }
      }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'student',
        targetId: student.id,
        targetName: student.fullName
      }
    });

    res.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.put('/api/students/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { fullName, email, status, cohort, earlyReleaseEligible } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        fullName,
        email,
        status,
        cohort,
        earlyReleaseEligible
      },
      include: { partner: true }
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EDITED',
        targetType: 'student',
        targetId: student.id,
        targetName: student.fullName
      }
    });

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/api/students/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        targetType: 'student',
        targetId: student.id,
        targetName: student.fullName
      }
    });

    await prisma.student.delete({ where: { id } });
    res.json({ success: true, message: 'Student deleted' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Dashboard/Stats
app.get('/api/staff/dashboard', authenticateToken, async (req, res) => {
  try {
    const recentInteractions = await prisma.interaction.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: { partner: true, staff: true }
    });
    
    const pendingFollowups = await prisma.interaction.count({
      where: { needsFollowup: true }
    });

    res.json({
      recentInteractions,
      pendingFollowups
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// AI Email Generation
app.post('/api/ai/generate-email', authenticateToken, async (req, res) => {
  try {
    const { userPrompt, partnerId } = req.body;
    
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      include: { contacts: true }
    });
    
    if (!partner) return res.status(404).json({ error: 'Partner not found' });
    
    const partnerContext = `Organization: ${partner.organizationName}\nType: ${partner.schoolType || 'N/A'}\nWebsite: ${partner.websiteUrl || 'N/A'}\nContacts: ${partner.contacts.map(c => c.name + ' (' + c.email + ')').join('; ') || 'None'}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an email assistant for partnerships. Generate professional email draft (Subject: ... Body: ...) based on context/input. Do NOT retain any data/PII - one-time generation only.',
        },
        {
          role: 'user',
          content: `Prompt: ${userPrompt}\n\nContext:\n${partnerContext}`,
        },
      ],
      temperature: 0.4,
    });
    
    const email = response.choices[0].message.content.trim();
    res.json({ email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Email Drafts
app.get('/api/email-drafts', authenticateToken, async (req, res) => {
  const { staffId } = req.query;
  try {
    const drafts = await prisma.emailDraft.findMany({
      where: { staffId },
      include: { partner: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(drafts);
  } catch (error) {
    console.error('Error fetching email drafts:', error);
    res.status(500).json({ error: 'Failed to fetch email drafts' });
  }
});

app.post('/api/email-drafts', authenticateToken, async (req, res) => {
  try {
    const draft = await prisma.emailDraft.create({
      data: req.body,
      include: { partner: true }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'emailDraft',
        targetId: draft.id,
        targetName: `Email draft to ${draft.partner.organizationName || 'Unknown Partner'}`
      }
    });

    res.json(draft);
  } catch (error) {
    console.error('Error creating email draft:', error);
    res.status(500).json({ error: 'Failed to create email draft' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Saved Search Endpoints
app.get('/api/saved-searches/:searchType', authenticateToken, async (req, res) => {
  const { searchType } = req.params;
  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        userId: req.user.id,
        searchType
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(savedSearches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    res.status(500).json({ error: 'Failed to fetch saved searches' });
  }
});

app.post('/api/saved-searches', authenticateToken, async (req, res) => {
  const { name, searchType, filters, isDefault = false } = req.body;
  try {
    // If setting as default, unset other defaults for this user and search type
    if (isDefault) {
      await prisma.savedSearch.updateMany({
        where: {
          userId: req.user.id,
          searchType,
          isDefault: true
        },
        data: { isDefault: false }
      });
    }

    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId: req.user.id,
        name,
        searchType,
        filters,
        isDefault
      }
    });

    // Log the creation
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'ADDED',
        targetType: 'saved_search',
        targetId: savedSearch.id,
        targetName: savedSearch.name
      }
    });

    res.json(savedSearch);
  } catch (error) {
    console.error('Error creating saved search:', error);
    res.status(500).json({ error: 'Failed to create saved search' });
  }
});

app.put('/api/saved-searches/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, filters, isDefault = false } = req.body;
  try {
    const existingSearch = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!existingSearch || existingSearch.userId !== req.user.id) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    // If setting as default, unset other defaults for this user and search type
    if (isDefault) {
      await prisma.savedSearch.updateMany({
        where: {
          userId: req.user.id,
          searchType: existingSearch.searchType,
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const savedSearch = await prisma.savedSearch.update({
      where: { id },
      data: {
        name,
        filters,
        isDefault
      }
    });

    // Log the update
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'EDITED',
        targetType: 'saved_search',
        targetId: savedSearch.id,
        targetName: savedSearch.name
      }
    });

    res.json(savedSearch);
  } catch (error) {
    console.error('Error updating saved search:', error);
    res.status(500).json({ error: 'Failed to update saved search' });
  }
});

app.delete('/api/saved-searches/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const savedSearch = await prisma.savedSearch.findUnique({
      where: { id }
    });

    if (!savedSearch || savedSearch.userId !== req.user.id) {
      return res.status(404).json({ error: 'Saved search not found' });
    }

    await prisma.savedSearch.delete({ where: { id } });

    // Log the deletion
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETED',
        targetType: 'saved_search',
        targetId: savedSearch.id,
        targetName: savedSearch.name
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting saved search:', error);
    res.status(500).json({ error: 'Failed to delete saved search' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});
