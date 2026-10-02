import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Code2,
  Terminal,
  Key,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface DocsPageProps {
  navigate: (path: string, state?: any) => void;
}

export const DocsPage: React.FC<DocsPageProps> = ({ navigate }) => {
  const { user, systemInfo } = useAuth();
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const apiKeyPlaceholder = user?.apiKey || 'YOUR_API_KEY';

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const endpoints = systemInfo?.endpoints || [
    {
      endpoint: '/api/search',
      name: 'Song Search API',
      description: 'Search tracks, artists, and live audio previews',
      cost: 1,
      enabled: true,
      method: 'GET',
    },
    {
      endpoint: '/api/song',
      name: 'Song Details & Stream API',
      description: 'Get detailed track metadata and playable audio URL',
      cost: 1,
      enabled: true,
      method: 'GET',
    },
    {
      endpoint: '/api/download',
      name: 'Song Audio Download API',
      description: 'Resolve high-speed direct audio download links',
      cost: 2,
      enabled: true,
      method: 'GET',
    },
    {
      endpoint: '/api/health',
      name: 'System Health API',
      description: 'Verify service status and uptime',
      cost: 0,
      enabled: true,
      method: 'GET',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Intro */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <span>🦋</span> DEVELOPER API SPECIFICATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          CRIMINAL-API Documentation
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Welcome to the official developer documentation for{' '}
          <span className="text-cyan-300 font-semibold">🦋 CRIMINAL-API 🦋</span>, engineered and maintained by{' '}
          <span className="text-purple-300 font-semibold">DCT TEAM</span>. Integrate instant song searches, stream playback, and high-quality download links into your applications, bots, or Discord servers with a developer-first REST interface.
        </p>
      </div>

      {/* Authentication Guide */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 space-y-6">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Authentication & API Keys</h2>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Protected endpoints require an authorized API key. You can authenticate requests using either of the following two standard methods:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Method 1: Bearer Header (Recommended)
            </span>
            <pre className="p-3 rounded-lg bg-black/60 font-mono text-xs text-slate-200 overflow-x-auto">
              Authorization: Bearer {apiKeyPlaceholder}
            </pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Method 2: Query Parameter
            </span>
            <pre className="p-3 rounded-lg bg-black/60 font-mono text-xs text-slate-200 overflow-x-auto">
              ?apikey={apiKeyPlaceholder}
            </pre>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
          <Coins className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Coin Billing Rule:</span> Every successful API call deducts the configured coin cost for that endpoint. If your balance drops below the required cost, the server returns HTTP 402 with <code className="text-amber-300">INSUFFICIENT_COINS</code>. Failed requests (HTTP 4xx/5xx) are never billed.
          </div>
        </div>
      </div>

      {/* Detailed Endpoints Guide */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-white">API Reference Endpoints</h2>

        {/* 1. GET /api/search */}
        <div id="endpoint-search" className="p-6 sm:p-8 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                GET
              </span>
              <code className="text-lg font-mono font-bold text-white">/api/search</code>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {endpoints.find((e) => e.endpoint === '/api/search')?.cost ?? 1} Coin
              </span>

              <button
                onClick={() => navigate('/tester')}
                className="px-3.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Test in Studio
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            Performs a real-time song search across global music registries. Returns list of matches with track title, artist name, album, duration, high-resolution artwork, and playable preview audio streams.
          </p>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Parameters
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Field</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Required</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">q</td>
                    <td className="py-2.5 px-3 text-purple-300">string</td>
                    <td className="py-2.5 px-3 text-emerald-400">Yes</td>
                    <td className="py-2.5 px-3 font-sans">
                      Song title, artist name, or keywords (e.g. "believer", "starboy")
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-cyan-300">apikey</td>
                    <td className="py-2.5 px-3 text-purple-300">string</td>
                    <td className="py-2.5 px-3 text-slate-400">Optional</td>
                    <td className="py-2.5 px-3 font-sans">
                      Your API key (if not using Authorization header)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold">Example Request (cURL)</span>
              <button
                onClick={() =>
                  handleCopy(
                    `curl "${baseUrl}/api/search?q=believer&apikey=${apiKeyPlaceholder}"`,
                    'curl-search'
                  )
                }
                className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
              >
                {copiedSnippet === 'curl-search' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
{`curl -X GET "${baseUrl}/api/search?q=believer" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}"`}
            </pre>
          </div>
        </div>

        {/* 2. GET /api/song */}
        <div id="endpoint-song" className="p-6 sm:p-8 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                GET
              </span>
              <code className="text-lg font-mono font-bold text-white">/api/song</code>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {endpoints.find((e) => e.endpoint === '/api/song')?.cost ?? 1} Coin
              </span>

              <button
                onClick={() => navigate('/tester')}
                className="px-3.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Test in Studio
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            Returns detailed song metadata including stream links, audio bitrate (up to 320 kbps), release year, explicit content tag, and direct playable stream URL.
          </p>

          <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-xs font-mono text-purple-300 overflow-x-auto">
{`curl -X GET "${baseUrl}/api/song?q=1440893043" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}"`}
          </pre>
        </div>

        {/* 3. GET /api/download */}
        <div id="endpoint-download" className="p-6 sm:p-8 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
                GET
              </span>
              <code className="text-lg font-mono font-bold text-white">/api/download</code>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {endpoints.find((e) => e.endpoint === '/api/download')?.cost ?? 2} Coins
              </span>

              <button
                onClick={() => navigate('/tester')}
                className="px-3.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Terminal className="w-3.5 h-3.5" />
                Test in Studio
              </button>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            Resolves and returns direct audio download links with file size estimation, quality level (256-320kbps), and download stream headers.
          </p>

          <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
{`curl -X GET "${baseUrl}/api/download?q=believer" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}"`}
          </pre>
        </div>

        {/* 4. GET /api/health */}
        <div id="endpoint-health" className="p-6 sm:p-8 rounded-2xl bg-[#0c0e24] border border-cyan-500/20 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                GET
              </span>
              <code className="text-lg font-mono font-bold text-white">/api/health</code>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              0 Coins (Free & Public)
            </span>
          </div>

          <p className="text-sm text-slate-300">
            Verifies the status of 🦋 CRIMINAL-API servers, uptime, and database connectivity. Does not deduct any coins.
          </p>

          <pre className="p-4 rounded-xl bg-black/70 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
{`curl "${baseUrl}/api/health"`}
          </pre>
        </div>
      </div>
    </div>
  );
};
