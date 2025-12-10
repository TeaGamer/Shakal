"use client";

import React, { ReactNode, useEffect, useState } from "react";

/*
  Ід епох 
*/
type Epoch =
  | "home"
  | "epoch-1"
  | "epoch-2"
  | "epoch-3"
  | "epoch-4"
  | "epoch-5"
  | "about";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const [mounted, setMounted] = useState(false);

  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = savedTheme ?? "dark";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    document.documentElement.setAttribute("data-epoch", "home");

    setMounted(true);
  }, []);

  /* передзавантаження фонових зображень */
  useEffect(() => {
    if (!mounted) return;

    const sources = [
      "/Epoch1.png",
      "/Epoch2.png",
      "/Epoch3.png",
      "/Epoch4.png",
      "/Epoch5.png",
    ];

    let loaded = 0;

    const handleDone = () => {
      loaded += 1;
      if (loaded === sources.length) {
        setAssetsReady(true);
      }
    };

    sources.forEach((src) => {
      const img = new Image();
      img.onload = handleDone;
      img.onerror = handleDone; 
      img.src = src;
    });
  }, [mounted]);

  /* зміна фону залежно від видимої секції */
  useEffect(() => {
    if (!mounted || !assetsReady) return;

    const sections: { id: string; epoch: Epoch }[] = [
      { id: "home", epoch: "home" },
      { id: "epoch-1", epoch: "epoch-1" },
      { id: "epoch-2", epoch: "epoch-2" },
      { id: "epoch-3", epoch: "epoch-3" },
      { id: "epoch-4", epoch: "epoch-4" },
      { id: "epoch-5", epoch: "epoch-5" },
      { id: "about", epoch: "about" },
    ];

    const observed = sections
      .map((s) => {
        const el = document.getElementById(s.id);
        return el ? { el, epoch: s.epoch } : null;
      })
      .filter(
        (x): x is { el: HTMLElement; epoch: Epoch } => x !== null
      );

    if (!observed.length) return;

    let currentEpoch: Epoch | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        let candidate: { epoch: Epoch; ratio: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const found = observed.find((o) => o.el === entry.target);
          if (!found) continue;

          if (!candidate || entry.intersectionRatio > candidate.ratio) {
            candidate = {
              epoch: found.epoch,
              ratio: entry.intersectionRatio,
            };
          }
        }

        if (candidate && candidate.epoch !== currentEpoch) {
          currentEpoch = candidate.epoch;
          document.documentElement.setAttribute(
            "data-epoch",
            candidate.epoch
          );
        }
      },
      {
        threshold: [0.3, 0.6, 0.9],
      }
    );

    observed.forEach(({ el }) => observer.observe(el));

    return () => observer.disconnect();
  }, [mounted, assetsReady]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  /* ----------------- Загрузочний екран ----------------- */
  if (!mounted || !assetsReady) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#ffffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <img
          src="/Uia.gif"
          alt="Loading"
          style={{
            width: "200px",
            height: "auto",
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Кнопка перемикання теми */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>

      {/* Кнопки зправа */}
      <nav className="side-nav">
        <button
          className="nav-btn nav-home"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          ГОЛОВНА
        </button>

        <button
          className="nav-btn nav-epoch"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "epoch-1");
            document
              .getElementById("epoch-1")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          КНЯЖА УКРАЇНА
        </button>

        <button
          className="nav-btn nav-epoch"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "epoch-2");
            document
              .getElementById("epoch-2")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          КОЗАЧЧИНА
        </button>

        <button
          className="nav-btn nav-epoch"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "epoch-3");
            document
              .getElementById("epoch-3")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          ВИЗВОЛЬНІ ЗМАГАННЯ
        </button>

        <button
          className="nav-btn nav-epoch"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "epoch-4");
            document
              .getElementById("epoch-4")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          УПА
        </button>

        <button
          className="nav-btn nav-epoch"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "epoch-5");
            document
              .getElementById("epoch-5")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          ЗСУ
        </button>

        <button
          className="nav-btn nav-about"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "about");
            document
              .getElementById("about")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          ПРО КОМАНДУ
        </button>
      </nav>

      {children}
    </>
  );
}
