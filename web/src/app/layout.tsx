import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PinCapture | Screen capture and process documentation",
  description:
    "Record browser workflows, create step-by-step guides, and export polished documentation or MP4 videos for your team.",
  icons: {
    icon: "/pincapture-icon.svg",
    shortcut: "/pincapture-icon.svg",
    apple: "/pincapture-icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
