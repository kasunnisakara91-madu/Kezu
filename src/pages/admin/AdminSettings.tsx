import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Settings,
  Save,
  Check,
  AlertCircle,
  RefreshCw,
  Power,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SystemSettings } from '../../types.ts';

export const AdminSettings: React.FC = () => {
  const { adminToken, refreshSystemInfo } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    if (!adminToken) return;
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [adminToken]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !settings) return;

    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.status) {
        setSaveSuccess(true);
        refreshSystemInfo();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to update system settings');
      }
    } catch {
      setErrorMessage('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
        Loading system configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">System Governance & Platform Settings</h2>
          <p className="text-xs text-slate-400">
            Control platform branding, maintenance states, access throttles, and registration gates.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>System configuration successfully saved across all services!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Branding */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Platform Branding & Versioning
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                API Platform Name
              </label>
              <input
                type="text"
                required
                value={settings.apiName}
                onChange={(e) => setSettings({ ...settings, apiName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Current Version
              </label>
              <input
                type="text"
                required
                value={settings.apiVersion}
                onChange={(e) => setSettings({ ...settings, apiVersion: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Powered By Brand
              </label>
              <input
                type="text"
                required
                value={settings.poweredBy}
                onChange={(e) => setSettings({ ...settings, poweredBy: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Access Gates & Maintenance Mode */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-slate-800 shadow-lg space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            System Operations & Maintenance
          </h3>

          <div className="space-y-4">
            {/* Maintenance Mode Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">System Maintenance Mode</span>
                  {settings.maintenanceMode && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      UNDER MAINTENANCE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  When enabled, all protected API calls will return HTTP 503 Maintenance notice. Free /health check remains accessible.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  settings.maintenanceMode
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {settings.maintenanceMode ? 'Maintenance ACTIVE' : 'Maintenance OFF'}
              </button>
            </div>

            {/* Maintenance Message */}
            {settings.maintenanceMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Broadcast Notice Message
                </label>
                <input
                  type="text"
                  value={settings.maintenanceMessage}
                  onChange={(e) =>
                    setSettings({ ...settings, maintenanceMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-xs text-amber-200 outline-none"
                />
              </div>
            )}

            {/* Signup Enabled Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-sm font-bold text-white">Allow Public Registration</span>
                <p className="text-xs text-slate-400 mt-1">
                  Controls whether new users can register on /register. If disabled, only existing accounts can authenticate.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSettings({ ...settings, signupEnabled: !settings.signupEnabled })
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  settings.signupEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {settings.signupEnabled ? 'Signups ENABLED' : 'Signups PAUSED'}
              </button>
            </div>
          </div>
        </div>

        {/* Limits & Default Coins */}
        <div className="p-6 rounded-2xl bg-[#0c0e24] border border-slate-800 shadow-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Quotas & Default Welcome Allocation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Default User Signup Coins
              </label>
              <input
                type="number"
                min="0"
                required
                value={settings.defaultCoins}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    defaultCoins: Math.max(0, parseInt(e.target.value, 10) || 0),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-purple-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Free coins granted to every newly registered developer account.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Global Rate Limit (Requests per minute per key)
              </label>
              <input
                type="number"
                min="10"
                required
                value={settings.rateLimitPerMinute}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    rateLimitPerMinute: Math.max(10, parseInt(e.target.value, 10) || 60),
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-purple-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Protects the song search backend against aggressive DDoS scrapers.
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Applying System Configuration...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
