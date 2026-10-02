import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  IUser,
  IAdmin,
  IAPIKey,
  ICoinTransaction,
  IAPIRequest,
  IAPISettings,
  IEndpointConfig,
  MongooseModels,
} from './models.ts';
import { config } from '../config.ts';

export type { IUser, IEndpointConfig, IAPISettings, ICoinTransaction, IAPIRequest };

// Default Endpoints configuration
const DEFAULT_ENDPOINTS = [
  {
    endpoint: '/api/search',
    name: 'Song Search API',
    description: 'Search songs, tracks, artists, and audio metadata in real-time',
    cost: 1,
    enabled: true,
    method: 'GET',
  },
  {
    endpoint: '/api/song',
    name: 'Song Details & Stream API',
    description: 'Get deep song metadata, lyrics, and direct playable audio stream URL',
    cost: 1,
    enabled: true,
    method: 'GET',
  },
  {
    endpoint: '/api/download',
    name: 'Song Audio Download API',
    description: 'Generate high-speed direct audio download link (320kbps/256kbps audio format)',
    cost: 2,
    enabled: true,
    method: 'GET',
  },
  {
    endpoint: '/api/health',
    name: 'System Health & Metrics API',
    description: 'Check uptime, status, database health and system version',
    cost: 0,
    enabled: true,
    method: 'GET',
  },
];

const DEFAULT_SETTINGS: IAPISettings = {
  id: 'global_settings',
  apiName: '🦋 CRIMINAL-API 🦋',
  apiVersion: 'v1.4.0',
  poweredBy: 'DCT TEAM',
  maintenanceMode: false,
  maintenanceMessage: '🦋 CRIMINAL-API is undergoing scheduled maintenance by DCT TEAM. Back shortly!',
  signupEnabled: true,
  defaultCoins: 25,
  rateLimitPerMinute: 60,
  endpoints: DEFAULT_ENDPOINTS,
};

// Fallback in-memory & file storage structure
interface IDataStore {
  users: IUser[];
  admins: IAdmin[];
  apiKeys: IAPIKey[];
  coinTransactions: ICoinTransaction[];
  apiRequests: IAPIRequest[];
  settings: IAPISettings;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.resolve(DATA_DIR, 'criminal_db.json');

let isMongoConnected = false;
let memoryStore: IDataStore = {
  users: [],
  admins: [],
  apiKeys: [],
  coinTransactions: [],
  apiRequests: [],
  settings: DEFAULT_SETTINGS,
};

// File persistence helpers
function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      saveToFile();
    } else {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      if (raw.trim()) {
        memoryStore = JSON.parse(raw);
        // Ensure default settings structure matches
        if (!memoryStore.settings || !memoryStore.settings.endpoints) {
          memoryStore.settings = DEFAULT_SETTINGS;
          saveToFile();
        }
      }
    }
  } catch (err) {
    console.error('[DB Store] Error initializing local storage:', err);
  }
}

function saveToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DB Store] Error writing local store file:', err);
  }
}

// Generate unique keys and IDs
export function generateApiKey(): string {
  return `crim_live_${crypto.randomBytes(18).toString('hex')}`;
}

export function generateUserId(): string {
  return `CRIM-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

// Initialize database
export async function initDatabase() {
  ensureDataFile();

  if (config.mongodbUrl) {
    try {
      console.log('[MongoDB] Connecting to:', config.mongodbUrl.replace(/:([^:@]{4})[^:@]*@/, ':****@'));
      await mongoose.connect(config.mongodbUrl, {
        serverSelectionTimeoutMS: 5000,
      });
      isMongoConnected = true;
      console.log('[MongoDB] Connected successfully to remote database!');
    } catch (err: any) {
      console.warn('[MongoDB] Remote connection failed, running on persistent local storage:', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('[Database] MONGODB_URL not provided. Running in persistent local store mode.');
  }

  // Ensure initial Admin exists
  await ensureDefaultAdmin();
}

async function ensureDefaultAdmin() {
  const existing = await getAdminByEmail(config.adminEmail);
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(config.adminPassword, salt);
    await createAdmin({
      username: 'DCT_ChiefAdmin',
      email: config.adminEmail,
      password: hashedPassword,
      role: 'superadmin',
    });
    console.log(`[Admin] Initialized superadmin account: ${config.adminEmail}`);
  }
}

// ================= USER METHODS =================
export async function getUserById(id: string): Promise<IUser | null> {
  if (isMongoConnected) {
    const doc = await MongooseModels.User.findById(id).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() } as unknown as IUser;
  }
  const u = memoryStore.users.find((u) => u.id === id || u.userId === id);
  return u ? { ...u } : null;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  const normalized = email.toLowerCase().trim();
  if (isMongoConnected) {
    const doc = await MongooseModels.User.findOne({ email: normalized }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() } as unknown as IUser;
  }
  const u = memoryStore.users.find((u) => u.email.toLowerCase() === normalized);
  return u ? { ...u } : null;
}

export async function getUserByUsername(username: string): Promise<IUser | null> {
  const normalized = username.toLowerCase().trim();
  if (isMongoConnected) {
    const doc = await MongooseModels.User.findOne({ username: new RegExp(`^${normalized}$`, 'i') }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() } as unknown as IUser;
  }
  const u = memoryStore.users.find((u) => u.username.toLowerCase() === normalized);
  return u ? { ...u } : null;
}

export async function getUserByApiKey(apiKey: string): Promise<IUser | null> {
  if (!apiKey) return null;
  const cleanKey = apiKey.trim();
  if (isMongoConnected) {
    const doc = await MongooseModels.User.findOne({ apiKey: cleanKey }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() } as unknown as IUser;
  }
  const u = memoryStore.users.find((u) => u.apiKey === cleanKey);
  return u ? { ...u } : null;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
}): Promise<IUser> {
  const settings = await getSettings();
  const id = generateId();
  const userId = generateUserId();
  const apiKey = generateApiKey();
  const now = new Date().toISOString();
  const initialCoins = settings.defaultCoins ?? 25;

  const newUser: IUser = {
    id,
    userId,
    username: data.username.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    apiKey,
    coinBalance: initialCoins,
    status: 'active',
    createdAt: now,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
  };

  if (isMongoConnected) {
    const created = await MongooseModels.User.create({
      _id: id,
      ...newUser,
    });
    // Create initial APIKey record
    await MongooseModels.APIKey.create({
      userId,
      key: apiKey,
      status: 'active',
      name: 'Default Primary Key',
      createdAt: now,
    });
  } else {
    memoryStore.users.push(newUser);
    memoryStore.apiKeys.push({
      id: generateId(),
      userId,
      key: apiKey,
      status: 'active',
      name: 'Default Primary Key',
      createdAt: now,
    });
    saveToFile();
  }

  // Record Welcome Bonus transaction if > 0
  if (initialCoins > 0) {
    await recordCoinTransaction({
      userId,
      username: newUser.username,
      amount: initialCoins,
      type: 'CREDIT',
      reason: 'Welcome Signup Bonus from DCT TEAM',
      balanceBefore: 0,
      balanceAfter: initialCoins,
    });
  }

  return newUser;
}

export async function updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
  if (isMongoConnected) {
    const updated = await MongooseModels.User.findOneAndUpdate(
      { $or: [{ _id: id }, { userId: id }] },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return null;
    return { ...updated, id: updated._id.toString() } as unknown as IUser;
  }

  const idx = memoryStore.users.findIndex((u) => u.id === id || u.userId === id);
  if (idx === -1) return null;
  memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
  saveToFile();
  return { ...memoryStore.users[idx] };
}

export async function deleteUser(id: string): Promise<boolean> {
  if (isMongoConnected) {
    const res = await MongooseModels.User.deleteOne({ $or: [{ _id: id }, { userId: id }] });
    return res.deletedCount > 0;
  }
  const beforeLen = memoryStore.users.length;
  memoryStore.users = memoryStore.users.filter((u) => u.id !== id && u.userId !== id);
  const deleted = memoryStore.users.length < beforeLen;
  if (deleted) saveToFile();
  return deleted;
}

export async function getAllUsers(search?: string): Promise<IUser[]> {
  if (isMongoConnected) {
    let filter: any = {};
    if (search) {
      const reg = new RegExp(search, 'i');
      filter = {
        $or: [{ username: reg }, { email: reg }, { userId: reg }, { apiKey: reg }],
      };
    }
    const docs = await MongooseModels.User.find(filter).sort({ createdAt: -1 }).lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }

  let list = [...memoryStore.users];
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.userId.toLowerCase().includes(q) ||
        u.apiKey.toLowerCase().includes(q)
    );
  }
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ================= ADMIN METHODS =================
export async function getAdminByEmail(email: string): Promise<IAdmin | null> {
  const norm = email.toLowerCase().trim();
  if (isMongoConnected) {
    const doc = await MongooseModels.Admin.findOne({ email: norm }).lean();
    if (!doc) return null;
    return { ...doc, id: doc._id.toString() } as unknown as IAdmin;
  }
  const a = memoryStore.admins.find((a) => a.email.toLowerCase() === norm);
  return a ? { ...a } : null;
}

export async function createAdmin(data: Partial<IAdmin>): Promise<IAdmin> {
  const id = generateId();
  const newAdmin: IAdmin = {
    id,
    username: data.username || 'Admin',
    email: (data.email || config.adminEmail).toLowerCase().trim(),
    password: data.password || '',
    role: data.role || 'admin',
    createdAt: new Date().toISOString(),
  };

  if (isMongoConnected) {
    const created = await MongooseModels.Admin.create({ _id: id, ...newAdmin });
    return { ...created.toObject(), id } as IAdmin;
  }

  memoryStore.admins.push(newAdmin);
  saveToFile();
  return newAdmin;
}

// ================= COIN SYSTEM =================
export async function recordCoinTransaction(tx: Omit<ICoinTransaction, 'id' | 'timestamp'>): Promise<ICoinTransaction> {
  const id = generateId();
  const timestamp = new Date().toISOString();
  const record: ICoinTransaction = {
    id,
    timestamp,
    ...tx,
  };

  if (isMongoConnected) {
    await MongooseModels.CoinTransaction.create({ _id: id, ...record });
  } else {
    memoryStore.coinTransactions.unshift(record);
    // Keep reasonable max size in memory
    if (memoryStore.coinTransactions.length > 5000) {
      memoryStore.coinTransactions.pop();
    }
    saveToFile();
  }

  return record;
}

export async function getUserCoinTransactions(userId: string, limit = 50): Promise<ICoinTransaction[]> {
  if (isMongoConnected) {
    const docs = await MongooseModels.CoinTransaction.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }
  return memoryStore.coinTransactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export async function getAllCoinTransactions(limit = 100): Promise<ICoinTransaction[]> {
  if (isMongoConnected) {
    const docs = await MongooseModels.CoinTransaction.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }
  return [...memoryStore.coinTransactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

/**
 * Deduct coins atomically.
 * Returns success, new balance, error message.
 */
export async function deductCoins(
  userId: string,
  cost: number,
  endpoint: string,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const user = await getUserById(userId);
  if (!user) {
    return { success: false, newBalance: 0, error: 'User not found' };
  }

  if (cost <= 0) {
    return { success: true, newBalance: user.coinBalance };
  }

  if (user.coinBalance < cost) {
    return {
      success: false,
      newBalance: user.coinBalance,
      error: `Insufficient coins. Required: ${cost} coins, Current balance: ${user.coinBalance} coins. Please contact admin to recharge.`,
    };
  }

  const balanceBefore = user.coinBalance;
  const balanceAfter = balanceBefore - cost;

  await updateUser(user.id, {
    coinBalance: balanceAfter,
    lastUsedAt: new Date().toISOString(),
  });

  await recordCoinTransaction({
    userId: user.userId,
    username: user.username,
    amount: cost,
    type: 'DEBIT',
    reason,
    endpoint,
    balanceBefore,
    balanceAfter,
  });

  return { success: true, newBalance: balanceAfter };
}

/**
 * Credit coins (from admin, bonus, etc.)
 */
export async function creditCoins(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount <= 0) {
    return { success: false, newBalance: 0, error: 'Amount must be greater than 0' };
  }

  const user = await getUserById(userId);
  if (!user) {
    return { success: false, newBalance: 0, error: 'User not found' };
  }

  const balanceBefore = user.coinBalance;
  const balanceAfter = balanceBefore + amount;

  await updateUser(user.id, {
    coinBalance: balanceAfter,
  });

  await recordCoinTransaction({
    userId: user.userId,
    username: user.username,
    amount,
    type: 'CREDIT',
    reason,
    balanceBefore,
    balanceAfter,
  });

  return { success: true, newBalance: balanceAfter };
}

/**
 * Admin direct coin adjustment (can add or remove)
 */
export async function adjustUserCoins(
  userId: string,
  amount: number,
  type: 'CREDIT' | 'DEBIT',
  reason: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const user = await getUserById(userId);
  if (!user) return { success: false, newBalance: 0, error: 'User not found' };

  if (type === 'CREDIT') {
    return creditCoins(userId, amount, reason);
  } else {
    // Debit check
    if (user.coinBalance < amount) {
      return {
        success: false,
        newBalance: user.coinBalance,
        error: `Cannot deduct ${amount} coins. User balance is only ${user.coinBalance} coins. Coins must never become negative.`,
      };
    }
    const balanceBefore = user.coinBalance;
    const balanceAfter = balanceBefore - amount;
    await updateUser(user.id, { coinBalance: balanceAfter });
    await recordCoinTransaction({
      userId: user.userId,
      username: user.username,
      amount,
      type: 'DEBIT',
      reason,
      balanceBefore,
      balanceAfter,
    });
    return { success: true, newBalance: balanceAfter };
  }
}

// ================= API KEY MANAGEMENT =================
export async function regenerateApiKey(userId: string): Promise<string | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const newKey = generateApiKey();
  const now = new Date().toISOString();

  // Revoke old key if mongo
  if (isMongoConnected) {
    await MongooseModels.APIKey.updateMany({ userId: user.userId }, { status: 'revoked' });
    await MongooseModels.APIKey.create({
      userId: user.userId,
      key: newKey,
      status: 'active',
      name: `Regenerated Key on ${new Date().toLocaleDateString()}`,
      createdAt: now,
    });
  } else {
    memoryStore.apiKeys.forEach((k) => {
      if (k.userId === user.userId) k.status = 'revoked';
    });
    memoryStore.apiKeys.push({
      id: generateId(),
      userId: user.userId,
      key: newKey,
      status: 'active',
      name: `Regenerated Key on ${new Date().toLocaleDateString()}`,
      createdAt: now,
    });
    saveToFile();
  }

  await updateUser(user.id, { apiKey: newKey });
  return newKey;
}

// ================= API REQUEST LOGGING =================
export async function recordAPIRequest(
  log: Omit<IAPIRequest, 'id' | 'requestTime'>
): Promise<IAPIRequest> {
  const id = generateId();
  const requestTime = new Date().toISOString();
  const record: IAPIRequest = {
    id,
    requestTime,
    ...log,
  };

  if (isMongoConnected) {
    await MongooseModels.APIRequest.create({ _id: id, ...record });
    // Update user request counter
    const isSuccess = record.responseStatus >= 200 && record.responseStatus < 400;
    await MongooseModels.User.findOneAndUpdate(
      { userId: log.userId },
      {
        $inc: {
          totalRequests: 1,
          successfulRequests: isSuccess ? 1 : 0,
          failedRequests: isSuccess ? 0 : 1,
        },
      }
    );
  } else {
    memoryStore.apiRequests.unshift(record);
    if (memoryStore.apiRequests.length > 5000) {
      memoryStore.apiRequests.pop();
    }

    // Update user in memory
    const user = memoryStore.users.find((u) => u.userId === log.userId);
    if (user) {
      user.totalRequests = (user.totalRequests || 0) + 1;
      if (record.responseStatus >= 200 && record.responseStatus < 400) {
        user.successfulRequests = (user.successfulRequests || 0) + 1;
      } else {
        user.failedRequests = (user.failedRequests || 0) + 1;
      }
    }
    saveToFile();
  }

  return record;
}

export async function getUserAPIRequests(userId: string, limit = 50): Promise<IAPIRequest[]> {
  if (isMongoConnected) {
    const docs = await MongooseModels.APIRequest.find({ userId })
      .sort({ requestTime: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }
  return memoryStore.apiRequests
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime())
    .slice(0, limit);
}

export async function getAllAPIRequests(limit = 100): Promise<IAPIRequest[]> {
  if (isMongoConnected) {
    const docs = await MongooseModels.APIRequest.find()
      .sort({ requestTime: -1 })
      .limit(limit)
      .lean();
    return docs.map((d: any) => ({ ...d, id: d._id.toString() }));
  }
  return [...memoryStore.apiRequests]
    .sort((a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime())
    .slice(0, limit);
}

// ================= SYSTEM SETTINGS =================
export async function getSettings(): Promise<IAPISettings> {
  if (isMongoConnected) {
    let settingsDoc = await MongooseModels.APISettings.findOne().lean();
    if (!settingsDoc) {
      settingsDoc = await MongooseModels.APISettings.create(DEFAULT_SETTINGS);
    }
    return { ...settingsDoc, id: settingsDoc._id?.toString() || 'global_settings' } as unknown as IAPISettings;
  }
  if (!memoryStore.settings) {
    memoryStore.settings = DEFAULT_SETTINGS;
    saveToFile();
  }
  return { ...memoryStore.settings };
}

export async function updateSettings(updates: Partial<IAPISettings>): Promise<IAPISettings> {
  if (isMongoConnected) {
    const updated = await MongooseModels.APISettings.findOneAndUpdate(
      {},
      { $set: updates },
      { new: true, upsert: true }
    ).lean();
    return { ...updated, id: updated._id?.toString() || 'global_settings' } as unknown as IAPISettings;
  }
  memoryStore.settings = {
    ...memoryStore.settings,
    ...updates,
  };
  saveToFile();
  return { ...memoryStore.settings };
}

// Endpoint config helpers
export async function getEndpointConfig(endpointPath: string): Promise<IEndpointConfig | undefined> {
  const settings = await getSettings();
  return settings.endpoints.find((e) => e.endpoint.toLowerCase() === endpointPath.toLowerCase());
}

export async function updateEndpointCost(endpointPath: string, cost: number, enabled?: boolean): Promise<boolean> {
  const settings = await getSettings();
  const endpoint = settings.endpoints.find((e) => e.endpoint.toLowerCase() === endpointPath.toLowerCase());
  if (!endpoint) return false;
  endpoint.cost = Math.max(0, cost);
  if (typeof enabled === 'boolean') {
    endpoint.enabled = enabled;
  }
  await updateSettings({ endpoints: settings.endpoints });
  return true;
}

// Aggregation Stats for Admin Dashboard
export async function getAdminMetrics() {
  const users = await getAllUsers();
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const bannedUsers = users.filter((u) => u.status === 'banned').length;

  const totalCoinsInCirculation = users.reduce((acc, u) => acc + (u.coinBalance || 0), 0);

  const transactions = await getAllCoinTransactions(10000);
  const totalCoinsUsed = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((acc, t) => acc + t.amount, 0);

  const requests = await getAllAPIRequests(10000);
  const totalRequests = requests.length;
  const successfulRequests = requests.filter((r) => r.responseStatus >= 200 && r.responseStatus < 400).length;
  const failedRequests = totalRequests - successfulRequests;

  return {
    totalUsers,
    activeUsers,
    bannedUsers,
    totalCoinsInCirculation,
    totalCoinsUsed,
    totalRequests,
    successfulRequests,
    failedRequests,
    isMongoConnected,
    serverUptime: process.uptime(),
  };
}
