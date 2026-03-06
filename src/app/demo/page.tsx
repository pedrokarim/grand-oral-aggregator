"use client";

import { useRef, useState, useEffect, useCallback } from "react";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function DemoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isScrubbing) setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => setDuration(video.duration);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [isScrubbing]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }, []);

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value) / 100;
    setVolume(v);
    setIsMuted(v === 0);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    setIsMuted(next);
    video.muted = next;
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) video.requestFullscreen();
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
    setScrubTime(currentTime);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScrubTime(Number(e.target.value));
  };

  const handleScrubEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    const newTime = Number((e.target as HTMLInputElement).value);
    if (videoRef.current) videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setIsScrubbing(false);
  };

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-[#FDFDF8]">
      {/* Video area */}
      <div className="flex-1 flex items-center justify-center bg-black min-h-0">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          preload="auto"
          playsInline
        >
          <source src="/video/demo.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Scrub bar */}
      <div className="px-2 py-1.5 bg-[#EFF7DE] border-t border-[#BFC1B7] flex items-center gap-2">
        <span className="text-xs font-semibold text-[#23251D] w-24 text-right tabular-nums">
          {formatTime(displayTime)} / {formatTime(duration)}
        </span>
        <div className="relative flex-1">
          <div className="h-1.5 bg-[#BFC1B7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#EB9D2A] rounded-full transition-[width] duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={displayTime}
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            onChange={handleScrub}
            onMouseUp={handleScrubEnd}
            onTouchEnd={handleScrubEnd}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
            style={{ left: `${progress}%` }}
          >
            <div className="w-3 h-3 bg-[#EB9D2A] rounded-full border-2 border-white shadow" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-12 px-4 py-2 bg-[#E5E7E0] border-t border-[#BFC1B7] gap-2">
        {/* Volume */}
        <div className="col-span-3 flex items-center gap-1.5">
          <button onClick={toggleMute} className="text-[#23251D] hover:text-[#EB9D2A]">
            {isMuted || volume === 0 ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            ) : volume > 0.5 ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume * 100}
            onChange={handleVolumeChange}
            className="w-16 accent-[#EB9D2A]"
          />
        </div>

        {/* Play controls */}
        <div className="col-span-6 flex items-center justify-center gap-2">
          <button
            onClick={() => seek(-10)}
            className="w-9 h-9 rounded-full border-2 border-[#BFC1B7] bg-[#FDFDF8] flex items-center justify-center text-[#4D4F46] hover:text-[#23251D] hover:border-[#9EA096] transition-colors"
          >
            <svg className="w-4 h-4 scale-x-[-1]" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
          <button
            onClick={togglePlay}
            className="w-11 h-11 rounded-full border-2 border-[#BFC1B7] bg-[#FDFDF8] flex items-center justify-center text-[#23251D] hover:border-[#EB9D2A] transition-colors"
          >
            {isPlaying ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <button
            onClick={() => seek(10)}
            className="w-9 h-9 rounded-full border-2 border-[#BFC1B7] bg-[#FDFDF8] flex items-center justify-center text-[#4D4F46] hover:text-[#23251D] hover:border-[#9EA096] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
          </button>
        </div>

        {/* Rate + fullscreen */}
        <div className="col-span-3 flex items-center justify-end gap-2">
          <select
            value={playbackRate}
            onChange={(e) => handleRateChange(Number(e.target.value))}
            className="text-xs font-semibold bg-[#FDFDF8] border border-[#BFC1B7] rounded px-1.5 py-1 text-[#23251D]"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
          <button
            onClick={toggleFullscreen}
            className="text-[#4D4F46] hover:text-[#23251D]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
