import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProseMirror Next.js Demo",
  description:
    "A simple ProseMirror editor demo built with Next.js and TypeScript",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-screen h-screen">{children}</body>
    </html>
  );
}
