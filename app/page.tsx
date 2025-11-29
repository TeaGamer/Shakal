// app/layout.tsx
import "./global.css";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <div className="app-bg">
        <header>
          <img
           src="/FastMoney.png"          // твій файл
           alt="site logo"
           className="top-logo"
          />
          </header>
          <main className="center-wrapper">
            <div className="center-card">
              {children}<p>Все пише тут</p>
              
            </div>
          </main>

        </div>
      </body>
    </html>
  );
}
