export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  apiKey: string;
  coinBalance: number;
  status: 'active' | 'banned';
  createdAt: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsedAt?: string;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface EndpointConfig {
  endpoint: string;
  name: string;
  description: string;
  cost: number;
  enabled: boolean;
  method: string;
}

export interface SystemSettings {
  id: string;
  apiName: string;
  apiVersion: string;
  poweredBy: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  signupEnabled: boolean;
  defaultCoins: number;
  rateLimitPerMinute: number;
  endpoints: EndpointConfig[];
}

export interface CoinTransaction {
  id: string;
  userId: string;
  username: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  reason: string;
  endpoint?: string;
  balanceBefore: number;
  balanceAfter: number;
  timestamp: string;
}

export interface APIRequestLog {
  id: string;
  userId: string;
  username: string;
  apiKey: string;
  endpoint: string;
  requestTime: string;
  responseStatus: number;
  coinsCharged: number;
  responseTime: number;
  ip: string;
  userAgent?: string;
  query?: string;
  error?: string | null;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalCoinsInCirculation: number;
  totalCoinsUsed: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  isMongoConnected: boolean;
  serverUptime: number;
}
