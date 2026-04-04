// src/components/home/HomePromoSection.tsx
"use client";

import Link from "next/link";
import { Megaphone, MessageSquare, ChevronRight, Gift } from "lucide-react";
import NewsSection from "@/components/market/NewsSection";

export default function HomePromoSection() {
    return (
        <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
            {/* 1. VIP 영상 배너 */}
            <div className="w-full max-w-5xl mx-auto -mt-6 md:mt-0 mb-6 md:mb-12 px-4 md:px-6">
                <div className="relative w-full rounded-[10px] md:rounded-[20px] overflow-hidden shadow-md md:shadow-2xl flex flex-row items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 md:py-8 group text-left bg-black">
                    <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60 md:opacity-80">
                        <source src="/vip-bg.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-black/40 z-0"></div>
                    <div className="relative z-10 flex-1 pr-3">
                        <h3 className="text-[10px] sm:text-[16px] md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tighter">
                            누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림
                        </h3>
                        <p className="text-[8px] sm:text-[11px] md:text-[15px] text-white/70 font-bold mt-0.5 md:mt-1.5 leading-tight">
                            로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.
                        </p>
                    </div>
                    <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-7 md:py-3.5 rounded-lg md:rounded-[16px] shadow-lg hover:scale-105 transition-all flex items-center gap-1 md:gap-2 shrink-0">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-6 md:h-6">
                            <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" />
                        </svg>
                        <span className="text-[10px] sm:text-[12px] md:text-[15px]">채널추가</span>
                    </Link>
                </div>
            </div>

            {/* 2. 공지사항 / 라운지 퀵 링크 */}
            <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-6xl px-4 mb-8 md:mb-10">
                <Link href="/notice" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                    <div className="flex items-center gap-2 md:gap-4 z-10 min-w-0">
                        <div className="w-8 h-8 md:w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"><Megaphone size={14} /></div>
                        <div className="text-left min-w-0"><h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">공지사항</h3><p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight leading-tight">공지 확인</p></div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors z-10 shrink-0" size={14} />
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-blue-100/60 transition-colors"></div>
                </Link>
                <Link href="/community" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-[#FF5A00] hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                    <div className="flex items-center gap-2 md:gap-4 z-10 min-w-0">
                        <div className="w-8 h-8 md:w-12 h-12 bg-orange-50 text-[#FF5A00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"><MessageSquare size={14} /></div>
                        <div className="text-left min-w-0"><h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">라운지</h3><p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight leading-tight">소통 공간</p></div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-[#FF5A00] transition-colors z-10 shrink-0" size={14} />
                    <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-orange-100 transition-colors"></div>
                </Link>
            </div>

            {/* 3. 포인트 배너 */}
            <div className="w-full max-w-5xl mb-24 px-4 md:px-6">
                <div className="relative w-full rounded-[20px] md:rounded-[32px] overflow-hidden shadow-sm border border-orange-100 flex flex-row items-center justify-between p-3.5 sm:p-5 md:px-10 md:py-8 group text-left bg-gradient-to-r from-[#FFF5F0] to-white hover:shadow-md transition-all">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 flex-1 pr-2 flex items-center gap-2.5 md:gap-5 min-w-0">
                        <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-orange-100 text-[#FF8C42]"><Gift className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} /></div>
                        <div className="min-w-0"><h3 className="text-[12px] sm:text-[14px] md:text-2xl font-black text-[#4A403A] mb-0.5 md:mb-1.5 tracking-tight truncate">활동하고 <span className="text-[#FF8C42]">아파티 포인트</span> 받자!</h3><p className="text-[9px] sm:text-[11px] md:text-[14px] text-gray-400 font-bold leading-tight truncate">출석체크, 글쓰기로 포인트 모으고 다양한 혜택으로 교환해 보세요.</p></div>
                    </div>
                    <Link href="/point" className="relative z-10 bg-[#FF8C42] text-white font-black px-3 py-2 md:px-6 md:py-3.5 rounded-xl transition-all shrink-0 text-[11px] md:text-[15px]">포인트 받기</Link>
                </div>
            </div>

            <NewsSection />
        </div>
    );
}