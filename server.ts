import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { config } from './server/config.ts';
import { initDatabase, getSettings } from './server/db/store.ts';
import { authRouter } from './server/routes/auth.routes.ts';
import { adminRouter } from './server/routes/admin.routes.ts';
import { userRouter } from './server/routes/user.routes.ts';
import { apiRouter } from './server/routes/api.routes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Basic Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Initialize DB (MongoDB with transparent file fallback)
  await initDatabase();

  // Public Info Endpoint for landing page & docs
  app.get('/api/public/info', async (req, res) => {
    try {
      const settings = await getSettings();
      res.json({
        status: true,
        apiName: settings.apiName,
        apiVersion: settings.apiVersion,
        poweredBy: settings.poweredBy,
        defaultCoins: settings.defaultCoins,
        signupEnabled: settings.signupEnabled,
        maintenanceMode: settings.maintenanceMode,
        endpoints: settings.endpoints,
      });
    } catch (err: any) {
      res.status(500).json({ status: false, error: err.message });
    }
  });

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/user', userRouter);
  app.use('/api', apiRouter);

  // Global 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({
      status: false,
      error: 'ENDPOINT_NOT_FOUND',
      message: `The requested API route '${req.originalUrl}' does not exist on 🦋 CRIMINAL-API 🦋. Refer to /docs for valid endpoints.`,
      creator: '🦋 CRIMINAL-API 🦋 | DCT TEAM',
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite Dev Server Middlewares for HMR & SPA handling
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: config.port,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[Vite] Dev middleware integrated on port ${config.port}`);
  } else {
    // Production static file serving
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('[Server] Production dist directory not found. Please run "npm run build" first.');
    }
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[Unhandled Server Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: err.message || 'An unexpected server error occurred.',
        creator: '🦋 CRIMINAL-API 🦋 | DCT TEAM',
      });
    }
  });

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`  🦋 CRIMINAL-API 🦋 Server Live!`);
    console.log(`  Powered by: ${config.poweredBy}`);
    console.log(`  Local URL:  http://localhost:${config.port}`);
    console.log(`  Admin Email: ${config.adminEmail}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
