import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import WaveSurfer from "wavesurfer.js";

const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const VoicePlayer = ({ src, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: isMe ? "rgba(255, 255, 255, 0.4)" : "rgba(59, 130, 246, 0.4)", // White for me, primary blue for other
      progressColor: isMe ? "#ffffff" : "#3b82f6",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 30,
      normalize: true,
      hideScrollbar: true,
    });

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";
    const isBlobUrl = src && src.startsWith("blob:");
    const proxySrc = !isBlobUrl && src ? `${apiUrl}/messages/stream-audio?url=${encodeURIComponent(src)}` : src;

    wavesurfer.current.load(proxySrc);

    wavesurfer.current.on("ready", () => {
      setIsReady(true);
      setDuration(wavesurfer.current.getDuration());
    });

    wavesurfer.current.on("audioprocess", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on("seek", () => {
      setCurrentTime(wavesurfer.current.getCurrentTime());
    });

    wavesurfer.current.on("finish", () => {
      setIsPlaying(false);
      setCurrentTime(0);
      wavesurfer.current.seekTo(0);
    });

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [src, isMe]);

  const togglePlayPause = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (wavesurfer.current && isReady) {
      if (isPlaying) {
        wavesurfer.current.pause();
        setIsPlaying(false);
      } else {
        wavesurfer.current.play();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className={`flex items-center gap-3 py-1 ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
      <button 
        onClick={togglePlayPause}
        disabled={!isReady}
        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all ${
          isMe 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-primary-100 hover:bg-primary-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-primary-600 dark:text-primary-400'
        } ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current translate-x-0.5" />
        )}
      </button>

      <div className="flex flex-col min-w-[120px] sm:min-w-[180px] max-w-[250px] flex-1">
        <div ref={waveformRef} className="w-full h-[30px] cursor-pointer" />
        <div className={`flex justify-between mt-1 text-[11px] font-medium tracking-wide ${isMe ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayer;
