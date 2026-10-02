import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.ts';
import { authenticateAdmin, AuthRequest } from '../middleware/auth.ts';
import {
  getAdminByEmail,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  adjustUserCoins,
  regenerateApiKey,
  getAllCoinTransactions,
  getAllAPIRequests,
  getSettings,
  updateSettings,
  updateEndpointCost,
  getAdminMetrics,
} from '../db/store.ts';

export const adminRouter = Router();

/**
 * POST /api/admin/login
 * Public admin login endpoint (securely gated)
 */
adminRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: false,
        error: 'VALIDATION_ERROR',
        message: 'Admin email and password are required',
      });
      return;
    }

    const admin = await getAdminByEmail(email);
    if (!admin || !admin.password) {
      res.status(401).json({
        status: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative credentials',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      res.status(401).json({
        status: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative credentials',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      status: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error('[Admin Login Error]:', err);
    res.status(500).json({ status: false, error: 'Internal admin auth error' });
  }
});

// Protect all subsequent admin routes
adminRouter.use(authenticateAdmin);

/**
 * GET /api/admin/me
 * Verify admin session
 */
adminRouter.get('/me', async (req: AuthRequest, res: Response) => {
  res.json({
    status: true,
    admin: req.admin,
  });
});

/**
 * GET /api/admin/dashboard
 * Aggregated metrics for Admin Dashboard
 */
adminRouter.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await getAdminMetrics();
    const settings = await getSettings();
    const recentRequests = await getAllAPIRequests(10);
    const recentTransactions = await getAllCoinTransactions(10);

    res.json({
      status: true,
      metrics,
      settings,
      recentRequests,
      recentTransactions,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/admin/users
 * List and search users
 */
adminRouter.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string;
    const users = await getAllUsers(search);
    // Strip passwords
    const safeUsers = users.map((u) => {
      const { password, ...safe } = u;
      return safe;
    });

    res.json({
      status: true,
      count: safeUsers.length,
      users: safeUsers,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
adminRouter.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      res.status(404).json({ status: false, error: 'User not found' });
      return;
    }
    const { password, ...safe } = user;
    res.json({ status: true, user: safe });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/coins/add
 * Add coins to user
 */
adminRouter.post('/users/:id/coins/add', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, reason } = req.body;
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ status: false, error: 'Valid positive coin amount required' });
      return;
    }

    const result = await adjustUserCoins(
      req.params.id,
      parsedAmount,
      'CREDIT',
      reason || `Manual credit by Admin (${req.admin?.username})`
    );

    if (!result.success) {
      res.status(400).json({ status: false, error: result.error });
      return;
    }

    res.json({
      status: true,
      message: `Successfully credited ${parsedAmount} coins`,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/coins/remove
 * Remove coins from user (preventing negative balance)
 */
adminRouter.post('/users/:id/coins/remove', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, reason } = req.body;
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ status: false, error: 'Valid positive coin amount required' });
      return;
    }

    const result = await adjustUserCoins(
      req.params.id,
      parsedAmount,
      'DEBIT',
      reason || `Manual debit by Admin (${req.admin?.username})`
    );

    if (!result.success) {
      res.status(400).json({ status: false, error: result.error });
      return;
    }

    res.json({
      status: true,
      message: `Successfully deducted ${parsedAmount} coins`,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/ban
 * Ban user
 */
adminRouter.post('/users/:id/ban', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateUser(req.params.id, { status: 'banned' });
    if (!updated) {
      res.status(404).json({ status: false, error: 'User not found' });
      return;
    }
    res.json({ status: true, message: 'User has been banned', user: updated });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/unban
 * Unban user
 */
adminRouter.post('/users/:id/unban', async (req: AuthRequest, res: Response) => {
  try {
    const updated = await updateUser(req.params.id, { status: 'active' });
    if (!updated) {
      res.status(404).json({ status: false, error: 'User not found' });
      return;
    }
    res.json({ status: true, message: 'User has been reactivated', user: updated });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/users/:id/reset-key
 * Reset API key for user
 */
adminRouter.post('/users/:id/reset-key', async (req: AuthRequest, res: Response) => {
  try {
    const newKey = await regenerateApiKey(req.params.id);
    if (!newKey) {
      res.status(404).json({ status: false, error: 'User not found or key reset failed' });
      return;
    }
    res.json({ status: true, message: 'User API key regenerated', apiKey: newKey });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user account
 */
adminRouter.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const success = await deleteUser(req.params.id);
    if (!success) {
      res.status(404).json({ status: false, error: 'User not found or already deleted' });
      return;
    }
    res.json({ status: true, message: 'User deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/admin/coins/transactions
 * Global coin transaction history
 */
adminRouter.get('/coins/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const transactions = await getAllCoinTransactions(limit);
    res.json({ status: true, count: transactions.length, transactions });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/admin/apis/stats
 * API Request statistics and error logs
 */
adminRouter.get('/apis/stats', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 200;
    const requests = await getAllAPIRequests(limit);
    const settings = await getSettings();

    // Group stats by endpoint
    const endpointStats: Record<string, { total: number; success: number; failed: number; totalCost: number; avgTime: number }> = {};

    settings.endpoints.forEach((ep) => {
      endpointStats[ep.endpoint] = { total: 0, success: 0, failed: 0, totalCost: 0, avgTime: 0 };
    });

    let totalDuration = 0;
    requests.forEach((r) => {
      if (!endpointStats[r.endpoint]) {
        endpointStats[r.endpoint] = { total: 0, success: 0, failed: 0, totalCost: 0, avgTime: 0 };
      }
      const st = endpointStats[r.endpoint];
      st.total += 1;
      st.totalCost += r.coinsCharged || 0;
      totalDuration += r.responseTime || 0;
      if (r.responseStatus >= 200 && r.responseStatus < 400) {
        st.success += 1;
      } else {
        st.failed += 1;
      }
    });

    res.json({
      status: true,
      endpoints: settings.endpoints,
      endpointStats,
      recentRequests: requests.slice(0, 50),
      recentErrors: requests.filter((r) => r.responseStatus >= 400).slice(0, 30),
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * POST /api/admin/apis/update-endpoint
 * Update endpoint cost and enable/disable
 */
adminRouter.post('/apis/update-endpoint', async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, cost, enabled } = req.body;
    if (!endpoint) {
      res.status(400).json({ status: false, error: 'Endpoint path is required' });
      return;
    }

    const success = await updateEndpointCost(
      endpoint,
      typeof cost === 'number' ? cost : parseInt(cost, 10),
      typeof enabled === 'boolean' ? enabled : undefined
    );

    if (!success) {
      res.status(404).json({ status: false, error: 'Endpoint not found in configuration' });
      return;
    }

    const settings = await getSettings();
    res.json({
      status: true,
      message: `Updated endpoint ${endpoint}`,
      endpoints: settings.endpoints,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/admin/settings
 */
adminRouter.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await getSettings();
    res.json({ status: true, settings });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * PUT /api/admin/settings
 * Update system settings (name, version, maintenance, signup, default coins, rate limit)
 */
adminRouter.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const {
      apiName,
      apiVersion,
      poweredBy,
      maintenanceMode,
      maintenanceMessage,
      signupEnabled,
      defaultCoins,
      rateLimitPerMinute,
      endpoints,
    } = req.body;

    const updates: any = {};
    if (apiName !== undefined) updates.apiName = apiName;
    if (apiVersion !== undefined) updates.apiVersion = apiVersion;
    if (poweredBy !== undefined) updates.poweredBy = poweredBy;
    if (maintenanceMode !== undefined) updates.maintenanceMode = Boolean(maintenanceMode);
    if (maintenanceMessage !== undefined) updates.maintenanceMessage = maintenanceMessage;
    if (signupEnabled !== undefined) updates.signupEnabled = Boolean(signupEnabled);
    if (defaultCoins !== undefined) updates.defaultCoins = Math.max(0, parseInt(defaultCoins, 10) || 0);
    if (rateLimitPerMinute !== undefined) updates.rateLimitPerMinute = Math.max(1, parseInt(rateLimitPerMinute, 10) || 60);
    if (Array.isArray(endpoints)) updates.endpoints = endpoints;

    const updated = await updateSettings(updates);
    res.json({
      status: true,
      message: 'System settings successfully updated',
      settings: updated,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});
