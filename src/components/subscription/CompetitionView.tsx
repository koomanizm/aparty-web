"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, TrendingUp, MapPin, Calendar, Filter, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

// 🚀 지역 필터 키워드 유지
const REGION_CATEGORIES = ["전체", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];
const REGION_KEYWORDS: { [key: string]: string[] } = {
    "서울/수도권": ["서울", "경기", "경기도", "인천"],
    "부산/경남": ["부산", "경남", "경상남도", "울산"],
    "대구/경북": ["대구", "경북", "경상북도"],
    "충청/호남": ["대전", "세종", "충북", "충청북도", "충남", "충청남도", "광주", "전북", "전라북도", "전북특별자치도", "전남", "전라남도"],
    "강원/제주": ["강원", "강원도", "강원특별자치도", "제주", "제주도", "제주특별자치도"]
};

// 🎨 뱃지 및 필터 활성화 컬러 헬퍼 유지
const getRankBadgeStyle = (rank: string) => {
    if (rank.includes("1순위") || rank === "1") return "text-[#042fc9] bg-[#042fc9]/10 border-[#042fc9]/20";
    if (rank.includes("2순위") || rank === "2") return "text-[#fc670a] bg-[#fc670a]/10 border-[#fc670a]/20";
    if (rank.includes("특별공급")) return "text-[#06bf0c] bg-[#06bf0c]/10 border-[#06bf0c]/20";
    if (rank.includes("무순위")) return "text-[#29bf04] bg-[#29bf04]/10 border-[#29bf04]/20";
    if (rank.includes("재공급") || rank.includes("취소후")) return "text-[#f205ab] bg-[#f205ab]/10 border-[#f205ab]/20";
    return "text-[#172554] bg-[#172554]/10 border-[#172554]/20";
};

export default function CompetitionView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [list, setList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState("전체");
    const [cardFilters, setCardFilters] = useState<{ [key: string]: string }>({});
    const [visibleCount, setVisibleCount] = useState(15);

    // 🚨 [정렬 상태 추가] 최신순 vs 경쟁률 높은순
    const [sortBy, setSortBy] = useState<"latest" | "highest">("latest");

    const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/dashboard/competition?t=${new Date().getTime()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(res => {
                if (res.data) setList(res.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        setVisibleCount(15);
    }, [selectedRegion, sortBy]); // 정렬이 바뀌어도 더보기 카운트 초기화

    // 🚀 [핵심] 필터링과 정렬을 동시에 처리하는 useMemo
    const sortedAndFilteredList = useMemo(() => {
        // 1. 먼저 지역 필터링을 거칩니다.
        let result = list.filter(item => {
            if (selectedRegion === "전체") return true;
            return REGION_KEYWORDS[selectedRegion].some(kw => item.addr.includes(kw));
        });

        // 2. 경쟁률 높은순으로 정렬합니다. (최신순은 DB 원본 순서 유지)
        if (sortBy === "highest") {
            result.sort((a, b) => {
                // 단지 내 최고 경쟁률 추출
                const maxA = Math.max(...a.models.map((m: any) => parseFloat(m.rate) || 0));
                const maxB = Math.max(...b.models.map((m: any) => parseFloat(m.rate) || 0));
                return maxB - maxA; // 내림차순 정렬
            });
        }

        return result;
    }, [list, selectedRegion, sortBy]);

    // 🚀 필터 및 정렬이 완료된 리스트를 보여줄 만큼만 자릅니다.
    const displayedList = sortedAndFilteredList.slice(0, visibleCount);

    const handleCardFilterChange = (id: string, filter: string) => {
        setCardFilters(prev => ({ ...prev, [id]: filter }));
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 15);
    };

    const toggleCard = (id: string) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500 relative">


            <div className="max-w-5xl mx-auto px-4 mt-8 relative">
                <div className="mb-6">
                    <h2 className="text-[24px] font-black text-[#172554] flex items-center gap-2">
                        <TrendingUp className="text-[#d40606]" /> 최근 6개월 청약 결과 리포트
                    </h2>
                    <p className="text-[#667085] text-[14px] mt-1 font-medium">최근 6개월 이내에 마감된 주요 단지의 경쟁률을 분석합니다.</p>
                </div>

                {/* ✨ 디자인 포인트 2: Sticky 필터 바 적용 (스크롤 시 상단 고정 & 배경 블러 효과) */}
                <div className="sticky top-0 z-20 bg-[#F5F7FA]/95 backdrop-blur-sm py-3 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0 w-full lg:w-auto">
                        <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[#EEF2F6] text-[#7B8794] mr-1">
                            <MapPin size={14} />
                        </div>
                        {REGION_CATEGORIES.map(region => (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${selectedRegion === region
                                    ? "bg-[#172554] border-[#172554] text-white shadow-md"
                                    : "bg-white border-[#E3E8EF] text-[#667085] hover:bg-[#F8FAFC]"
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>

                    {/* 정렬 토글 버튼 */}
                    <div className="flex items-center shrink-0 bg-white border border-[#E3E8EF] rounded-full p-1 shadow-sm w-fit">
                        <button
                            onClick={() => setSortBy("latest")}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1 ${sortBy === "latest" ? "bg-[#172554] text-white shadow-md" : "text-[#667085] hover:text-[#172554]"
                                }`}
                        >
                            최신순
                        </button>
                        <button
                            onClick={() => setSortBy("highest")}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all flex items-center gap-1 ${sortBy === "highest" ? "bg-[#172554] text-white shadow-md" : "text-[#667085] hover:text-[#172554]"
                                }`}
                        >
                            경쟁률 높은순 <ArrowUpDown size={12} className={sortBy === "highest" ? "text-white" : "text-[#94A3B8]"} />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[32px] border border-[#E3E8EF] shadow-sm">
                        <Loader2 size={40} className="animate-spin text-[#172554] mb-4" />
                        <p className="text-[15px] font-bold text-[#98A2B3]">DB에서 청약 데이터를 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {displayedList.length > 0 ? displayedList.map((item) => {
                            const activeFilter = cardFilters[item.id] || "전체";
                            const isExpanded = expandedCards[item.id];

                            const itemDisplayedModels = item.models.filter((m: any) => {
                                if (activeFilter === "전체") return true;
                                return String(m.rank).includes(activeFilter.replace("순위", ""));
                            });

                            const totalUnits = itemDisplayedModels.reduce((acc: number, cur: any) => acc + cur.units, 0);
                            const totalApplied = itemDisplayedModels.reduce((acc: number, cur: any) => acc + cur.applied, 0);
                            const dynamicAvgRate = totalUnits > 0 ? (totalApplied / totalUnits).toFixed(2) : "0.00";

                            let dynamicMaxRate = "0.00";
                            if (itemDisplayedModels.length > 0) {
                                dynamicMaxRate = Math.max(...itemDisplayedModels.map((m: any) => {
                                    const parsed = parseFloat(m.rate);
                                    return isNaN(parsed) ? 0 : parsed;
                                })).toFixed(2);
                            }

                            const labelPrefix = activeFilter === "전체" ? "전체" : activeFilter;

                            return (
                                // ✨ 디자인 포인트 3: hover:-translate-y-1 hover:shadow-lg 추가로 입체감 부여
                                <div key={item.id} className="bg-white rounded-[24px] border border-[#E3E8EF] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                    <div
                                        className="p-5 md:p-8 cursor-pointer select-none"
                                        onClick={() => toggleCard(item.id)}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#172554] text-white text-[11px] font-black px-2 py-0.5 rounded">아파트</span>
                                                    <span className="text-[#94A3B8] text-[12px] font-bold flex items-center gap-1">
                                                        <Calendar size={13} /> {item.date} 공고
                                                    </span>
                                                </div>
                                                <h3 className="text-[18px] md:text-[22px] font-black text-[#101828] group-hover:text-[#172554] transition-colors leading-tight">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-[#667085] text-[13px] font-medium">
                                                    <MapPin size={14} className="text-[#94A3B8]" />
                                                    {item.addr}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
                                                <div className="flex gap-2 md:gap-4">
                                                    <div className="bg-[#F8FAFC] border border-[#EEF2F6] rounded-2xl px-4 py-3 md:px-5 md:py-4 text-center min-w-[90px] md:min-w-[100px]">
                                                        <p className="text-[10px] md:text-[11px] font-bold text-[#94A3B8] mb-1">{labelPrefix} 평균</p>
                                                        <p className="text-[16px] md:text-[18px] font-black text-[#172554]">{dynamicAvgRate}<span className="text-[12px] md:text-[13px] ml-0.5">:1</span></p>
                                                    </div>
                                                    <div className="bg-[#FFF5F5] border border-[#FFEBEB] rounded-2xl px-4 py-3 md:px-5 md:py-4 text-center min-w-[90px] md:min-w-[100px]">
                                                        <p className="text-[10px] md:text-[11px] font-bold text-[#d40606] mb-1">{labelPrefix} 최고</p>
                                                        <p className="text-[16px] md:text-[18px] font-black text-[#d40606]">{dynamicMaxRate}<span className="text-[12px] md:text-[13px] ml-0.5">:1</span></p>
                                                    </div>
                                                </div>
                                                <div className="text-[#94A3B8] ml-1 md:ml-2">
                                                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-5 pb-5 md:px-8 md:pb-8 pt-0 animate-in fade-in duration-300">
                                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 border-b border-[#F2F4F7]">
                                                <div className="flex items-center text-[#98A2B3] mr-1">
                                                    <Filter size={14} />
                                                </div>
                                                {["전체", "1순위", "2순위", "특별공급"].map((filter) => {
                                                    const isActive = activeFilter === filter;
                                                    let activeClass = "bg-[#172554] text-white border-[#172554]";
                                                    if (filter === "1순위") activeClass = "bg-[#042fc9] text-white border-[#042fc9]";
                                                    if (filter === "2순위") activeClass = "bg-[#fc670a] text-white border-[#fc670a]";
                                                    if (filter === "특별공급") activeClass = "bg-[#06bf0c] text-white border-[#06bf0c]";

                                                    return (
                                                        <button
                                                            key={filter}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCardFilterChange(item.id, filter);
                                                            }}
                                                            className={`shrink-0 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all border ${isActive ? activeClass : "bg-white text-[#667085] border-[#E3E8EF] hover:bg-[#F8FAFC]"}`}
                                                        >
                                                            {filter}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 overflow-x-auto scrollbar-hide border border-[#F2F4F7] rounded-xl">
                                                <table className="w-full text-left text-[13px]">
                                                    <thead className="bg-[#F9FAFB] text-[#667085] font-bold border-b border-[#F2F4F7]">
                                                        <tr>
                                                            <th className="px-4 py-3 whitespace-nowrap">주택형</th>
                                                            <th className="px-4 py-3 whitespace-nowrap">지역구분</th>
                                                            <th className="px-4 py-3 text-right whitespace-nowrap">공급</th>
                                                            <th className="px-4 py-3 text-right whitespace-nowrap">접수건수</th>
                                                            <th className="px-4 py-3 text-right text-[#172554] whitespace-nowrap">경쟁률</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#F2F4F7]">
                                                        {itemDisplayedModels.length > 0 ? itemDisplayedModels.map((model: any, idx: number) => {
                                                            const rateNum = parseFloat(model.rate) || 0;
                                                            return (
                                                                <tr key={idx} className="hover:bg-[#FBFCFD] transition-colors">
                                                                    <td className="px-4 py-3 font-black text-[#344054] flex items-center gap-2 whitespace-nowrap">
                                                                        {model.type}
                                                                        {model.rank && model.rank !== "-" && (
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap ${getRankBadgeStyle(model.rank)}`}>
                                                                                {model.rank}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-[#667085] font-medium whitespace-nowrap">{model.region}</td>
                                                                    <td className="px-4 py-3 text-right font-bold text-[#667085] whitespace-nowrap">{model.units}</td>
                                                                    <td className="px-4 py-3 text-right font-bold text-[#344054] whitespace-nowrap">{model.applied.toLocaleString()}건</td>
                                                                    <td className="px-4 py-3 text-right font-black text-[#172554] whitespace-nowrap min-w-[100px]">
                                                                        {/* ✨ 디자인 포인트 1: 경쟁률 온도계(Heat) 막대 그래프 추가 */}
                                                                        {model.rate === "0" || model.rate === 0 ? (
                                                                            <span className="text-[#d40606] font-bold">미달</span>
                                                                        ) : (
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                <span>{model.rate} : 1</span>
                                                                                <div className="w-16 h-1.5 bg-[#F2F4F7] rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className={`h-full rounded-full transition-all duration-500 ${rateNum >= 10 ? 'bg-[#d40606]' : rateNum >= 3 ? 'bg-[#fc670a]' : 'bg-[#172554]'}`}
                                                                                        style={{ width: `${Math.min(100, rateNum * 5)}%` }}
                                                                                    ></div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }) : (
                                                            <tr>
                                                                <td colSpan={5} className="px-4 py-8 text-center text-[#98A2B3] font-bold text-[13px]">
                                                                    해당 순위의 청약 결과 데이터가 없습니다.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#D0D5DD]">
                                <p className="text-[#98A2B3] font-bold text-[15px]">해당 지역에 최근 6개월 내 마감된 청약 데이터가 없습니다.</p>
                            </div>
                        )}

                        {visibleCount < sortedAndFilteredList.length && (
                            <div className="flex justify-center mt-4 mb-10">
                                <button
                                    onClick={loadMore}
                                    className="flex items-center gap-2 bg-white border border-[#E3E8EF] text-[#24324A] font-bold px-6 py-3 rounded-full shadow-sm hover:bg-[#F8FAFC] hover:shadow-md transition-all"
                                >
                                    더보기 ({visibleCount} / {sortedAndFilteredList.length})
                                    <ChevronDown size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}