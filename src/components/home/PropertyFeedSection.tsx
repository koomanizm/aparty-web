"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { LayoutGrid, Map as MapIcon, ChevronLeft, ChevronRight, MapPin, ChevronDown, ChevronUp, Sparkles, Grid, Search, Filter, RefreshCw } from "lucide-react";
import PropertyCard from "../PropertyCard";
import MainMapExplorer from "../MainMapExplorer";

const REGION_COORDS: Record<string, { lat: number; lng: number; level: number }> = {
    전국: { lat: 36.3504, lng: 127.3845, level: 10 }, 서울: { lat: 37.5665, lng: 126.978, level: 8 }, 경기: { lat: 37.4138, lng: 127.5183, level: 9 },
    인천: { lat: 37.4563, lng: 126.7052, level: 8 }, 부산: { lat: 35.1796, lng: 129.0756, level: 8 }, 대전: { lat: 36.3504, lng: 127.3845, level: 8 },
    대구: { lat: 35.8714, lng: 128.6014, level: 8 }, 광주: { lat: 35.1595, lng: 126.8526, level: 8 }, 울산: { lat: 35.5384, lng: 129.3114, level: 8 },
    세종: { lat: 36.48, lng: 127.289, level: 8 }, 강원: { lat: 37.8228, lng: 128.1555, level: 10 }, 충북: { lat: 36.6353, lng: 127.4913, level: 10 },
    충남: { lat: 36.6588, lng: 126.6728, level: 10 }, 전북: { lat: 35.8204, lng: 127.1087, level: 10 }, 전남: { lat: 34.8679, lng: 126.991, level: 10 },
    경북: { lat: 36.576, lng: 128.5058, level: 10 }, 경남: { lat: 35.2376, lng: 128.6919, level: 10 }, 제주: { lat: 33.4996, lng: 126.5312, level: 9 },
};

const REGION_CATEGORIES = [
    { title: "수도권", items: ["서울", "경기", "인천"] },
    { title: "광역시", items: ["부산", "대구", "광주", "대전", "울산", "세종"] },
    { title: "지방", items: ["강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"] },
];

const REGIONS_LIST = ["전국", "서울", "경기", "인천", "부산", "대구", "광주", "대전", "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

const TYPE_OPTIONS = ["전체", "아파트", "오피스텔", "민간임대", "공공임대"];
const SORT_OPTIONS = ["최신순", "인기순", "마감임박순"];

const BENEFIT_CHIPS = ["즉시입주", "할인분양", "전매가능", "소액투자"];

export default function PropertyFeedSection({
    properties = [], activeRegion, setActiveRegion, viewMode, setViewMode, currentPage, setCurrentPage, searchQuery, setSearchQuery, activeFilter, setActiveFilter, isSearchActive
}: any) {
    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [mapTarget, setMapTarget] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    const [selectedType, setSelectedType] = useState("전체");
    const [selectedSort, setSelectedSort] = useState("최신순");

    const [activeBenefitChip, setActiveBenefitChip] = useState("");
    const [openDropdown, setOpenDropdown] = useState("");

    const itemsPerPage = isMobile ? 10 : 12;

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeRegion, selectedType, activeBenefitChip, setCurrentPage]);

    const handleRegionSelect = (region: string) => {
        setActiveRegion(region);
        setIsRegionModalOpen(false);
        setOpenDropdown("");
        if (REGION_COORDS[region]) setMapTarget(REGION_COORDS[region]);
    };

    const finalFilteredProps = useMemo(() => {
        return properties
            .filter((p: any) => {
                const keyword = (searchQuery || "").toLowerCase().trim();
                const textToSearch = `${p.title} ${p.location} ${(p.status || []).join(" ")} ${(p.signals || []).join(" ")} ${p.propertyType} ${p.searchKeyword || ""}`.toLowerCase();

                const matchesSearch = !keyword || keyword.split(/\s+/).every((term: string) => textToSearch.includes(term));
                const matchesRegion = activeRegion === "전국" || p.location?.includes(activeRegion);

                const matchesType = selectedType === "전체" ? true :
                    p.propertyType === selectedType ||
                    (p.status || []).includes(selectedType) ||
                    (p.searchKeyword || "").includes(selectedType);

                const matchesBenefit = !activeBenefitChip ||
                    (p.status || []).includes(activeBenefitChip) ||
                    (p.signals || []).includes(activeBenefitChip) ||
                    (p.searchKeyword || "").includes(activeBenefitChip) ||
                    (p.description || "").includes(activeBenefitChip);

                return matchesSearch && matchesRegion && matchesType && matchesBenefit;
            })
            .sort((a: any, b: any) => {
                if (selectedSort === "최신순") return (b.id || 0) - (a.id || 0);
                if (selectedSort === "인기순") return (b.views || 0) - (a.views || 0);
                if (selectedSort === "마감임박순") return (a.deadlineOrder || 999) - (b.deadlineOrder || 999);
                return 0;
            });
    }, [properties, searchQuery, activeRegion, selectedType, activeBenefitChip, selectedSort]);

    const totalPages = Math.ceil(finalFilteredProps.length / itemsPerPage) || 1;

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(1);
    }, [currentPage, totalPages, setCurrentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPropertiesList = finalFilteredProps.slice(startIndex, startIndex + itemsPerPage);

    const getVisiblePages = () => {
        const maxVisible = isMobile ? 5 : 7;
        let start = 1, end = totalPages;
        if (totalPages > maxVisible) {
            const half = Math.floor(maxVisible / 2);
            if (currentPage <= half + 1) { start = 1; end = maxVisible; }
            else if (currentPage >= totalPages - half) { start = totalPages - maxVisible + 1; end = totalPages; }
            else { start = currentPage - half; end = currentPage + half; }
        }
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <div className="w-full flex flex-col relative" id="property-feed">
            {openDropdown && <div className="fixed inset-0 z-[40]" onClick={() => setOpenDropdown("")}></div>}

            {isMapFullScreen && (
                <div className="fixed top-6 left-6 z-[100000] hidden md:flex animate-in fade-in slide-in-from-left-4 duration-300">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button onClick={() => setOpenDropdown(openDropdown === "float-region" ? "" : "float-region")} className="h-[38px] px-3.5 bg-white border border-gray-200 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                {activeRegion === "전국" ? "전체지역" : activeRegion} <ChevronDown size={14} className={openDropdown === "float-region" ? "transform rotate-180 transition-transform" : "transition-transform text-gray-400"} />
                            </button>
                            {openDropdown === "float-region" && (
                                <div className="absolute top-full left-0 mt-1.5 w-[320px] bg-white border border-gray-200 rounded-[12px] shadow-xl p-3 grid grid-cols-4 gap-1.5 z-[100010]">
                                    {REGIONS_LIST.map((region) => (
                                        <button key={region} onClick={() => handleRegionSelect(region)} className={`px-3 py-2 text-[13px] font-semibold rounded-[8px] text-center transition-colors ${activeRegion === region ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{region}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button onClick={() => setOpenDropdown(openDropdown === "float-type" ? "" : "float-type")} className="h-[38px] px-3.5 bg-white border border-gray-200 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                {selectedType === "전체" ? "건물유형" : selectedType} <ChevronDown size={14} className={openDropdown === "float-type" ? "transform rotate-180 transition-transform" : "transition-transform text-gray-400"} />
                            </button>
                            {openDropdown === "float-type" && (
                                <div className="absolute top-full left-0 mt-1.5 w-max bg-white border border-gray-200 rounded-[12px] shadow-xl p-2 flex flex-col gap-1 z-[100010]">
                                    {TYPE_OPTIONS.map((type) => (
                                        <button key={type} onClick={() => { setSelectedType(type); setOpenDropdown(""); }} className={`px-4 py-2 text-[13px] font-semibold rounded-[8px] text-left transition-colors ${selectedType === type ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"}`}>{type}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <button onClick={() => setOpenDropdown(openDropdown === "float-sort" ? "" : "float-sort")} className="h-[38px] px-3.5 bg-white border border-gray-200 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                                {selectedSort} <ChevronDown size={14} className={openDropdown === "float-sort" ? "transform rotate-180 transition-transform" : "transition-transform text-gray-400"} />
                            </button>
                            {openDropdown === "float-sort" && (
                                <div className="absolute top-full left-0 mt-1.5 w-max bg-white border border-gray-200 rounded-[12px] shadow-xl p-2 flex flex-col gap-1 z-[100010]">
                                    {SORT_OPTIONS.map((sort) => (
                                        <button key={sort} onClick={() => { setSelectedSort(sort); setOpenDropdown(""); }} className={`px-4 py-2 text-[13px] font-semibold rounded-[8px] text-left transition-colors ${selectedSort === sort ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-100"}`}>{sort}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(activeRegion !== "전국" || selectedType !== "전체" || activeBenefitChip) && (
                            <button
                                onClick={() => { setActiveRegion("전국"); setSelectedType("전체"); setActiveBenefitChip(""); }}
                                className="h-[38px] px-3.5 bg-white border border-gray-200 rounded-[8px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw size={13} className="text-gray-500" /> 초기화
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 📱 모바일 헤더 영역 */}
            <div className="md:hidden flex flex-col w-full px-2">
                <div className="flex flex-col gap-4 mb-5">
                    {/* 🚀 레퍼런스(15/18px Bold)에 맞춘 초슬림 제목 */}
                    {!isSearchActive && (
                        <h2 className="text-[15px] md:text-[18px] font-bold text-gray-900 tracking-tight flex items-center gap-1.5 mb-2 transition-all duration-300">
                            <Sparkles size={16} className="text-orange-500" /> 맞춤 분양 현장 탐색
                        </h2>
                    )}

                    <div className="flex justify-between items-center w-full">
                        <div className="relative z-[50]">
                            <button onClick={() => setIsRegionModalOpen(!isRegionModalOpen)} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[10px] text-[12px] font-bold transition-all w-max shadow-sm ${isRegionModalOpen ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>
                                <MapPin size={14} className={isRegionModalOpen ? "text-white" : "text-gray-400"} />
                                {activeRegion === "전국" ? "전국" : activeRegion}
                                {isRegionModalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400" />}
                            </button>

                            {isRegionModalOpen && (
                                <>
                                    <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm" onClick={() => setIsRegionModalOpen(false)}></div>
                                    <div className="absolute top-full mt-2 left-0 z-[110] bg-white w-[280px] rounded-[16px] shadow-xl border border-gray-100 p-5 animate-in slide-in-from-top-2 duration-200">
                                        <div className="mb-4 pb-4 border-b border-gray-100">
                                            <button onClick={() => handleRegionSelect("전국")} className={`w-full py-2.5 rounded-[10px] font-bold text-[13px] transition-all border ${activeRegion === "전국" ? "bg-gray-900 text-white border-gray-900 shadow-md" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"}`}>
                                                전국 전체보기
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {REGION_CATEGORIES.map((cat) => (
                                                <div key={cat.title}>
                                                    <p className="text-[11px] font-bold text-gray-500 mb-2 ml-1 flex items-center gap-1.5">
                                                        {cat.title}
                                                    </p>
                                                    <div className="grid grid-cols-3 gap-1.5">
                                                        {cat.items.map((r) => (
                                                            <button key={r} onClick={() => handleRegionSelect(r)} className={`py-1.5 rounded-[8px] font-semibold text-[12px] border transition-colors ${activeRegion === r ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                                                                {r}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex bg-gray-100 p-1 rounded-[10px] shrink-0">
                            <button onClick={() => setViewMode("gallery")} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold transition-all ${viewMode === "gallery" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
                                <LayoutGrid size={14} /> 갤러리
                            </button>
                            <button onClick={() => setViewMode("map")} className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] font-bold transition-all ${viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>
                                <MapIcon size={14} /> 지도
                            </button>
                        </div>
                    </div>
                </div>

                {viewMode === "map" ? (
                    <div className="w-full h-[500px] rounded-[16px] overflow-hidden shadow-sm border border-gray-200 relative">
                        <MainMapExplorer properties={finalFilteredProps as any} searchQuery={searchQuery} isFullScreen={isMapFullScreen} onFullScreenChange={setIsMapFullScreen} mapTarget={mapTarget} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        {currentPropertiesList.map((p: any) => (
                            <PropertyCard key={p.id} {...p} />
                        ))}
                    </div>
                )}

                {viewMode === "gallery" && totalPages > 1 && (
                    <div className="w-full flex justify-center items-center gap-1.5 mt-8 mb-4">
                        <button onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30"><ChevronLeft size={16} /></button>
                        {getVisiblePages().map((page) => (
                            <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} className={`w-8 h-8 flex items-center justify-center rounded-[8px] text-[13px] font-bold transition-all ${currentPage === page ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>{page}</button>
                        ))}
                        <button onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>

            {/* 💻 PC 헤더 및 필터 영역 */}
            <div className="hidden md:block w-full mx-auto relative z-10">
                {!isMapFullScreen && (
                    <>
                        {/* 🚀 레퍼런스(PC 18px Bold)에 맞춘 컴팩트 제목 */}
                        {!isSearchActive && (
                            <div className="flex items-center justify-between mb-5 transition-all duration-300">
                                <h2 className="text-[15px] md:text-[18px] font-bold tracking-tight text-gray-900 leading-none flex items-center gap-2">
                                    조건별 전체 분양 탐색
                                </h2>
                                <Link href="/properties" className="inline-flex items-center gap-1 text-[13px] font-bold text-gray-500 hover:text-gray-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">
                                    전체 현장 보기 <ChevronRight size={14} strokeWidth={2.5} />
                                </Link>
                            </div>
                        )}

                        <div className="rounded-[16px] border border-gray-200 bg-white shadow-sm px-6 py-4 relative z-30 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="relative z-[50]">
                                        <button onClick={() => setOpenDropdown(openDropdown === "region" ? "" : "region")} className={`h-10 px-4 rounded-[10px] border flex items-center gap-2 text-[13px] font-bold transition-colors shadow-sm ${openDropdown === "region" || activeRegion !== "전국" ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                                            <MapPin size={14} className={openDropdown === "region" || activeRegion !== "전국" ? "text-white" : "text-gray-400"} />
                                            {activeRegion} <ChevronDown size={14} className={openDropdown === "region" || activeRegion !== "전국" ? "text-white" : "text-gray-400"} />
                                        </button>
                                        {openDropdown === "region" && (
                                            <div className="absolute top-full left-0 mt-2 w-max bg-white border border-gray-200 rounded-[12px] shadow-xl p-3 grid grid-cols-4 gap-1.5 z-[60] animate-in fade-in zoom-in-95 duration-150">
                                                {REGIONS_LIST.map((region) => (
                                                    <button key={region} onClick={() => handleRegionSelect(region)} className={`px-3 py-2 text-[13px] font-semibold rounded-[8px] text-left transition-colors ${activeRegion === region ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}>{region}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-[48]">
                                        <button onClick={() => setOpenDropdown(openDropdown === "type" ? "" : "type")} className={`h-10 px-4 rounded-[10px] border flex items-center gap-2 text-[13px] font-bold transition-colors shadow-sm ${openDropdown === "type" || selectedType !== "전체" ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                                            <Filter size={14} className={openDropdown === "type" || selectedType !== "전체" ? "text-orange-500" : "text-gray-400"} />
                                            {selectedType} <ChevronDown size={14} className={openDropdown === "type" || selectedType !== "전체" ? "text-orange-500" : "text-gray-400"} />
                                        </button>
                                        {openDropdown === "type" && (
                                            <div className="absolute top-full left-0 mt-2 w-max bg-white border border-gray-200 rounded-[12px] shadow-xl p-2 flex flex-col gap-1 z-[60] animate-in fade-in zoom-in-95 duration-150">
                                                {TYPE_OPTIONS.map((type) => (
                                                    <button key={type} onClick={() => { setSelectedType(type); setOpenDropdown(""); }} className={`px-4 py-2 text-[13px] font-semibold rounded-[8px] text-left transition-colors ${selectedType === type ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-gray-100"}`}>{type}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="relative z-[47]">
                                        <button onClick={() => setOpenDropdown(openDropdown === "sort" ? "" : "sort")} className={`h-10 px-4 rounded-[10px] border flex items-center gap-2 text-[13px] font-bold transition-colors shadow-sm ${openDropdown === "sort" ? "bg-gray-100 border-gray-300 text-gray-900" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
                                            {selectedSort} <ChevronDown size={14} className={openDropdown === "sort" ? "text-gray-600" : "text-gray-400"} />
                                        </button>
                                        {openDropdown === "sort" && (
                                            <div className="absolute top-full left-0 mt-2 w-max bg-white border border-gray-200 rounded-[12px] shadow-xl p-2 flex flex-col gap-1 z-[60] animate-in fade-in zoom-in-95 duration-150">
                                                {SORT_OPTIONS.map((sort) => (
                                                    <button key={sort} onClick={() => { setSelectedSort(sort); setOpenDropdown(""); }} className={`px-4 py-2 text-[13px] font-semibold rounded-[8px] text-left transition-colors ${selectedSort === sort ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}>{sort}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block"></div>

                                    <div className="flex gap-2 relative z-10">
                                        {BENEFIT_CHIPS.map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => setActiveBenefitChip((prev) => (prev === chip ? "" : chip))}
                                                className={`h-10 px-3.5 rounded-[10px] border text-[12px] font-bold transition-all ${activeBenefitChip === chip
                                                    ? "bg-gray-900 border-gray-900 text-white shadow-sm"
                                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                                    }`}
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-[10px] shrink-0 relative z-10">
                                    <button onClick={() => setViewMode("gallery")} className={`flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-[12px] font-bold transition-all ${viewMode === "gallery" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}><Grid size={14} strokeWidth={2.5} /> 갤러리</button>
                                    <button onClick={() => setViewMode("map")} className={`flex items-center gap-1.5 h-8 px-3 rounded-[6px] text-[12px] font-bold transition-all ${viewMode === "map" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}><MapIcon size={14} strokeWidth={2.5} /> 지도</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <div className="relative z-20">
                    {viewMode === "map" ? (
                        <div className="w-full h-[650px] rounded-[16px] overflow-hidden shadow-sm border border-gray-200 relative">
                            <MainMapExplorer properties={finalFilteredProps as any} searchQuery={searchQuery} isFullScreen={isMapFullScreen} onFullScreenChange={setIsMapFullScreen} mapTarget={mapTarget} />
                        </div>
                    ) : finalFilteredProps.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
                            {currentPropertiesList.map((p: any) => (
                                <PropertyCard key={p.id} {...p} />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full py-24 flex flex-col items-center justify-center bg-gray-50/50 rounded-[16px] border border-dashed border-gray-300">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4">
                                <Search className="text-gray-400" size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-[15px] font-bold text-gray-900 mb-1">조건에 맞는 현장이 없습니다.</p>
                            <p className="text-[13px] text-gray-500 mb-4">다른 지역이나 필터 조건을 선택해 보세요.</p>
                            <button
                                onClick={() => {
                                    setSearchQuery(""); setActiveRegion("전국"); setActiveBenefitChip(""); setSelectedType("전체");
                                }}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-[8px] text-[13px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                필터 초기화
                            </button>
                        </div>
                    )}
                </div>

                {viewMode === "gallery" && totalPages > 1 && (
                    <div className="w-full flex justify-center items-center gap-2 mt-12">
                        <button onClick={() => { setCurrentPage(Math.max(1, currentPage - 1)); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30"><ChevronLeft size={16} /></button>
                        {getVisiblePages().map((page) => (
                            <button key={page} onClick={() => { setCurrentPage(page); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} className={`w-9 h-9 flex items-center justify-center rounded-[8px] text-[13px] font-bold transition-all ${currentPage === page ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:bg-gray-100"}`}>{page}</button>
                        ))}
                        <button onClick={() => { setCurrentPage(Math.min(totalPages, currentPage + 1)); window.scrollTo({ top: document.getElementById("property-feed")?.offsetTop || 0, behavior: "smooth" }); }} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-[8px] border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 disabled:opacity-30"><ChevronRight size={16} /></button>
                    </div>
                )}
            </div>
        </div>
    );
}