import mongoose, { Schema, Document } from 'mongoose';

export interface IUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  password?: string;
  apiKey: string;
  coinBalance: number;
  status: 'active' | 'banned';
  createdAt: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsedAt?: string;
}

export interface IAdmin {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export interface IAPIKey {
  id: string;
  userId: string;
  key: string;
  status: 'active' | 'revoked';
  name: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ICoinTransaction {
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

export interface IAPIRequest {
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

export interface IEndpointConfig {
  endpoint: string;
  name: string;
  description: string;
  cost: number;
  enabled: boolean;
  method: string;
}

export interface IAPISettings {
  id: string;
  apiName: string;
  apiVersion: string;
  poweredBy: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  signupEnabled: boolean;
  defaultCoins: number;
  rateLimitPerMinute: number;
  endpoints: IEndpointConfig[];
}

// Mongoose Schemas (used when MongoDB is connected)
const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true, index: true },
  coinBalance: { type: Number, default: 25, min: 0 },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  totalRequests: { type: Number, default: 0 },
  successfulRequests: { type: Number, default: 0 },
  failedRequests: { type: Number, default: 0 },
  lastUsedAt: { type: Date },
});

const AdminSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
});

const APIKeySchema = new Schema({
  userId: { type: String, required: true, index: true },
  key: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  name: { type: String, default: 'Default API Key' },
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
});

const CoinTransactionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  reason: { type: String, required: true },
  endpoint: { type: String },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

const APIRequestSchema = new Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  apiKey: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, index: true },
  requestTime: { type: Date, default: Date.now, index: true },
  responseStatus: { type: Number, required: true },
  coinsCharged: { type: Number, required: true },
  responseTime: { type: Number, required: true },
  ip: { type: String, default: '127.0.0.1' },
  userAgent: { type: String },
  query: { type: String },
  error: { type: String },
});

const APISettingsSchema = new Schema({
  apiName: { type: String, default: '🦋 CRIMINAL-API 🦋' },
  apiVersion: { type: String, default: 'v1.4.0' },
  poweredBy: { type: String, default: 'DCT TEAM' },
  maintenanceMode: { type: Boolean, default: false },
  maintenanceMessage: { type: String, default: '🦋 CRIMINAL-API is undergoing scheduled maintenance by DCT TEAM. Back shortly!' },
  signupEnabled: { type: Boolean, default: true },
  defaultCoins: { type: Number, default: 25 },
  rateLimitPerMinute: { type: Number, default: 60 },
  endpoints: [
    {
      endpoint: { type: String, required: true },
      name: { type: String, required: true },
      description: { type: String, required: true },
      cost: { type: Number, required: true, default: 1 },
      enabled: { type: Boolean, default: true },
      method: { type: String, default: 'GET' },
    },
  ],
});

export const MongooseModels = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Admin: mongoose.models.Admin || mongoose.model('Admin', AdminSchema),
  APIKey: mongoose.models.APIKey || mongoose.model('APIKey', APIKeySchema),
  CoinTransaction: mongoose.models.CoinTransaction || mongoose.model('CoinTransaction', CoinTransactionSchema),
  APIRequest: mongoose.models.APIRequest || mongoose.model('APIRequest', APIRequestSchema),
  APISettings: mongoose.models.APISettings || mongoose.model('APISettings', APISettingsSchema),
};
