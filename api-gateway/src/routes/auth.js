import { Router } from 'express';
import { authJwt } from '../middleware/authJwt.js';
import * as authService from '../services/authService.js';
import { User } from '../models/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'email, password, and displayName are required' });
    }
    const { user, token } = await authService.registerUser({ email, password, displayName });
    res.status(201).json({ user: authService.sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const { user, token } = await authService.loginUser({ email, password });
    res.json({ user: authService.sanitizeUser(user), token });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authJwt, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: authService.sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

export default router;
