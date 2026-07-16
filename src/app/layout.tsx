import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bea & Basil '26",
  description: "dis is it, pancit!",
  // Invite-only — keep it out of search engines.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Paint edge-to-edge into the iOS safe areas (behind the toolbar / home
  // indicator) so the forest background fills the whole screen.
  viewportFit: "cover",
  // Tint Safari's browser chrome to match the hero.
  themeColor: "#4d573f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
