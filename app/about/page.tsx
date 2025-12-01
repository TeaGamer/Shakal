"use client";

import AudioPlayer from "../components/audioplayer";

export default function AboutPage() {
  return (
    <div className="app-bg">
      <main className="center-wrapper">
        <div className="center-card">
          <section id="about" className="section">
            <header>
              <img src="/FastMoney.png" alt="Shakal FM" className="top-logo" />
            </header>
            <div className="center-card-inner">
              <h1>Про команду</h1>
              <p>Ми команда творчих людей, які створили Shakal FM.</p>
              <p>Дякуємо за вашу підтримку!</p>
              <AudioPlayer />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
