import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUrl: process.env.MONGODB_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'criminal_api_super_secret_jwt_key_dct_team_2026',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@criminal-api.dct',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@Criminal2026!',
  apiBaseUrl: process.env.API_BASE_URL || (process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : 'http://localhost:3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  brandName: '🦋 CRIMINAL-API 🦋',
  poweredBy: 'DCT TEAM',
};
