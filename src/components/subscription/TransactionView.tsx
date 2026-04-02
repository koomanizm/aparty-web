"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Map as MapIcon, BarChart3, Users, Home, Activity, Percent, ArrowLeft, Info, Loader2, ArrowRight } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

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

const FINE_TUNED_PASTEL_COLORS = {
    level7: "#e55353",
    level6: "#f97316",
    level5: "#facc15",
    level4: "#4ade80",
    level3: "#38bdf8",
    level2: "#4f8ae9",
    level1: "#6674f4",
};

// 🚀 [해결] 지도에 뜰 대한민국의 올바른 도 단위 약칭 변환기!
const getShortProvinceName = (name: string) => {
    if (name.includes("경상남도")) return "경남";
    if (name.includes("경상북도")) return "경북";
    if (name.includes("전라남도")) return "전남";
    if (name.includes("전라북도") || name.includes("전북특별")) return "전북";
    if (name.includes("충청남도")) return "충남";
    if (name.includes("충청북도")) return "충북";
    if (name.includes("강원")) return "강원";
    if (name.includes("제주")) return "제주";
    return name.substring(0, 2); // 서울, 경기, 부산 등은 그대로 앞 두 글자
};

export default function TransactionView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [mapLevel, setMapLevel] = useState<"national" | "provincial">("national");
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const [mapZoom, setMapZoom] = useState<number>(1);
    const [hoveredGeo, setHoveredGeo] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
    const [volumeData, setVolumeData] = useState<any[]>([]);
    const [supplyData, setSupplyData] = useState<any[]>([]);
    const [populationData, setPopulationData] = useState<any[]>([]);
    const [gapData, setGapData] = useState<any[]>([]);

    const provinceVolumeChanges = [
        { name: "서울", change: 5.2 }, { name: "경기", change: 7.1 },
        { name: "인천", change: -1.8 }, { name: "부산", change: 2.3 },
        { name: "대구", change: -3.5 }, { name: "대전", change: 1.1 },
        { name: "광주", change: 0.5 }, { name: "울산", change: -2.1 },
        { name: "세종", change: 8.5 }, { name: "강원", change: 1.9 },
        { name: "충북", change: 0.8 }, { name: "충남", change: -0.2 },
        { name: "전북", change: 2.0 }, { name: "전남", change: 1.3 },
        { name: "경북", change: -1.5 }, { name: "경남", change: 3.1 },
        { name: "제주", change: -0.9 }
    ];

    useEffect(() => {
        const fetchRealEstateData = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedProvince) params.append('province', selectedProvince);
                if (selectedDistrict) params.append('district', selectedDistrict);

                const response = await fetch(`/api/real-estate?${params.toString()}`, { cache: 'no-store' });
                if (!response.ok) throw new Error("네트워크 응답 에러");

                const data = await response.json();

                setHeatmapData(data.heatmapData || {});
                setVolumeData(data.volumeData || []);
                setSupplyData(data.supplyData || []);
                setPopulationData(data.populationData || []);
                setGapData(data.gapData || []);

            } catch (error) {
                console.error("데이터 통신 에러:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRealEstateData();
    }, [mapLevel, selectedProvince, selectedDistrict]);

    const getDynamicColor = (name: string) => {
        let value = heatmapData[name];

        if (value === undefined) {
            const foundKey = Object.keys(heatmapData).find(k => name.includes(k) || k.includes(name));
            if (foundKey) {
                value = heatmapData[foundKey];
            } else {
                let hash = 0;
                for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
                value = (Math.abs(hash) % 30) - 15;
            }
        }

        if (value >= 10) return FINE_TUNED_PASTEL_COLORS.level7;
        if (value >= 5) return FINE_TUNED_PASTEL_COLORS.level6;
        if (value > 0) return FINE_TUNED_PASTEL_COLORS.level5;
        if (value === 0) return FINE_TUNED_PASTEL_COLORS.level4;
        if (value > -5) return FINE_TUNED_PASTEL_COLORS.level3;
        if (value > -10) return FINE_TUNED_PASTEL_COLORS.level2;
        return FINE_TUNED_PASTEL_COLORS.level1;
    };

    const handleProvinceClick = (province: string) => {
        let formattedName = province;
        if (province === "강원도") formattedName = "강원특별자치도";
        if (province === "전라북도") formattedName = "전북특별자치도";

        if (PROVINCE_INFO[formattedName]) {
            setSelectedProvince(formattedName);
            setMapLevel("provincial");
            setSelectedDistrict(null);
            setMapZoom(1);
        }
    };

    const handleBackToNational = () => {
        setMapLevel("national");
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setMapZoom(1);
    };

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto px-4 mt-6">

                <div className="flex flex-col md:flex-row gap-4 mb-6 items-stretch">
                    <div className="w-full md:w-1/4 bg-white p-4 rounded-2xl border border-[#E3E8EF] shadow-sm relative overflow-hidden flex flex-col justify-center">
                        {isLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="animate-spin text-[#d40606]" size={20} /></div>}
                        <p className="text-[12px] font-bold text-[#667085] mb-1">전국 아파트 거래량 종합</p>
                        <div className="flex items-end justify-between">
                            <p className="text-[24px] font-black text-[#101828] leading-none">42,150<span className="text-[14px] font-bold ml-1">건</span></p>
                            <span className="flex items-center text-[12px] font-bold text-[#d40606]"><TrendingUp size={14} className="mr-0.5" />+5.2%</span>
                        </div>
                    </div>

                    <div className="w-full md:w-3/4 bg-white p-4 rounded-2xl border border-[#E3E8EF] shadow-sm relative overflow-hidden flex items-center">
                        {isLoading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center"><Loader2 className="animate-spin text-[#042fc9]" size={24} /></div>}

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-x-2 gap-y-2 w-full">
                            {provinceVolumeChanges.map((prov) => {
                                const isUp = prov.change > 0;
                                const isDown = prov.change < 0;
                                return (
                                    <div key={prov.name} className="flex items-center justify-between gap-1 px-2.5 py-1.5 border border-[#E3E8EF] rounded-full bg-[#F9FAFB] hover:border-[#CBD5E1] transition-colors cursor-pointer">
                                        <span className="text-[11px] font-bold text-[#344054] truncate">{prov.name}</span>
                                        <div className={`flex items-center text-[10px] font-black ${isUp ? 'text-[#d40606]' : isDown ? 'text-[#042fc9]' : 'text-[#667085]'}`}>
                                            {isUp && <TrendingUp size={10} strokeWidth={3} />}
                                            {isDown && <TrendingDown size={10} strokeWidth={3} />}
                                            {prov.change.toFixed(1)}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    <div className="w-full lg:w-[40%] sticky top-[80px] bg-white rounded-[24px] border border-[#E3E8EF] shadow-sm overflow-hidden transition-all duration-500 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-30 flex flex-col items-center justify-center">
                                <Loader2 className="animate-spin text-[#172554] mb-2" size={32} />
                                <span className="text-[#172554] font-bold text-[14px]">공공데이터 API 통신 중...</span>
                            </div>
                        )}
                        <div className="h-[350px] md:h-[450px] lg:h-[600px] w-full bg-[#F1F5F9] flex items-center justify-center relative overflow-hidden">

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
                                                        const provinceName = geo.properties.name || geo.properties.CTP_KOR_NM;
                                                        const color = getDynamicColor(provinceName);
                                                        return (
                                                            <Geography
                                                                key={geo.rsmKey}
                                                                geography={geo}
                                                                onClick={() => handleProvinceClick(provinceName)}
                                                                onMouseEnter={() => setHoveredGeo(geo.rsmKey)}
                                                                onMouseLeave={() => setHoveredGeo(null)}
                                                                style={{
                                                                    default: { fill: color, stroke: "#CBD5E1", strokeWidth: 0.8, outline: "none", transition: "fill 0.3s ease" },
                                                                    hover: { fill: color, stroke: "#CBD5E1", strokeWidth: 0.8, outline: "none", cursor: "pointer" },
                                                                    pressed: { fill: color, outline: "none" }
                                                                }}
                                                            />
                                                        );
                                                    })}

                                                    {hoveredGeo && (() => {
                                                        const targetGeo = geographies.find(g => g.rsmKey === hoveredGeo);
                                                        if (!targetGeo) return null;
                                                        const geoName = targetGeo.properties.name || targetGeo.properties.CTP_KOR_NM;
                                                        const color = getDynamicColor(geoName);
                                                        return (
                                                            <Geography
                                                                key="hover-clone-national"
                                                                geography={targetGeo}
                                                                style={{
                                                                    default: {
                                                                        fill: color,
                                                                        stroke: "#ffffff",
                                                                        strokeWidth: 1.5,
                                                                        outline: "none",
                                                                        pointerEvents: "none",
                                                                        filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))"
                                                                    }
                                                                }}
                                                            />
                                                        );
                                                    })()}

                                                    {geographies.map((geo) => {
                                                        // 🚀 [해결] 멍청한 substring(0,2) 대신 똑똑한 약칭 변환기 사용!
                                                        const provinceName = getShortProvinceName(geo.properties.name || geo.properties.CTP_KOR_NM || "");

                                                        const isGyeonggi = provinceName === "경기";
                                                        const textX = isGyeonggi ? 20 / mapZoom : 0;
                                                        const textY = isGyeonggi ? 25 / mapZoom : 3 / mapZoom;

                                                        return (
                                                            <Marker key={`${geo.rsmKey}-label`} coordinates={geoCentroid(geo)}>
                                                                <text
                                                                    textAnchor="middle"
                                                                    x={textX}
                                                                    y={textY}
                                                                    style={{
                                                                        fontFamily: "var(--font-pretendard)",
                                                                        fontSize: `${11 / mapZoom}px`,
                                                                        fontWeight: 900,
                                                                        fill: "#ffffff",
                                                                        pointerEvents: "none",
                                                                        textShadow: "0 0 5px rgba(0,0,0,0.8)"
                                                                    }}
                                                                >
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
                                                            const districtName = geo.properties.name || geo.properties.SIGUNGU_NM;
                                                            const isSelected = selectedDistrict === districtName;
                                                            const color = getDynamicColor(districtName);
                                                            return (
                                                                <Geography
                                                                    key={geo.rsmKey}
                                                                    geography={geo}
                                                                    onClick={() => setSelectedDistrict(isSelected ? null : districtName)}
                                                                    onMouseEnter={() => setHoveredGeo(geo.rsmKey)}
                                                                    onMouseLeave={() => setHoveredGeo(null)}
                                                                    style={{
                                                                        default: { fill: isSelected ? "#042fc9" : color, stroke: isSelected ? "#ffffff" : "#CBD5E1", strokeWidth: isSelected ? 2 : 0.8, outline: "none", transition: "all 0.3s ease" },
                                                                        hover: { fill: isSelected ? "#042fc9" : color, stroke: isSelected ? "#ffffff" : "#CBD5E1", strokeWidth: isSelected ? 2 : 0.8, outline: "none", cursor: "pointer" },
                                                                        pressed: { fill: "#042fc9", outline: "none" }
                                                                    }}
                                                                />
                                                            );
                                                        })}

                                                        {hoveredGeo && (() => {
                                                            const targetGeo = filteredGeos.find(g => g.rsmKey === hoveredGeo);
                                                            if (!targetGeo) return null;
                                                            const districtName = targetGeo.properties.name || targetGeo.properties.SIGUNGU_NM;
                                                            if (selectedDistrict === districtName) return null;
                                                            const color = getDynamicColor(districtName);
                                                            return (
                                                                <Geography
                                                                    key="hover-clone-provincial"
                                                                    geography={targetGeo}
                                                                    style={{
                                                                        default: {
                                                                            fill: color,
                                                                            stroke: "#ffffff",
                                                                            strokeWidth: 1.5,
                                                                            outline: "none",
                                                                            pointerEvents: "none",
                                                                            filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.4))"
                                                                        }
                                                                    }}
                                                                />
                                                            );
                                                        })()}

                                                        {filteredGeos.map((geo) => {
                                                            const districtName = (geo.properties.name || geo.properties.SIGUNGU_NM || "").replace(/\s+/g, '');
                                                            const isSelected = selectedDistrict === districtName;
                                                            const baseFontSize = PROVINCE_INFO[selectedProvince].scale > 50000 ? 11 : 12;
                                                            return (
                                                                <Marker key={`${geo.rsmKey}-label`} coordinates={geoCentroid(geo)}>
                                                                    <text
                                                                        textAnchor="middle"
                                                                        y={3 / mapZoom}
                                                                        style={{
                                                                            fontFamily: "var(--font-pretendard)",
                                                                            fontSize: `${baseFontSize / mapZoom}px`,
                                                                            fontWeight: isSelected ? 900 : 800,
                                                                            fill: isSelected ? "#ffffff" : "#1e293b",
                                                                            pointerEvents: "none",
                                                                            textShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.3)" : "0 0 4px rgba(255,255,255,0.9)",
                                                                            transition: "fill 0.3s ease, font-weight 0.3s ease"
                                                                        }}
                                                                    >
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

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] max-w-[280px] bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-md border border-[#E3E8EF] z-20 animate-in slide-in-from-bottom-4">
                                <div className="flex justify-between items-center mb-2 px-1">
                                    <span className="text-[10px] font-bold text-[#6674f4]">감소</span>
                                    <span className="text-[10px] font-black text-[#172554]">거래량</span>
                                    <span className="text-[10px] font-bold text-[#e55353]">증가</span>
                                </div>
                                <div
                                    className="h-2.5 w-full rounded-full shadow-inner"
                                    style={{ background: 'linear-gradient(to right, #6674f4, #4f8ae9, #38bdf8, #4ade80, #facc15, #f97316, #e55353)' }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[60%] flex flex-col gap-4">
                        <div className="space-y-4 animate-in slide-in-from-right-8 fade-in duration-500">

                            <h3 className="text-[22px] font-black text-[#172554] flex items-center gap-2 px-2">
                                {mapLevel === "national" ? (
                                    <>📍 대한민국 <span className="text-[#042fc9]">전국 종합</span> 인사이트</>
                                ) : (
                                    <>📍 {selectedProvince} <span className="text-[#042fc9]">{selectedDistrict || '전체'}</span> 인사이트</>
                                )}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                                {isLoading && <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-30 flex items-center justify-center rounded-[20px]"><Loader2 className="animate-spin text-[#172554]" size={40} /></div>}

                                <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm">
                                    <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-4">
                                        <BarChart3 size={16} className="text-[#fc670a]" /> 최근 5개월 거래량 강도
                                    </h4>
                                    <div className="h-[180px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} />
                                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Bar dataKey="volume" fill="#fc670a" radius={[4, 4, 0, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm">
                                    <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-4">
                                        <Percent size={16} className="text-[#042fc9]" /> 매매/전세가 추이 (억)
                                    </h4>
                                    <div className="h-[180px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={gapData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={10} />
                                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} tickFormatter={(val) => typeof val === 'number' ? val.toFixed(1) : val} />
                                                <RechartsTooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(1)}억` : value, undefined]}
                                                />
                                                <Line type="monotone" dataKey="price" name="매매가" stroke="#042fc9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                                <Line type="monotone" dataKey="jeonse" name="전세가" stroke="#d40606" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm md:col-span-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5">
                                            <Home size={16} className="text-[#06bf0c]" /> 향후 입주 물량 vs 적정 수요
                                        </h4>
                                        <span className="text-[11px] font-bold px-2 py-1 bg-[#F0FDF4] text-[#06bf0c] rounded-md">공급부족 예상</span>
                                    </div>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={supplyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={10} />
                                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} />
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Bar yAxisId="left" dataKey="supply" name="입주예정(호)" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={40} />
                                                <Line yAxisId="left" type="monotone" dataKey="demand" name="적정수요" stroke="#06bf0c" strokeWidth={3} dot={false} strokeDasharray="5 5" />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm md:col-span-2">
                                    <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-4">
                                        <Users size={16} className="text-[#172554]" /> 최근 5개월 인구 순이동 (전입-전출)
                                    </h4>
                                    <div className="h-[200px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={populationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#042fc9" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#042fc9" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} />
                                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                <Area type="monotone" dataKey="net" stroke="#042fc9" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}