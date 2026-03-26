"use client";

import Link from "next/link";
import { ChevronRight, Workflow, Sparkles } from "lucide-react"; // 🚀 최첨단 최신형 아이콘으로 import 변경

// 🚀 이 'export default function' 부분이 반드시 있어야 합니다!
export default function ColumnRibbonBanner() {
    return (
        // 🚀 배경: 아주 맑고 부드러운 스카이블루/연인디고 그라데이션 유지
        <div className="w-full bg-gradient-to-r from-[#F4F7FF] to-[#EEF2FF] py-4 px-5 rounded-2xl border border-[#DDE5FF] cursor-pointer hover:shadow-md hover:border-accent-action/30 transition-all group">
            <Link href="/column" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm relative">

                        {/* 🚀 최첨단 최신형 아이콘: 단순한 종이 대신, 정보가 시스템적으로 흐르는 느낌의 'Workflow' 아이콘 적용 */}
                        <Workflow size={17} className="text-accent-action" />

                        {/* 🚀 디테일 추가: 시스템에서 빛이 나는 것처럼 보이게 아주 작은 'Sparkles' 아이콘을 우측 상단에 엣지있게 붙임 */}
                        <Sparkles size={8} className="text-accent-info absolute -top-0.5 -right-0.5" />

                    </div>
                    {/* 🚀 타이틀: 묵직한 뼈대 네이비(primary) 유지 */}
                    <p className="text-[13px] md:text-[15px] font-extrabold text-primary tracking-tight">
                        청약 전 꼭 알아야 할 필수 체크리스트
                    </p>
                </div>
                {/* 🚀 '칼럼 보기' 유도 텍스트: 행동 인디고(accent-action) 유지 */}
                <div className="flex items-center text-[12px] md:text-[13px] font-bold text-accent-action group-hover:translate-x-1 transition-transform">
                    칼럼 보기 <ChevronRight size={16} strokeWidth={2.5} className="ml-0.5" />
                </div>
            </Link>
        </div>
    );
}