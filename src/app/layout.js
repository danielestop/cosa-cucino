import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cosa Cucino?",
  description: "Ricettario intelligente per adulti e svezzamento",
};


export default function RootLayout({ children }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className="antialiased dark:bg-[#1a1a1a] dark:text-[#f0f0f0]">
        {children}
      </body>
    </html>
  );
}
