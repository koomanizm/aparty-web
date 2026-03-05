"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom"; // 🚀 포탈 사용
import { X, MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Provider } from "@supabase/supabase-js";
import Link from "next/link";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [mounted, setMounted] = useState(false);

    // 🚀 서버 사이드 렌더링 에러 방지 (클라이언트에서만 렌더링)
    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden"; // 모달 열릴 때 스크롤 방지
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    // LoginModal.tsx 안의 함수
    const handleSupabaseLogin = async (provider: 'kakao' | 'google') => {
        console.log("🚀 버튼 눌림! 프로바이더:", provider); // 👈 이게 콘솔에 찍히는지 확인!

        const { error } = await supabase.auth.signInWithOAuth({
            provider: provider as Provider,
            options: {
                redirectTo: window.location.origin,
                // 💡 [팁] 아래 설정을 추가하면 구글 계정 선택창이 강제로 뜹니다.
                queryParams: { prompt: 'select_account' }
            },
        });

        if (error) console.error("❌ 로그인 에러:", error.message);
    };

    const handleNaverLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "ngPRhkgNiZZkBYC5xmzv";
        const redirectUri = encodeURIComponent("https://aparty.co.kr/api/auth/naver/callback");
        window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=aparty`;
    };

    // 🚀 createPortal을 사용하여 body 최상단으로 '순간이동' 시킵니다.
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* 배경 레이어: backdrop-blur와 투명도 조절 */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* 실제 모달 박스 */}
            <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-[0_25px_80px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* 닫기 버튼 */}
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-full transition-colors z-20">
                    <X size={24} />
                </button>

                {/* 상단 로고 영역 */}
                <div className="bg-[#fdfbf7] pt-14 pb-10 px-6 text-center border-b border-gray-50">
                    <div className="flex flex-col items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain mb-1" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-2xl font-black text-[#4A403A] tracking-tighter">아파티</span>
                            <span className="text-2xl font-black text-[#FF5A00] tracking-tight uppercase">Aparty</span>
                        </div>
                        <p className="text-[13px] font-semibold text-gray-400 mt-1">3초 만에 시작하는 스마트한 주거 라이프</p>
                    </div>
                </div>

                {/* 버튼 및 약관 영역 */}
                <div className="px-6 py-8 bg-white">
                    <div className="space-y-3 mb-8">
                        <button onClick={() => handleSupabaseLogin('kakao')} className="w-full bg-[#FEE500] text-[#191919] font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all text-[13px]">
                            <MessageCircle size={16} className="fill-[#191919]" /> 카카오로 시작하기
                        </button>
                        <button onClick={handleNaverLogin} className="w-full bg-[#03C75A] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all text-[13px]">
                            <span className="font-black text-[15px]">N</span> 네이버로 시작하기
                        </button>
                        <button onClick={() => handleSupabaseLogin('google')} className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 active:scale-95 transition-all text-[13px]">
                            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            구글로 시작하기
                        </button>
                    </div>

                    {/* 약관 안내 문구 */}
                    <p className="text-center text-[11px] text-gray-400 font-normal leading-relaxed">
                        로그인 시 아파티의
                        <Link href="/terms" className="mx-1 underline underline-offset-2 hover:text-[#4A403A] font-medium transition-colors">이용약관</Link>
                        및
                        <Link href="/privacy" className="mx-1 underline underline-offset-2 hover:text-[#4A403A] font-medium transition-colors">개인정보처리방침</Link>
                        에 <br />동의하는 것으로 간주합니다.
                    </p>
                </div>
            </div>
        </div>,
        document.body // 🚀 이곳이 탈출구입니다!
    );
}