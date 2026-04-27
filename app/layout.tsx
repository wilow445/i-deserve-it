import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "I Deserve It",
  description: "Ton compagnon glow-up. Affirmations, rituels, douceur.",
  applicationName: "I Deserve It",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "I Deserve It",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FBF6F0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-body text-ink relative overflow-x-hidden" style={{ background: "#FBF6F0" }}>
        <div className="grain" />
        <ServiceWorkerRegister />
        <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
