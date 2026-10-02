import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  navigate: (path: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ navigate }) => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        setError(data.message || data.error || 'Invalid administrator credentials');
        setLoading(false);
        return;
      }

      adminLogin(data.token, data.admin);
      navigate('/admin/dashboard');
    } catch {
      setError('Connection error. Server may be initializing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminFill = () => {
    setEmail('admin@criminal-api.dct');
    setPassword('Admin@Criminal2026!');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute w-[500px] h-[350px] bg-purple-600/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0b0c20]/95 border border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/40 text-3xl shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              🛡️
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Admin Access Gate
            </h1>
            <p className="text-xs text-purple-300/80 font-mono">
              🦋 CRIMINAL-API • Powered by DCT TEAM
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@criminal-api.dct"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700/80 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Authenticate Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill button for testing */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleDemoAdminFill}
              className="text-[11px] text-purple-300/80 hover:text-purple-200 bg-purple-950/40 hover:bg-purple-900/40 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-all font-mono"
            >
              ⚡ Fill Default Admin Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
