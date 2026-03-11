// src/components/home/VipBanner.tsx
"use client";
import Link from "next/link";

export default function VipBanner() {
    return (
        <div className="w-full max-w-5xl mx-auto mt-2 md:mt-0 mb-6 md:mb-12 px-4 md:px-6">
            {/* 🚀 모바일 높이를 h-[160px] 정도로 조절하여 매물 카드(이미지 영역)와 유사한 부피감을 줬습니다.
          글자 크기는 대표님이 원래 쓰시던 아주 작은 사이즈로 복구했습니다. */}
            <div className="relative w-full h-[90px] sm:h-[180px] md:h-auto rounded-[10px] md:rounded-[20px] overflow-hidden shadow-md md:shadow-2xl flex flex-row items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 md:py-8 group text-left bg-black">

                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60 md:opacity-80">
                    <source src="/vip-bg.mp4" type="video/mp4" />
                </video>

                <div className="absolute inset-0 bg-black/40 z-0"></div>

                {/* 텍스트 영역: 기존 크기([10px], [8px]) 완벽 복구 */}
                <div className="relative z-10 flex-1 pr-3">
                    <h3 className="text-[10px] sm:text-[16px] md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tighter">
                        누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림
                    </h3>
                    <p className="text-[8px] sm:text-[11px] md:text-[15px] text-white/70 font-bold mt-0.5 md:mt-1.5 leading-tight">
                        로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.
                    </p>
                </div>

                {/* 버튼 영역: 기존 크기([10px]) 및 스타일 복구 */}
                <Link
                    href="http://pf.kakao.com/_EbnAX"
                    target="_blank"
                    className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-7 md:py-3.5 rounded-lg md:rounded-[16px] shadow-lg hover:scale-105 transition-all flex items-center gap-1 md:gap-2 shrink-0"
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-6 md:h-6">
                        <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" />
                    </svg>
                    <span className="text-[10px] sm:text-[12px] md:text-[15px]">채널추가</span>
                </Link>
            </div>
        </div>
    );
}