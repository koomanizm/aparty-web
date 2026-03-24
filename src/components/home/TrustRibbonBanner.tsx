"use client";

import { TrendingUp } from "lucide-react";

export default function TrustRibbonBanner() {
    return (
        // 🚀 다이어트 완료: py-1.5로 고정, gap 축소, 텍스트/아이콘 크기 최적화!
        <div className="w-full bg-[#1E293B] py-1.5 px-4 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-5 border-b border-[#0F172A] shadow-sm">
            <div className="flex items-center gap-1.5 text-white/90">
                <TrendingUp size={12} className="text-[#FF7A2F]" />
                <span className="text-[11px] md:text-[12px] font-medium tracking-tight">현재 등록 분양 현장</span>
                <span className="text-[12px] md:text-[13px] font-black text-[#FF7A2F]">3,428개</span>
                <span className="text-[9px] md:text-[10px] text-gray-400 font-normal tracking-tighter ml-0.5">(국토부 연동)</span>
            </div>
            <span className="hidden md:inline text-gray-600 text-[10px]">|</span>
            <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-[11px] md:text-[12px] font-medium tracking-tight">이번 달 예비 청약자 방문</span>
                <span className="text-[12px] md:text-[13px] font-black text-[#FF7A2F]">124만명</span>
            </div>
        </div>
    );
}