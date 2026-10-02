import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.ts';
import {
  getUserByApiKey,
  getUserById,
  getEndpointConfig,
  getSettings,
  deductCoins,
  recordAPIRequest,
  IUser,
} from '../db/store.ts';

// Extend Express Request
export interface AuthRequest extends Request {
  user?: IUser;
  admin?: { id: string; email: string; role: string; username: string };
  apiKeyUser?: IUser;
  endpointCost?: number;
  apiStartTime?: number;
  matchedEndpoint?: string;
}

// User JWT Auth Middleware
export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication token required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role?: string };

    const user = await getUserById(decoded.id);
    if (!user) {
      res.status(401).json({
        status: false,
        error: 'USER_NOT_FOUND',
        message: 'Account no longer exists',
      });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({
        status: false,
        error: 'ACCOUNT_BANNED',
        message: 'Your account has been suspended by DCT TEAM administrators.',
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      status: false,
      error: 'INVALID_TOKEN',
      message: 'Session expired or token is invalid. Please log in again.',
    });
  }
}

// Admin JWT Auth Middleware
export async function authenticateAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: false,
        error: 'ADMIN_UNAUTHORIZED',
        message: 'Admin authorization header required',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
      username: string;
    };

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      res.status(403).json({
        status: false,
        error: 'FORBIDDEN',
        message: 'Administrative privileges required',
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({
      status: false,
      error: 'INVALID_ADMIN_TOKEN',
      message: 'Admin session expired or invalid credentials.',
    });
  }
}

// Public API Key & Coin Validation Middleware
export function requireApiKeyAndCoins(endpointPath: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    req.apiStartTime = startTime;
    req.matchedEndpoint = endpointPath;

    // 1. Check System Maintenance Mode
    const settings = await getSettings();
    if (settings.maintenanceMode && endpointPath !== '/api/health') {
      res.status(503).json({
        status: false,
        error: 'MAINTENANCE_MODE',
        message: settings.maintenanceMessage || 'API is temporarily in maintenance mode.',
        creator: `${settings.apiName} | ${settings.poweredBy}`,
      });
      return;
    }

    // 2. Check if endpoint is enabled
    const endpointConfig = await getEndpointConfig(endpointPath);
    if (endpointConfig && !endpointConfig.enabled && endpointPath !== '/api/health') {
      res.status(403).json({
        status: false,
        error: 'ENDPOINT_DISABLED',
        message: `Endpoint ${endpointPath} is currently disabled by administrator.`,
        creator: `${settings.apiName} | ${settings.poweredBy}`,
      });
      return;
    }

    const cost = endpointConfig ? endpointConfig.cost : 1;
    req.endpointCost = cost;

    // Health endpoint is free and does not require an API key
    if (endpointPath === '/api/health' && cost === 0) {
      next();
      return;
    }

    // 3. Extract API Key from Bearer header or ?apikey= query param or x-api-key header
    let apiKey: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      // If it looks like an API key (starts with crim_live_)
      if (token.startsWith('crim_live_')) {
        apiKey = token;
      }
    }

    if (!apiKey && req.query.apikey) {
      apiKey = String(req.query.apikey);
    }

    if (!apiKey && req.headers['x-api-key']) {
      apiKey = String(req.headers['x-api-key']);
    }

    if (!apiKey) {
      res.status(401).json({
        status: false,
        error: 'API_KEY_REQUIRED',
        message: 'No API key provided. Provide your key via "Authorization: Bearer YOUR_API_KEY", query "?apikey=YOUR_API_KEY", or "x-api-key" header.',
        creator: `${settings.apiName} | ${settings.poweredBy}`,
        docs: '/docs',
      });
      return;
    }

    // 4. Validate API Key against database
    const user = await getUserByApiKey(apiKey);
    if (!user) {
      res.status(401).json({
        status: false,
        error: 'INVALID_API_KEY',
        message: 'The provided API key is invalid or has been revoked.',
        creator: `${settings.apiName} | ${settings.poweredBy}`,
      });
      return;
    }

    // 5. Check if user is banned
    if (user.status === 'banned') {
      res.status(403).json({
        status: false,
        error: 'ACCOUNT_BANNED',
        message: 'Your account is banned. Contact DCT TEAM support.',
        creator: `${settings.apiName} | ${settings.poweredBy}`,
      });
      return;
    }

    // 6. Check Coin Balance
    if (cost > 0 && user.coinBalance < cost) {
      // Record failed request
      await recordAPIRequest({
        userId: user.userId,
        username: user.username,
        apiKey: user.apiKey,
        endpoint: endpointPath,
        responseStatus: 402,
        coinsCharged: 0,
        responseTime: Date.now() - startTime,
        ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'],
        query: req.query.q ? String(req.query.q) : '',
        error: 'INSUFFICIENT_COINS',
      });

      res.status(402).json({
        status: false,
        error: 'INSUFFICIENT_COINS',
        message: `Insufficient coins to execute this request. Required: ${cost} coin(s), Current balance: ${user.coinBalance} coin(s). Please top up coins.`,
        requiredCoins: cost,
        currentBalance: user.coinBalance,
        creator: `${settings.apiName} | ${settings.poweredBy}`,
      });
      return;
    }

    // Attach user to request
    req.apiKeyUser = user;

    // Deduct coins and log request on response completion
    const originalJson = res.json.bind(res);
    let deductionHandled = false;

    res.json = function (body: any) {
      if (!deductionHandled) {
        deductionHandled = true;
        const statusCode = res.statusCode;
        const duration = Date.now() - startTime;
        const isSuccess = statusCode >= 200 && statusCode < 400;

        // Perform deduction asynchronously if successful
        (async () => {
          try {
            let charged = 0;
            let finalBalance = user.coinBalance;

            if (isSuccess && cost > 0) {
              const deduction = await deductCoins(
                user.id,
                cost,
                endpointPath,
                `API Call: ${endpointPath}${req.query.q ? ` (q=${req.query.q})` : ''}`
              );
              if (deduction.success) {
                charged = cost;
                finalBalance = deduction.newBalance;
              }
            }

            await recordAPIRequest({
              userId: user.userId,
              username: user.username,
              apiKey: user.apiKey,
              endpoint: endpointPath,
              responseStatus: statusCode,
              coinsCharged: charged,
              responseTime: duration,
              ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
              userAgent: req.headers['user-agent'],
              query: req.query.q ? String(req.query.q) : '',
              error: isSuccess ? null : (body?.error || 'Unknown Error'),
            });
          } catch (logErr) {
            console.error('[API Log Error]:', logErr);
          }
        })();

        // Inject balance info in response if user has balance
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          body.remainingCoins = isSuccess ? Math.max(0, user.coinBalance - cost) : user.coinBalance;
          body.coinsDeducted = isSuccess ? cost : 0;
          body.creator = `${settings.apiName} | ${settings.poweredBy}`;
        }
      }
      return originalJson(body);
    };

    next();
  };
}
