"use client";

import React, { useState } from "react";

export type CardItem = {
  id: string | number;
  title: string;
  image: string;
  text: string;
};

export default function LogoLoopAndFlipCards({
  logos = [],
  cards = [],
}: {
  logos?: string[];
  cards?: CardItem[];
}) {
  const [flipped, setFlipped] = useState<Record<string | number, boolean>>({});
  const toggle = (id: string | number) =>
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="w-full max-w-screen-lg mx-auto py-8">
      <style>{`
        :root {
          --orbit-duration: 18s;
          --card-image-size: 128px;
          --card-gap: 24px;
          --card-fixed-w: 260px;
          --orbit-radius: 6.5rem; /* зменшено — щоб логотипи не заходили на картки */
        }

        /* ORBIT */
        @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes counter { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }

        .logo-loop {
  width: 100%;
  height: 100%;
  /* animation: orbit var(--orbit-duration) linear infinite;  <-- ВИМКНУТО */
  transform-origin: center center;
  position: relative;
  overflow: visible;
  pointer-events: none;
}
        .logo-orbit-inner { position: absolute; inset: 0; }
        .logo-loop img {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 64px;
  height: 64px;
  object-fit: contain;
  transform-origin: center center;
  /* animation: counter var(--orbit-duration) linear infinite;  <-- ВИМКНУТО */
  z-index: 6;
  /* РОЗМІЩЕННЯ: ставимо статично по радіусу */
  transform: translate(-50%, -50%) translateY(calc(-1 * var(--orbit-radius)));
}
        .logo-center {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          z-index: 20; /* завжди над орбітою */
          pointer-events: auto;
        }

        /* FLIP CARDS 3D */
        .flip-card-3d { perspective: 1000px; }
        .flip-card-inner {
          transition: transform 0.6s cubic-bezier(.2,.9,.2,1);
          transform-style: preserve-3d;
          transform-origin: center center;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 320px; /* гарантуємо достатню висоту для обох сторін */
        }
        .flip-card-inner.flipped { transform: rotateY(180deg); }

        .flip-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 12px;
          box-sizing: border-box;
        }
        .flip-card-back { transform: rotateY(180deg); }

        /* ---- IMAGE SQUARE: fixed aspect ratio ---- */
        .card-image-wrap {
          width: 100%;
          min-width: 120px;
          max-width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          overflow: hidden;
          display: block;
          background: rgba(0,0,0,0.04);
          flex: 0 0 auto;
        }

        .card-image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
        }

        .card-front-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          height: 100%;
          padding: 12px;
          box-sizing: border-box;
        }

        .card-box {
          height: 100%;
          min-height: 220px;
          display: flex;
          align-items: stretch;
          box-sizing: border-box;
        }

        /* ===== NEW: row layout that does NOT depend on Tailwind ===== */
        .cards-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--card-gap);
          justify-content: center;
          align-items: flex-start;
          margin-top: 8px;
          z-index: 10; /* над орбітою */
        }

        .card-item {
          width: var(--card-fixed-w);
          flex: 0 0 var(--card-fixed-w);
          box-sizing: border-box;
          position: relative;
          z-index: 12;
        }

        /* Примусова висота / вирівнювання для flip-контейнера */
        .card-item .flip-card-inner { height: 100%; min-height: 320px; }

        /* make cards responsive: on small screens use full width */
        @media (max-width: 640px) {
          .card-item {
            width: calc(100% - (var(--card-gap) * 1));
            flex: 0 0 calc(100% - (var(--card-gap) * 1));
          }
          .flip-card-inner { min-height: 260px; }
        }

        /* on medium screens two columns */
        @media (min-width: 641px) and (max-width: 1024px) {
          .card-item {
            width: calc((100% - var(--card-gap)) / 2);
            flex: 0 0 calc((100% - var(--card-gap)) / 2);
          }
        }

        /* small cosmetic */
        .text-title { font-size: 16px; font-weight: 700; text-align:center; color: var(--text-primary, #fff); }
        .btn-small {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          font-weight: 600;
        }

        /* ensure card faces have subtle bg so text readable */
        .flip-card-face.bg-white { background: rgba(255,255,255,0.03); }
        .flip-card-face.bg-gray-50 { background: rgba(0,0,0,0.06); }

      `}</style>

      {/* Logo loop */}
      
      {/* === Cards row (replaces grid) === */}
      <div className="cards-row" role="list">
        {cards.map((c) => (
          <div key={c.id} className="card-item flip-card-3d" role="listitem">
            <div className={`flip-card-inner ${flipped[c.id] ? "flipped" : ""}`}>
              {/* FRONT */}
              <div className="flip-card-face bg-white border shadow-sm">
                <div className="card-front-inner">
                  <div className="card-image-wrap" aria-hidden>
                    <img src={c.image} alt={c.title} />
                  </div>

                  <div className="text-title">{c.title}</div>

                  <button onClick={() => toggle(c.id)} className="btn-small">
                    Докладніше
                  </button>
                </div>
              </div>

              {/* BACK */}
              <div className="flip-card-face flip-card-back bg-gray-50 border shadow-sm">
                <div className="flex flex-col items-start justify-center gap-3 w-full h-full p-4">
                  <p className="text-sm text-gray-200 leading-relaxed" style={{color: "rgba(255,255,255,0.9)"}}>
                    {c.text}
                  </p>

                  <div className="w-full flex justify-end">
                    <button onClick={() => toggle(c.id)} className="btn-small">
                      Назад
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
