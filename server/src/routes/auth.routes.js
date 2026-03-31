import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, fullName, email, birthday, role, password, confirmPassword } = req.body || {};

    if (!username || !fullName || !email || !birthday || !role || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ tất cả thông tin' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Mật khẩu xác nhận không khớp!' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, error: 'Mật khẩu phải tối thiểu 8 ký tự' });
    }

    const exists = await User.findOne({ username });
    if (exists) return res.status(409).json({ success: false, error: 'Tên tài khoản đã tồn tại' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, fullName, email, birthday, role, passwordHash });

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ success: true, user: user.toJSON(), token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Lỗi đăng ký tài khoản' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, error: 'Tên đăng nhập hoặc mật khẩu không chính xác' });

    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ success: true, user: user.toJSON(), token });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'Lỗi đăng nhập' });
  }
});

export default router;