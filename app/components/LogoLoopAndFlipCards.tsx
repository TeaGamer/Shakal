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
  
  const toggle = (id: string | number) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Перевірка перевернутих карток
  const isAnyCardFlipped = Object.values(flipped).some(val => val === true);

  return (
    <div style={{ width: '99%', margin: '0 auto', padding: '20px 0' }}>
      <style>{`
        :root {
          --card-gap: 75px; /* відстань між картками */
          --card-width: 140px; /* фіксована ширина картки */
          --card-count: 5; /* кількість карток */
          --total-width: calc(var(--card-width) * var(--card-count) + var(--card-gap) * (var(--card-count) - 1)); /* загальна ширина одної копії */
        }

        @keyframes scrollConveyorRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-1 * var(--total-width) - var(--card-gap)));
          }
        }

        .cards-row {
          display: flex;
          flex-wrap: nowrap;
          gap: var(--card-gap);
          justify-content: flex-start;
          align-items: flex-start;
          z-index: 10;
          width: 100%;
          overflow: hidden;
          position: relative;
          margin-bottom: 40px;
        }

        /* Градієнт по краях */
        .cards-row::before,
        .cards-row::after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          width: 200px;
          z-index: 20;
          pointer-events: none;
        }

        .cards-row::before {
          left: 0;
          background: linear-gradient(to right, var(--bg-secondary) 0%, transparent 100%);
        }

        .cards-row::after {
          right: 0;
          background: linear-gradient(to left, var(--bg-secondary) 0%, transparent 100%);
        }

        .cards-row.row-1 {
          display: flex;
          flex-wrap: nowrap;
          gap: var(--card-gap);
          overflow: hidden;
          position: relative;
        }


        .cards-row.row-1 .flip-card-3d { 
          perspective: 1000px;
          overflow: hidden;
          animation: scrollConveyorRight 28s linear infinite;
        }

        /* зупинка анімації якщо картку перегорнуто */
        .cards-row.row-1.paused .flip-card-3d {
          animation-play-state: paused !important;
        }
        
        .flip-card-inner {
          transition: transform 0.6s cubic-bezier(.2,.9,.2,1);
          transform-style: preserve-3d;
          transform-origin: center center;
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 240px;
        }
        
        .flip-card-inner.flipped { 
          transform: rotateY(180deg); 
        }

        .flip-card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          border-radius: 12px;
          box-sizing: border-box;
        }
        
        .flip-card-back { 
          transform: rotateY(180deg); 
        }

        /* Контейнер для фото */
        .card-image-wrap {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          display: block;
          background: rgba(0,0,0,0.04);
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

        .card-item {
          width: var(--card-width);
          flex-shrink: 0;
          box-sizing: border-box;
          position: relative;
          z-index: 12;
        }

        /* Текст карток */
        .text-title { 
          font-size: 12px; 
          font-weight: 700; 
          text-align: center; 
          color: var(--text-primary, #fff); 
          line-height: 1.2;
        }
        
        .btn-small {
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          font-weight: 600;
          font-size: 10px;
        }

        .flip-card-face.bg-white { 
          background: rgba(255,255,255,0.03); 
        }
        
        .flip-card-face.bg-gray-50 { 
          background: rgba(0,0,0,0.06); 
        }

        @media (min-width: 1200px) {
          :root {
            --card-gap: 75px;
            --card-width: 140px;
          }
          .flip-card-inner { min-height: 240px; }
          .cards-row.row-1 .flip-card-3d { animation: scrollConveyorRight 28s linear infinite; }
        }

        @media (min-width: 768px) and (max-width: 1199px) {
          :root {
            --card-gap: 55px;
            --card-width: 130px;
          }
          .flip-card-inner { min-height: 220px; }
          .text-title { font-size: 11px; }
          .btn-small { font-size: 9px; padding: 3px 6px; }
          .cards-row.row-1 .flip-card-3d { animation: scrollConveyorRight 24s linear infinite; }
        }


        @media (min-width: 600px) and (max-width: 767px) {
          :root {
            --card-gap: 40px;
            --card-width: 110px;
          }
          .flip-card-inner { min-height: 200px; }
          .card-front-inner { gap: 10px; padding: 10px; }
          .text-title { font-size: 10px; }
          .btn-small { font-size: 8px; padding: 3px 6px; }
          .cards-row.row-1 .flip-card-3d { animation: scrollConveyorRight 20s linear infinite; }
        }

        @media (min-width: 480px) and (max-width: 599px) {
          :root {
            --card-gap: 25px;
            --card-width: 95px;
          }
          .flip-card-inner { min-height: 180px; }
          .card-front-inner { gap: 8px; padding: 8px; }
          .text-title { font-size: 9px; }
          .btn-small { font-size: 7px; padding: 2px 5px; }
          .cards-row.row-1 .flip-card-3d { animation: scrollConveyorRight 17s linear infinite; }
        }

        @media (max-width: 479px) {
          :root {
            --card-gap: 15px;
            --card-width: 80px;
          }
          .flip-card-inner { min-height: 160px; }
          .card-front-inner { gap: 6px; padding: 6px; }
          .text-title { font-size: 8px; }
          .btn-small { font-size: 7px; padding: 2px 4px; }
          .flip-card-face { padding: 8px; }
          .cards-row.row-1 .flip-card-3d { animation: scrollConveyorRight 15s linear infinite; }
        }

      `}</style>

      {/* Конвеєр */}
      
      <div className={`cards-row row-1 ${isAnyCardFlipped ? 'paused' : ''}`} role="list">
        {[...cards, ...cards].map((c, idx) => (
          <div key={`row1-${c.id}-${idx}`} className="card-item flip-card-3d" role="listitem">
            <div className={`flip-card-inner ${flipped[c.id] ? "flipped" : ""}`}>
              {/* Перед картки */}
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

              {/* Зад картки */}
              <div className="flip-card-face flip-card-back bg-gray-50 border shadow-sm">
                <div className="flex flex-col items-start justify-center gap-2 w-full h-full p-3">
                  <p className="text-xs text-gray-200 leading-snug" style={{color: "rgba(255,255,255,0.9)", fontSize: "10px", lineHeight: "1.3"}}>
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
