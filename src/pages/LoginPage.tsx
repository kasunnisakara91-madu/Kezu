import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Key, Lock, Mail, ArrowRight, Shield, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Unable to connect to the server. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      {/* Background ambient lighting */}
      <div className="absolute w-[500px] h-[350px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0e24]/90 border border-cyan-500/25 shadow-[0_0_40px_rgba(0,242,254,0.1)] backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-3xl shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              🦋
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Sign In to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">CRIMINAL-API</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Powered by DCT TEAM • Access your API Keys & Coins
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
                Username or Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. dev_user or you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Don't have an API account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-4"
              >
                Create one now (Free Coins)
              </button>
            </p>

            <button
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Are you an administrator? Switch to Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
