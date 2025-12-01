import React, { ReactNode } from "react";
import "./global.css";
import { ThemeProvider } from "./components";

export const metadata = {
  title: "Shakal FM",
  description: "Shakal FM — музика та історія України",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
