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
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-700/50 py-6 px-4 mt-auto">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-gray-300 text-sm leading-relaxed">
                This site was created for educational purposes and would not be promoting or abetting crime of any sort.
                <br />
                <span className="text-gray-400">
                  IF it does, kindly contact me as i would restrict it from your region or take the whole site down immediately. 
                  Contact: <a href="mailto:erudaite@proton.me" className="text-blue-400 hover:text-blue-300 underline">erudaite@proton.me</a>
                </span>
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
