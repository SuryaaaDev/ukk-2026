import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IoT Monitoring Dashboard",
  description: "Realtime IoT monitoring with MQTT and Next.js"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
