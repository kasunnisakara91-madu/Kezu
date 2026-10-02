import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Key,
  Coins,
  Sparkles,
  Zap,
  Shield,
  Download,
  Terminal,
  Code2,
  ChevronRight,
  Music2,
  Check,
  Radio,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { user, systemInfo } = useAuth();
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl');

  const defaultCoins = systemInfo?.defaultCoins ?? 25;
  const endpoints = systemInfo?.endpoints || [];

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-cyan-500/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-48 right-10 w-[350px] h-[350px] bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-pink-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_20px_rgba(0,242,254,0.15)] animate-in fade-in zoom-in duration-300">
            <span className="text-base">🦋</span>
            <span className="tracking-wider uppercase font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-300">
              POWERED BY DCT TEAM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-normal">Next-Gen Audio & Metadata Infrastructure</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            High-Speed{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 drop-shadow-[0_0_35px_rgba(0,242,254,0.3)]">
              Song & Music API
            </span>{' '}
            For Modern Apps
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Search millions of tracks, extract direct high-fidelity audio streams, download high-bitrate audio, and power your bots or platforms with flexible coin-metered billing.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Key className="w-4 h-4 text-slate-950" />
                Go to Dashboard ({user.coinBalance} Coins)
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={() => navigate('/register')}
                className="px-7 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 hover:shadow-[0_0_25px_rgba(0,242,254,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Claim Free API Key ({defaultCoins} Free Coins)
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}

            <button
              onClick={() => navigate('/tester')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              Interactive API Tester
            </button>

            <button
              onClick={() => navigate('/docs')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              API Docs
            </button>
          </div>

          {/* Micro Stats */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-slate-400 text-xs sm:text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Real Live Catalog (No Fake Data)</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{defaultCoins} Coins on Signup</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>&lt; 150ms Response Latency</span>
            </div>
          </div>
        </div>

        {/* Interactive Code Showcase Terminal */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#090b1c]/90 border border-cyan-500/25 shadow-[0_0_50px_rgba(0,242,254,0.12)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/70 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400">
                🦋 criminal-api.dct / api / search?q=believer
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeTab === 'curl' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeTab === 'js' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Node/JS
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                  activeTab === 'python' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                }`}
              >
                Python
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-5 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto space-y-4">
            {activeTab === 'curl' && (
              <pre className="text-cyan-300 leading-relaxed">
{`# 1. Search song using Bearer token or ?apikey=
curl -X GET "https://criminal-api.dct/api/search?q=believer" \\
  -H "Authorization: Bearer YOUR_API_KEY"

# Or simply pass query parameter:
curl "https://criminal-api.dct/api/search?q=believer&apikey=YOUR_API_KEY"`}
              </pre>
            )}

            {activeTab === 'js' && (
              <pre className="text-purple-300 leading-relaxed">
{`// Real-time Song Search & Stream via CRIMINAL-API
const response = await fetch("https://criminal-api.dct/api/search?q=believer", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});
const data = await response.json();
console.log(data.data[0].title);      // "Believer"
console.log(data.data[0].streamUrl);  // Playable audio stream URL
console.log(data.remainingCoins);     // 24`}
              </pre>
            )}

            {activeTab === 'python' && (
              <pre className="text-sky-300 leading-relaxed">
{`import requests

url = "https://criminal-api.dct/api/search"
headers = {"Authorization": "Bearer YOUR_API_KEY"}
params = {"q": "believer"}

res = requests.get(url, headers=headers, params=params).json()
top_song = res["data"][0]
print(f"Playing: {top_song['title']} by {top_song['artist']}")
print(f"Download URL: {top_song['downloadUrl']}")`}
              </pre>
            )}

            {/* Simulated Live Response Box */}
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span>Response Sample (HTTP 200 OK • 1 Coin Deducted)</span>
                <span className="text-emerald-400 font-bold">● Active 200 OK</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/15 text-slate-300 text-xs">
{`{
  "status": true,
  "code": 200,
  "query": "believer",
  "totalResults": 15,
  "data": [
    {
      "id": "1440893043",
      "title": "Believer",
      "artist": "Imagine Dragons",
      "album": "Evolve",
      "duration": 204,
      "durationFormatted": "3:24",
      "previewUrl": "https://audio-ssl.itunes.apple.com/.../preview.m4a",
      "streamUrl": "https://audio-ssl.itunes.apple.com/.../preview.m4a",
      "source": "DCT Global Music CDN"
    }
  ],
  "remainingCoins": 24,
  "coinsDeducted": 1,
  "creator": "🦋 CRIMINAL-API 🦋 | DCT TEAM"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Endpoints & Coin Costs Table */}
      <section className="py-16 bg-[#0a0c20]/60 border-y border-cyan-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Dynamic Coin Pricing & Endpoints
            </h2>
            <p className="text-slate-400 text-sm">
              Endpoints consume coins dynamically configured by the Administrator. Coins are only charged on valid responses and never become negative.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {endpoints.map((ep) => (
              <div
                key={ep.endpoint}
                className="p-6 rounded-2xl bg-gradient-to-b from-[#0f122e] to-[#0a0c22] border border-cyan-500/20 hover:border-cyan-400/50 shadow-lg hover:shadow-[0_0_25px_rgba(0,242,254,0.15)] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {ep.method}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ep.cost} Coin{ep.cost === 1 ? '' : 's'}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {ep.name}
                  </h3>
                  <code className="text-xs text-purple-400 block my-1 font-mono">
                    {ep.endpoint}
                  </code>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {ep.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Operational
                  </span>
                  <button
                    onClick={() => navigate('/tester')}
                    className="text-cyan-300 hover:text-cyan-200 font-semibold flex items-center gap-1"
                  >
                    Test <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-purple-400">
            ENGINEERED FOR SCALE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built for Developers, Bots & Music Platforms
          </h2>
          <p className="text-slate-400 text-sm">
            Everything you need to integrate instant song queries, direct audio links, and high-speed audio resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-cyan-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Music2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">100% Real Music Catalog</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No mock results or fake data. Real songs, artists, high-definition album covers, track durations, and playable audio streams right out of the box.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-purple-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Flexible Authentication</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Authenticate via standard <code className="text-purple-300">Authorization: Bearer</code> headers, query parameters <code className="text-purple-300">?apikey=</code>, or custom headers.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-amber-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Robust Coin & Ledger System</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every coin credit or debit is written to an immutable transaction ledger. Instant verification prevents balance overdrafts.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-emerald-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">High Quality Downloads</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Download endpoints generate clean direct audio download URLs with bitrate and file size estimation ready for player consumption.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-sky-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-300">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Built-in API Tester</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Test queries directly in the web browser without installing third-party apps like Postman. Listen to songs immediately on completion.
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-[#0c0e24] border border-pink-500/15 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Admin Governance</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Dedicated admin portal to adjust coin costs, grant credits, ban abusers, toggle maintenance mode, and track request analytics.
            </p>
          </div>
        </div>
      </section>

      {/* DCT TEAM Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0d102c] via-[#141238] to-[#0d102c] border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.15)] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold tracking-wider">
              <span>🦋</span> ELITE DCT INFRASTRUCTURE
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to power your application with CRIMINAL-API?
            </h3>
            <p className="text-slate-400 text-sm max-w-xl">
              Register now and receive <span className="text-amber-300 font-bold">{defaultCoins} complimentary coins</span> to start querying instantly. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/register')}
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 to-purple-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all"
            >
              {user ? 'Open Dashboard' : 'Get Started Free'}
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all"
            >
              Read Docs
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
