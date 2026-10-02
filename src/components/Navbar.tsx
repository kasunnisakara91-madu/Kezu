import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Key,
  Coins,
  Shield,
  LogOut,
  Menu,
  X,
  Code2,
  Terminal,
  User as UserIcon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, admin, logout, systemInfo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'Documentation', path: '/docs', icon: Code2 },
    { label: 'API Tester', path: '/tester', icon: Terminal },
    ...(user ? [{ label: 'Dashboard', path: '/dashboard', icon: Key }] : []),
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080914]/85 border-b border-cyan-500/15 shadow-[0_4px_30px_rgba(0,242,254,0.03)]">
      {/* Top micro banner if maintenance mode is active */}
      {systemInfo?.maintenanceMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 text-amber-300 text-xs px-4 py-1.5 text-center font-medium flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          Maintenance Notice: {systemInfo.maintenanceMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNav('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-600/25 to-pink-500/20 border border-cyan-500/30 group-hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,242,254,0.25)] transition-all duration-300">
            <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
              🦋
            </span>
            <div className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-400">
                CRIMINAL-API
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {systemInfo?.apiVersion || 'v1.4'}
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
              Powered by <span className="text-purple-400 font-bold">DCT TEAM</span>
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 opacity-75" />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User / Auth Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Coin Balance Pill */}
              <div
                onClick={() => handleNav('/dashboard')}
                title="Your active coin balance"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:border-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.15)]"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{user.coinBalance.toLocaleString()} Coins</span>
              </div>

              {/* User Dropdown / Dashboard Button */}
              <button
                onClick={() => handleNav('/dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
              >
                <UserIcon className="w-4 h-4 text-cyan-400" />
                <span className="max-w-[100px] truncate">{user.username}</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  handleNav('/');
                }}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="relative group px-4 py-2 rounded-lg text-sm font-semibold text-slate-900 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-300 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all duration-300 active:scale-95"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Get API Key</span>
                </div>
              </button>
            </div>
          )}

          {/* Admin link pill */}
          <button
            onClick={() => handleNav(admin ? '/admin/dashboard' : '/admin')}
            title="Administrator Portal"
            className={`p-2 rounded-lg border transition-all ${
              admin
                ? 'bg-purple-900/40 text-purple-300 border-purple-500/40 hover:bg-purple-800/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 border-slate-800 hover:text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/5'
            }`}
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <div
              onClick={() => handleNav('/dashboard')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold"
            >
              <Coins className="w-3 h-3 text-amber-400" />
              <span>{user.coinBalance}</span>
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0e22] border-b border-cyan-500/20 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {user ? (
              <>
                <div className="px-4 py-2 text-xs text-slate-400">
                  Signed in as <span className="font-semibold text-cyan-300">{user.username}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    handleNav('/');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-400 bg-red-500/10 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNav('/login')}
                  className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 text-center shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                >
                  Get Free Key
                </button>
              </div>
            )}

            <button
              onClick={() => handleNav(admin ? '/admin/dashboard' : '/admin')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold text-purple-300 bg-purple-900/30 border border-purple-500/30 mt-2"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal Gate</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
