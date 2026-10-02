import { Router, Response } from 'express';
import { authenticateUser, AuthRequest } from '../middleware/auth.ts';
import {
  getUserCoinTransactions,
  getUserAPIRequests,
  getUserById,
} from '../db/store.ts';

export const userRouter = Router();

// Protect all user routes
userRouter.use(authenticateUser);

/**
 * GET /api/user/transactions
 * Retrieve coin transaction history for the logged-in user
 */
userRouter.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const transactions = await getUserCoinTransactions(req.user!.userId, limit);
    res.json({
      status: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/user/logs
 * Retrieve recent API requests made by this user
 */
userRouter.get('/logs', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = await getUserAPIRequests(req.user!.userId, limit);
    res.json({
      status: true,
      count: logs.length,
      data: logs,
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});

/**
 * GET /api/user/stats
 */
userRouter.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ status: false, error: 'User not found' });
      return;
    }

    res.json({
      status: true,
      data: {
        userId: user.userId,
        username: user.username,
        coinBalance: user.coinBalance,
        totalRequests: user.totalRequests || 0,
        successfulRequests: user.successfulRequests || 0,
        failedRequests: user.failedRequests || 0,
        apiKey: user.apiKey,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ status: false, error: err.message });
  }
});
