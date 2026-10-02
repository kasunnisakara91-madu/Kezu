import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Shield,
  LayoutDashboard,
  Users,
  Coins,
  Cpu,
  Settings,
  LogOut,
  ExternalLink,
  Activity,
  Terminal,
} from 'lucide-react';

interface AdminLayoutProps {
  currentPath: string;
  navigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  navigate,
  children,
}) => {
  const { admin, adminLogout } = useAuth();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Coin Management', path: '/admin/coins', icon: Coins },
    { label: 'API Management', path: '/admin/apis', icon: Cpu },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  if (!admin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Shield className="w-12 h-12 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-slate-400 text-sm">Please log in to the administrative portal.</p>
        <button
          onClick={() => navigate('/admin')}
          className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Admin Sub-bar */}
      <div className="mb-8 p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-[#0e0f26] to-purple-950/40 border border-purple-500/25 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">CRIMINAL-API Security Portal</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                {admin.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Logged in as <span className="text-purple-300 font-semibold">{admin.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/tester')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Test API</span>
          </button>

          <button
            onClick={() => {
              adminLogout();
              navigate('/admin');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Admin Logout</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-1">
          <div className="p-3 rounded-2xl bg-[#0c0e24] border border-slate-800 space-y-1">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick System Badge */}
          <div className="p-4 rounded-2xl bg-[#0a0b1c] border border-purple-500/15 text-xs text-slate-400 space-y-2 mt-4 font-mono">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>Security Shield</span>
              <span className="text-emerald-400">ACTIVE</span>
            </div>
            <div className="text-[11px] leading-relaxed text-slate-400">
              Pass-thru JWT auth, salted bcrypt hashing, and atomic transaction recording.
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
};
