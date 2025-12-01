"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * AudioPlayer with waveform (WebAudio Analyser), progress seek and time display.
 * - audio file: public/smaragdove-nebo.mp3
 * - use in page.tsx: <AudioPlayer />
 */

export default function AudioPlayer(): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const volumeRef = useRef(1); // зберігаємо гучність без перепрацювання

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0..100
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1); // для UI відображення

  // format seconds -> mm:ss
  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);

    // Змінюємо гучність негайно
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  };

  // Play/pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error("❌ Audio element not found");
      return;
    }
    
    console.log("🔊 Audio element found");
    console.log("📄 Audio src:", audio.src);
    console.log("⏱️ Duration:", audio.duration);
    console.log("📊 Ready state:", audio.readyState, "(0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA, 3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA)");
    console.log("🎵 Network state:", audio.networkState, "(0=NETWORK_EMPTY, 1=NETWORK_IDLE, 2=NETWORK_LOADING, 3=NETWORK_NO_SOURCE)");
    
    try {
      if (!isPlaying) {
        console.log("▶️ Attempting to play...");
        // resume audio context on user gesture if suspended
        if (audioCtxRef.current?.state === "suspended") {
          console.log("🔓 Resuming AudioContext...");
          await audioCtxRef.current.resume();
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log("✅ Play succeeded");
        }
        setIsPlaying(true);
      } else {
        console.log("⏸️ Pausing...");
        audio.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("❌ Audio play failed:", e);
    }
  };

  // Seek when clicking on progress bar
  // Seeking / scrubbing (support drag)
  const isSeekingRef = useRef(false);

  const doSeekFromClientX = (clientX: number, container: HTMLDivElement | null) => {
    const audio = audioRef.current;
    if (!audio || !container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = pct * (audio.duration || 0);
    audio.currentTime = targetTime;
    // update UI immediately
    setProgress((audio.duration && audio.duration > 0) ? (targetTime / audio.duration) * 100 : 0);
    setCurrent(targetTime);
  };

  // start dragging (pointerdown)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget as HTMLDivElement;
    // capture pointer to continue receiving events
    try { container.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    isSeekingRef.current = true;
    doSeekFromClientX(e.clientX, container);
  };

  // move while dragging
  useEffect(() => {
    const onPointerMove = (ev: PointerEvent) => {
      if (!isSeekingRef.current) return;
      const wrapper = canvasRef.current?.parentElement as HTMLDivElement | null;
      if (!wrapper) return;
      doSeekFromClientX(ev.clientX, wrapper);
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!isSeekingRef.current) return;
      isSeekingRef.current = false;
      const wrapper = canvasRef.current?.parentElement as HTMLDivElement | null;
      if (wrapper) {
        try { wrapper.releasePointerCapture((ev as any).pointerId); } catch (err) { /* ignore */ }
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // Setup analyser and draw waveform — run once on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return; // guard: audio must exist

    function setupAudioContext(mediaEl: HTMLAudioElement) {
      if (audioCtxRef.current) return;

      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // create source from <audio> — mediaEl is guaranteed non-null
      const source = ctx.createMediaElementSource(mediaEl);
      sourceRef.current = source;

      // connect: source -> analyser -> destination
      source.connect(analyser);
      analyser.connect(ctx.destination);
    }

    setupAudioContext(audio);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array((analyser && analyser.frequencyBinCount) || 1024);

    const dpr = window.devicePixelRatio || 1;
    const resizeCanvas = () => {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 400;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(48 * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `48px`;
      // reset transform before scaling (avoid cumulative scaling)
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      ctx2d.scale(dpr, dpr);
    };
    resizeCanvas();

    const onResize = () => {
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      resizeCanvas();
    };
    window.addEventListener("resize", onResize);

    const draw = () => {
      if (!analyser || !ctx2d || !canvas) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteTimeDomainData(dataArray);

      // clear
      ctx2d.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // styling
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const midY = height / 2;
      ctx2d.lineWidth = 2;
      ctx2d.strokeStyle = "rgba(43,156,255,0.95)";
      ctx2d.fillStyle = "rgba(43,156,255,0.12)";

      // draw filled waveform
      ctx2d.beginPath();
      const step = Math.max(1, Math.floor(dataArray.length / width));
      let x = 0;
      for (let i = 0; i < dataArray.length; i += step) {
        const v = dataArray[i] / 128.0; // 0..2
        const y = (v * midY) - midY;
        const drawY = midY + y;
        if (i === 0) ctx2d.moveTo(x, drawY);
        else ctx2d.lineTo(x, drawY);
        x += 1;
      }
      ctx2d.lineTo(width, midY);
      ctx2d.lineTo(0, midY);
      ctx2d.closePath();
      ctx2d.fill();

      // overlay stroke
      ctx2d.beginPath();
      x = 0;
      for (let i = 0; i < dataArray.length; i += step) {
        const v = dataArray[i] / 128.0;
        const y = (v * midY) - midY;
        const drawY = midY + y;
        if (i === 0) ctx2d.moveTo(x, drawY);
        else ctx2d.lineTo(x, drawY);
        x += 1;
      }
      ctx2d.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      // cleanup audio nodes safely
      try {
        analyserRef.current?.disconnect();
        sourceRef.current?.disconnect();
      } catch (e) {
        // ignore
      }
    };
  }, []); // run only once on mount

  // time / progress updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      const d = audio.duration || 0;
      const cur = audio.currentTime || 0;
      setCurrent(cur);
      setDuration(d);
      setProgress(d ? (cur / d) * 100 : 0);
      if (!isNaN(d) && cur >= d && d > 0) {
        setIsPlaying(false);
      }
    };

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      console.log("Audio loaded, duration:", audio.duration);
      // ensure initial volume is set when metadata loaded
      audio.volume = audioRef.current?.volume || 1;
    };

    const onError = (err: Event) => {
      console.error("Audio error:", audio.error);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("error", onError);
    audio.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  return (
    <div className="audio-box" role="region" aria-label="Audio player">
      <button
        className="audio-btn"
        onClick={togglePlay}
        aria-pressed={isPlaying}
        title={isPlaying ? "Pause" : "Play"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          {isPlaying ? (
            <g fill="#fff">
              <rect x="6" y="5" width="3.5" height="14" rx="0.8" />
              <rect x="14" y="5" width="3.5" height="14" rx="0.8" />
            </g>
          ) : (
            <path d="M5 3.868v16.264L19 12 5 3.868z" fill="#fff" />
          )}
        </svg>
      </button>

      <div className="audio-controls">
        <div className="wave-wrapper" onPointerDown={handlePointerDown} style={{ cursor: "pointer" }}>
          <canvas ref={canvasRef} />
          <div className="progress-overlay" style={{ width: `${progress}%` }} aria-hidden />
        </div>

        <div className="time-row" aria-live="polite">
          <div className="time-left">{fmt(current)}</div>
          <div className="time-right">{fmt(duration)}</div>
        </div>
      </div>

      <div className="volume-box" aria-label="Volume control">
        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={changeVolume}
          aria-label="Volume"
        />
      </div>

      <audio 
        ref={audioRef} 
        src="/smaragdove-nebo.mp3" 
        preload="metadata" 
        crossOrigin="anonymous"
      /> 
    </div>
  );
}
