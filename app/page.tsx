// app/layout.tsx
import "./global.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <div className="app-bg">
          <main className="center-wrapper">
            <div className="center-card">
              {/* Тут з'явиться текст/відео/аудіо — наразі плейсхолдер */}
              {children ?? (
                <div className="center-placeholder">
                  <h2>Все буде тут</h2>
                </div>
              )}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
