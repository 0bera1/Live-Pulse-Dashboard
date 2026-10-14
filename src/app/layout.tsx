import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Live Pulse · Canlı Nabız Paneli",
  description:
    "Depremler, piyasalar, hava durumu ve açık kaynak aktivitesini halka açık API'lerden gerçek zamanlı izleyen operasyon merkezi.",
};

export const viewport: Viewport = {
  themeColor: "#05070b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <div className="backdrop" aria-hidden />
        {children}
      </body>
    </html>
  );
}
