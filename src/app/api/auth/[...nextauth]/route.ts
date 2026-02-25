import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

// 🚨 범인 잡는 덫: 서버가 카카오 키를 제대로 읽고 있는지 터미널에 출력해봅니다!
console.log("🔑 내 카카오 키:", process.env.KAKAO_CLIENT_ID);

// 🚀 any 타입으로 감싸서 최신 버전(v5)의 엄격한 검사를 부드럽게 통과시킵니다.
const handler: any = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
});

// 🚀 최신 버전(v5)이면 새로운 방식(handlers.GET)으로, 구 버전이면 기존 방식(handler)으로 자동 맞춤 출력합니다!
export const GET = handler.handlers?.GET || handler;
export const POST = handler.handlers?.POST || handler;