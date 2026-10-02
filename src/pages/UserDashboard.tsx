import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Key,
  Coins,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { CoinTransaction, APIRequestLog } from '../types.ts';

interface UserDashboardProps {
  navigate: (path: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ navigate }) => {
  const { user, token, refreshUser, regenerateUserApiKey } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<'requests' | 'transactions'>('requests');
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [requestLogs, setRequestLogs] = useState<APIRequestLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch transactions and logs
  const loadDashboardData = async () => {
    if (!token) return;
    try {
      setLoadingData(true);
      const [txRes, logRes] = await Promise.all([
        fetch('/api/user/transactions?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/user/logs?limit=50', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        if (txData.status) setTransactions(txData.data || []);
      }
      if (logRes.ok) {
        const logData = await logRes.json();
        if (logData.status) setRequestLogs(logData.data || []);
      }
      await refreshUser();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleCopyKey = () => {
    if (!user?.apiKey) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = async () => {
    setRegenerating(true);
    await regenerateUserApiKey();
    setRegenerating(false);
    setConfirmRegenerate(false);
    loadDashboardData();
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">Authentication Required</h2>
        <p className="text-slate-400 text-sm">Please log in to access your user dashboard.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-sm"
        >
          Sign In
        </button>
      </div>
    );
  }

  const successRate =
    user.totalRequests > 0
      ? Math.round((user.successfulRequests / user.totalRequests) * 100)
      : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0d102a] via-[#121035] to-[#0d102a] border border-cyan-500/20 shadow-[0_0_30px_rgba(0,242,254,0.08)] relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦋</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              CRIMINAL-API Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono">
            Account: <span className="text-cyan-300 font-bold">{user.username}</span> • ID:{' '}
            <span className="text-purple-300">{user.userId}</span> • Status:{' '}
            <span
              className={`font-bold ${
                user.status === 'active' ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {user.status.toUpperCase()}
            </span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => navigate('/tester')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-950" />
            <span>API Tester</span>
          </button>

          <button
            onClick={() => navigate('/docs')}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Documentation</span>
          </button>

          <button
            onClick={loadDashboardData}
            title="Refresh statistics"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Coin Balance Card */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.08)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Coin Balance
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-300 tracking-tight">
              {user.coinBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {user.coinBalance > 0
                ? 'Ready to execute API calls'
                : 'Insufficient coins. Contact admin to recharge.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400/80 font-mono">
            Never goes negative
          </div>
        </div>

        {/* Total Requests */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total API Requests
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white tracking-tight">
              {user.totalRequests.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Lifetime requests sent via your API key
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-mono">
            Success Rate: {successRate}%
          </div>
        </div>

        {/* Successful Requests */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Successful Calls
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
              {user.successfulRequests.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">HTTP 200 - 399 Status responses</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
            Coins billed correctly
          </div>
        </div>

        {/* Failed Requests */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-purple-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Failed Requests
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-300 tracking-tight">
              {user.failedRequests.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">HTTP 4xx / 5xx or insufficient coins</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            Zero coins billed on error
          </div>
        </div>
      </div>

      {/* API Key Box */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0a0c20] border border-cyan-500/25 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Your Secret Live API Key
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pass this key via header{' '}
              <code className="text-cyan-300 font-mono bg-cyan-950/60 px-1 py-0.5 rounded">
                Authorization: Bearer YOUR_KEY
              </code>{' '}
              or parameter{' '}
              <code className="text-purple-300 font-mono bg-purple-950/60 px-1 py-0.5 rounded">
                ?apikey=YOUR_KEY
              </code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKey(!showKey)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 transition-colors"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>

            <button
              onClick={handleCopyKey}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy API Key</span>
                </>
              )}
            </button>

            <button
              onClick={() => setConfirmRegenerate(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate API Key</span>
            </button>
          </div>
        </div>

        {/* Display Field */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 font-mono text-sm text-cyan-300 break-all select-all flex items-center justify-between gap-4">
          <span>
            {showKey
              ? user.apiKey
              : `${user.apiKey.slice(0, 14)}••••••••••••••••••••••••••••••••`}
          </span>
          <span className="text-[10px] text-slate-400 font-sans uppercase shrink-0">
            {showKey ? 'Revealed' : 'Protected'}
          </span>
        </div>

        {/* Confirm Regenerate Modal / Notice */}
        {confirmRegenerate && (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-red-300">
              <AlertTriangle className="w-4 h-4" />
              <span>Are you sure you want to regenerate your API Key?</span>
            </div>
            <p className="text-slate-300">
              Your existing API key will immediately stop working. All bots, scrapers, and applications using the old key will fail until updated.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateKey}
                disabled={regenerating}
                className="px-4 py-1.5 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 disabled:opacity-50"
              >
                {regenerating ? 'Regenerating...' : 'Yes, Revoke & Regenerate'}
              </button>
              <button
                onClick={() => setConfirmRegenerate(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Recent API Requests & Coin Transactions */}
      <div className="rounded-2xl bg-[#0a0c20] border border-cyan-500/20 overflow-hidden shadow-lg">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'requests'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Recent API Requests ({requestLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'transactions'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Coin Transaction History ({transactions.length})</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            Real-time ledger audit
          </span>
        </div>

        {/* Tab Content: Requests */}
        {activeTab === 'requests' && (
          <div className="overflow-x-auto">
            {requestLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-slate-400 text-sm">No API calls recorded yet.</p>
                <button
                  onClick={() => navigate('/tester')}
                  className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20"
                >
                  Send your first test request in API Tester
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Endpoint</th>
                    <th className="py-3 px-4">Query / Param</th>
                    <th className="py-3 px-4">Coins Charged</th>
                    <th className="py-3 px-4">Response Time</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {requestLogs.map((log) => {
                    const isOk = log.responseStatus >= 200 && log.responseStatus < 400;
                    return (
                      <tr key={log.id} className="hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              isOk
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {log.responseStatus} {isOk ? 'OK' : 'ERR'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-white">{log.endpoint}</td>
                        <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                          {log.query ? `q=${log.query}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-amber-400 font-bold">
                            {log.coinsCharged > 0 ? `-${log.coinsCharged} 🪙` : '0 🪙'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cyan-300">{log.responseTime}ms</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(log.requestTime).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab Content: Coin Transactions */}
        {activeTab === 'transactions' && (
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                No coin transactions recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reason / Description</th>
                    <th className="py-3 px-4">Before</th>
                    <th className="py-3 px-4">After</th>
                    <th className="py-3 px-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === 'CREDIT';
                    return (
                      <tr key={tx.id} className="hover:bg-amber-500/5 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] ${
                              isCredit
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {isCredit ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span className={isCredit ? 'text-emerald-400' : 'text-amber-400'}>
                            {isCredit ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans max-w-sm truncate">
                          {tx.reason}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{tx.balanceBefore}</td>
                        <td className="py-3 px-4 font-bold text-white">{tx.balanceAfter}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(tx.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
