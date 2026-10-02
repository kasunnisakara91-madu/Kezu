import React from 'react';
import { Shield, Code2, Terminal, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="mt-auto border-t border-cyan-500/10 bg-[#060710] py-12 relative overflow-hidden">
      {/* Background neon ambient aura */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦋</span>
              <div>
                <span className="text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
                  CRIMINAL-API
                </span>
                <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Powered by <span className="text-purple-400 font-bold">DCT TEAM</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Enterprise-grade real-time Music & Song metadata, audio streaming, and high-speed download resolution engine. Equipped with dynamic coin-metered billing and developer-first REST interfaces.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Production Core Engine • Zero Downtime Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Developer Hub
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/docs')}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <Code2 className="w-3.5 h-3.5" /> API Documentation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/tester')}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5" /> Interactive API Tester
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  User Dashboard & Keys
                </button>
              </li>
            </ul>
          </div>

          {/* System & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Governance & Admin
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => navigate('/admin')}
                  className="hover:text-purple-300 transition-colors flex items-center gap-1.5 text-purple-400/90 font-medium"
                >
                  <Shield className="w-3.5 h-3.5" /> Admin Panel Login
                </button>
              </li>
              <li>
                <span className="text-xs text-slate-400 font-mono">
                  Bearer Token & ?apikey= Support
                </span>
              </li>
              <li>
                <span className="text-xs text-slate-400 font-mono">
                  MongoDB Cloud / Isolated Store
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} 🦋 <span className="text-slate-300 font-semibold">CRIMINAL-API</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            Engineered with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> by{' '}
            <span className="text-purple-300 font-bold tracking-wide">DCT TEAM</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
