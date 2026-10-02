import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Coins,
  RefreshCw,
  Power,
  Clock,
} from 'lucide-react';
import { EndpointConfig, APIRequestLog } from '../../types.ts';

export const AdminApis: React.FC = () => {
  const { adminToken } = useAuth();
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>([]);
  const [endpointStats, setEndpointStats] = useState<Record<string, any>>({});
  const [recentErrors, setRecentErrors] = useState<APIRequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchApiData = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/apis/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setEndpoints(data.endpoints || []);
          setEndpointStats(data.endpointStats || {});
          setRecentErrors(data.recentErrors || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch API stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiData();
  }, [adminToken]);

  const handleToggleEndpoint = async (endpoint: EndpointConfig) => {
    if (!adminToken) return;
    setUpdating(endpoint.endpoint);
    try {
      const res = await fetch('/api/admin/apis/update-endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          endpoint: endpoint.endpoint,
          cost: endpoint.cost,
          enabled: !endpoint.enabled,
        }),
      });

      const data = await res.json();
      if (data.status) {
        setEndpoints(data.endpoints || []);
      }
    } catch (err) {
      console.error('Failed to toggle endpoint:', err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">API Endpoint Controls & Error Analytics</h2>
          <p className="text-xs text-slate-400">
            Control endpoint availability, inspect volume, and audit error payloads.
          </p>
        </div>

        <button
          onClick={fetchApiData}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Endpoints Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {endpoints.map((ep) => {
          const stats = endpointStats[ep.endpoint] || {
            total: 0,
            success: 0,
            failed: 0,
            totalCost: 0,
          };
          const successPercent =
            stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100;
          const isBusy = updating === ep.endpoint;

          return (
            <div
              key={ep.endpoint}
              className={`p-6 rounded-2xl bg-[#0c0e24] border transition-all ${
                ep.enabled
                  ? 'border-cyan-500/25 shadow-[0_0_20px_rgba(0,242,254,0.06)]'
                  : 'border-red-500/20 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      {ep.method}
                    </span>
                    <h3 className="text-sm font-bold text-white">{ep.name}</h3>
                  </div>
                  <code className="text-xs text-purple-300 font-mono block mt-1">
                    {ep.endpoint}
                  </code>
                </div>

                {/* Toggle Button */}
                <button
                  onClick={() => handleToggleEndpoint(ep)}
                  disabled={isBusy}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    ep.enabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{ep.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-2">{ep.description}</p>

              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-800 text-center font-mono">
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 block font-sans">Calls</span>
                  <span className="text-xs font-bold text-white">{stats.total}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 block font-sans">Rate</span>
                  <span className="text-xs font-bold text-emerald-400">{successPercent}%</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 block font-sans">Cost</span>
                  <span className="text-xs font-bold text-amber-300">{ep.cost} 🪙</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60">
                  <span className="text-[10px] text-slate-400 block font-sans">Billed</span>
                  <span className="text-xs font-bold text-purple-300">{stats.totalCost} 🪙</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Logs Table */}
      <div className="rounded-2xl bg-[#0c0e24] border border-red-500/20 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-300">
              Recent Error Logs & Rejections ({recentErrors.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            4xx / 5xx / Insufficient Coins
          </span>
        </div>

        <div className="overflow-x-auto">
          {recentErrors.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              Zero errors recorded. All systems operating flawlessly.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Endpoint</th>
                  <th className="py-2.5 px-4">Error Code</th>
                  <th className="py-2.5 px-4">Query</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentErrors.map((err) => (
                  <tr key={err.id} className="hover:bg-red-500/5">
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
                        {err.responseStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-cyan-300">{err.username}</td>
                    <td className="py-2.5 px-4 text-white font-bold">{err.endpoint}</td>
                    <td className="py-2.5 px-4 text-amber-300">{err.error || 'ERROR'}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-sans max-w-xs truncate">
                      {err.query || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {new Date(err.requestTime).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
