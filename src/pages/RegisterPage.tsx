import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Sparkles, Lock, Mail, User as UserIcon, ArrowRight, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegisterPageProps {
  navigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ navigate }) => {
  const { register, systemInfo } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultCoins = systemInfo?.defaultCoins ?? 25;
  const isSignupDisabled = systemInfo?.signupEnabled === false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) {
        setError(data.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      register(data.token, data.user);
      navigate('/dashboard');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute w-[500px] h-[350px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0c0e24]/90 border border-cyan-500/25 shadow-[0_0_40px_rgba(0,242,254,0.1)] backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-3xl shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              🦋
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Create Account
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Get an instant API Key for <span className="text-cyan-300 font-bold">CRIMINAL-API</span>
            </p>
          </div>

          {/* Welcome Coins Incentive Pill */}
          <div className="mb-6 p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-cyan-500/15 border border-amber-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-amber-200">
                Welcome Gift from DCT TEAM
              </span>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
              +{defaultCoins} FREE COINS
            </span>
          </div>

          {isSignupDisabled ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center space-y-2">
              <AlertCircle className="w-6 h-6 mx-auto text-amber-400" />
              <p className="font-semibold">New Registrations Currently Paused</p>
              <p className="text-slate-400">
                The administrator has temporarily paused public registrations. Please contact DCT TEAM or try again later.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. music_ninja"
                      minLength={3}
                      maxLength={30}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="developer@example.com"
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
                      placeholder="At least 6 characters"
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Register & Claim {defaultCoins} Coins</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-cyan-300 hover:text-cyan-200 font-semibold underline underline-offset-4"
              >
                Log in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
