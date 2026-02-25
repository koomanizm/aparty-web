"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LoginButton() {
    const { data: session, status } = useSession();

    // 1. 로딩 중 (더 슬림해진 스켈레톤)
    if (status === "loading") {
        // 모바일엔 작은 원, PC엔 슬림한 타원
        return <div className="w-9 h-9 md:w-24 md:h-9 bg-gray-100 animate-pulse rounded-full"></div>;
    }

    // 2. 🟢 로그인 상태 (군더더기 뺀 초슬림 프로필 칩)
    if (session && session.user) {
        return (
            <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-100 py-1 pl-1 pr-3 md:pr-4 rounded-full shadow-sm hover:shadow-md transition-all duration-300">

                {/* 프로필 이미지 (사이즈 미세 조정) */}
                {session.user.image ? (
                    <img
                        src={session.user.image}
                        alt="프로필"
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-100 object-cover shrink-0"
                    />
                ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#FF8C42] font-black text-xs shrink-0">
                        {session.user.name?.[0]}
                    </div>
                )}

                {/* 닉네임 (모바일에서도 잘 보이게) */}
                <span className="text-[12px] md:text-[13px] font-bold text-[#4A403A] tracking-tight truncate max-w-[60px] md:max-w-none">
                    {session.user.name}<span className="font-medium text-gray-400 ml-0.5 hidden md:inline">님</span>
                </span>

                {/* 구분선 (PC에서만) */}
                <div className="hidden md:block w-[1px] h-2.5 bg-gray-200 mx-0.5"></div>

                {/* 로그아웃 버튼 (PC: 텍스트+아이콘 / 모바일: 아이콘만) */}
                <button
                    onClick={() => signOut()}
                    className="group flex items-center gap-1 text-[11px] md:text-[12px] text-gray-400 hover:text-gray-600 transition-colors font-bold shrink-0"
                    title="로그아웃"
                >
                    <LogOut size={14} className="group-hover:text-red-400 transition-colors" />
                    <span className="hidden md:inline">로그아웃</span>
                </button>
            </div>
        );
    }

    // 3. 🟡 로그아웃 상태 (모바일: 아이콘만 / PC: 슬림한 버튼)
    return (
        <button
            onClick={() => signIn("kakao", { callbackUrl: "https://www.aparty.co.kr" })}
            // 🚀 핵심: 모바일은 p-2(아이콘만 감쌈), PC는 px-4 py-2(슬림한 알약 모양)
            className="bg-[#FEE500] hover:bg-[#FDD800] text-[#391B1B] rounded-full font-bold text-[13px] md:text-[14px] transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 p-2 md:px-4 md:py-2"
            aria-label="카카오 로그인"
        >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-4 md:h-4 shrink-0">
                <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" />
            </svg>
            {/* 🚀 핵심: 모바일(hidden)에서는 숨기고, PC(md:inline)에서만 글씨 보이기 */}
            <span className="hidden md:inline whitespace-nowrap leading-none pt-0.5">
                카카오 로그인
            </span>
        </button>
    );
}