import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Thai, Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
});

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fitness Equipment Asia — อุปกรณ์ฟิตเนสสำหรับบ้านและธุรกิจยิม",
    template: "%s · Fitness Equipment Asia",
  },
  description: "อุปกรณ์ฟิตเนสแบรนด์ของเราเอง สำหรับบ้านและธุรกิจยิม ในไทย ลาว เมียนมา และจีน",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${kanit.variable} ${plexThai.variable} ${plexMono.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
