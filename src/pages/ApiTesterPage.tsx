import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Terminal,
  Send,
  Key,
  Coins,
  Copy,
  Check,
  Play,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer.tsx';

interface ApiTesterPageProps {
  navigate: (path: string) => void;
}

export const ApiTesterPage: React.FC<ApiTesterPageProps> = ({ navigate }) => {
  const { user, refreshUser, systemInfo } = useAuth();

  const [selectedEndpoint, setSelectedEndpoint] = useState('/api/search');
  const [query, setQuery] = useState('believer');
  const [authMethod, setAuthMethod] = useState<'header' | 'query'>('header');
  const [apiKeyInput, setApiKeyInput] = useState(user?.apiKey || '');
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);

  // Sync API key if user logs in
  React.useEffect(() => {
    if (user?.apiKey && !apiKeyInput) {
      setApiKeyInput(user.apiKey);
    }
  }, [user]);

  const endpoints = systemInfo?.endpoints || [
    { endpoint: '/api/search', name: 'Song Search', cost: 1 },
    { endpoint: '/api/song', name: 'Song Details & Stream', cost: 1 },
    { endpoint: '/api/download', name: 'Audio Download URL', cost: 2 },
    { endpoint: '/api/health', name: 'Health Check (Free)', cost: 0 },
  ];

  const currentEpConfig = endpoints.find((e) => e.endpoint === selectedEndpoint);

  const presets = ['believer', 'starboy', 'shape of you', 'faded', 'despacito'];

  const executeRequest = async () => {
    setLoading(true);
    setResponseData(null);
    setResponseStatus(null);
    setResponseTime(null);

    const startTime = performance.now();

    try {
      let url = selectedEndpoint;
      const params = new URLSearchParams();

      if (selectedEndpoint !== '/api/health' && query.trim()) {
        params.append('q', query.trim());
      }

      if (authMethod === 'query' && apiKeyInput.trim()) {
        params.append('apikey', apiKeyInput.trim());
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const headers: Record<string, string> = {};
      if (authMethod === 'header' && apiKeyInput.trim()) {
        headers['Authorization'] = `Bearer ${apiKeyInput.trim()}`;
      }

      const res = await fetch(url, { headers });
      const duration = Math.round(performance.now() - startTime);

      setResponseStatus(res.status);
      setResponseTime(duration);

      const json = await res.json();
      setResponseData(json);

      // Refresh balance in background
      if (user) {
        refreshUser();
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResponseStatus(500);
      setResponseTime(duration);
      setResponseData({
        status: false,
        error: 'CLIENT_FETCH_ERROR',
        message: err.message || 'Failed to communicate with API server',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!responseData) return;
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Find if returned data has playable song
  const topSong =
    responseData?.data && Array.isArray(responseData.data) && responseData.data.length > 0
      ? responseData.data[0]
      : responseData?.data && typeof responseData.data === 'object' && responseData.data.title
      ? responseData.data
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦋</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              Interactive API Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test live song queries, inspect latency, and preview audio streams in real-time.
          </p>
        </div>

        {user ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0c0e24] border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Balance: {user.coinBalance} Coins</span>
          </div>
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300"
          >
            Get Free Key + 25 Coins
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Request Builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0c0e24] border border-cyan-500/25 shadow-lg space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Request Configuration
            </h3>

            {/* Select Endpoint */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Endpoint
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-cyan-400"
              >
                {endpoints.map((ep) => (
                  <option key={ep.endpoint} value={ep.endpoint}>
                    GET {ep.endpoint} ({ep.cost} Coin{ep.cost === 1 ? '' : 's'})
                  </option>
                ))}
              </select>
            </div>

            {/* Query Param input (if not health) */}
            {selectedEndpoint !== '/api/health' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Query Parameter (<code className="text-cyan-300">q</code>)
                  </label>
                  <span className="text-[10px] text-slate-400">Try quick preset:</span>
                </div>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Song name or artist..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono outline-none focus:border-cyan-400"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setQuery(p)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-md border font-mono transition-colors ${
                        query === p
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication method */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authentication Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMethod('header')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    authMethod === 'header'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Bearer Header
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('query')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    authMethod === 'query'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  ?apikey= Parameter
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  API Key
                </label>
                {user && (
                  <button
                    type="button"
                    onClick={() => setApiKeyInput(user.apiKey)}
                    className="text-[10px] text-cyan-300 hover:underline"
                  >
                    Insert My Key
                  </button>
                )}
              </div>
              <input
                type="text"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="crim_live_xxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400"
              />
            </div>

            {/* Send Request Button */}
            <button
              onClick={executeRequest}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Dispatching Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send API Request</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Inspector & Audio Streamer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0a0c20] border border-cyan-500/25 shadow-lg space-y-4 min-h-[500px] flex flex-col">
            {/* Inspector Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Response Inspector
                </span>

                {responseStatus !== null && (
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold ${
                      responseStatus >= 200 && responseStatus < 400
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    HTTP {responseStatus}
                  </span>
                )}

                {responseTime !== null && (
                  <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {responseTime} ms
                  </span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={handleCopyJson}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 transition-colors"
                >
                  {copiedResponse ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Audio Stream Player Preview (if audio stream present) */}
            {topSong && (topSong.streamUrl || topSong.previewUrl) && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider">
                  Live Audio Stream Preview
                </span>
                <AudioPlayer
                  url={topSong.streamUrl || topSong.previewUrl}
                  title={topSong.title}
                  artist={topSong.artist}
                  artwork={topSong.thumbnail || topSong.highResArtwork}
                  downloadUrl={topSong.downloadUrl}
                />
              </div>
            )}

            {/* JSON Output Viewer */}
            <div className="flex-1 bg-black/60 rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-auto max-h-[500px]">
              {responseData ? (
                <pre className="text-slate-200 whitespace-pre-wrap">
                  {JSON.stringify(responseData, null, 2)}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <Terminal className="w-10 h-10 opacity-30 text-cyan-400" />
                  <p className="text-sm font-sans">Ready to test.</p>
                  <p className="text-xs max-w-sm font-sans">
                    Configure your parameters on the left and click "Send API Request". Real-time song data, streams, and coin deductions will display here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
