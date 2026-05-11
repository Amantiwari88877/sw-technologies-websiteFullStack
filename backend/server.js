const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'sw_technologies_jwt_secret_2025_very_secure';
const ADMIN_SECRET = 'sw_admin_secret_key';

// ─── DATABASE SETUP (json file-based, no native modules needed) ───
const DB_PATH = path.join(__dirname, 'database.json');

function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    const init = { users: [], contacts: [], newsletter: [], quotes: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length === 0 ? 1 : Math.max(...arr.map(x => x.id)) + 1;
}

// ─── MIDDLEWARE ───
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── AUTH MIDDLEWARE ───
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ═══════════════════════════════════════════
// ─── AUTH ROUTES ───
// ═══════════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password } = req.body;
  const db = loadDB();

  if (db.users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = {
    id: nextId(db.users),
    name,
    email,
    password: hashedPassword,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  saveDB(db);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, isAdmin: false }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ message: 'Registration successful', token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/login
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find(u => u.email === email);

  if (!user) return res.status(401).json({ error: 'Invalid email or password' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
});

// GET /api/auth/profile
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const db = loadDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, createdAt: user.createdAt });
});

// ═══════════════════════════════════════════
// ─── CONTACT ROUTES ───
// ═══════════════════════════════════════════

// POST /api/contact
app.post('/api/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').matches(/^(\+91[\s-]?)?[6-9]\d{9}$/).withMessage('Valid Indian phone number required'),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject must be at least 3 characters'),
  body('message').trim().isLength({ min: 20 }).withMessage('Message must be at least 20 characters'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone, subject, service, message } = req.body;
  const db = loadDB();

  const contact = {
    id: nextId(db.contacts),
    name, email, phone, subject,
    service: service || 'Not specified',
    message,
    createdAt: new Date().toISOString()
  };

  db.contacts.push(contact);
  saveDB(db);

  res.status(201).json({ message: 'Message sent successfully! We will reply within 24 hours.' });
});

// ═══════════════════════════════════════════
// ─── NEWSLETTER ROUTES ───
// ═══════════════════════════════════════════

// POST /api/newsletter/subscribe
app.post('/api/newsletter/subscribe', [
  body('email').isEmail().withMessage('Valid email address required'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email } = req.body;
  const db = loadDB();

  if (db.newsletter.find(n => n.email === email)) {
    return res.status(409).json({ error: 'You are already subscribed' });
  }

  db.newsletter.push({ id: nextId(db.newsletter), email, subscribedAt: new Date().toISOString() });
  saveDB(db);

  res.status(201).json({ message: 'Successfully subscribed to our newsletter!' });
});

// ═══════════════════════════════════════════
// ─── QUOTE ROUTES ───
// ═══════════════════════════════════════════

// POST /api/quote
app.post('/api/quote', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').matches(/^(\+91[\s-]?)?[6-9]\d{9}$/).withMessage('Valid phone required'),
  body('service').notEmpty().withMessage('Please select a service'),
  body('budget').notEmpty().withMessage('Please select a budget'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone, service, budget, message } = req.body;
  const db = loadDB();

  const quote = {
    id: nextId(db.quotes),
    name, email, phone, service, budget, message,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.quotes.push(quote);
  saveDB(db);

  res.status(201).json({ message: 'Quote request received! We will contact you within 24 hours with a detailed quote.' });
});

// ═══════════════════════════════════════════
// ─── ADMIN ROUTES ───
// ═══════════════════════════════════════════

// GET /api/admin/contacts
app.get('/api/admin/contacts', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.contacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// DELETE /api/admin/contacts/:id
app.delete('/api/admin/contacts/:id', adminMiddleware, (req, res) => {
  const db = loadDB();
  const idx = db.contacts.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Contact not found' });
  db.contacts.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Deleted successfully' });
});

// GET /api/admin/users
app.get('/api/admin/users', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.users.map(u => ({ id: u.id, name: u.name, email: u.email, isAdmin: u.isAdmin, createdAt: u.createdAt })));
});

// GET /api/admin/quotes
app.get('/api/admin/quotes', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// DELETE /api/admin/quotes/:id
app.delete('/api/admin/quotes/:id', adminMiddleware, (req, res) => {
  const db = loadDB();
  const idx = db.quotes.findIndex(q => q.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Quote not found' });
  db.quotes.splice(idx, 1);
  saveDB(db);
  res.json({ message: 'Deleted successfully' });
});

// GET /api/admin/newsletter
app.get('/api/admin/newsletter', adminMiddleware, (req, res) => {
  const db = loadDB();
  res.json(db.newsletter);
});

// ─── CATCH-ALL: serve frontend ───
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n✅ SW Technologies backend running on http://localhost:${PORT}`);
  console.log(`📁 Serving frontend from: ../frontend/`);
  console.log(`🔑 Admin credentials: admin@swtechnologies.in / Admin@123\n`);
});
