"use client";

import { useRef, useState, useEffect } from "react";
import { Flame, ChevronUp, ChevronDown } from "lucide-react";
import ToolShortcutGrid from "./ToolShortcutGrid";

const FALLBACK_RANKINGS = [
    { id: "10", name: "광안 센텀 아이파크" },
    { id: "11", name: "해운대 롯데캐슬 스타" },
    { id: "12", name: "명지 에코델타시티 디에트르 더 퍼스트" },
    { id: "13", name: "서면 푸르지오 엘센트로" },
    { id: "14", name: "동래 래미안 아이파크" },
    { id: "15", name: "에코델타시티 푸르지오 린" },
    { id: "16", name: "대연 디아이엘" },
    { id: "17", name: "거제 레이카운티" },
    { id: "18", name: "남천 자이" },
    { id: "19", name: "사송 더샵 데시앙" }
];

const MarqueeText = ({ text }: { text: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);
    const [isOverflow, setIsOverflow] = useState(false);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                setIsOverflow(textRef.current.scrollWidth > containerRef.current.clientWidth);
            }
        };

        checkOverflow();
        setTimeout(checkOverflow, 50);
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    return (
        <div ref={containerRef} className={`flex-1 overflow-hidden whitespace-nowrap relative w-full ${isOverflow ? 'marquee-mask' : ''}`}>
            <div className={`inline-flex w-max ${isOverflow ? 'is-overflowing' : ''}`}>
                {/* 🚀 텍스트 호버: 오렌지 대신 쨍한 행동 인디고(accent-action) 적용! */}
                <span ref={textRef} className={`text-[12px] font-semibold text-text-main group-hover:text-accent-action transition-colors ${isOverflow ? 'pr-8' : 'truncate'}`}>
                    {text}
                </span>
                {isOverflow && (
                    <span className="text-[12px] font-semibold text-text-main group-hover:text-accent-action transition-colors pr-8">
                        {text}
                    </span>
                )}
            </div>
        </div>
    );
};

export default function RightUtilities({ realtimeRankings, properties = [], setSearchQuery }: any) {
    const displayRankings = realtimeRankings?.length && realtimeRankings.length > 0 ? realtimeRankings : FALLBACK_RANKINGS;

    const listRef = useRef<HTMLDivElement>(null);
    const [showTopArrow, setShowTopArrow] = useState(false);
    const [showBottomArrow, setShowBottomArrow] = useState(true);

    const handleScroll = () => {
        if (!listRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        setShowTopArrow(scrollTop > 0);
        setShowBottomArrow(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    };

    useEffect(() => {
        handleScroll();
    }, [displayRankings]);

    const scrollDown = () => {
        listRef.current?.scrollBy({ top: 140, behavior: 'smooth' });
    };

    const scrollUp = () => {
        listRef.current?.scrollBy({ top: -140, behavior: 'smooth' });
    };

    const getRankName = (rank: any) => {
        if (!rank) return "데이터 로딩중";
        if (rank.name) return rank.name;
        if (rank.id && properties.length > 0) {
            const matchedProp = properties.find((p: any) => String(p.id) === String(rank.id));
            return matchedProp ? matchedProp.title : "불러오는 중...";
        }
        return rank.title || "데이터 로딩중";
    };

    const getTrendIcon = (id: string | number) => {
        const val = Number(id) % 5;
        if (isNaN(val)) return <div className="w-3.5 h-3.5 rounded-full bg-gray-50 flex items-center justify-center text-[#4A403A] shrink-0"><div className="w-1.5 h-[1.5px] bg-[#4A403A] rounded-full"></div></div>;
        if (val === 0 || val === 2) return <div className="w-3.5 h-3.5 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0"><ChevronUp size={10} strokeWidth={3} /></div>;
        if (val === 1) return <div className="w-3.5 h-3.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><ChevronDown size={10} strokeWidth={3} /></div>;
        return <div className="w-3.5 h-3.5 rounded-full bg-gray-50 flex items-center justify-center text-[#4A403A] shrink-0"><div className="w-1.5 h-[1.5px] bg-[#4A403A] rounded-full"></div></div>;
    };

    return (
        <div className="flex flex-col w-full min-w-0 z-10 relative pt-3">
            <style>
                {`
                    .marquee-mask {
                        mask-image: linear-gradient(to right, #000 75%, transparent 100%);
                        -webkit-mask-image: linear-gradient(to right, #000 75%, transparent 100%);
                    }
                    .group:hover .is-overflowing {
                        animation: text-marquee 5s linear infinite;
                    }
                    @keyframes text-marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>

            <div className="flex flex-col w-full gap-3 z-10 relative">
                {/* 🚀 카드 보더와 그림자를 시스템 변수에 맞게 미세 조정 */}
                <div className="w-full bg-surface border border-border-light rounded-[20px] shadow-sm p-4 xl:p-5 flex flex-col hover:shadow-md transition-shadow duration-300 relative">
                    <div className="flex items-center gap-2 mb-2 pb-3 border-b border-gray-50">
                        {/* 🚀 불꽃 아이콘 배경 & 색상: 행동 포인트 블루(accent-action)로 교체 */}
                        <div className="w-7 h-7 rounded-full bg-accent-action/10 flex items-center justify-center">
                            <Flame size={14} className="text-accent-action" />
                        </div>
                        <span className="text-[14px] font-extrabold text-primary tracking-tight">실시간 인기 분양</span>
                    </div>

                    <div className="relative w-full">
                        {showTopArrow && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20">
                                {/* 🚀 화살표 호버: 오렌지 -> 인디고 */}
                                <button
                                    onClick={scrollUp}
                                    className="p-1 flex items-center justify-center text-gray-300 hover:text-accent-action transition-colors drop-shadow-sm"
                                >
                                    <ChevronUp size={16} strokeWidth={3} />
                                </button>
                            </div>
                        )}

                        <div
                            ref={listRef}
                            onScroll={handleScroll}
                            className="flex flex-col gap-1 overflow-y-auto no-scrollbar max-h-[200px] scroll-smooth relative z-10 py-1 w-full"
                        >
                            {displayRankings.slice(0, 10).map((rank: any, idx: number) => {
                                const rankName = getRankName(rank);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSearchQuery && setSearchQuery(rankName)}
                                        // 🚀 리스트 호버 배경: 오렌지톤 -> 투명하고 시원한 연블루(#EEF2FF)
                                        className="flex items-center gap-2 group cursor-pointer hover:bg-[#EEF2FF] py-1.5 px-2 rounded-xl transition-colors w-full overflow-hidden shrink-0"
                                    >
                                        {/* 🚀 1~3위 숫자 색상: 오렌지 -> 인디고(accent-action) */}
                                        <span className={`text-[12px] font-black w-4 text-center shrink-0 ${idx < 3 ? 'text-accent-action' : 'text-gray-400'}`}>{idx + 1}</span>
                                        <div className="shrink-0">{getTrendIcon(rank.id || String(idx))}</div>
                                        <MarqueeText text={rankName} />
                                    </div>
                                )
                            })}
                        </div>

                        {showBottomArrow && displayRankings.length > 5 && (
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20">
                                {/* 🚀 화살표 호버: 오렌지 -> 인디고 */}
                                <button
                                    onClick={scrollDown}
                                    className="p-1 flex items-center justify-center text-gray-300 hover:text-accent-action transition-colors drop-shadow-sm"
                                >
                                    <ChevronDown size={16} strokeWidth={3} />
                                </button>
                            </div>
                        )}

                        {showBottomArrow && displayRankings.length > 5 && (
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-surface to-transparent pointer-events-none z-10" />
                        )}
                        {showTopArrow && (
                            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-surface to-transparent pointer-events-none z-10" />
                        )}
                    </div>
                </div>

                <div className="z-10 relative mt-1 w-full">
                    <ToolShortcutGrid />
                </div>
            </div>
        </div>
    );
}