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
                {children}<h1>Тепер є голосові!</h1>
                <div className="lyrics">
{`
Світанком біля моря
Мрійним промінням сонця
All up to you
All up to you

На це хибує більшість
Вірність бракує цінність
All up to you
All up to you

Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад

Смарагдове небо
Загадуй бажання
А я йду до тебе
Я йду назад

Смарагдове небо
Смарагдове небо

Смарагдове небо

Мені прислали пісню
Немає більше місця
В моєму злому серці
Давно уже війна

Давай забудем де ми
Пробудем всі проблеми
Мені пора на сцену
Сказати ці слова

Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад

Смарагдове небо
Загадуй бажання
А я йду до тебе
Я йду назад

Смарагдове небо
Смарагдове небо

Смарагдове небо

Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад

Смарагдове небо
Загадуй бажання
Я йду до тебе

Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад

Смарагдове небо
Загадуй бажання
Я йду до тебе

Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад

Смарагдове небо
Загадуй бажання
А я йду до тебе
Я йду назад
`}
</div>
                <AudioPlayer />
              </div>
            </div>
          </main> 
          <a href="/about" className="floating-mytea" aria-label="Open About">
            <img src="/MyTea.png" alt="MyTea" />
          </a>
        </div>
      </body>
    </html>
  );
}

// Floating button pinned bottom-left (stays visible while scrolling)
// Rendered here so it's present on the main page
// The CSS class `floating-mytea` is declared in `app/global.css`.
