"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Map as MapIcon, BarChart3, Users, Home, Activity, Percent, ArrowLeft } from "lucide-react";
// 🚀 1. 지도 및 라벨링 라이브러리 불러오기
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo"; // 지역 중앙점을 계산해주는 마법의 도구

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

// 🎨 🚀 2. 지역별 구분을 위한 연하고 감각적인 랜덤 색상 팔레트 세팅
const REGION_COLORS = [
    "#EFF6FF", "#F0FDF4", "#FFFBEB", "#FDF2F8", "#F5F3FF", // 블루, 그린, 옐로우, 핑크, 퍼플 연한톤
    "#ECFDF5", "#FFF7ED", "#F0FDFA", "#FAF5FF", "#F0F9FF"
];

// 이름을 기준으로 색상을 고정하는 함수 (새로고침해도 색이 안 바뀌게 함)
const getRegionColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    const index = Math.abs(hash) % REGION_COLORS.length;
    return REGION_COLORS[index];
};

export default function TransactionView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [mapLevel, setMapLevel] = useState<"national" | "provincial">("national");
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

    const summaryData = {
        national: { volume: "42,150", change: "+5.2", isUp: true },
        provincial: { volume: "3,240", change: "-1.8", isUp: false }
    };

    const handleProvinceClick = (province: string) => {
        let formattedName = province;
        if (province === "강원도") formattedName = "강원특별자치도";
        if (province === "전라북도") formattedName = "전북특별자치도";

        if (PROVINCE_INFO[formattedName]) {
            setSelectedProvince(formattedName);
            setMapLevel("provincial");
            setSelectedDistrict(null);
        }
    };

    const handleBackToNational = () => {
        setMapLevel("national");
        setSelectedProvince(null);
        setSelectedDistrict(null);
    };

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="max-w-5xl mx-auto px-4 mt-6">

                {/* 1단계: 마켓 서머리 */}
                <div className="mb-6 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[20px] font-black text-[#172554] flex items-center gap-2">
                            <Activity className="text-[#fc670a]" size={22} />
                            {mapLevel === "national" ? "전국 부동산 시장 온도" : `${selectedProvince} 시장 온도`}
                        </h2>
                        <span className="text-[12px] font-bold text-[#94A3B8]">2026년 3월 기준</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-[#E3E8EF] shadow-sm">
                            <p className="text-[12px] font-bold text-[#667085] mb-1">전국 아파트 거래량</p>
                            <div className="flex items-end justify-between">
                                <p className="text-[22px] font-black text-[#101828]">{summaryData.national.volume}<span className="text-[14px] font-bold ml-1">건</span></p>
                                <span className={`flex items-center text-[12px] font-bold ${summaryData.national.isUp ? "text-[#d40606]" : "text-[#042fc9]"}`}>
                                    {summaryData.national.isUp ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                    {summaryData.national.change}%
                                </span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-[#E3E8EF] shadow-sm ring-1 ring-[#172554]/5">
                            <p className="text-[12px] font-bold text-[#667085] mb-1">
                                {mapLevel === "national" ? "전월 대비 최대 상승 지역" : `${selectedProvince} 거래량`}
                            </p>
                            <div className="flex items-end justify-between">
                                <p className="text-[22px] font-black text-[#101828]">
                                    {mapLevel === "national" ? "경기도" : summaryData.provincial.volume}
                                    {mapLevel !== "national" && <span className="text-[14px] font-bold ml-1">건</span>}
                                </p>
                                <span className={`flex items-center text-[12px] font-bold ${summaryData.provincial.isUp ? "text-[#d40606]" : "text-[#042fc9]"}`}>
                                    {summaryData.provincial.isUp ? <TrendingUp size={14} className="mr-0.5" /> : <TrendingDown size={14} className="mr-0.5" />}
                                    {summaryData.provincial.change}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2단계: 인터랙티브 구역별 지도 (업그레이드 완료! 🚀) */}
                <div className="bg-white rounded-[24px] border border-[#E3E8EF] shadow-sm mb-6 overflow-hidden relative transition-all duration-500">
                    <div className="p-4 border-b border-[#F2F4F7] flex justify-between items-center bg-[#F8FAFC]">
                        <div className="flex items-center gap-2">
                            {mapLevel === "provincial" && (
                                <button onClick={handleBackToNational} className="p-1.5 bg-white border border-[#E3E8EF] rounded-lg text-[#667085] hover:text-[#172554] hover:bg-[#EEF2F6] transition-colors z-10">
                                    <ArrowLeft size={16} strokeWidth={3} />
                                </button>
                            )}
                            <h3 className="text-[15px] font-black text-[#172554] flex items-center gap-2">
                                <MapIcon size={18} className="text-[#06bf0c]" />
                                {mapLevel === "national" ? "대한민국 전국 실거래 지도" : `${selectedProvince} 상세 지도`}
                            </h3>
                        </div>
                        <div className="text-[11px] font-bold text-[#667085] bg-white px-2 py-1 rounded border border-[#E3E8EF] z-10">
                            {mapLevel === "national" ? "시/도를 클릭하세요" : selectedDistrict ? selectedDistrict : "구/군을 클릭하세요"}
                        </div>
                    </div>

                    {/* SVG 지도 캔버스 영역 */}
                    <div className="h-[480px] md:h-[580px] w-full bg-[#F1F5F9] flex items-center justify-center relative overflow-hidden p-3">

                        {/* 🇰🇷 전국 지도 모드 (1단계 + 라벨 + 랜덤색상) */}
                        {mapLevel === "national" && (
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: 5800,
                                    center: [127.7, 36.1] // 라벨 보이도록 미세조정
                                }}
                                className="w-full h-full animate-in fade-in duration-700"
                            >
                                <Geographies geography={KOREA_PROVINCES_URL}>
                                    {({ geographies }) => (
                                        <>
                                            {geographies.map((geo) => {
                                                const provinceName = geo.properties.name || geo.properties.CTP_KOR_NM;
                                                return (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        onClick={() => handleProvinceClick(provinceName)}
                                                        style={{
                                                            default: {
                                                                // 🚀 [업그레이드] 구획 구분을 위한 연한 랜덤 색상 적용!
                                                                fill: getRegionColor(provinceName),
                                                                stroke: "#CBD5E1",
                                                                strokeWidth: 0.8,
                                                                outline: "none",
                                                                transition: "fill 0.3s ease"
                                                            },
                                                            hover: { fill: "#d40606", stroke: "#ffffff", strokeWidth: 1.5, outline: "none", cursor: "pointer", transition: "all 0.3s ease" },
                                                            pressed: { fill: "#fc670a", outline: "none" }
                                                        }}
                                                    />
                                                );
                                            })}
                                            {/* 🚀 [업그레이드] 전국 지도 위에 시/도 이름표 붙이기! */}
                                            {geographies.map((geo) => {
                                                const provinceName = (geo.properties.name || geo.properties.CTP_KOR_NM || "").substring(0, 2); // '서울특별시' -> '서울'
                                                const centroid = geoCentroid(geo); // 💡 d3-geo로 중앙 좌표 계산

                                                // 세종시는 좁아서 라벨 제외하거나 위치 조정 필요 (일단 표시)
                                                return (
                                                    <Marker key={`${geo.rsmKey}-label`} coordinates={centroid}>
                                                        <text
                                                            textAnchor="middle"
                                                            y={3} // 글자를 살짝 아래로
                                                            style={{
                                                                fontFamily: "var(--font-pretendard)",
                                                                fontSize: "11px",
                                                                fontWeight: 900,
                                                                fill: "#334155", // 진한 회색 
                                                                pointerEvents: "none", // 글자 클릭 안되게 (지도 클릭 방해 금지)
                                                                textShadow: "0 0 4px rgba(255,255,255,0.7)" // 글자 잘 보이게 흰색 그림자
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
                            </ComposableMap>
                        )}

                        {/* 🏙️ 시/도 상세 줌인 모드 (2단계 - 구/군 그리기 + 라벨 + 랜덤색상!) */}
                        {mapLevel === "provincial" && selectedProvince && PROVINCE_INFO[selectedProvince] && (
                            <ComposableMap
                                projection="geoMercator"
                                projectionConfig={{
                                    scale: PROVINCE_INFO[selectedProvince].scale,
                                    center: PROVINCE_INFO[selectedProvince].center
                                }}
                                className="w-full h-full animate-in zoom-in-95 fade-in duration-700"
                            >
                                <Geographies geography={KOREA_MUNICIPALITIES_URL}>
                                    {({ geographies }) => {
                                        // 🚀 먼저 선택한 시/도의 구/군만 필터링!
                                        const filteredGeos = geographies.filter(geo => geo.properties.code.startsWith(PROVINCE_INFO[selectedProvince].code));

                                        return (
                                            <>
                                                {filteredGeos.map((geo) => {
                                                    const districtName = geo.properties.name || geo.properties.SIGUNGU_NM;
                                                    const isSelected = selectedDistrict === districtName;

                                                    return (
                                                        <Geography
                                                            key={geo.rsmKey}
                                                            geography={geo}
                                                            onClick={() => setSelectedDistrict(isSelected ? null : districtName)}
                                                            style={{
                                                                default: {
                                                                    // 🚀 [업그레이드] 구획 구분을 위한 연한 랜덤 색상 적용 + 선택 시 컬러!
                                                                    fill: isSelected ? "#fc670a" : getRegionColor(districtName),
                                                                    stroke: isSelected ? "#ffffff" : "#94A3B8",
                                                                    strokeWidth: isSelected ? 1.5 : 0.5,
                                                                    outline: "none",
                                                                    transition: "all 0.3s ease"
                                                                },
                                                                hover: { fill: "#d40606", stroke: "#ffffff", strokeWidth: 1.5, outline: "none", cursor: "pointer", transition: "all 0.3s ease" },
                                                                pressed: { fill: "#042fc9", outline: "none" }
                                                            }}
                                                        />
                                                    );
                                                })}
                                                {/* 🚀 [업그레이드] 상세 지도 위에 구/군 이름표 붙이기! */}
                                                {filteredGeos.map((geo) => {
                                                    const districtName = (geo.properties.name || geo.properties.SIGUNGU_NM || "").replace(/\s+/g, ''); // 이름 공백 제거
                                                    const centroid = geoCentroid(geo); // 💡 중앙 좌표 계산
                                                    const isSelected = selectedDistrict === districtName;

                                                    // 글자 폰트 크기를 지역 넓이에 따라 유동적으로 조절하면 좋지만 일단 고정
                                                    const fontSize = PROVINCE_INFO[selectedProvince].scale > 50000 ? "11px" : "12px";

                                                    return (
                                                        <Marker key={`${geo.rsmKey}-label`} coordinates={centroid}>
                                                            <text
                                                                textAnchor="middle"
                                                                y={3}
                                                                style={{
                                                                    fontFamily: "var(--font-pretendard)",
                                                                    fontSize: fontSize,
                                                                    fontWeight: isSelected ? 900 : 800,
                                                                    fill: isSelected ? "#ffffff" : "#1e293b", // 선택되면 흰색, 아니면 네이비
                                                                    pointerEvents: "none",
                                                                    textShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.3)" : "0 0 3px rgba(255,255,255,0.8)",
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
                            </ComposableMap>
                        )}
                    </div>
                </div>

                {/* 3단계: 5대 핵심 지표 융합 분석 (원본 유지) */}
                {selectedDistrict && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-6 fade-in duration-500">
                        <h3 className="text-[22px] font-black text-[#172554] ml-1 flex items-center gap-2">
                            📍 {selectedProvince} {selectedDistrict} <span className="text-[#fc670a]">인사이트 리포트</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-3">
                                    <BarChart3 size={16} className="text-[#042fc9]" /> 거래량 강도
                                </h4>
                                <div className="h-[140px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D0D5DD] flex items-center justify-center">
                                    <span className="text-[#98A2B3] text-[12px] font-bold">막대 차트 영역</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-3">
                                    <Home size={16} className="text-[#06bf0c]" /> 향후 3년 공급량 진단
                                </h4>
                                <div className="h-[140px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D0D5DD] flex items-center justify-center">
                                    <span className="text-[#98A2B3] text-[12px] font-bold">누적 공급 차트 영역</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-3">
                                    <Users size={16} className="text-[#fc670a]" /> 인구 순이동 흐름
                                </h4>
                                <div className="h-[140px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D0D5DD] flex items-center justify-center">
                                    <span className="text-[#98A2B3] text-[12px] font-bold">방사형/플로우 차트 영역</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-[20px] border border-[#E3E8EF] shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5 mb-3">
                                    <Percent size={16} className="text-[#d40606]" /> 전세가율 & 갭 현황
                                </h4>
                                <div className="h-[140px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#D0D5DD] flex items-center justify-center">
                                    <span className="text-[#98A2B3] text-[12px] font-bold">선/면적 겹침 차트 영역</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}