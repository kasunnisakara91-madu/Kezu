import { Router, Response } from 'express';
import { requireApiKeyAndCoins, AuthRequest } from '../middleware/auth.ts';
import {
  searchSongs,
  getSongDetails,
  getDownloadInfo,
} from '../scripts/song_service.ts';
import { getSettings } from '../db/store.ts';

export const apiRouter = Router();

/**
 * GET /api/health
 * Public status endpoint (0 coin cost)
 */
apiRouter.get('/health', requireApiKeyAndCoins('/api/health'), async (req: AuthRequest, res: Response) => {
  const settings = await getSettings();
  res.json({
    status: true,
    code: 200,
    message: 'CRIMINAL-API System is Operational',
    data: {
      apiName: settings.apiName,
      version: settings.apiVersion,
      poweredBy: settings.poweredBy,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      status: 'ONLINE',
      features: ['real-time song search', 'audio stream metadata', 'high-speed download resolution'],
    },
  });
});

/**
 * GET /api/search?q={query}
 * Search songs with real music catalog
 */
apiRouter.get('/search', requireApiKeyAndCoins('/api/search'), async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      res.status(400).json({
        status: false,
        error: 'BAD_REQUEST',
        message: 'Query parameter "q" is required. Example: /api/search?q=believer',
      });
      return;
    }

    const songs = await searchSongs(query);

    res.json({
      status: true,
      code: 200,
      query,
      totalResults: songs.length,
      data: songs,
    });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: 'SONG_SEARCH_FAILED',
      message: err.message || 'Failed to search songs',
    });
  }
});

/**
 * GET /api/song?q={query}
 * Get specific song details & direct playable audio stream
 */
apiRouter.get('/song', requireApiKeyAndCoins('/api/song'), async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      res.status(400).json({
        status: false,
        error: 'BAD_REQUEST',
        message: 'Query parameter "q" is required. Example: /api/song?q=starboy or trackId',
      });
      return;
    }

    const song = await getSongDetails(query);

    res.json({
      status: true,
      code: 200,
      query,
      data: song,
    });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: 'SONG_FETCH_FAILED',
      message: err.message || 'Failed to retrieve song details',
    });
  }
});

/**
 * GET /api/download?q={query}
 * Resolve high quality download link & stream info
 */
apiRouter.get('/download', requireApiKeyAndCoins('/api/download'), async (req: AuthRequest, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || !query.trim()) {
      res.status(400).json({
        status: false,
        error: 'BAD_REQUEST',
        message: 'Query parameter "q" is required. Example: /api/download?q=despacito',
      });
      return;
    }

    const downloadInfo = await getDownloadInfo(query);

    res.json({
      status: true,
      code: 200,
      query,
      data: downloadInfo,
    });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: 'DOWNLOAD_RESOLUTION_FAILED',
      message: err.message || 'Failed to resolve download url',
    });
  }
});
