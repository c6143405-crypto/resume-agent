import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Agent Mock",
  description: "Figma to Next.js + Tailwind",
};

// 모바일 Safari 주소창 / 상태바 영역 색.
// 화면 전환 시 useSyncBodyBackground 훅이 동적으로 덮어쓴다.
export const viewport: Viewport = {
  themeColor: "#FAFFFC",
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
