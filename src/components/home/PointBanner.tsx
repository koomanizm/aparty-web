"use client";
import Link from "next/link";
import { Gift } from "lucide-react";

export default function PointBanner() {
    return (
        <div className="w-full max-w-5xl mb-24 px-4 md:px-6 mx-auto">
            <div className="relative w-full rounded-[20px] md:rounded-[32px] overflow-hidden shadow-sm border border-orange-100 flex flex-row items-center justify-between p-3.5 sm:p-5 md:px-10 md:py-8 group text-left bg-gradient-to-r from-[#FFF5F0] to-white hover:shadow-md transition-all">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex-1 pr-2 flex items-center gap-2.5 md:gap-5 min-w-0">
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-orange-100 text-[#FF8C42]"><Gift className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} /></div>
                    <div className="min-w-0"><h3 className="text-[12px] sm:text-[14px] md:text-2xl font-black text-[#4A403A] mb-0.5 md:mb-1.5 tracking-tight truncate">활동하고 <span className="text-[#FF8C42]">아파티 포인트</span> 받자!</h3><p className="text-[9px] sm:text-[11px] md:text-[14px] text-gray-400 font-bold leading-tight truncate">출석체크, 글쓰기로 포인트 모으고 다양한 혜택으로 교환해 보세요.</p></div>
                </div>
                <Link href="/point" className="relative z-10 bg-[#FF8C42] text-white font-black px-3 py-2 md:px-6 md:py-3.5 rounded-xl transition-all shrink-0 text-[11px] md:text-[15px]">포인트 받기</Link>
            </div>
        </div>
    );
}