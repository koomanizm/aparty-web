import type { Metadata } from "next";
import "./globals.css";

import Footer from "../components/common/Footer";
import ChatBot from "../components/support/ChatBot";
// 🚀 1. 방금 만든 AuthContext를 불러옵니다.
import AuthContext from "../components/auth/AuthContext";

export const metadata: Metadata = {
  // ✅ 1. 기본 주소 설정 (이게 있어야 이미지가 잘 뜹니다)
  metadataBase: new URL('https://aparty.co.kr'),

  title: "아파티 (APARTY) - 프리미엄 분양권 포털",
  description: "전국의 모든 아파트 분양 정보, 아파티가 쉽고 정확하게 알려드립니다. 청약, 줍줍, 미분양 정보를 한눈에 확인하세요.",

  // ✅ 2. Open Graph 추가 (카카오톡 미리보기 설정)
  openGraph: {
    title: "아파티 (APARTY) - 대한민국 1등 분양 포털",
    description: "청약, 줍줍, 미분양 아파트 정보를 가장 빠르고 정확하게 확인하세요.",
    url: "https://aparty.co.kr",
    siteName: "아파티",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og-image.png", // 대표 이미지 (잠시 후 설명드릴게요)
        width: 1200,
        height: 630,
        alt: "아파티 미리보기 이미지",
      },
    ],
  },
  // 👇 여기를 추가하세요! (네이버 출입증)
  verification: {
    other: {
      "naver-site-verification": "71e60c6b3d047257aedff9df4c40d50e3d0338fd",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{ fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', sans-serif" }}
      >
        {/* 🚀 2. 전체 사이트를 AuthContext로 감싸서 로그인 정보를 공유합니다. */}
        <AuthContext>
          <div className="flex-grow">
            {children}
          </div>

          {/* 하단 푸터 */}
          <Footer />

          {/* 챗봇 (모든 페이지에 둥둥 떠있음) */}
          <ChatBot />
        </AuthContext>
      </body>
    </html>
  );
}