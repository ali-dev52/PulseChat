import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";

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
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      if (audio.duration && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const setAudioTime = () => setCurrentTime(audio.currentTime);

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("ended", handleEnded);

    // If duration isn't available immediately (sometimes happens with webm/ogg)
    if (audio.readyState > 0 && audio.duration && audio.duration !== Infinity) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlayPause = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error("Audio playback error:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className={`flex items-center gap-3 py-1 ${isMe ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <button 
        onClick={togglePlayPause}
        className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all ${
          isMe 
            ? 'bg-white/20 hover:bg-white/30 text-white' 
            : 'bg-primary-100 hover:bg-primary-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-primary-600 dark:text-primary-400'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current translate-x-0.5" />
        )}
      </button>

      <div className="flex flex-col min-w-[100px] sm:min-w-[150px] max-w-[200px] flex-1">
        <input
          type="range"
          ref={progressBarRef}
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={handleProgressChange}
          className={`w-full h-1.5 rounded-full outline-none appearance-none cursor-pointer transition-all ${
            isMe
              ? 'bg-white/30 accent-white'
              : 'bg-slate-200 dark:bg-slate-700 accent-primary-500'
          }`}
          style={{
            background: `linear-gradient(to right, ${isMe ? '#ffffff' : '#3b82f6'} ${
              duration ? (currentTime / duration) * 100 : 0
            }%, ${isMe ? 'rgba(255,255,255,0.3)' : 'rgba(148, 163, 184, 0.3)'} ${
              duration ? (currentTime / duration) * 100 : 0
            }%)`
          }}
        />
        <div className={`flex justify-between mt-1 text-[11px] font-medium tracking-wide ${isMe ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VoicePlayer;
