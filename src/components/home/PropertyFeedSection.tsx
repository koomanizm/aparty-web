"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, Map as MapIcon, ChevronLeft, ChevronRight, MapPin, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import PropertyCard from "../PropertyCard";
import MainMapExplorer from "../MainMapExplorer";

const REGION_COORDS: any = {
    "전국": { lat: 36.3504, lng: 127.3845, level: 10 },
    "서울": { lat: 37.5665, lng: 126.9780, level: 8 },
    "경기": { lat: 37.4138, lng: 127.5183, level: 9 },
    "인천": { lat: 37.4563, lng: 126.7052, level: 8 },
    "부산": { lat: 35.1796, lng: 129.0756, level: 8 },
    "대전": { lat: 36.3504, lng: 127.3845, level: 8 },
    "대구": { lat: 35.8714, lng: 128.6014, level: 8 },
    "광주": { lat: 35.1595, lng: 126.8526, level: 8 },
    "울산": { lat: 35.5384, lng: 129.3114, level: 8 },
    "세종": { lat: 36.4800, lng: 127.2890, level: 8 },
    "강원": { lat: 37.8228, lng: 128.1555, level: 10 },
    "충북": { lat: 36.6353, lng: 127.4913, level: 10 },
    "충남": { lat: 36.6588, lng: 126.6728, level: 10 },
    "전북": { lat: 35.8204, lng: 127.1087, level: 10 },
    "전남": { lat: 34.8679, lng: 126.9910, level: 10 },
    "경북": { lat: 36.5760, lng: 128.5058, level: 10 },
    "경남": { lat: 35.2376, lng: 128.6919, level: 10 },
    "제주": { lat: 33.4996, lng: 126.5312, level: 9 }
};

export default function PropertyFeedSection({
    filteredProperties, currentProperties, activeRegion, setActiveRegion, viewMode, setViewMode, currentPage, setCurrentPage, totalPages, searchQuery, activeFilter
}: any) {

    const [isMapFullScreen, setIsMapFullScreen] = useState(false);
    const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
    const [mapTarget, setMapTarget] = useState<any>(null);

    // 🚀 모바일 감지 State 추가
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // 화면 크기에 따라 모바일 여부 판단 (768px 기준)
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // 초기 실행
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const REGION_CATEGORIES = [
        { title: "수도권", items: ["서울", "경기", "인천"] },
        { title: "광역시", items: ["부산", "대구", "광주", "대전", "울산", "세종"] },
        { title: "지방", items: ["강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"] }
    ];

    const handleRegionSelect = (region: string) => {
        setActiveRegion(region);
        setCurrentPage(1);
        setIsRegionModalOpen(false);
        if (REGION_COORDS[region]) setMapTarget(REGION_COORDS[region]);
    };

    // 🚀 똑똑한 페이지네이션 (모바일은 5개, PC는 7개 자동 슬라이딩)
    const getVisiblePages = () => {
        const maxVisible = isMobile ? 5 : 7;
        let start = 1;
        let end = totalPages;

        if (totalPages > maxVisible) {
            const half = Math.floor(maxVisible / 2); // 모바일은 2, PC는 3

            if (currentPage <= half + 1) {
                // 현재 페이지가 맨 앞쪽일 때
                start = 1;
                end = maxVisible;
            } else if (currentPage >= totalPages - half) {
                // 현재 페이지가 맨 끝쪽일 때
                start = totalPages - maxVisible + 1;
                end = totalPages;
            } else {
                // 중간에 있을 때 (현재 페이지를 정중앙에 배치)
                start = currentPage - half;
                end = currentPage + half;
            }
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <div className="w-full flex flex-col" id="property-feed">

            {/* 헤더 영역 */}
            <div className="flex flex-col gap-4 mb-6 px-1 md:px-0">
                <h2 className="text-[18px] md:text-[22px] font-extrabold text-[#4A403A] tracking-tighter flex items-center gap-1.5">
                    <Sparkles size={20} className="text-[#FF8C42] md:w-[22px]" /> 전체 분양 현장 탐색
                </h2>

                <div className="flex justify-between items-center w-full">
                    <div className="relative">
                        <button
                            onClick={() => setIsRegionModalOpen(!isRegionModalOpen)}
                            className={`flex items-center gap-1.5 px-3 md:px-3.5 py-1.5 border rounded-xl text-[11px] md:text-[13px] font-bold transition-all w-max ${isRegionModalOpen
                                ? "bg-[#4A403A] text-white border-[#4A403A]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-[#FF8C42]"}`}
                        >
                            <MapPin size={14} className={isRegionModalOpen ? "text-white" : "text-gray-400"} />
                            {activeRegion === "전국" ? "전국" : activeRegion}
                            {isRegionModalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} className="text-gray-400" />}
                        </button>

                        {isRegionModalOpen && (
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setIsRegionModalOpen(false)}></div>
                                <div className="absolute top-full mt-2 left-0 z-[110] bg-white w-[280px] md:w-[320px] rounded-2xl shadow-[0_20px_50px_rgba(74,64,58,0.2)] border border-gray-100 p-5 animate-in slide-in-from-top-2 duration-200">
                                    <div className="mb-4 pb-4 border-b border-gray-50">
                                        <button onClick={() => handleRegionSelect("전국")} className={`w-full py-2.5 rounded-xl font-black text-[13px] transition-all border ${activeRegion === "전국" ? "bg-[#4A403A] text-white border-[#4A403A] shadow-md" : "bg-[#FDFBF7] text-[#4A403A] border-gray-100 hover:border-[#FF8C42]"}`}>전국 전체보기</button>
                                    </div>
                                    <div className="space-y-4">
                                        {REGION_CATEGORIES.map((cat) => (
                                            <div key={cat.title}>
                                                <p className="text-[11px] font-black text-[#4A403A] mb-2 ml-0.5 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-[#FF8C42]"></span>{cat.title}</p>
                                                <div className="grid grid-cols-3 gap-1">
                                                    {cat.items.map((r) => (
                                                        <button key={r} onClick={() => handleRegionSelect(r)} className={`py-1.5 rounded-lg font-bold text-[12px] border ${activeRegion === r ? "bg-[#4A403A] text-white border-[#4A403A]" : "bg-white text-gray-500 border-gray-100 hover:border-[#FF8C42]"}`}>{r}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex bg-gray-50 border border-gray-100 p-0.5 rounded-lg shrink-0">
                        <button
                            onClick={() => setViewMode('gallery')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] md:text-[12px] font-bold transition-all ${viewMode === 'gallery' ? "bg-white text-[#4A403A] shadow-sm border border-gray-100" : "text-gray-400"}`}
                        >
                            <LayoutGrid size={13} />
                            갤러리
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[11px] md:text-[12px] font-bold transition-all ${viewMode === 'map' ? "bg-white text-[#4A403A] shadow-sm border border-gray-100" : "text-gray-400"}`}
                        >
                            <MapIcon size={13} />
                            지도
                        </button>
                    </div>
                </div>
            </div>

            {/* 뷰 영역 */}
            {viewMode === 'map' ? (
                <div className="w-full h-[600px] rounded-lg overflow-hidden shadow-md border border-gray-100 relative">
                    <MainMapExplorer properties={filteredProperties} searchQuery={searchQuery} activeFilter={activeFilter} isFullScreen={isMapFullScreen} onFullScreenChange={setIsMapFullScreen} mapTarget={mapTarget} />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full">
                    {currentProperties.map((p: any) => (<PropertyCard key={p.id} {...p} />))}
                </div>
            )}

            {/* 🚀 스마트 페이지네이션 UI (디테일 튜닝 완료) */}
            {viewMode === 'gallery' && totalPages > 1 && (
                <div className="w-full flex justify-center items-center gap-1.5 md:gap-2 mt-8 md:mt-10 mb-4">

                    {/* 🚀 이전 페이지 버튼 (호버 및 비활성화 스타일 강화) */}
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-300 shadow-sm
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200
                        hover:bg-[#FF8C42] hover:text-white hover:border-[#FF8C42] hover:shadow-md active:scale-90"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* 페이지 번호 */}
                    {getVisiblePages().map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full text-[13px] md:text-[14px] font-bold transition-all duration-300 active:scale-90 ${currentPage === page
                                ? "bg-[#4A403A] text-white shadow-md scale-105"
                                : "text-gray-500 hover:bg-[#FF8C42]/10 hover:text-[#FF8C42]"
                                }`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* 🚀 다음 페이지 버튼 (호버 및 비활성화 스타일 강화) */}
                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all duration-300 shadow-sm
                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500 disabled:hover:border-gray-200
                        hover:bg-[#FF8C42] hover:text-white hover:border-[#FF8C42] hover:shadow-md active:scale-90"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

        </div>
    );
}