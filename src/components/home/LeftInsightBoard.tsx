"use client";

import { Flame, ChevronRight, CalendarRange, TrendingUp } from "lucide-react";
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
        <div className="flex flex-col w-full h-[420px] relative overflow-visible group pt-2">

            <svg width="0" height="0" className="absolute invisible" aria-hidden="true">
                <defs>
                    <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="40%" stopColor="#FB923C" />
                        <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                </defs>
            </svg>

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
                <h2 className="text-[16px] xl:text-[18px] font-extrabold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-[#7E22CE] via-[#EC4899] to-[#F97316] animate-aurora-text">
                    오늘의 분양 브리핑
                </h2>
                <p className="text-[11px] xl:text-[12px] font-medium text-gray-500 leading-none">
                    놓치면 후회할 주요 일정, 알려드려요.
                </p>
            </div>

            <div className="relative mb-5 z-10 mx-1">
                <div className="absolute inset-x-3 -bottom-3 h-full bg-[#FF8C42]/10 rounded-[24px] -z-20"></div>
                <div className="absolute inset-x-1.5 -bottom-1.5 h-full bg-[#FF8C42]/20 rounded-[24px] -z-10"></div>

                <div className="relative bg-gradient-to-br from-[#FFFDFB] via-[#FFF5ED] to-[#FFEBE0] border border-white/90 rounded-[24px] p-3 xl:p-4 md:p-5 shadow-sm flex flex-col gap-4">

                    <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#FFC78A] via-[#FFB06A] to-[#FF8C42] rounded-2xl flex items-center justify-center shadow-[0_6px_16px_rgba(255,140,66,0.3)] shrink-0 mt-0.5 transition-all group-hover:shadow-[0_8px_24px_rgba(255,140,66,0.4)]">
                            <CalendarRange className="text-white drop-shadow-sm" size={24} strokeWidth={1.5} />
                        </div>

                        <div className="flex flex-col gap-2.5 items-start flex-1 w-full mt-2.5 pr-1">
                            <div className="flex justify-between items-baseline w-full">
                                <span className="text-[11px] xl:text-[12px] font-bold text-gray-800 leading-none tracking-tight">
                                    오늘 청약 시작
                                </span>
                                <span className="text-[#FF8C42] font-black text-[12px] xl:text-[13px] leading-none ml-2 shrink-0">
                                    {briefingData.todayStarts}건
                                </span>
                            </div>
                            <div className="flex justify-between items-baseline w-full">
                                <span className="text-[11px] xl:text-[12px] font-bold text-gray-800 leading-none tracking-tight">
                                    마감 임박
                                </span>
                                <span className="text-red-500 font-black text-[12px] xl:text-[13px] leading-none ml-2 shrink-0">
                                    {briefingData.closingSoon}건
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center w-full mt-0.5">
                        <Link href="/more/calendar" className="inline-flex items-center justify-center bg-white px-5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(255,140,66,0.15)] border border-orange-100/80 text-[10px] xl:text-[11px] font-extrabold text-[#FF8C42] hover:bg-orange-50 transition-colors">
                            확인하기
                        </Link>
                    </div>
                </div>
            </div>

            <Link href="/more/competition" className="mx-1 bg-white border border-red-100/30 rounded-[18px] py-4 xl:py-5 px-3 xl:px-4 mb-5 shadow-[0_4px_16px_rgba(239,68,68,0.06)] relative overflow-hidden group/sub transition-all hover:shadow-md hover:border-red-200/80 flex flex-col justify-center">
                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-red-50/50 to-transparent pointer-events-none"></div>

                <div className="flex flex-col relative z-10 w-full min-w-0">
                    <div className="flex items-center justify-between w-full mb-1.5 pr-1">
                        <div className="flex items-center gap-1.5">
                            <Flame size={15} fill="url(#flame-gradient)" stroke="url(#flame-gradient)" className="animate-pulse drop-shadow-sm mb-[1px]" />
                            <span className="text-[9px] xl:text-[10px] font-bold text-red-500 tracking-tight">청약경쟁률 1위</span>
                        </div>
                        <span className="text-[13px] xl:text-[14px] font-black text-red-600 tracking-tighter italic">
                            {briefingData.hotRatio}
                        </span>
                    </div>

                    <span className="text-[13px] xl:text-[14px] font-extrabold text-gray-800 group-hover/sub:text-red-500 transition-colors truncate w-full pr-1 pl-0.5">
                        {briefingData.hotProperty}
                    </span>
                </div>
            </Link>

            <div className="flex flex-col gap-3 px-3 mt-auto mb-1">

                <Link href="/more/transaction" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <TrendingUp size={18} className="text-blue-500" />
                        <span className="text-[12px] xl:text-[13px] font-bold text-gray-700 group-hover/link:text-gray-900 transition-colors tracking-tight">
                            우리동네 실거래가는?
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover/link:translate-x-1 group-hover/link:text-gray-500 transition-all" />
                </Link>

                <Link href="https://www.applyhome.co.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0">
                            <Image src="/cyh.png" alt="청약홈 로고" fill className="object-contain" />
                        </div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-gray-700 group-hover/link:text-gray-900 transition-colors tracking-tight">
                            청약홈 가기
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover/link:translate-x-1 group-hover/link:text-gray-500 transition-all" />
                </Link>

                <Link href="https://apply.lh.or.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0">
                            <Image src="/cyp.png" alt="LH청약플러스 로고" fill className="object-contain" />
                        </div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-gray-700 group-hover/link:text-gray-900 transition-colors tracking-tight">
                            LH청약플러스 가기
                        </span>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover/link:translate-x-1 group-hover/link:text-gray-500 transition-all" />
                </Link>

            </div>

        </div>
    );
}