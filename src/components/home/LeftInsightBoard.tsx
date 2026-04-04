"use client";

import { useState, useEffect } from "react";
import { ChevronRight, CalendarRange, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 헬퍼 함수: 공공데이터의 평형(059.9800A 등)을 깔끔하게(59㎡ A) 변환
const formatAptType = (rawType: string) => {
    if (!rawType) return "";
    const match = rawType.match(/^0*(\d+)(?:\.\d+)?([a-zA-Z]*)/);
    if (match) {
        const size = match[1];
        const type = match[2] ? ` ${match[2].toUpperCase()}` : "";
        return `${size}㎡${type}`;
    }
    return rawType;
};

export default function LeftInsightBoard({ dashboard, setActiveMenu, ...props }: any) {
    const [briefingData, setBriefingData] = useState({
        todayStarts: 0,
        closingSoon: 0,
        hotProperty: "데이터 분석 중...",
        hotRatio: "-:1",
        hotDate: "",
        hotType: ""
    });

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const today = new Date();
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, '0');
                const dd = String(today.getDate()).padStart(2, '0');
                const todayStr = `${yyyy}-${mm}-${dd}`;

                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tmrStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

                // 1. 오늘의 분양 브리핑
                const calRes = await fetch(`/api/dashboard/calendar?year=${yyyy}&month=${mm}`);
                const calJson = await calRes.json();
                let starts = 0;
                let closes = 0;

                if (calJson && calJson[0] && calJson[0].data) {
                    calJson[0].data.forEach((item: any) => {
                        const rawDate = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || "";
                        if (rawDate === todayStr) starts++;
                        if (rawDate === tmrStr) closes++;
                    });
                }

                // 2. 최근 6개월 청약경쟁률 1위 조회
                const compRes = await fetch(`/api/dashboard/competition?t=${new Date().getTime()}`);
                const compJson = await compRes.json();

                let topProperty = "최근 6개월 데이터 없음";
                let topRatio = "-:1";
                let topDate = "";
                let topType = "";

                if (compJson && compJson.data && compJson.data.length > 0) {
                    let maxNum = -1;
                    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());

                    compJson.data.forEach((item: any) => {
                        const itemDate = new Date(item.date);
                        if (itemDate >= sixMonthsAgo) {
                            item.models.forEach((model: any) => {
                                const rateNum = parseFloat(String(model.rate).replace(/,/g, ''));
                                if (!isNaN(rateNum) && rateNum > maxNum) {
                                    maxNum = rateNum;
                                    topProperty = item.name;
                                    topRatio = `${rateNum}:1`;
                                    topDate = item.date;
                                    topType = model.type || "";
                                }
                            });
                        }
                    });
                }

                setBriefingData({
                    todayStarts: starts,
                    closingSoon: closes,
                    hotProperty: topProperty,
                    hotRatio: topRatio,
                    hotDate: topDate,
                    hotType: topType
                });

            } catch (e) {
                console.error("인사이트 로드 에러:", e);
            }
        };

        fetchInsights();
    }, []);

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
                        <button
                            onClick={() => setActiveMenu && setActiveMenu("calendar")}
                            className="inline-flex items-center justify-center bg-surface px-5 py-1.5 rounded-full shadow-[0_2px_8px_rgba(79,70,255,0.1)] border border-border-light text-[10px] xl:text-[11px] font-extrabold text-accent-action hover:bg-[#EEF2FF] hover:border-accent-action/30 transition-all"
                        >
                            확인하기
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setActiveMenu && setActiveMenu("competition")}
                className="mx-1 bg-surface border border-border-light rounded-[18px] py-4 xl:py-5 px-4 mb-5 shadow-sm relative overflow-hidden transition-all hover:shadow-[0_8px_24px_rgba(23,37,84,0.06)] hover:border-[#C9D5F3] flex flex-col justify-center group/sub text-left w-[calc(100%-8px)]"
            >
                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#EEF2FF]/60 to-transparent pointer-events-none"></div>

                <div className="flex flex-col relative z-10 w-full min-w-0">

                    {/* 상단 */}
                    <div className="flex items-center justify-between w-full mt-1.5 mb-1">
                        <div className="flex items-center gap-1">
                            <Image src="/fire.gif" alt="불꽃" width={17} height={17} className="mb-[1px] object-contain shrink-0" unoptimized />
                            <span className="text-[11px] xl:text-[12px] font-bold text-[#FF3B30] tracking-tight">청약경쟁률 1위</span>
                        </div>
                        <span className="text-[10px] font-medium text-[#94A3B8] tracking-tight">(최근 6개월)</span>
                    </div>

                    {/* 중단: 단지명 & 경쟁률 (숫자 자간 조절) */}
                    <div className="flex items-end justify-between w-full gap-2 mb-0.5 mt-1.5">
                        <span className="text-[14px] xl:text-[15px] font-black text-primary group-hover/sub:text-accent-action transition-colors truncate leading-none pb-[1px]">
                            {briefingData.hotProperty}
                        </span>

                        {/* 🚀 전체는 tracking-tighter로 좁히고, 콜론(:) 양옆에만 px-[3px] 여백을 주어 분리합니다. */}
                        <span className="text-[16px] xl:text-[17px] font-black text-[#FF3B30] tracking-tighter italic shrink-0 leading-none flex items-center">
                            {briefingData.hotRatio.includes(':') ? (
                                <>
                                    <span>{briefingData.hotRatio.split(':')[0]}</span>
                                    <span className="px-[3px] text-[15px] pb-[1px]">:</span>
                                    <span>{briefingData.hotRatio.split(':')[1]}</span>
                                </>
                            ) : (
                                briefingData.hotRatio
                            )}
                        </span>
                    </div>

                    {/* 하단: 평형 & 날짜 */}
                    {briefingData.hotDate && (
                        <div className="flex items-center justify-between w-full mt-0">
                            <div className="flex-1">
                                {briefingData.hotType && (
                                    <span className="text-[9px] font-bold bg-[#EEF2FF] text-accent-action px-1.5 py-0.5 rounded-[4px] border border-[#C9D5F3] tracking-tight inline-block">
                                        {formatAptType(briefingData.hotType)}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] font-medium text-[#94A3B8] tracking-tight shrink-0 text-right">
                                {briefingData.hotDate}
                            </span>
                        </div>
                    )}

                </div>
            </button>

            <div className="flex flex-col gap-3 px-3 mt-auto mb-1">
                <button onClick={() => setActiveMenu && setActiveMenu("realprice")} className="flex items-center justify-between group/link w-full bg-transparent border-none p-0 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                        <TrendingUp size={18} className="text-accent-info" />
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">우리동네 실거래가는?</span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </button>
                <Link href="https://www.applyhome.co.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0"><Image src="/cyh.png" alt="청약홈 로고" fill className="object-contain" /></div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">청약홈 가기</span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </Link>
                <Link href="https://apply.lh.or.kr" target="_blank" className="flex items-center justify-between group/link">
                    <div className="flex items-center gap-2.5">
                        <div className="w-[18px] h-[18px] relative flex shrink-0"><Image src="/cyp.png" alt="LH청약플러스 로고" fill className="object-contain" /></div>
                        <span className="text-[12px] xl:text-[13px] font-bold text-text-main group-hover/link:text-accent-action transition-colors tracking-tight">LH청약플러스 가기</span>
                    </div>
                    <ChevronRight size={16} className="text-border-light group-hover/link:translate-x-1 group-hover/link:text-accent-action/50 transition-all" />
                </Link>
            </div>
        </div>
    );
}