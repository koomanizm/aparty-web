import NextAuth from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

// 🚀 v4 표준 설정
const handler = NextAuth({
  providers: [
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID || "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET || "",
    }),
  ],
  // 🔑 [해결 1] NO_SECRET 에러 방지
  secret: process.env.NEXTAUTH_SECRET,

  // 🛡️ [해결 2] 실서버(HTTPS) 환경에서 쿠키 보안 설정 강화
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true, // 실서버 https 환경에서는 true가 필수입니다!
      },
    },
  },

  // 🎨 로그인 페이지 및 에러 페이지 설정 (커스텀 필요 시)
  pages: {
    signIn: '/auth/signin', // 나중에 커스텀 로그인 페이지를 만드신다면 사용하세요.
    error: '/api/auth/error',
  },

  // 🧐 로그 확인을 위한 콜백
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
});

// 🚀 App Router 방식 내보내기 (v4 표준)
export { handler as GET, handler as POST };