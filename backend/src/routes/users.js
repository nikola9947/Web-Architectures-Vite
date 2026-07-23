import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbRun, dbGet } from '../utils/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable must be set and contain at least 32 characters."
  );
};

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing.");
}

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const existing = await dbGet(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await dbRun(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const user = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [result.id]);

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: { id: user.id, username: user.username, email: user.email },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    if (username || email) {
      // Check if new username/email already exists
      const existing = await dbGet(
        'SELECT * FROM users WHERE (email = ? OR username = ?) AND id != ?',
        [email, username, userId]
      );

      if (existing) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }
    }

    await dbRun(
      'UPDATE users SET username = COALESCE(?, username), email = COALESCE(?, email), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username || null, email || null, userId]
    );

    const user = await dbGet(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token
router.post('/verify', authenticateToken, async (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
