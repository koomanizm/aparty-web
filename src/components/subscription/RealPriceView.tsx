"use client";

import { useState, useEffect } from "react";
import { Search, Building2, Calendar, LineChart as LineChartIcon, ArrowUpRight, ArrowDownRight, Minus, Loader2, ArrowLeft, ChevronDown, MapPin, Building, Car } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const KOREA_PROVINCES_URL = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo_simple.json";
const KOREA_MUNICIPALITIES_URL = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json";

const PROVINCE_INFO: Record<string, { code: string, center: [number, number], scale: number }> = {
    "서울특별시": { code: "11", center: [126.98, 37.56], scale: 60000 },
    "부산광역시": { code: "21", center: [129.07, 35.18], scale: 60000 },
    "대구광역시": { code: "22", center: [128.60, 35.87], scale: 60000 },
    "인천광역시": { code: "23", center: [126.45, 37.45], scale: 45000 },
    "광주광역시": { code: "24", center: [126.85, 35.16], scale: 70000 },
    "대전광역시": { code: "25", center: [127.38, 36.35], scale: 70000 },
    "울산광역시": { code: "26", center: [129.31, 35.55], scale: 60000 },
    "세종특별자치시": { code: "29", center: [127.28, 36.48], scale: 80000 },
    "경기도": { code: "31", center: [127.25, 37.55], scale: 22000 },
    "강원특별자치도": { code: "32", center: [128.25, 37.75], scale: 13000 },
    "충청북도": { code: "33", center: [127.75, 36.85], scale: 18000 },
    "충청남도": { code: "34", center: [126.65, 36.55], scale: 18000 },
    "전북특별자치도": { code: "35", center: [127.15, 35.75], scale: 18000 },
    "전라남도": { code: "36", center: [126.95, 34.85], scale: 15000 },
    "경상북도": { code: "37", center: [128.75, 36.35], scale: 13000 },
    "경상남도": { code: "38", center: [128.25, 35.35], scale: 16000 },
    "제주특별자치도": { code: "39", center: [126.52, 33.38], scale: 35000 },
};

const getShortProvinceName = (name: string) => {
    if (!name) return "";
    if (name.includes("경상남도")) return "경남";
    if (name.includes("경상북도")) return "경북";
    if (name.includes("전라남도")) return "전남";
    if (name.includes("전라북도") || name.includes("전북특별")) return "전북";
    if (name.includes("충청남도")) return "충남";
    if (name.includes("충청북도")) return "충북";
    if (name.includes("강원")) return "강원";
    if (name.includes("제주")) return "제주";
    return name.substring(0, 2);
};

export default function RealPriceView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [mapLevel, setMapLevel] = useState<"national" | "provincial">("national");
    const [selectedProvince, setSelectedProvince] = useState<string>("서울특별시");
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>("강남구");
    const [mapZoom, setMapZoom] = useState<number>(1);
    const [hoveredGeo, setHoveredGeo] = useState<string | null>(null);

    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [aptList, setAptList] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [searchTerm, setSearchTerm] = useState<string>("");

    // 🚀 차트 기간 설정 State (기본 1년)
    const [chartPeriod, setChartPeriod] = useState<1 | 2 | 5 | 10>(1);

    // 🚀 수정됨: aptInfo 타입 추가
    const [detailData, setDetailData] = useState<{ chart: any[], txList: any[], hasMore: boolean, aptInfo?: any } | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [detailPage, setDetailPage] = useState<number>(1);
    const [isDetailMoreLoading, setIsDetailMoreLoading] = useState<boolean>(false);

    const fetchRealPriceList = async (pageNum: number) => {
        if (pageNum === 1) {
            setIsLoading(true);
            setAptList([]);
            setSelectedApt(null);
            setDetailData(null);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const params = new URLSearchParams();
            if (selectedProvince) params.append('province', selectedProvince);
            if (selectedDistrict) params.append('district', selectedDistrict);
            params.append('page', pageNum.toString());

            const response = await fetch(`/api/real-estate/list?${params.toString()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error("네트워크 응답 에러");

            const data = await response.json();

            setAptList(prev => {
                if (pageNum === 1) return data.aptList || [];
                const newItems = (data.aptList || []).filter(
                    (newItem: any) => !prev.some(existing => existing.name === newItem.name && existing.size === newItem.size)
                );
                return [...prev, ...newItems];
            });
            setHasMore(data.hasMore);
        } catch (error) {
            console.error(error);
        } finally {
            if (pageNum === 1) setIsLoading(false);
            else setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        setSearchTerm("");
        fetchRealPriceList(1);
    }, [selectedProvince, selectedDistrict]);

    const fetchAptDetail = async (apt: any, dPage: number) => {
        if (dPage === 1) {
            setIsDetailLoading(true);
        } else {
            setIsDetailMoreLoading(true);
        }

        try {
            const params = new URLSearchParams();
            params.append('aptName', apt.name);
            params.append('currentPrice', apt.price);
            params.append('aptSize', apt.size); // 🚀 [추가됨] 평형 정보를 서버로 쏴줍니다!
            params.append('page', dPage.toString());

            const response = await fetch(`/api/real-estate/detail?${params.toString()}`);
            const data = await response.json();

            if (dPage === 1) {
                setDetailData(data);
                setChartPeriod(1);
            } else {
                setDetailData(prev => prev ? {
                    ...prev,
                    txList: [...prev.txList, ...data.txList],
                    hasMore: data.hasMore
                } : null);
            }
        } catch (error) {
            console.error("단지 상세 통신 에러", error);
        } finally {
            setIsDetailLoading(false);
            setIsDetailMoreLoading(false);
        }
    };

    const handleAptClick = (apt: any) => {
        if (selectedApt?.id === apt.id) {
            setSelectedApt(null);
            setDetailData(null);
        } else {
            setSelectedApt(apt);
            setDetailData(null);
            setDetailPage(1);
            fetchAptDetail(apt, 1);
        }
    };

    const handleLoadMoreDetail = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextDPage = detailPage + 1;
        setDetailPage(nextDPage);
        fetchAptDetail(selectedApt, nextDPage);
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchRealPriceList(nextPage);
    };

    const handleProvinceClick = (provinceName: string) => {
        if (!provinceName) return;
        let formattedName = provinceName;
        if (provinceName === "강원도") formattedName = "강원특별자치도";
        if (provinceName === "전라북도") formattedName = "전북특별자치도";

        if (PROVINCE_INFO[formattedName]) {
            setSelectedProvince(formattedName);
            setMapLevel("provincial");
            setSelectedDistrict(null);
            setMapZoom(1);
        }
    };

    const handleBackToNational = () => {
        setMapLevel("national");
        setSelectedProvince("서울특별시");
        setSelectedDistrict("강남구");
        setMapZoom(1);
    };

    const filteredAptList = aptList.filter(apt =>
        apt?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 🚀 수정된 로직: 뼈대 철거! 빈 곳은 땡겨서 동일한 간격으로 정렬 (모바일 최적화)
    const getFilteredChartData = () => {
        if (!detailData?.chart || detailData.chart.length === 0) return [];

        const currentYear = new Date().getFullYear();
        const currentYearYY = parseInt(currentYear.toString().slice(-2), 10);

        // 1. 기간 필터링
        const periodFiltered = detailData.chart.filter((item: any) => {
            const dateStr = String(item.year || item.trade_date || '');
            const y = parseInt(dateStr.split(/[.-]/)[0], 10);
            const targetY = y > 2000 ? y - 2000 : y;
            return targetY >= (currentYearYY - chartPeriod);
        });

        // 🚨 데이터가 없으면 방어 (최소한의 과거 데이터 노출)
        const dataToProcess = periodFiltered.length > 0 ? periodFiltered : detailData.chart.slice(-20);

        // 2. 월평균/연평균 그룹화
        const grouped: Record<string, { sum: number, count: number }> = {};

        dataToProcess.forEach((item: any) => {
            const dateStr = String(item.year || item.trade_date || '');
            let key = "";

            if (chartPeriod <= 2) {
                // 월별 그룹화 (예: "2026.03")
                const parts = dateStr.split(/[.-]/);
                const y = parts[0].length === 4 ? parts[0] : `20${parts[0].slice(-2)}`;
                const m = parts[1] ? parts[1].padStart(2, '0') : "01";
                key = `${y}.${m}`;
            } else {
                // 연도별 그룹화 (예: "2026년")
                const y = dateStr.split(/[.-]/)[0];
                const fullY = y.length === 4 ? y : `20${y.slice(-2)}`;
                key = `${fullY}년`;
            }

            if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
            grouped[key].sum += parseFloat(item.price);
            grouped[key].count += 1;
        });

        // 3. 🚀 있는 데이터만 정렬해서 반환 (Recharts가 알아서 동일한 간격으로 분배함)
        return Object.entries(grouped)
            .map(([displayYear, data]) => ({
                displayYear,
                price: parseFloat((data.sum / data.count).toFixed(2)) // 평균가 계산
            }))
            .sort((a, b) => a.displayYear.localeCompare(b.displayYear));
    };

    const chartData = getFilteredChartData();

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto px-4 mt-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="w-full lg:w-[40%] sticky top-[80px] bg-white rounded-[24px] border border-[#E3E8EF] shadow-sm overflow-hidden">
                        <div className="h-[400px] lg:h-[600px] w-full bg-[#F1F5F9] flex items-center justify-center relative overflow-hidden">
                            {mapLevel === "provincial" && (
                                <button
                                    onClick={handleBackToNational}
                                    className="absolute top-4 left-4 p-2.5 bg-white/95 backdrop-blur-md border border-[#CBD5E1] rounded-xl text-[#475467] hover:text-[#172554] hover:shadow-md transition-all z-20 flex items-center gap-1 shadow-sm"
                                >
                                    <ArrowLeft size={16} strokeWidth={3} />
                                    <span className="text-[12px] font-black pr-1">전국지도</span>
                                </button>
                            )}

                            {mapLevel === "national" && (
                                <ComposableMap width={400} height={600} projection="geoMercator" projectionConfig={{ scale: 4000, center: [127.5, 35.1] }} className="w-full h-full animate-in fade-in duration-700">
                                    <ZoomableGroup minZoom={0.5} maxZoom={5} onMove={({ zoom }) => setMapZoom(zoom)}>
                                        <Geographies geography={KOREA_PROVINCES_URL}>
                                            {({ geographies }) => (
                                                <>
                                                    {geographies.map((geo) => {
                                                        const provinceName = geo.properties.name || geo.properties.CTP_KOR_NM || "";
                                                        const isSelected = provinceName ? selectedProvince.includes(provinceName.substring(0, 2)) : false;
                                                        return (
                                                            <Geography
                                                                key={geo.rsmKey}
                                                                geography={geo}
                                                                onClick={() => handleProvinceClick(provinceName)}
                                                                onMouseEnter={() => setHoveredGeo(geo.rsmKey)}
                                                                onMouseLeave={() => setHoveredGeo(null)}
                                                                style={{
                                                                    default: { fill: isSelected ? "#042fc9" : "#E2E8F0", stroke: "#CBD5E1", strokeWidth: 0.8, outline: "none", transition: "all 0.3s" },
                                                                    hover: { fill: "#042fc9", stroke: "#042fc9", strokeWidth: 1.5, outline: "none", cursor: "pointer" },
                                                                    pressed: { fill: "#172554", outline: "none" }
                                                                }}
                                                            />
                                                        )
                                                    })}
                                                    {hoveredGeo && (() => {
                                                        const targetGeo = geographies.find(g => g.rsmKey === hoveredGeo);
                                                        if (!targetGeo) return null;
                                                        const provinceName = targetGeo.properties.name || targetGeo.properties.CTP_KOR_NM || "";
                                                        const isSelected = provinceName ? selectedProvince.includes(provinceName.substring(0, 2)) : false;
                                                        return (
                                                            <Geography
                                                                key="hover-clone-national"
                                                                geography={targetGeo}
                                                                style={{ default: { fill: isSelected ? "#042fc9" : "#E2E8F0", stroke: "#ffffff", strokeWidth: 1.5, outline: "none", pointerEvents: "none", filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" } }}
                                                            />
                                                        );
                                                    })()}
                                                    {geographies.map((geo) => {
                                                        const provinceName = getShortProvinceName(geo.properties.name || geo.properties.CTP_KOR_NM || "");
                                                        const isGyeonggi = provinceName === "경기";
                                                        return (
                                                            <Marker key={`${geo.rsmKey}-label`} coordinates={geoCentroid(geo)}>
                                                                <text textAnchor="middle" x={isGyeonggi ? 20 / mapZoom : 0} y={isGyeonggi ? 25 / mapZoom : 3 / mapZoom} style={{ fontFamily: "var(--font-pretendard)", fontSize: `${11 / mapZoom}px`, fontWeight: 900, fill: selectedProvince.includes(provinceName.substring(0, 2)) ? "#ffffff" : "#64748B", pointerEvents: "none", textShadow: selectedProvince.includes(provinceName.substring(0, 2)) ? "0 0 5px rgba(0,0,0,0.8)" : "0 1px 2px rgba(255,255,255,0.8)", transition: "all 0.3s ease" }}>
                                                                    {provinceName}
                                                                </text>
                                                            </Marker>
                                                        );
                                                    })}
                                                </>
                                            )}
                                        </Geographies>
                                    </ZoomableGroup>
                                </ComposableMap>
                            )}

                            {mapLevel === "provincial" && selectedProvince && PROVINCE_INFO[selectedProvince] && (
                                <ComposableMap width={400} height={600} projection="geoMercator" projectionConfig={{ scale: PROVINCE_INFO[selectedProvince].scale * 0.85, center: PROVINCE_INFO[selectedProvince].center }} className="w-full h-full animate-in zoom-in-95 fade-in duration-700">
                                    <ZoomableGroup minZoom={0.5} maxZoom={8} onMove={({ zoom }) => setMapZoom(zoom)}>
                                        <Geographies geography={KOREA_MUNICIPALITIES_URL}>
                                            {({ geographies }) => {
                                                const filteredGeos = geographies.filter(geo => geo.properties.code.startsWith(PROVINCE_INFO[selectedProvince].code));
                                                return (
                                                    <>
                                                        {filteredGeos.map((geo) => {
                                                            const districtName = geo.properties.name || geo.properties.SIGUNGU_NM || "";
                                                            const isSelected = selectedDistrict === districtName || (!selectedDistrict && districtName === "강남구" && selectedProvince === "서울특별시");
                                                            return (
                                                                <Geography
                                                                    key={geo.rsmKey}
                                                                    geography={geo}
                                                                    onClick={() => setSelectedDistrict(districtName)}
                                                                    onMouseEnter={() => setHoveredGeo(geo.rsmKey)}
                                                                    onMouseLeave={() => setHoveredGeo(null)}
                                                                    style={{
                                                                        default: { fill: isSelected ? "#042fc9" : "#E2E8F0", stroke: isSelected ? "#ffffff" : "#CBD5E1", strokeWidth: isSelected ? 2 : 0.8, outline: "none", transition: "all 0.3s ease" },
                                                                        hover: { fill: isSelected ? "#042fc9" : "#93C5FD", stroke: isSelected ? "#ffffff" : "#CBD5E1", strokeWidth: isSelected ? 2 : 0.8, outline: "none", cursor: "pointer" },
                                                                        pressed: { fill: "#042fc9", outline: "none" }
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                        {hoveredGeo && (() => {
                                                            const targetGeo = filteredGeos.find(g => g.rsmKey === hoveredGeo);
                                                            if (!targetGeo) return null;
                                                            const districtName = targetGeo.properties.name || targetGeo.properties.SIGUNGU_NM || "";
                                                            const isSelected = selectedDistrict === districtName;
                                                            if (isSelected) return null;
                                                            return (
                                                                <Geography
                                                                    key="hover-clone-provincial"
                                                                    geography={targetGeo}
                                                                    style={{ default: { fill: "#93C5FD", stroke: "#ffffff", strokeWidth: 1.5, outline: "none", pointerEvents: "none", filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" } }}
                                                                />
                                                            );
                                                        })()}
                                                        {filteredGeos.map((geo) => {
                                                            const districtName = (geo.properties.name || geo.properties.SIGUNGU_NM || "").replace(/\s+/g, '');
                                                            const isSelected = selectedDistrict === districtName || (!selectedDistrict && districtName === "강남구" && selectedProvince === "서울특별시");
                                                            const baseFontSize = PROVINCE_INFO[selectedProvince].scale > 50000 ? 11 : 12;
                                                            return (
                                                                <Marker key={`${geo.rsmKey}-label`} coordinates={geoCentroid(geo)}>
                                                                    <text textAnchor="middle" y={3 / mapZoom} style={{ fontFamily: "var(--font-pretendard)", fontSize: `${baseFontSize / mapZoom}px`, fontWeight: isSelected ? 900 : 800, fill: isSelected ? "#ffffff" : "#1e293b", pointerEvents: "none", textShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.3)" : "0 0 4px rgba(255,255,255,0.9)", transition: "fill 0.3s ease" }}>
                                                                        {districtName}
                                                                    </text>
                                                                </Marker>
                                                            );
                                                        })}
                                                    </>
                                                );
                                            }}
                                        </Geographies>
                                    </ZoomableGroup>
                                </ComposableMap>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[60%] flex flex-col gap-4 relative min-h-[500px]">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h3 className="text-[18px] font-extrabold text-[#172554]">
                                {selectedProvince} <span className="text-[#042fc9]">{selectedDistrict || '전체'}</span> 실거래가
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="단지명 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-[#E3E8EF] rounded-full text-[13px] font-bold outline-none focus:border-[#042fc9] transition-colors"
                                />
                            </div>
                        </div>

                        {isLoading && (
                            <div className="absolute inset-0 top-[60px] bg-[#F5F7FA]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                                <Loader2 className="animate-spin text-[#042fc9] mb-3" size={40} />
                                <span className="text-[#172554] font-bold">국토교통부 실거래가 연동 중...</span>
                            </div>
                        )}

                        {!isLoading && aptList.length === 0 && (
                            <div className="w-full bg-white p-10 rounded-[20px] border border-[#E3E8EF] flex flex-col items-center justify-center text-center">
                                <Building2 size={48} className="text-[#CBD5E1] mb-4" />
                                <p className="text-[#475467] font-bold text-[15px]">해당 지역의 최근 거래 내역이 없습니다.</p>
                                <p className="text-[#94A3B8] text-[13px] mt-1">다른 지역을 선택하거나 과거 내역을 불러오세요.</p>
                                <button
                                    onClick={handleLoadMore}
                                    className="mt-6 px-5 py-2.5 bg-[#EEF2FF] text-[#042fc9] rounded-xl font-bold text-[14px] hover:bg-[#E0E7FF] transition-colors"
                                >
                                    과거 내역 탐색하기
                                </button>
                            </div>
                        )}

                        {!isLoading && aptList.length > 0 && filteredAptList.length === 0 && (
                            <div className="w-full bg-white p-10 rounded-[20px] border border-[#E3E8EF] flex flex-col items-center justify-center text-center">
                                <Search size={40} className="text-[#CBD5E1] mb-4" />
                                <p className="text-[#475467] font-bold text-[15px]">검색 결과가 없습니다.</p>
                                <p className="text-[#94A3B8] text-[13px] mt-1">과거 거래 내역을 더 불러오거나 단지명을 확인해주세요.</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            {filteredAptList.map((apt) => (
                                <div key={apt.id} className={`bg-white rounded-[20px] border transition-all duration-300 overflow-hidden ${selectedApt?.id === apt.id ? 'border-[#042fc9] shadow-md ring-2 ring-[#042fc9]/10' : 'border-[#E3E8EF] hover:border-[#CBD5E1] shadow-sm'}`}>
                                    <div
                                        className="p-5 cursor-pointer flex items-center justify-between"
                                        onClick={() => handleAptClick(apt)}
                                    >
                                        <div className="flex flex-col gap-1.5 w-[65%]">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="text-[16px] sm:text-[18px] font-black text-[#101828] truncate max-w-full">{apt.name}</h4>
                                                <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475467] text-[11px] font-bold rounded-md whitespace-nowrap shrink-0">{apt.size}</span>
                                            </div>
                                            <p className="text-[12px] font-medium text-[#94A3B8] truncate mt-0.5 mb-0.5">{apt.address || "상세 주소 불러오는 중"}</p>
                                            <div className="flex items-center gap-3 text-[12px] sm:text-[13px] font-semibold text-[#667085]">
                                                <span className="flex items-center gap-1 shrink-0"><Calendar size={14} /> {apt.date}</span>
                                                <span className="flex items-center gap-1 shrink-0"><Building2 size={14} /> {apt.floor}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <p className="text-[18px] sm:text-[22px] font-black text-[#172554] leading-none">{apt.price}</p>
                                            <div className={`flex items-center text-[11px] sm:text-[12px] font-bold ${apt.type === 'up' ? 'text-[#d40606]' : apt.type === 'down' ? 'text-[#042fc9]' : 'text-[#667085]'}`}>
                                                {apt.type === 'up' && <ArrowUpRight size={14} className="mr-0.5" />}
                                                {apt.type === 'down' && <ArrowDownRight size={14} className="mr-0.5" />}
                                                {apt.type === 'flat' && <Minus size={14} className="mr-0.5" />}
                                                {apt.change}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedApt?.id === apt.id && (
                                        <div className="px-5 pb-6 pt-4 border-t border-[#F1F5F9] bg-[#FAFAFA] animate-in slide-in-from-top-4 fade-in">
                                            {isDetailLoading ? (
                                                <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                    <Loader2 className="animate-spin text-[#042fc9]" size={32} />
                                                    <span className="text-[13px] font-bold text-[#64748B]">시세 데이터를 분석하고 있습니다...</span>
                                                </div>
                                            ) : detailData && (
                                                <>
                                                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#64748B] mb-4">
                                                        <MapPin size={16} className="shrink-0 text-[#042fc9]" /> {apt.address}
                                                    </div>
                                                    {/* 🚀 수정됨: 서버에서 받은 aptInfo 데이터를 연동하는 부분 */}
                                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                                        <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center border border-[#E3E8EF] shadow-sm">
                                                            <Building size={18} className="text-[#94A3B8] mb-1" />
                                                            <span className="text-[11px] font-bold text-[#64748B]">세대수</span>
                                                            <span className="text-[13px] font-black text-[#1E293B] mt-0.5">
                                                                {detailData.aptInfo?.total_households ? `${detailData.aptInfo.total_households.toLocaleString()}세대` : "정보 없음"}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center border border-[#E3E8EF] shadow-sm">
                                                            <Calendar size={18} className="text-[#94A3B8] mb-1" />
                                                            <span className="text-[11px] font-bold text-[#64748B]">준공년월</span>
                                                            <span className="text-[13px] font-black text-[#1E293B] mt-0.5">
                                                                {detailData.aptInfo?.completion_date || "정보 없음"}
                                                            </span>
                                                        </div>
                                                        <div className="bg-white rounded-xl p-3 flex flex-col items-center justify-center border border-[#E3E8EF] shadow-sm">
                                                            <Car size={18} className="text-[#94A3B8] mb-1" />
                                                            <span className="text-[11px] font-bold text-[#64748B]">주차대수</span>
                                                            <span className="text-[13px] font-black text-[#1E293B] mt-0.5">
                                                                {detailData.aptInfo?.parking_count ? `${detailData.aptInfo.parking_count}대` : "정보 없음"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                                        <h5 className="text-[14px] font-black text-[#172554] flex items-center gap-1.5">
                                                            <LineChartIcon size={16} className="text-[#042fc9]" />
                                                            단지 시세 추이
                                                        </h5>

                                                        <div className="flex items-center gap-1.5 bg-[#F1F5F9] p-1 rounded-lg">
                                                            {[1, 2, 5, 10].map((period) => (
                                                                <button
                                                                    key={period}
                                                                    onClick={() => setChartPeriod(period as 1 | 2 | 5 | 10)}
                                                                    className={`px-3 py-1 text-[12px] font-bold rounded-md transition-all ${chartPeriod === period
                                                                        ? 'bg-white text-[#042fc9] shadow-sm'
                                                                        : 'text-[#64748B] hover:text-[#1E293B]'
                                                                        }`}
                                                                >
                                                                    {period}년
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {chartData.length > 0 && (
                                                        <div className="h-[240px] w-full bg-white rounded-xl p-3 border border-[#E3E8EF] shadow-sm mb-6">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                                    <XAxis
                                                                        dataKey="displayYear"
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        tick={{ fontSize: 11, fill: '#667085' }}
                                                                        dy={10}
                                                                        minTickGap={20}
                                                                    />
                                                                    <YAxis
                                                                        domain={['auto', 'auto']}
                                                                        axisLine={false}
                                                                        tickLine={false}
                                                                        tick={{ fontSize: 11, fill: '#667085' }}
                                                                        tickFormatter={(val) => typeof val === 'number' ? val.toFixed(1) : val}
                                                                    />
                                                                    <RechartsTooltip
                                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                                        formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(1)}억` : value, "평균 실거래가"]}
                                                                    />
                                                                    <Line
                                                                        type="monotone"
                                                                        dataKey="price"
                                                                        stroke="#042fc9"
                                                                        strokeWidth={3}
                                                                        dot={{ r: 3, strokeWidth: 2, fill: '#fff' }}
                                                                        activeDot={{ r: 6, fill: '#042fc9' }}
                                                                        connectNulls={true}
                                                                    />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    )}

                                                    <div className="mb-2">
                                                        <h5 className="text-[14px] font-black text-[#172554] mb-3 flex items-center gap-1.5">
                                                            <Calendar size={16} className="text-[#042fc9]" /> 최근 실거래 내역
                                                        </h5>
                                                        <div className="bg-white rounded-xl border border-[#E3E8EF] shadow-sm overflow-hidden flex flex-col">
                                                            <div className="flex items-center justify-between p-4 border-b border-[#E3E8EF] bg-[#EEF2FF]/60">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[12px] font-bold text-[#042fc9]">최신 거래 ({apt.date})</span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-0.5 bg-[#042fc9] text-white text-[11px] font-bold rounded">매매</span>
                                                                        <span className="text-[13px] font-bold text-[#475467]">{apt.floor}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[18px] font-black text-[#172554]">{apt.price}</span>
                                                                    <span className={`text-[11px] font-bold ${apt.type === 'up' ? 'text-[#d40606]' : apt.type === 'down' ? 'text-[#042fc9]' : 'text-[#667085]'}`}>
                                                                        {apt.change}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            {detailData.txList.map((tx: any, idx: number) => (
                                                                <div key={idx} className="flex items-center justify-between p-4 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="text-[12px] font-bold text-[#64748B]">{tx.date}</span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#64748B] text-[11px] font-bold rounded">{tx.type}</span>
                                                                            <span className="text-[13px] font-bold text-[#475467]">{tx.floor}</span>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[16px] font-black text-[#1E293B]">{tx.price}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {detailData.hasMore && (
                                                            <button
                                                                onClick={handleLoadMoreDetail}
                                                                disabled={isDetailMoreLoading}
                                                                className="w-full py-3 mt-3 text-[13px] font-bold text-[#042fc9] bg-[#FAFAFA] border border-[#E3E8EF] rounded-xl hover:bg-[#F1F5F9] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                                            >
                                                                {isDetailMoreLoading ? (
                                                                    <><Loader2 size={14} className="animate-spin" /> 불러오는 중...</>
                                                                ) : (
                                                                    <><ChevronDown size={14} /> 과거 거래 내역 8개 더보기</>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {hasMore && aptList.length > 0 && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="w-full py-4 mt-2 mb-4 bg-white border border-[#E3E8EF] rounded-[20px] text-[14px] font-bold text-[#042fc9] hover:bg-[#EEF2FF] hover:border-[#042fc9]/30 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <><Loader2 size={16} className="animate-spin" /> 리스트를 더 불러오는 중...</>
                                    ) : (
                                        <>해당 지역 리스트 더보기 <ChevronDown size={16} /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}