import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/LanguageContext";

export const metadata: Metadata = {
  title: "HSK1 Тренажёр — учи китайский",
  description: "Учи 300 слов HSK1 с карточками, тестами и интервальными повторениями",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          <Navbar />
          <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
