import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PinCapture",
  description: "Capture and share step-by-step process guides",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
