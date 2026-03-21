import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Auction Market | ตลาดประมูล",
  description: "Aggregated auction marketplace from Discord channels - browse items, check prices, and view on Discord",
  keywords: ["auction", "marketplace", "discord", "ประมูล", "ตลาด"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
