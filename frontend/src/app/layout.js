import { Inter, Prompt } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
});

export const metadata = {
  title: "Auction Market | ตลาดประมูล",
  description: "Aggregated auction marketplace from Discord channels - browse items, check prices, and view on Discord",
  keywords: ["auction", "marketplace", "discord", "ประมูล", "ตลาด"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${inter.variable} ${prompt.variable}`}>
        {children}
      </body>
    </html>
  );
}
