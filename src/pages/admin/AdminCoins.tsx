import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  Settings,
} from 'lucide-react';
import { CoinTransaction, EndpointConfig } from '../../types.ts';

export const AdminCoins: React.FC = () => {
  const { adminToken } = useAuth();
  const [defaultCoins, setDefaultCoins] = useState<number>(25);
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCoinData = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const [settingsRes, txRes] = await Promise.all([
        fetch('/api/admin/settings', {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch('/api/admin/coins/transactions?limit=100', {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData.status && sData.settings) {
          setDefaultCoins(sData.settings.defaultCoins);
          setEndpoints(sData.settings.endpoints || []);
        }
      }

      if (txRes.ok) {
        const tData = await txRes.json();
        if (tData.status) {
          setTransactions(tData.transactions || []);
        }
      }
    } catch (err) {
      console.error('Failed to load coin management data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, [adminToken]);

  const handleUpdateCost = (endpointPath: string, newCost: number) => {
    setEndpoints((prev) =>
      prev.map((ep) => (ep.endpoint === endpointPath ? { ...ep, cost: Math.max(0, newCost) } : ep))
    );
  };

  const handleSaveConfigs = async () => {
    if (!adminToken) return;
    setSavingSettings(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          defaultCoins,
          endpoints,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save coin configurations');
      }
    } catch {
      setErrorMessage('Network error while saving settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">Coin & Ledger Management</h2>
          <p className="text-xs text-slate-400">
            Configure welcome grants, per-endpoint deduction rates, and inspect the global ledger.
          </p>
        </div>

        <button
          onClick={fetchCoinData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Coin rules and endpoint costs updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Coin Rules Configuration Card */}
      <div className="p-6 rounded-2xl bg-[#0c0e24] border border-amber-500/25 shadow-lg space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Coin Configuration Engine
            </h3>
          </div>

          <button
            onClick={handleSaveConfigs}
            disabled={savingSettings}
            className="px-4 py-2 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Coin Rules'}</span>
          </button>
        </div>

        {/* Default Signup Coins Setting */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-white block">
              Default New User Welcome Coins
            </label>
            <p className="text-xs text-slate-400 mt-0.5">
              Automatically granted upon registration. Set to 0 to require admin recharge before first use.
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <input
              type="number"
              min="0"
              value={defaultCoins}
              onChange={(e) => setDefaultCoins(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-28 px-3 py-2 rounded-xl bg-black/60 border border-amber-500/40 text-center font-mono font-bold text-amber-300 text-sm outline-none"
            />
            <span className="text-xs font-bold text-amber-400">Coins</span>
          </div>
        </div>

        {/* Per-Endpoint Coin Costs */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Per-Endpoint Request Costs
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {endpoints.map((ep) => (
              <div
                key={ep.endpoint}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div>
                  <span className="text-xs font-bold text-white block">{ep.name}</span>
                  <code className="text-[11px] text-purple-300 font-mono">{ep.endpoint}</code>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">Cost (Coins):</span>
                  <input
                    type="number"
                    min="0"
                    value={ep.cost}
                    onChange={(e) =>
                      handleUpdateCost(ep.endpoint, parseInt(e.target.value, 10) || 0)
                    }
                    className="w-16 px-2 py-1 rounded-lg bg-black/60 border border-slate-700 text-center font-mono font-bold text-amber-300 text-xs outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Coin Transaction Ledger */}
      <div className="rounded-2xl bg-[#0c0e24] border border-slate-800 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Global Transaction Audit Ledger ({transactions.length} records)
            </h3>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Immutable Audit Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No coin transactions recorded yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Reason / Description</th>
                  <th className="py-2.5 px-4">Before</th>
                  <th className="py-2.5 px-4">After</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.map((tx) => {
                  const isCredit = tx.type === 'CREDIT';
                  return (
                    <tr key={tx.id} className="hover:bg-amber-500/5">
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] ${
                            isCredit
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
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

                      <td className="py-2.5 px-4 text-cyan-300 font-bold">{tx.username}</td>

                      <td className="py-2.5 px-4 font-bold">
                        <span className={isCredit ? 'text-emerald-400' : 'text-amber-400'}>
                          {isCredit ? `+${tx.amount}` : `-${tx.amount}`} 🪙
                        </span>
                      </td>

                      <td className="py-2.5 px-4 font-sans text-slate-300 max-w-sm truncate">
                        {tx.reason}
                      </td>

                      <td className="py-2.5 px-4 text-slate-400">{tx.balanceBefore}</td>
                      <td className="py-2.5 px-4 text-white font-bold">{tx.balanceAfter}</td>
                      <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString()}
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
