import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Users,
  Coins,
  Activity,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from 'lucide-react';
import { AdminMetrics, APIRequestLog, CoinTransaction } from '../../types.ts';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const { adminToken } = useAuth();
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentRequests, setRecentRequests] = useState<APIRequestLog[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setMetrics(data.metrics);
          setRecentRequests(data.recentRequests || []);
          setRecentTransactions(data.recentTransactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [adminToken]);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">System Metrics & Overview</h2>
          <p className="text-xs text-slate-400">
            Real-time analytics across all users, API requests, and coin balances.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Users
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {metrics?.totalUsers.toLocaleString() ?? '—'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registered developer accounts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-emerald-400 font-mono flex items-center justify-between">
            <span>Active: {metrics?.activeUsers ?? 0}</span>
            <span className="text-red-400">Banned: {metrics?.bannedUsers ?? 0}</span>
          </div>
        </div>

        {/* Total API Requests */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-purple-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total API Requests
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-300 tracking-tight">
              {metrics?.totalRequests.toLocaleString() ?? '—'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Recorded across song, search & download
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-purple-300 font-mono flex items-center justify-between">
            <span className="text-emerald-400">Success: {metrics?.successfulRequests ?? 0}</span>
            <span className="text-red-400">Failed: {metrics?.failedRequests ?? 0}</span>
          </div>
        </div>

        {/* Total Coins Used */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-amber-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Coins Consumed
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {metrics?.totalCoinsUsed.toLocaleString() ?? '—'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Coins billed to API requests
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-amber-400 font-mono">
            In Circulation: {metrics?.totalCoinsInCirculation.toLocaleString() ?? 0} Coins
          </div>
        </div>

        {/* Server & API Status */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Server & API Status
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span>OPERATIONAL</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Uptime: {metrics ? formatUptime(metrics.serverUptime) : '—'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 font-mono">
            Port 3000 • Express REST
          </div>
        </div>

        {/* Database Status */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-sky-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Database Engine
            </span>
            <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>{metrics?.isMongoConnected ? 'MongoDB Cloud' : 'Isolated Persistent Store'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {metrics?.isMongoConnected
                ? 'Connected to remote MongoDB cluster'
                : 'Atomic file persistence (.data/criminal_db.json)'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-sky-400 font-mono">
            Zero Data Loss Guaranteed
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#120f2c] to-[#0c0e24] border border-purple-500/30 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Admin Shortcuts
            </span>
            <h4 className="text-base font-bold text-white mt-1">Instant Management</h4>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              Manage Users
            </button>
            <button
              onClick={() => navigate('/admin/coins')}
              className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              Adjust Costs
            </button>
            <button
              onClick={() => navigate('/admin/apis')}
              className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 text-center transition-colors"
            >
              APIs & Errors
            </button>
            <button
              onClick={() => navigate('/admin/settings')}
              className="py-2 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white text-center transition-colors"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Recent API Requests Stream */}
      <div className="rounded-2xl bg-[#0c0e24] border border-slate-800 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Live API Request Stream
            </h3>
          </div>
          <button
            onClick={() => navigate('/admin/apis')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
          >
            View Full Logs & Errors →
          </button>
        </div>

        <div className="overflow-x-auto">
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent requests logged. Send a query via /tester to view activity!
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Endpoint</th>
                  <th className="py-2.5 px-4">Query</th>
                  <th className="py-2.5 px-4">Coins</th>
                  <th className="py-2.5 px-4">Latency</th>
                  <th className="py-2.5 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentRequests.map((r) => {
                  const isOk = r.responseStatus >= 200 && r.responseStatus < 400;
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isOk
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {r.responseStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-cyan-300 font-bold">{r.username}</td>
                      <td className="py-2.5 px-4 text-white font-bold">{r.endpoint}</td>
                      <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate font-sans">
                        {r.query || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-amber-400">{r.coinsCharged} 🪙</td>
                      <td className="py-2.5 px-4 text-slate-400">{r.responseTime}ms</td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {new Date(r.requestTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
