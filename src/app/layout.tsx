import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "아파티 (APARTY) - 대한민국 1등 프리미엄 분양 포털",
  description: "전국의 모든 아파트 분양 정보, 아파티가 쉽고 정확하게 알려드립니다. 청약, 줍줍, 미분양 정보를 한눈에 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <div className="flex-grow">
          {children}
        </div>

        {/* 하단 푸터 */}
        <Footer />

        {/* 챗봇 (모든 페이지에 둥둥 떠있음) */}
        <ChatBot />
      </body>
    </html>
  );
}