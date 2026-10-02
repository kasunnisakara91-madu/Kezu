import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, ExternalLink } from 'lucide-react';

interface AudioPlayerProps {
  url: string;
  title: string;
  artist: string;
  artwork?: string;
  downloadUrl?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  url,
  title,
  artist,
  artwork,
  downloadUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play error:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || 1;
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newPercent = parseFloat(e.target.value);
    const dur = audioRef.current.duration || 1;
    audioRef.current.currentTime = (newPercent / 100) * dur;
    setProgress(newPercent);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!url) {
    return (
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
        No preview audio stream available for this track.
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#0d1026] via-[#101432] to-[#120f28] border border-cyan-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col gap-2.5">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {artwork ? (
            <img
              src={artwork}
              alt={title}
              className="w-11 h-11 rounded-lg object-cover border border-cyan-500/20 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-300 font-bold">
              🎵
            </div>
          )}

          <div className="min-w-0">
            <h5 className="text-sm font-semibold text-slate-100 truncate">{title}</h5>
            <p className="text-xs text-slate-400 truncate">{artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              title="Download Audio"
              className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.3)] transition-all shrink-0 active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
        </button>

        <span className="text-[11px] font-mono text-slate-400 shrink-0">
          {audioRef.current ? formatSeconds(audioRef.current.currentTime) : '0:00'}
        </span>

        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
        />

        <span className="text-[11px] font-mono text-slate-400 shrink-0">
          {formatSeconds(duration)}
        </span>
      </div>
    </div>
  );
};
