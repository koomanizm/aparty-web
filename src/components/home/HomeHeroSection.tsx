"use client";

import { useState, useEffect } from "react";
import { Search, X, Flame, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
    notices: any[];
    tickerIndex: number;
    isTransitioning: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    isFilterApplied: boolean;
    setIsFilterApplied: (val: boolean) => void;
    realtimeRankings?: any[];
    properties?: any[];
}

const FALLBACK_RANKINGS = [
    { id: "10", name: "광안 센텀 아이파크" },
    { id: "11", name: "해운대 롯데캐슬 스타" },
    { id: "12", name: "명지 에코델타시티 디에트르" },
    { id: "13", name: "서면 푸르지오 엘센트로" },
    { id: "14", name: "동래 래미안 아이파크" },
    { id: "15", name: "남천 자이" },
    { id: "16", name: "연산 포레큐브" },
    { id: "17", name: "대연 디아이엘" },
    { id: "18", name: "부암 에일린의 뜰" },
    { id: "19", name: "거제 레이카운티" }
];

export default function HomeHeroSection({
    searchQuery, setSearchQuery,
    realtimeRankings,
    properties = []
}: Props) {
    const [rankingIndex, setRankingIndex] = useState(0);
    const [isRankingOpen, setIsRankingOpen] = useState(false);

    const displayRankings = realtimeRankings?.length && realtimeRankings.length > 0 ? realtimeRankings : FALLBACK_RANKINGS;

    const getRankName = (rank: any) => {
        if (!rank) return "데이터 로딩중";
        if (rank.name) return rank.name;
        if (rank.id && properties.length > 0) {
            const matchedProp = properties.find(p => String(p.id) === String(rank.id));
            return matchedProp ? matchedProp.title : "불러오는 중...";
        }
        return rank.title || "데이터 로딩중";
    };

    const getTrendIcon = (id: string | number) => {
        const val = Number(id) % 5;
        if (isNaN(val)) return <div className="w-3.5 h-3.5 rounded-full bg-gray-50 flex items-center justify-center text-[#4A403A] shrink-0"><div className="w-1.5 h-[2px] bg-[#4A403A] rounded-full"></div></div>;
        if (val === 0 || val === 2) return <div className="w-3.5 h-3.5 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0"><ChevronUp size={10} strokeWidth={3} /></div>;
        if (val === 1) return <div className="w-3.5 h-3.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><ChevronDown size={10} strokeWidth={3} /></div>;
        return <div className="w-3.5 h-3.5 rounded-full bg-gray-50 flex items-center justify-center text-[#4A403A] shrink-0"><div className="w-1.5 h-[2px] bg-[#4A403A] rounded-full"></div></div>;
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setRankingIndex((prev) => (prev + 1) % Math.min(displayRankings.length, 10));
        }, 3000);
        return () => clearInterval(timer);
    }, [displayRankings.length]);

    return (
        <div className="relative z-30 flex flex-col items-center w-full">

            {/* 검색창 */}
            <div className="relative w-full max-w-xl mx-auto mt-4 md:mt-8 mb-4 group z-30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[32px] bg-white">
                <input
                    type="text"
                    className="w-full h-[56px] md:h-[64px] px-6 py-3 rounded-[32px] border-[2px] border-orange-500/20 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 text-[15px] md:text-[17px] font-bold outline-none bg-transparent relative z-10 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* 커스텀 Placeholder */}
                {!searchQuery && (
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-0 text-[15px] md:text-[17px] font-semibold text-gray-400 tracking-tight">
                        지금 가장 핫한 <span className="text-orange-500 mx-1.5 font-bold">선착순 분양단지</span>는?
                    </div>
                )}

                {searchQuery ? (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-gray-50 text-gray-400 rounded-[20px] flex items-center justify-center active:scale-90 transition-transform z-20"><X size={18} /></button>
                ) : (
                    <button className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-[#4A403A] text-white rounded-[20px] flex items-center justify-center shadow-lg active:scale-95 transition-all z-20"><Search size={20} /></button>
                )}
            </div>

            {/* 실시간 롤링 랭킹 */}
            <div className="relative w-full max-w-xl mx-auto flex justify-center z-40 mb-2">
                <div
                    className="relative flex items-center gap-2.5 cursor-pointer px-2 py-1 group"
                    onMouseEnter={() => setIsRankingOpen(true)}
                    onMouseLeave={() => setIsRankingOpen(false)}
                    onClick={() => setIsRankingOpen(!isRankingOpen)}
                >
                    {/* 🚀 타이틀 폰트 다이어트: font-extrabold -> font-bold */}
                    <span className="text-[13px] font-bold text-orange-500 flex items-center gap-1 whitespace-nowrap shrink-0"><Flame size={14} /> 실시간 랭킹</span>

                    <div className="h-[20px] overflow-hidden w-[180px] md:w-[240px] relative">
                        <div className="flex flex-col transition-transform duration-500 ease-in-out" style={{ transform: `translateY(-${rankingIndex * 20}px)` }}>
                            {displayRankings.slice(0, 10).map((rank, idx) => (
                                <div key={idx} className="h-[20px] flex items-center justify-start text-[13px] font-medium text-gray-800 truncate gap-1.5 w-full">
                                    <span className="w-4 text-left font-bold text-gray-400 shrink-0">{idx + 1}.</span>
                                    <div className="shrink-0">{getTrendIcon(rank.id || String(idx))}</div>
                                    <span className="truncate group-hover:text-orange-500 transition-colors ml-0.5 flex-1 text-left">{getRankName(rank)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${isRankingOpen ? 'rotate-180' : ''}`} />

                    {/* 확장 드롭다운 (1위~10위) */}
                    {isRankingOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[360px] md:w-[580px] bg-white rounded-2xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-4 md:p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-1.5 mb-3 border-b border-gray-50 pb-2">
                                <Flame size={14} className="text-orange-500" />
                                {/* 🚀 드롭다운 타이틀 폰트 다이어트: font-extrabold -> font-bold */}
                                <span className="text-[13px] font-bold text-gray-800">실시간 인기 분양단지</span>
                            </div>

                            <div className="grid grid-cols-2 grid-rows-5 grid-flow-col gap-x-6 gap-y-2">
                                {displayRankings.slice(0, 10).map((rank, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-1.5 p-1.5 hover:bg-orange-50 rounded-lg cursor-pointer transition-colors w-full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSearchQuery(getRankName(rank));
                                            setIsRankingOpen(false);
                                        }}
                                    >
                                        <span className={`text-[12px] font-bold w-4 text-center shrink-0 ${idx < 3 ? 'text-orange-500' : 'text-gray-400'}`}>{idx + 1}</span>
                                        <div className="shrink-0">{getTrendIcon(rank.id || String(idx))}</div>
                                        <span className="text-[12px] font-medium text-gray-700 truncate flex-1 ml-1 text-left">{getRankName(rank)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}