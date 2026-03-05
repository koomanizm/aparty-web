import { createClient } from '@supabase/supabase-js';

// .env.local에 숨겨둔 URL과 열쇠를 안전하게 꺼내옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🚀 [범인 검거용 로그] 브라우저 콘솔(F12)에서 확인해 보세요!
console.log("🔗 URL 확인:", supabaseUrl ? "성공" : "❌ 비어있음");
console.log("🔑 KEY 확인:", supabaseAnonKey ? "성공" : "❌ 비어있음");

// 🚀 [보안 강화] 브라우저를 끄면 증발하는 휘발성 저장소(sessionStorage) 설정
const sessionStore = {
    getItem: (key: string) => {
        if (typeof window === 'undefined') return null;
        return window.sessionStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(key, value);
        }
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            window.sessionStorage.removeItem(key);
        }
    },
};

// 수파베이스 통신소(클라이언트) 생성! (보안 저장소 옵션 추가)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        //storage: sessionStore, // 👈 브라우저 종료 시 로그아웃되도록 설정!
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});