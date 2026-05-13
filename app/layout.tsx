import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Agent Mock",
  description: "Figma to Next.js + Tailwind",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
