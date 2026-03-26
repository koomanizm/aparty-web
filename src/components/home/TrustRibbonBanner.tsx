"use client";

import { TrendingUp } from "lucide-react";

export default function TrustRibbonBanner() {
    // 🚀 배경: 딥 오션 네이비(#172554)가 bg-primary로 자동 적용됩니다.
    // 🚀 데이터: 고대비 오렌지색(#FF7A2F)으로 시선 강탈!
    return (
        <div className="w-full bg-primary py-1.5 px-4 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-5 border-b border-primary-hover shadow-sm">
            <div className="flex items-center gap-1.5 text-white/90">
                <TrendingUp size={12} className="text-[#FF7A2F]" />
                <span className="text-[11px] md:text-[12px] font-medium tracking-tight">현재 등록 분양 현장</span>
                <span className="text-[12px] md:text-[13px] font-black text-[#FF7A2F]">3,428개</span>
                <span className="text-[9px] md:text-[10px] text-white/40 font-normal tracking-tighter ml-0.5">(국토부 연동)</span>
            </div>
            <span className="hidden md:inline text-white/10 text-[10px]">|</span>
            <div className="flex items-center gap-1.5 text-white/90">
                <span className="text-[11px] md:text-[12px] font-medium tracking-tight">이번 달 예비 청약자 방문</span>
                <span className="text-[12px] md:text-[13px] font-black text-[#FF7A2F]">124만명</span>
            </div>
        </div>
    );
}