"use client";

import { ChevronRight, CalendarRange, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LeftInsightBoard({ dashboard, ...props }: any) {
    const briefingData = {
        todayStarts: 2,
        closingSoon: 1,
        hotProperty: "수영강 래미안 파크",
        hotRatio: "152:1",
    };

    return (
        <div className="flex flex-col w-full h-[420px] relative overflow-visible pt-2">

            <div className="flex flex-col gap-1.5 mb-3.5 px-1 relative">
                <style>
                    {`
                        @keyframes auroraText {
                            0% { background-position: 0% 50%; }
                            50% { background-position: 100% 50%; }
                            100% { background-position: 0% 50%; }
                        }
                        .animate-aurora-text {
                            background-size: 200% auto;
                            animation: auroraText 3s ease-in-out infinite;
                        }
                    `}
                </style>
                <h2 className="text-[16px] xl:text-[18px] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-action to-accent-info animate-aurora-text">
                    오늘의 분양 브리핑
                </h2>
                <p className="text-[11px] xl:text-[12px] font-medium text-text-sub leading-none">
                    놓치면 후회할 주요 일정, 알려드려요.
                </p>
            </div>

            <div className="relative mb-5 z-10 mx-1">
                <div className="absolute inset-x-3 -bottom-3 h-full bg-accent-info/5 rounded-[24px] -z-20"></div>
                <div className="absolute inset-x-1.5 -bottom-1.5 h-full bg-accent-info/10 rounded-[24px] -z-10"></div>

                <div className="relative bg-gradient-to-br from-surface via-[#F0F7FF] to-[#EAF2FF] border border-white/90 rounded-[24px] p-3 xl:p-4 md:p-5 shadow-sm flex flex-col gap-4 group">

                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-2xl flex items-center justify-center shadow-[0_6px_16px_rgba(23,37,84,0.15)] shrink-0 mt-0.5 transition-all group-hover:shadow-[0_8px_24px_rgba(23,37,84,0.25)]">
                            <CalendarRange className="text-white drop-shadow-sm" size={24} strokeWidth={1.5} />
                        </div>

                        <div className="flex flex-col gap-2.5 items-start flex-1 w-full mt-2.5 pr-1">
                            <div className="flex justify-between items-baseline w-full">
                                <span className="text-[11px] xl:text-[12px] font-bold text-text-main leading-none tracking-tight">
                                    오늘 청약 시작
                                </span>
                                <span className="text-accent-action font-black text-[12px] xl:text-[13px] leading-none ml-2 shrink-0">
                                    {briefingData.todayStarts}건
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline w-full">
                                <span className="text-[11px] xl:text-[12px] font-bold text-text-main leading-none tracking-tight">
                                    마감 임박
                                </span>
                                <span className="text-red-500 font-black text-[12px] xl:text-[13px] leading-none ml-2 shrink-0">
                                    {briefingData.closingSoon}건
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center w-full mt-0.5">
                        <Link href="/more/calendar" className="inline-flex items-center justify-center bg-surface px-5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(79,70,255,0.1)] border border-border-light text-[10px] xl:text-[11px] font-extrabold text-accent-action hover:bg-[#EEF2FF] hover:border-accent-action/30 transition-all">
                            확인하기
                        </Link>
                    </div>
                </div>
            </div>

            <Link href="/more/competition" className="mx-1 bg-surface border border-border-light rounded-[18px] py-4 xl:py-5 px-3 xl:px-4 mb-5 shadow-sm relative overflow-hidden transition-all hover:shadow-[0_8px_24px_rgba(23,37,84,0.06)] hover:border-[#C9D5F3] flex flex-col justify-center group/sub">
                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#EEF2FF]/60 to-transparent pointer-events-none"></div>

                <div className="flex flex-col relative z-10 w-full min-w-0">
                    <div className="flex items-center justify-between w-full mb-1.5 pr-1">
                        <div className="flex items-center gap-1.5">
                            <Image src="/fire.gif" alt="불꽃" width={17} height={17} className="mb-[1px] object-contain" unoptimized />
                            <span className="text-[11px] xl:text-[12px] font-bold text-[#FF3B30] tracking-tight">청약경쟁률 1위</span>
                        </div>

                        {/* 🚀 경쟁률 수치 디테일: 크기 0.5pt 증가 및 붉은색(#FF3B30) 적용 */}
                        <span className="text-[13.5px] xl:text-[14.5px] font-black text-[#FF3B30] tracking-tighter italic">
                            {briefingData.hotRatio}
                        </span>
                    </div>

                    <span className="text-[13px] xl:text-[14px] font-extrabold text-primary group-hover/sub:text-accent-action transition-colors truncate w-full pr-1 pl-0.5">
                        {briefingData.hotProperty}
                    </span>
                </div>
            </Link>

            <div className="flex flex-col gap-3 px-3 mt-auto mb-1">
                <Link href="/more/transaction" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <TrendingUp size={18} className="text-accent-info" />
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">
                            우리동네 실거래가는?
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </Link>

                <Link href="https://www.applyhome.co.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0">
                            <Image src="/cyh.png" alt="청약홈 로고" fill className="object-contain" />
                        </div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">
                            청약홈 가기
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </Link>

                <Link href="https://apply.lh.or.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0">
                            <Image src="/cyp.png" alt="LH청약플러스 로고" fill className="object-contain" />
                        </div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">
                            LH청약플러스 가기
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </Link>
            </div>

        </div>
    );
}