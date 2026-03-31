import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const [, token] = auth.split(' ');

  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, role, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }
  return next();
}

// GET /api/users
router.get('/', requireAuth, requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  return res.json(users.map(u => u.toJSON()));
});

// PUT /api/users/:id/role
router.put('/:id/role', requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body || {};
  if (!role) return res.status(400).json({ success: false, error: 'Missing role' });

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });

  return res.json({ success: true, user: user.toJSON() });
});

export default router;