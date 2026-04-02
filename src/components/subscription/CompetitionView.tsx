"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, TrendingUp, MapPin, Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react";

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

    // 🚨 [아코디언 UI 핵심] 어떤 단지(카드)가 열려있는지 저장하는 상태 (기본값은 모두 닫힘)
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
    }, [selectedRegion]);

    const filteredList = useMemo(() => {
        return list.filter(item => {
            if (selectedRegion === "전체") return true;
            return REGION_KEYWORDS[selectedRegion].some(kw => item.addr.includes(kw));
        });
    }, [list, selectedRegion]);

    const displayedList = filteredList.slice(0, visibleCount);

    const handleCardFilterChange = (id: string, filter: string) => {
        setCardFilters(prev => ({ ...prev, [id]: filter }));
    };

    const loadMore = () => {
        setVisibleCount(prev => prev + 15);
    };

    // 🚨 [아코디언 토글 함수] 클릭 시 해당 카드의 열림/닫힘 상태를 반전시킵니다.
    const toggleCard = (id: string) => {
        setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="bg-white border-b border-[#E5E9F0] shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-[1200px] mx-auto px-5 md:px-6 flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveMenu("calendar")} className="py-4 text-[14px] font-bold text-[#94A3B8] hover:text-[#172554] transition-colors whitespace-nowrap">
                        청약 일정 달력
                    </button>
                    <button onClick={() => setActiveMenu("competition")} className="py-4 text-[14px] font-black text-[#172554] border-b-[3px] border-[#172554] whitespace-nowrap">
                        청약 경쟁률 분석
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="mb-6">
                    <h2 className="text-[24px] font-black text-[#172554] flex items-center gap-2">
                        <TrendingUp className="text-[#d40606]" /> 최근 6개월 청약 결과 리포트
                    </h2>
                    <p className="text-[#667085] text-[14px] mt-1 font-medium">최근 6개월 이내에 마감된 주요 단지의 경쟁률을 분석합니다.</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
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

                {isLoading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[32px] border border-[#E3E8EF] shadow-sm">
                        <Loader2 size={40} className="animate-spin text-[#172554] mb-4" />
                        <p className="text-[15px] font-bold text-[#98A2B3]">DB에서 청약 데이터를 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:gap-6">
                        {displayedList.length > 0 ? displayedList.map((item) => {
                            const activeFilter = cardFilters[item.id] || "전체";
                            const isExpanded = expandedCards[item.id]; // 👈 현재 카드의 열림 상태

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
                                <div key={item.id} className="bg-white rounded-[24px] border border-[#E3E8EF] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    {/* 🚀 [헤더 영역] 이 부분을 누르면 접히고 펴집니다! 커서 포인터 추가 */}
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

                                            {/* 경쟁률 박스 & 화살표 아이콘 */}
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
                                                {/* 🚀 열림/닫힘 상태에 따른 화살표 아이콘 */}
                                                <div className="text-[#94A3B8] ml-1 md:ml-2">
                                                    {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🚀 [상세 내용 영역] isExpanded가 true일 때만 부드럽게 나타납니다! */}
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
                                                                e.stopPropagation(); // 🚀 버튼 클릭 시 카드가 닫히지 않도록 막아줍니다.
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
                                                        {itemDisplayedModels.length > 0 ? itemDisplayedModels.map((model: any, idx: number) => (
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
                                                                <td className="px-4 py-3 text-right font-black text-[#172554] whitespace-nowrap">
                                                                    {model.rate === "0" || model.rate === 0 ? (
                                                                        <span className="text-[#d40606] font-bold">미달</span>
                                                                    ) : (
                                                                        `${model.rate} : 1`
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )) : (
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

                        {visibleCount < filteredList.length && (
                            <div className="flex justify-center mt-4 mb-10">
                                <button
                                    onClick={loadMore}
                                    className="flex items-center gap-2 bg-white border border-[#E3E8EF] text-[#24324A] font-bold px-6 py-3 rounded-full shadow-sm hover:bg-[#F8FAFC] hover:shadow-md transition-all"
                                >
                                    더보기 ({visibleCount} / {filteredList.length})
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