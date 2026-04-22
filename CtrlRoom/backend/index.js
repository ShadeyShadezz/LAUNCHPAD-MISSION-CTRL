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
app.get('/api/partners', async (req, res) => {
  const partners = await prisma.partner.findMany({
    include: { contacts: true }
  });
  res.json(partners);
});

app.get('/api/partners/:id', async (req, res) => {
  const { id } = req.params;
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { contacts: true, interactions: true }
  });
  res.json(partner);
});

app.post('/api/partners', async (req, res) => {
  const { organizationName, websiteUrl, schoolType, createdById, contacts } = req.body;
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
  res.json(partner);
});

// Interactions Endpoints
app.get('/api/interactions', async (req, res) => {
  const interactions = await prisma.interaction.findMany({
    include: { partner: true, staff: true }
  });
  res.json(interactions);
});

app.post('/api/interactions', async (req, res) => {
  const { partnerId, interactionType, staffId, date, studentCount, sharedNotes, needsFollowup, followupDueDate } = req.body;
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
    }
  });
  res.json(interaction);
});

// Students Endpoints
app.get('/api/students', async (req, res) => {
  const students = await prisma.student.findMany({
    include: { partner: true }
  });
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  const { fullName, email, partnerId, status, cohort, earlyReleaseEligible, addedById } = req.body;
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
  res.json(student);
});

// Dashboard/Stats
app.get('/api/staff/dashboard', async (req, res) => {
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
});

// AI Email Generation
app.post('/api/ai/generate-email', async (req, res) => {
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
app.get('/api/email-drafts', async (req, res) => {
  const { staffId } = req.query;
  const drafts = await prisma.emailDraft.findMany({
    where: { staffId },
    include: { partner: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(drafts);
});

app.post('/api/email-drafts', async (req, res) => {
  const draft = await prisma.emailDraft.create({
    data: req.body,
    include: { partner: true }
  });
  res.json(draft);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
