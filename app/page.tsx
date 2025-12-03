"use client";

import AudioPlayer from "./components/audioplayer";

export default function HomePage() {
  return (
    <div className="app-bg">
      <main className="center-wrapper">
        <div className="center-card">
          {/* Розділ 1: Головна */}
          <section id="home" className="section">
            <header>
              <img src="/FastMoney.png" alt="Shakal FM" className="top-logo" />
            </header>
            <div className="center-card-inner">
              <h1>Тепер є голосові!</h1>
              <p>Ласкаво просимо на Shakal FM.</p>
              <AudioPlayer />
            </div>
          </section>

          {/* Розділ 2: Епоха 1 */}
          <section id="epoch-1" className="section">
            <h2>Княжа Доба(XI–XIII ст.)</h2>
            <p>Це стародавня епоха, в якій розпочалася наша історія.</p>
            <div className="lyrics">
{`Світанком біля моря
Мрійним промінням сонця
All up to you
All up to you`}
            </div>
          </section>

          {/* Розділ 3: Епоха 2 */}
          <section id="epoch-2" className="section">
            <h2>Козаччина (XVI–XVIII ст.)</h2>
            <p>На це хибує більшість вірність бракує цінність.</p>
            <div className="lyrics">
{`На це хибує більшість
Вірність бракує цінність
All up to you
All up to you`}
            </div>
          </section>

          {/* Розділ 4: Епоха 3 */}
          <section id="epoch-3" className="section">
            <h2>УНР (1917–1921)</h2>
            <p>Смарагдове небо чекає на завтра.</p>
            <div className="lyrics">
{`Смарагдове небо
Чекає на завтра
А я йду до тебе
Я йду назад`}
            </div>
          </section>

          {/* Розділ 5: Епоха 4 */}
          <section id="epoch-4" className="section">
            <h2>УПА (1940–1950-ті)</h2>
            <p>Загадуй бажання на смарагдовому небі.</p>
            <div className="lyrics">
{`Смарагдове небо
Загадуй бажання
А я йду до тебе
Я йду назад`}
            </div>
          </section>

          {/* Розділ 6: Епоха 5 */}
          <section id="epoch-5" className="section">
            <h2>ЗСУ 1990–2022+</h2>
            <p>Мені прислали пісню, немає більше місця.</p>
            <div className="lyrics">
{`Мені прислали пісню
Немає більше місця
В моєму злому серці
Давно уже війна`}
            </div>  
          </section>

          {/* Розділ 8: Про команду */}
          <section id="about" className="section">
            <h2>Про команду</h2>
            <p>Ми команда творчих людей, які створили Shakal FM.</p>
            <p>Дякуємо за вашу підтримку!</p>
            <AudioPlayer />
          </section>
        </div>
      </main>
    </div>
  );
}
