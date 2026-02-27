"use client";

import { X, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Provider } from "@supabase/supabase-js";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    // 🚀 1. 수파베이스 OAuth (카카오, 구글용)
    const handleSupabaseLogin = async (provider: 'kakao' | 'google') => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: provider as Provider,
                options: {
                    // 💡 Redirect 주소를 메인 페이지로 우선 설정해서 안전하게 복구합니다.
                    redirectTo: `${window.location.origin}`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error(`${provider} 로그인 에러:`, error.message);
            alert("로그인 중 오류가 발생했습니다.");
        }
    };

    // 🚀 2. 네이버 로그인 (기존의 수동 API 연결 방식 복구)
    const handleNaverLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "ngPRhkgNiZZkBYC5xmzv";
        // 기존에 쓰시던 콜백 주소 그대로 복구합니다.
        const redirectUri = encodeURIComponent("https://aparty.co.kr/api/auth/naver/callback");
        const state = "aparty";
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-[#4A403A]/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-[0_20px_70px_rgba(0,0,0,0.3)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors z-10">
                    <X size={24} />
                </button>

                {/* 상단 로고 영역 */}
                <div className="bg-[#fdfbf7] pt-14 pb-10 px-6 text-center border-b border-gray-50 relative overflow-hidden">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 flex items-center justify-center mb-1">
                            <img src="/logo.png" alt="Aparty Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-black text-[#4A403A] tracking-tighter">아파티</span>
                            <span className="text-2xl font-black text-[#FF5A00] tracking-tight uppercase font-sans">Aparty</span>
                        </div>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">3초 만에 시작하는 스마트한 주거 라이프</p>
                    </div>
                </div>

                <div className="px-6 py-8 bg-white">
                    <div className="space-y-3 mb-8">
                        {/* 🚀 카카오: 수파베이스용 함수 호출 */}
                        <button
                            onClick={() => handleSupabaseLogin('kakao')}
                            className="w-full bg-[#FEE500] hover:bg-[#FDD800] text-[#191919] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-95 text-[13px]"
                        >
                            <MessageCircle size={16} className="fill-[#191919]" />
                            카카오로 시작하기
                        </button>

                        {/* 🚀 네이버: 전용 함수 호출 */}
                        <button
                            onClick={handleNaverLogin}
                            className="w-full bg-[#03C75A] hover:bg-[#02b350] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-95 text-[13px]"
                        >
                            <span className="font-black text-[15px] leading-none mb-0.5">N</span>
                            네이버로 시작하기
                        </button>

                        {/* 🚀 구글: 수파베이스용 함수 호출 */}
                        <button
                            onClick={() => handleSupabaseLogin('google')}
                            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-95 text-[13px]"
                        >
                            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            구글로 시작하기
                        </button>
                    </div>

                    <p className="text-center text-[10px] text-gray-400 font-bold mt-2">
                        가입 시 아파티의 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                    </p>
                </div>
            </div>
        </div>
    );
}