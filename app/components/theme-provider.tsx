"use client";

import React, { ReactNode, useState, useEffect } from "react";

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

  // Завантаження теми + початкова епоха
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const initialTheme = saved || "dark";

    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);

    // Початковий фон — головна (Epoch1)
    document.documentElement.setAttribute("data-epoch", "home");

    setMounted(true);
  }, []);

  // Перемикання теми
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // 🔥 ОБНОВЛЕННЯ фону при скролі (IntersectionObserver)
  useEffect(() => {
    if (!mounted) return;

    const defs: { id: string; epoch: Epoch }[] = [
      { id: "home", epoch: "home" },
      { id: "epoch-1", epoch: "epoch-1" },
      { id: "epoch-2", epoch: "epoch-2" },
      { id: "epoch-3", epoch: "epoch-3" },
      { id: "epoch-4", epoch: "epoch-4" },
      { id: "epoch-5", epoch: "epoch-5" },
      { id: "about", epoch: "about" },
    ];

    const elements = defs
      .map((d) => {
        const el = document.getElementById(d.id);
        return el ? { el, epoch: d.epoch } : null;
      })
      .filter(
        (x): x is { el: Element; epoch: Epoch } => x !== null
      );

    if (!elements.length) return;

    let currentEpoch: Epoch | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { epoch: Epoch; ratio: number } | null = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const found = elements.find((e) => e.el === entry.target);
          if (!found) continue;

          if (!best || entry.intersectionRatio > best.ratio) {
            best = { epoch: found.epoch, ratio: entry.intersectionRatio };
          }
        }

        if (best && best.epoch !== currentEpoch) {
          currentEpoch = best.epoch;
          document.documentElement.setAttribute("data-epoch", best.epoch);
        }
      },
      {
        threshold: [0.3, 0.6, 0.9], // коли секція більш-менш в центрі
      }
    );

    elements.forEach(({ el }) => observer.observe(el));

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return <>{children}</>;

  return (
    <>
      {/* Кнопка перемикання теми (зліва зверху) */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>

      {/* Навігація справа */}
      <nav className="side-nav">
        <button
          className="nav-btn nav-home"
          onClick={() => {
            document.documentElement.setAttribute("data-epoch", "home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          title="Головна"
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
          title="Епоха 1"
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
          title="Епоха 2"
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
          title="Епоха 3"
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
          title="Епоха 4"
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
          title="Епоха 5"
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
          title="Про команду"
        >
          ПРО КОМАНДУ
        </button>
      </nav>

      {children}
    </>
  );
}
