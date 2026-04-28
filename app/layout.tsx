import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Say Suco X&O | Win a Promo Code!",
  description:
    "Play the Say Suco açaí challenge! Beat the AI 10 times and win an exclusive promo code. Always scooped, never blended.",
  keywords: ["say suco", "acai", "game", "promo", "xo", "tic tac toe"],
  openGraph: {
    title: "Say Suco X&O Game",
    description: "Beat the AI 10 times and win a free promo code at Say Suco!",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#85184F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
