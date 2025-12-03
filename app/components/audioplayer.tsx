"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * AudioPlayer — оновлена версія
 * - AudioContext створюється тільки на першій user gesture
 * - Додається GainNode для надійного контролю гучності
 * - resume() викликається при gesture (play / slider)
 * - Analyser + canvas залишаються для waveform
 *
 * Використано як основа твого останнього коміту. :contentReference[oaicite:1]{index=1}
 */

export default function AudioPlayer(): React.ReactElement {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const volumeRef = useRef<number>(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(1);

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "00:00";
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // === Audio graph creation (only on user gesture) ===
  function ensureAudioGraph(mediaEl: HTMLAudioElement) {
    if (audioCtxRef.current) return;

    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) {
      console.warn("AudioContext not available in this browser");
      return;
    }

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    const source = ctx.createMediaElementSource(mediaEl);
    sourceRef.current = source;

    const gain = ctx.createGain();
    gain.gain.value = volumeRef.current ?? 1;
    gainRef.current = gain;

    // source -> analyser -> gain -> destination
    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);

    console.log("Audio graph created, gain:", gain.gain.value);
  }

  // === Play / Pause ===
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      console.error("Audio element not found");
      return;
    }

    // create audio graph on first gesture
    ensureAudioGraph(audio);

    try {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
        console.log("AudioContext resumed");
      }

      if (!isPlaying) {
        console.log("Attempting to play...");
        const p = audio.play();
        if (p !== undefined) await p;
        // ensure gain reflects UI
        if (gainRef.current && audioCtxRef.current) {
          gainRef.current.gain.setValueAtTime(volumeRef.current, audioCtxRef.current.currentTime);
        } else {
          audio.volume = volumeRef.current;
        }
        audio.muted = false;
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Play failed:", e);
    }
  };

  // === Volume change ===
  const changeVolume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    volumeRef.current = v;

    // resume context if suspended (user gesture)
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      try {
        await audioCtxRef.current.resume();
        console.log("AudioContext resumed by volume change");
      } catch (err) {
        console.warn("Resume failed", err);
      }
    }

    // if graph not created yet, create on slider move
    const audio = audioRef.current;
    if (audio && !audioCtxRef.current) ensureAudioGraph(audio);

    if (gainRef.current && audioCtxRef.current) {
      try {
        gainRef.current.gain.setTargetAtTime(v, audioCtxRef.current.currentTime, 0.01);
      } catch {
        gainRef.current.gain.value = v;
      }
    } else if (audio) {
      audio.volume = v;
    }
  };

  // === Seeking (same як у тебе) ===
  const isSeekingRef = useRef(false);
  const doSeekFromClientX = (clientX: number, container: HTMLDivElement | null) => {
    const audio = audioRef.current;
    if (!audio || !container) return;
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const targetTime = pct * (audio.duration || 0);
    audio.currentTime = targetTime;
    setProgress((audio.duration && audio.duration > 0) ? (targetTime / audio.duration) * 100 : 0);
    setCurrent(targetTime);
  };
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = e.currentTarget as HTMLDivElement;
    try { container.setPointerCapture(e.pointerId); } catch {}
    isSeekingRef.current = true;
    doSeekFromClientX(e.clientX, container);
  };
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
        try { wrapper.releasePointerCapture((ev as any).pointerId); } catch {}
      }
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // === Canvas / Analyser draw loop (safe if analyser not ready) ===
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    if (!ctx2d) return;

    const dpr = window.devicePixelRatio || 1;
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 400;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(48 * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `48px`;
      ctx2d.setTransform(1, 0, 0, 1, 0, 0);
      ctx2d.scale(dpr, dpr);
    };
    resizeCanvas();
    const onResize = () => { ctx2d.setTransform(1,0,0,1,0,0); resizeCanvas(); };
    window.addEventListener("resize", onResize);

    const draw = () => {
  const analyser = analyserRef.current;
  const width = canvas.width / dpr;
  const height = canvas.height / dpr;
  const midY = height / 2;

  // очищаємо
  ctx2d.clearRect(0, 0, width, height);

  // Рендер-заповнювач коли аналайзера немає
  if (!analyser) {
    // фонова "порожня" смуга
    ctx2d.fillStyle = "rgba(255,255,255,0.02)";
    const r = 8; // радіус заокруглення
    ctx2d.beginPath();
    ctx2d.moveTo(r, 0);
    ctx2d.lineTo(width - r, 0);
    ctx2d.quadraticCurveTo(width, 0, width, r);
    ctx2d.lineTo(width, height - r);
    ctx2d.quadraticCurveTo(width, height, width - r, height);
    ctx2d.lineTo(r, height);
    ctx2d.quadraticCurveTo(0, height, 0, height - r);
    ctx2d.lineTo(0, r);
    ctx2d.quadraticCurveTo(0, 0, r, 0);
    ctx2d.closePath();
    ctx2d.fill();

    // тонка центральна лінія (щоб було відчуття "треку")
    ctx2d.strokeStyle = "rgba(255,255,255,0.06)";
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.moveTo(6, midY);
    ctx2d.lineTo(width - 6, midY);
    ctx2d.stroke();

    // залишаємо анімаційний цикл
    rafRef.current = requestAnimationFrame(draw);
    return;
  }

  // Якщо аналайзер є — малюємо реальний waveform
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteTimeDomainData(dataArray);

  ctx2d.lineWidth = 2;
  ctx2d.strokeStyle = "rgba(43,156,255,0.95)";
  ctx2d.fillStyle = "rgba(43,156,255,0.12)";

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
    };
  }, []);

  // === Time / progress events ===
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      const d = audio.duration || 0;
      const cur = audio.currentTime || 0;
      setCurrent(cur);
      setDuration(d);
      setProgress(d ? (cur / d) * 100 : 0);
      if (!isNaN(d) && cur >= d && d > 0) setIsPlaying(false);
    };

    const onLoaded = () => {
      setDuration(audio.duration || 0);
      console.log("Audio loaded, duration:", audio.duration);
      audio.volume = volumeRef.current ?? 1;
    };

    const onError = () => {
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
      <button className="audio-btn" onClick={togglePlay} aria-pressed={isPlaying} title={isPlaying ? "Pause" : "Play"}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          {isPlaying ? (
            <g fill="#fff"><rect x="6" y="5" width="3.5" height="14" rx="0.8"/><rect x="14" y="5" width="3.5" height="14" rx="0.8"/></g>
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
        <input className="volume-slider" type="range" min="0" max="1" step="0.01" value={volume} onChange={changeVolume} aria-label="Volume" />
      </div>

      <audio ref={audioRef} src="/smaragdove-nebo.mp3" preload="metadata" crossOrigin="anonymous" />
    </div>
  );
}
