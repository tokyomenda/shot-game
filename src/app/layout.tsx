import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ХАЛУУН ХӨЗӨР — Үдшийг эхлүүл",
  description: "Асуултаа хариул. Даалгавраа биелүүл. Үгүй бол шийтгэлтэй.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="mn"><body>{children}</body></html>;
}