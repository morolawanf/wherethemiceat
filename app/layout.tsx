import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Where them ICE at? 🧊 - Anonymous ICE Agent Location Reports",
  description:
    "Real-time, anonymous reporting of ICE agent locations. Stay informed and safe with community-driven proximity alerts. Report and track ICE agent sightings in your area.",
  keywords: [
    "ICE agents",
    "location reports",
    "community safety",
    "anonymous reporting",
    "immigration enforcement",
    "real-time alerts",
    "proximity warnings",
  ],
  authors: [{ name: "Where them ICE at? 🧊" }],
  openGraph: {
    title: "Where them ICE at? 🧊 - Anonymous ICE Agent Location Reports",
    description:
      "Real-time, anonymous reporting of ICE agent locations. Stay informed and safe with community-driven proximity alerts.",
    type: "website",
    locale: "en_US",
    siteName: "Where them ICE at? 🧊",
  },
  twitter: {
    card: "summary_large_image",
    title: "Where them ICE at? 🧊",
    description: "Real-time ICE agent location reports",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
