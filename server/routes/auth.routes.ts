import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.ts';
import {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
  regenerateApiKey,
  getSettings,
} from '../db/store.ts';
import { authenticateUser, AuthRequest } from '../middleware/auth.ts';

export const authRouter = Router();

/**
 * POST /api/auth/register
 */
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Check system settings
    const settings = await getSettings();
    if (!settings.signupEnabled) {
      res.status(403).json({
        status: false,
        error: 'SIGNUP_DISABLED',
        message: 'New user registration is currently disabled by administrator.',
      });
      return;
    }

    if (!username || !email || !password) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Username, email, and password are required',
      });
      return;
    }

    if (username.length < 3 || username.length > 30) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Username must be between 3 and 30 characters',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Please provide a valid email address',
      });
      return;
    }

    // Check existing
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      res.status(409).json({
        status: false,
        error: 'EMAIL_EXISTS',
        message: 'An account with this email already exists',
      });
      return;
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      res.status(409).json({
        status: false,
        error: 'USERNAME_EXISTS',
        message: 'This username is already taken',
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default coins from settings
    const user = await createUser({
      username,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email, role: 'user' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: true,
      message: 'Account successfully registered!',
      token,
      user: {
        id: user.id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        apiKey: user.apiKey,
        coinBalance: user.coinBalance,
        status: user.status,
        createdAt: user.createdAt,
        totalRequests: user.totalRequests,
        successfulRequests: user.successfulRequests,
        failedRequests: user.failedRequests,
      },
    });
  } catch (err: any) {
    console.error('[Register Error]:', err);
    res.status(500).json({
      status: false,
      error: 'SERVER_ERROR',
      message: 'Registration failed due to internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Please provide email or username, and password',
      });
      return;
    }

    // Lookup by email or username
    const user = (await getUserByEmail(identifier)) || (await getUserByUsername(identifier));
    if (!user || !user.password) {
      res.status(401).json({
        status: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email/username or password',
      });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        status: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email/username or password',
      });
      return;
    }

    // Verify account status
    if (user.status === 'banned') {
      res.status(403).json({
        status: false,
        error: 'ACCOUNT_BANNED',
        message: 'Your account is banned. Contact DCT TEAM support.',
      });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email, role: 'user' },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      status: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        userId: user.userId,
        username: user.username,
        email: user.email,
        apiKey: user.apiKey,
        coinBalance: user.coinBalance,
        status: user.status,
        createdAt: user.createdAt,
        totalRequests: user.totalRequests,
        successfulRequests: user.successfulRequests,
        failedRequests: user.failedRequests,
      },
    });
  } catch (err: any) {
    console.error('[Login Error]:', err);
    res.status(500).json({
      status: false,
      error: 'SERVER_ERROR',
      message: 'Login failed due to an unexpected error',
    });
  }
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authenticateUser, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: false, error: 'UNAUTHORIZED' });
    return;
  }

  // Fresh user record
  const fresh = await getUserById(req.user.id);
  if (!fresh) {
    res.status(404).json({ status: false, error: 'USER_NOT_FOUND' });
    return;
  }

  const { password, ...safeUser } = fresh;
  res.json({
    status: true,
    user: safeUser,
  });
});

/**
 * POST /api/auth/regenerate-key
 */
authRouter.post('/regenerate-key', authenticateUser, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ status: false, error: 'UNAUTHORIZED' });
    return;
  }

  const newKey = await regenerateApiKey(req.user.id);
  if (!newKey) {
    res.status(500).json({ status: false, error: 'Failed to regenerate API key' });
    return;
  }

  res.json({
    status: true,
    message: 'API key regenerated successfully. Please update your integrations immediately.',
    apiKey: newKey,
  });
});
