"use client";

import { BotMessageSquare, ChevronRight } from "lucide-react";

export default function AiConciergeBar() {
    return (
        <div
            className="w-full bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-2xl p-5 md:p-6 shadow-lg relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 mt-2"
            onClick={() => alert('AI 아파티 챗봇 상담 기능이 곧 오픈됩니다!')} // 챗봇 연결 등 원하시는 기능으로 추후 변경!
        >
            {/* 🚀 빛 번짐 데코레이션 (고급스러움 강조) */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A2F]/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#FF7A2F] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,122,47,0.4)] group-hover:scale-110 transition-transform">
                        <BotMessageSquare className="text-white" size={24} />
                    </div>
                    <div className="flex flex-col text-left">
                        <h3 className="text-white text-[16px] md:text-[18px] font-extrabold tracking-tight mb-1">
                            원하는 분양 찾기 힘드신가요?
                        </h3>
                        <p className="text-gray-400 text-[12px] md:text-[14px] font-medium tracking-tight break-keep">
                            AI 아파티에게 조건만 말해주세요. 딱 맞는 현장을 찾아드립니다.
                        </p>
                    </div>
                </div>

                <button className="flex items-center justify-center gap-1 bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full font-bold text-[13px] md:text-[14px] group-hover:bg-[#FF7A2F] group-hover:border-[#FF7A2F] transition-all shrink-0 w-full md:w-auto">
                    1:1 맞춤 추천받기 <ChevronRight size={16} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}