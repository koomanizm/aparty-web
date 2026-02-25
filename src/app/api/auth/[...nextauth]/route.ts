import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

// 🚨 범인 잡는 덫: 서버가 카카오 키를 제대로 읽고 있는지 터미널에 출력해봅니다!
console.log("🔑 내 카카오 키:", process.env.KAKAO_CLIENT_ID);

// 🚀 any 타입으로 감싸서 최신 버전(v5)의 엄격한 검사를 부드럽게 통과시킵니다.
const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  // 🚀 보안 쿠키 설정을 추가하면 실서버 배포 시 안정성이 확 올라갑니다!
  cookies: {
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code_verifier',
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
});

// 🚀 깔끔한 내보내기 방식
export { handler as GET, handler as POST };