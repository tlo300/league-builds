import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "League Builds",
  description: "Track your League of Legends champion builds",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
