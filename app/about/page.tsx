"use client";
import "../global.css";
import AudioPlayer from "../components/audioplayer";

export default function AboutPage() {
  return (
    <html lang="uk">
      <body>
        <div className="app-bg">
          <header>
            <img
              src="/FastMoney.png"
              alt="site logo"
              className="top-logo"
            />
          </header>

          <main className="center-wrapper">
            <div className="center-card">

              <div className="center-card-inner">
                <h1>Про сайт</h1>
                <p>Вітаю вас на другій сторінці </p>
                <p>Тут поки нічого</p>
                <AudioPlayer />
              </div>
            </div>
          </main>
          <a href="/" className="floating-mytea" aria-label="Back to Home">
            <img src="/MyTea.png" alt="MyTea" />
          </a>
        </div>
      </body>
    </html>
  );
}
