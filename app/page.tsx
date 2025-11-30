"use client";
import "./global.css";
import AudioPlayer from "./components/audioplayer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <div className="app-bg">
        <header>
          <img
           src="/FastMoney.png"          // Лого (не забувай писати який тип файлу .png .jpg)
           alt="site logo"
           className="top-logo"
          />
          </header>
          <main className="center-wrapper">
            <div className="center-card">
              <div className="center-card-inner">
                {children}<h1>Терез є голосові!</h1>
                <AudioPlayer />
              </div>
            </div>
          </main> 
        </div>
      </body>
    </html>
  );
}
