"use client";

import React, { ReactNode, useState, useEffect } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  // Завантажити тему з localStorage на клієнті
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
    setMounted(true);
  }, []);

  // Перемикання теми
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

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
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* 8 кнопок навігації (справа) */}
      <nav className="side-nav">
        <button
          className="nav-btn nav-home"
          onClick={() => document.getElementById("home")?.scrollIntoView({ behavior: "smooth" })}
          title="Головна"
        >
          Головна
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-1")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 1"
        >
          Епоха 1
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-2")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 2"
        >
          Епоха 2
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-3")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 3"
        >
          Епоха 3
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-4")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 4"
        >
          Епоха 4
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-5")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 5"
        >
          Епоха 5
        </button>
        <button
          className="nav-btn nav-epoch"
          onClick={() => document.getElementById("epoch-6")?.scrollIntoView({ behavior: "smooth" })}
          title="Епоха 6"
        >
          Епоха 6
        </button>
        <button
          className="nav-btn nav-about"
          onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
          title="Про команду"
        >
          Про команду
        </button>
      </nav>

      {children}
    </>
  );
}
