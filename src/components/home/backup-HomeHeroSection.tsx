// src/components/home/HomeHeroSection.tsx (수정본)
"use client";

import Link from "next/link";
import { Search, X, Megaphone } from "lucide-react";
import { Notice } from "../../lib/sheet";

interface Props {
    notices: Notice[];
    tickerIndex: number;
    isTransitioning: boolean;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeFilter: string;
    setActiveFilter: (filter: string) => void;
    isFilterApplied: boolean;
    setIsFilterApplied: (val: boolean) => void;
}

export default function HomeHeroSection({
    notices, tickerIndex, isTransitioning,
    searchQuery, setSearchQuery,
    activeFilter, setActiveFilter,
    isFilterApplied, setIsFilterApplied
}: Props) {
    return (
        <>
            {/* 🚀 모바일에서 타이틀이 너무 겹쳐 보이지 않게 leading-tight -> leading-[1.2]로 미세 조정 */}
            <h1 className="text-[28px] md:text-5xl font-bold text-[#4a403a] leading-[1.2] md:leading-tight mb-5 tracking-tight px-2">
                지금 가장 핫한 <br className="md:hidden" /><span className="text-orange-500 font-extrabold">선착순 분양단지</span>는?
            </h1>

            {/* 1. 롤링 공지사항 (모바일 터치 미스 방지를 위해 높이 약간 확보) */}
            {notices.length > 0 && (
                <div className="w-full max-w-xl mx-auto mb-6 relative flex flex-col items-center justify-start overflow-hidden h-[26px] cursor-pointer group z-20">
                    <div className="flex flex-col w-full" style={{ transform: `translateY(-${tickerIndex * 26}px)`, transition: isTransitioning ? 'transform 800ms ease-in-out' : 'none' }}>
                        {[...notices, notices[0]].map((notice, index) => (
                            <div key={index} className="h-[26px] w-full flex items-center justify-center shrink-0 truncate text-[13px] md:text-[14px] font-bold text-gray-600 text-center">
                                <Link href="/notice" className="flex items-center justify-center">
                                    <span className="text-[#FF8C42] mr-2 text-[11px] font-black flex items-center gap-1 bg-orange-50 px-1.5 py-0.5 rounded-md"><Megaphone size={11} className="animate-pulse" />공지</span>
                                    <span className="truncate max-w-[200px] md:max-w-none">{notice.title}</span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. 검색창 (모바일에서 그림자 더 선명하게, 높이 52px 확보) */}
            <div className="relative w-full max-w-xl mx-auto mb-4 md:mb-5 group mt-2 z-20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[24px]">
                <input
                    type="text"
                    placeholder="지역, 단지명을 입력하세요"
                    className="w-full h-[52px] md:h-[60px] px-6 py-3 rounded-[24px] border border-gray-100 focus:ring-4 focus:ring-orange-100 text-[15px] md:text-[16px] font-bold outline-none bg-white transition-all placeholder:text-gray-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery ? (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center active:scale-90 transition-transform"><X size={18} /></button>
                ) : (
                    <button className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all"><Search size={20} /></button>
                )}
            </div>

            {/* 3. 상태 필터 버튼 (모바일 스크롤 유도 위해 좌측 여백 추가) */}
            <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center gap-2 mb-6 px-1 py-1 w-full mask-fade-right">
                {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => {
                            setActiveFilter(filter);
                            setIsFilterApplied(true);
                        }}
                        className={`shrink-0 px-5 py-2.5 rounded-full font-bold text-[12px] md:text-[13px] transition-all whitespace-nowrap active:scale-95 ${activeFilter === filter && isFilterApplied ? "bg-[#4a403a] text-white shadow-md ring-2 ring-[#4a403a]/10" : "bg-white text-gray-500 border border-gray-100 hover:text-[#FF8C42]"}`}
                    >
                        {filter === "전체" ? "전체보기" : `#${filter}`}
                    </button>
                ))}
            </div>
        </>
    );
}