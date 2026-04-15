"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    Building2,
    Calendar,
    LineChart as LineChartIcon,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Loader2,
    ArrowLeft,
    ChevronDown,
    MapPin,
    Building,
    Car,
    Sparkles,
    ParkingCircle,
    SlidersHorizontal,
    BarChart3,
    BadgeDollarSign,
} from "lucide-react";
import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from "recharts";

const KOREA_PROVINCES_URL =
    "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo_simple.json";
const KOREA_MUNICIPALITIES_URL =
    "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json";

const PROVINCE_INFO: Record<
    string,
    { code: string; center: [number, number]; scale: number }
> = {
    서울특별시: { code: "11", center: [126.98, 37.56], scale: 60000 },
    부산광역시: { code: "21", center: [129.07, 35.18], scale: 60000 },
    대구광역시: { code: "22", center: [128.6, 35.87], scale: 60000 },
    인천광역시: { code: "23", center: [126.45, 37.45], scale: 45000 },
    광주광역시: { code: "24", center: [126.85, 35.16], scale: 70000 },
    대전광역시: { code: "25", center: [127.38, 36.35], scale: 70000 },
    울산광역시: { code: "26", center: [129.31, 35.55], scale: 60000 },
    세종특별자치시: { code: "29", center: [127.28, 36.48], scale: 80000 },
    경기도: { code: "31", center: [127.25, 37.55], scale: 22000 },
    강원특별자치도: { code: "32", center: [128.25, 37.75], scale: 13000 },
    충청북도: { code: "33", center: [127.75, 36.85], scale: 18000 },
    충청남도: { code: "34", center: [126.65, 36.55], scale: 18000 },
    전북특별자치도: { code: "35", center: [127.15, 35.75], scale: 18000 },
    전라남도: { code: "36", center: [126.95, 34.85], scale: 15000 },
    경상북도: { code: "37", center: [128.75, 36.35], scale: 13000 },
    경상남도: { code: "38", center: [128.25, 35.35], scale: 16000 },
    제주특별자치도: { code: "39", center: [126.52, 33.38], scale: 35000 },
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

const colorByChangeType = (type: string) => {
    if (type === "up") return "text-[#E11D48]";
    if (type === "down") return "text-[#2563EB]";
    return "text-[#94A3B8]";
};

// 면적(㎡)을 평수로 변환하여 예쁘게 보여주는 헬퍼 함수
const formatSizeWithPyung = (sizeStr: string) => {
    const numMatch = sizeStr.match(/[\d.]+/);
    if (numMatch) {
        const sqm = parseFloat(numMatch[0]);
        const pyung = Math.round(sqm * 0.3025);
        return `${Math.round(sqm)}㎡ (${pyung}평)`;
    }
    return sizeStr;
};

export default function RealPriceView({
    setActiveMenu,
}: {
    setActiveMenu: (menu: string) => void;
}) {
    const [mapLevel, setMapLevel] = useState<"national" | "provincial">("national");
    const [selectedProvince, setSelectedProvince] = useState<string>("");
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>("");
    const [mapZoom, setMapZoom] = useState<number>(1);
    const [hoveredGeo, setHoveredGeo] = useState<string | null>(null);

    const [selectedApt, setSelectedApt] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [aptList, setAptList] = useState<any[]>([]);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [chartPeriod, setChartPeriod] = useState<1 | 2 | 5 | 10>(1);
    const [detailData, setDetailData] = useState<{
        chart: any[];
        txList: any[];
        hasMore: boolean;
        aptInfo?: any;
    } | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
    const [detailPage, setDetailPage] = useState<number>(1);
    const [isDetailMoreLoading, setIsDetailMoreLoading] = useState<boolean>(false);

    const abortControllerRef = useRef<AbortController | null>(null);

    const [filterNewApt, setFilterNewApt] = useState<boolean>(false);
    const [filterGoodParking, setFilterGoodParking] = useState<boolean>(false);

    const fetchRealPriceList = async (pageNum: number) => {
        if (pageNum === 1) {
            setIsLoading(true);
            setAptList([]);
            setSelectedApt(null);
            setDetailData(null);
        } else {
            setIsLoadingMore(true);
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            const params = new URLSearchParams();
            if (selectedProvince) params.append("province", selectedProvince);
            if (selectedDistrict) params.append("district", selectedDistrict);
            params.append("page", pageNum.toString());

            if (searchTerm) params.append("search", searchTerm);
            if (filterNewApt) params.append("isNew", "true");
            if (filterGoodParking) params.append("isGoodParking", "true");

            const response = await fetch(`/api/real-estate/list?${params.toString()}`, {
                cache: "no-store",
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error("네트워크 응답 에러");
            const data = await response.json();

            setAptList((prev) => {
                if (pageNum === 1) return data.aptList || [];
                const newItems = (data.aptList || []).filter(
                    (newItem: any) =>
                        !prev.some(
                            (existing) =>
                                existing.name === newItem.name && existing.size === newItem.size
                        )
                );
                return [...prev, ...newItems];
            });
            setHasMore(data.hasMore);
        } catch (error: any) {
            if (error.name === "AbortError") return;
            console.error(error);
        } finally {
            if (pageNum === 1) setIsLoading(false);
            else setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        setPage(1);
        const timeoutId = setTimeout(() => {
            fetchRealPriceList(1);
        }, 400);
        return () => clearTimeout(timeoutId);
    }, [selectedProvince, selectedDistrict, searchTerm, filterNewApt, filterGoodParking]);

    const fetchAptDetail = async (apt: any, dPage: number) => {
        if (dPage === 1) setIsDetailLoading(true);
        else setIsDetailMoreLoading(true);

        try {
            const params = new URLSearchParams();
            params.append("aptName", apt.name);
            params.append("currentPrice", apt.price);
            params.append("aptSize", apt.size);
            params.append("page", dPage.toString());

            const response = await fetch(`/api/real-estate/detail?${params.toString()}`);
            const data = await response.json();

            if (dPage === 1) {
                setDetailData(data);
                setChartPeriod(1);
            } else {
                setDetailData((prev) =>
                    prev
                        ? {
                            ...prev,
                            txList: [...prev.txList, ...data.txList],
                            hasMore: data.hasMore,
                        }
                        : null
                );
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
            setSearchTerm("");
            setMapZoom(1);
        }
    };

    const handleBackToNational = () => {
        setMapLevel("national");
        setSelectedProvince("");
        setSelectedDistrict("");
        setSearchTerm("");
        setMapZoom(1);
    };

    const getFilteredChartData = () => {
        if (!detailData?.chart || detailData.chart.length === 0) return [];
        const currentYear = new Date().getFullYear();

        const periodFiltered = detailData.chart.filter((item: any) => {
            const dateStr = String(item.year || item.trade_date || "");
            const dateParts = dateStr.split(/[.-]/);
            let yy = parseInt(dateParts[0], 10);
            if (yy < 100) yy += 2000;
            return yy >= currentYear - chartPeriod;
        });

        const dataToProcess =
            periodFiltered.length > 0 ? periodFiltered : detailData.chart.slice(-20);

        const grouped: Record<string, { sum: number; count: number }> = {};

        dataToProcess.forEach((item: any) => {
            const dateStr = String(item.year || item.trade_date || "");
            const dateParts = dateStr.split(/[.-]/);
            let yy = parseInt(dateParts[0], 10);
            if (yy < 100) yy += 2000;
            const m = dateParts[1] ? dateParts[1].padStart(2, "0") : "01";

            let key = "";
            if (chartPeriod <= 2) {
                key = `${String(yy).slice(-2)}.${m}`;
            } else {
                key = `${yy}년`;
            }

            const p = parseFloat(item.price);
            if (!isNaN(p) && p > 0) {
                if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
                grouped[key].sum += p;
                grouped[key].count += 1;
            }
        });

        return Object.entries(grouped)
            .map(([displayYear, data]) => ({
                displayYear,
                price: parseFloat((data.sum / data.count).toFixed(2)),
            }))
            .sort((a, b) => a.displayYear.localeCompare(b.displayYear));
    };

    const chartData = getFilteredChartData();

    const getParkingRatioText = (parking: any, total: any) => {
        const p = parseInt(String(parking || "0").replace(/[^0-9]/g, ""), 10);
        const t = parseInt(String(total || "0").replace(/[^0-9]/g, ""), 10);
        if (!isNaN(p) && !isNaN(t) && t > 0 && p > 0) {
            return `${(p / t).toFixed(2)}대`;
        }
        return "-";
    };

    const selectedLocationLabel = selectedProvince
        ? `${selectedProvince} ${selectedDistrict || "전체"}`
        : "전국";

    return (
        <div className="min-h-screen w-full bg-[linear-gradient(180deg,#F4F7FB_0%,#F8FAFC_35%,#FBFCFE_100%)] pb-24 font-pretendard tracking-tight">
            <div className="max-w-[1680px] mx-auto px-4 md:px-6 pt-8">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                    <aside className="xl:col-span-3 flex flex-col gap-4 xl:sticky xl:top-[82px]">
                        <div className="bg-white rounded-[24px] border border-[#E7ECF4] shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center gap-2">
                                <div className="w-10 h-10 rounded-[14px] bg-[#EEF4FF] text-[#315EFB] flex items-center justify-center">
                                    <SlidersHorizontal size={18} />
                                </div>
                                <div>
                                    <h2 className="text-[16px] font-bold text-[#111827]">탐색 필터</h2>
                                    <p className="text-[12px] text-[#6B7280] font-medium">
                                        지역과 조건을 빠르게 좁혀보세요
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 space-y-4">
                                <div className="rounded-[16px] border border-[#E7ECF4] bg-[#F8FAFC] px-4 py-3.5">
                                    <div className="text-[11px] font-semibold text-[#94A3B8] mb-1">
                                        현재 검색 지역
                                    </div>
                                    <div className="text-[14px] font-bold text-[#172554]">
                                        {selectedLocationLabel}
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search
                                        size={16}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="단지명을 입력해보세요"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 rounded-[16px] bg-white border border-[#E7ECF4] text-[14px] font-medium text-[#111827] outline-none focus:border-[#315EFB] focus:ring-4 focus:ring-[#E6EEFF] placeholder:text-[#9CA3AF] transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        onClick={() => setFilterNewApt(!filterNewApt)}
                                        className={`w-full rounded-[16px] border px-4 py-3.5 text-left transition-all ${filterNewApt
                                            ? "bg-[#FFF8E8] border-[#F6C453] shadow-[0_8px_18px_rgba(245,158,11,0.10)]"
                                            : "bg-white border-[#E7ECF4] hover:border-[#D9E1EE] hover:bg-[#FBFCFE]"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${filterNewApt
                                                        ? "bg-[#F59E0B] text-white"
                                                        : "bg-[#FFF7E6] text-[#D97706]"
                                                        }`}
                                                >
                                                    <Sparkles size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-[#111827]">
                                                        5년 내 신축
                                                    </p>
                                                    <p className="text-[12px] text-[#6B7280] font-medium">
                                                        최근 준공 단지 우선 탐색
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${filterNewApt
                                                    ? "border-[#D97706] bg-[#D97706]"
                                                    : "border-[#D1D5DB] bg-white"
                                                    }`}
                                            >
                                                {filterNewApt && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setFilterGoodParking(!filterGoodParking)}
                                        className={`w-full rounded-[16px] border px-4 py-3.5 text-left transition-all ${filterGoodParking
                                            ? "bg-[#EEFFFB] border-[#53D3C2] shadow-[0_8px_18px_rgba(20,184,166,0.10)]"
                                            : "bg-white border-[#E7ECF4] hover:border-[#D9E1EE] hover:bg-[#FBFCFE]"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${filterGoodParking
                                                        ? "bg-[#14B8A6] text-white"
                                                        : "bg-[#EAFBF8] text-[#0F766E]"
                                                        }`}
                                                >
                                                    <ParkingCircle size={17} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-[#111827]">
                                                        여유로운 주차
                                                    </p>
                                                    <p className="text-[12px] text-[#6B7280] font-medium">
                                                        세대당 주차비율이 좋은 단지
                                                    </p>
                                                </div>
                                            </div>
                                            <div
                                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${filterGoodParking
                                                    ? "border-[#0F766E] bg-[#0F766E]"
                                                    : "border-[#D1D5DB] bg-white"
                                                    }`}
                                            >
                                                {filterGoodParking && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="xl:col-span-5 flex flex-col gap-4 relative min-h-[520px]">
                        <div className="flex items-center justify-between px-1">
                            <div>
                                <h3 className="text-[18px] font-bold text-[#111827]">단지 리스트</h3>
                                <p className="text-[13px] text-[#6B7280] font-medium mt-1">
                                    시세와 거래 흐름을 비교해 보세요
                                </p>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#E7ECF4] bg-white px-3 py-2 text-[12px] font-semibold text-[#64748B]">
                                <BarChart3 size={14} />
                                실거래 데이터 반영
                            </div>
                        </div>

                        {isLoading && (
                            <div className="absolute inset-0 top-[60px] bg-white/75 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[24px] border border-[#E7ECF4]">
                                <Loader2 className="animate-spin text-[#315EFB] mb-4" size={34} />
                                <span className="text-[#172554] font-bold text-[15px]">
                                    빅데이터 분석 중...
                                </span>
                            </div>
                        )}

                        {!isLoading && aptList.length === 0 && (
                            <div className="bg-white rounded-[24px] border border-[#E7ECF4] px-8 py-14 flex flex-col items-center justify-center text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                                <div className="w-16 h-16 rounded-full bg-[#F8FAFC] border border-[#E7ECF4] flex items-center justify-center mb-4">
                                    <Building2 size={30} className="text-[#A0AEC0]" />
                                </div>
                                <p className="text-[16px] font-bold text-[#172554] mb-2">
                                    해당 조건의 단지가 없습니다.
                                </p>
                                <p className="text-[13px] font-medium text-[#6B7280]">
                                    검색어나 조건을 조금 넓혀보세요.
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col gap-3.5">
                            {aptList.map((apt) => {
                                let buildYear = parseInt(
                                    apt.build_year || apt.completion_date?.split(".")[0] || "0",
                                    10
                                );
                                if (buildYear > 0 && buildYear < 100) buildYear += 2000;
                                const isNew = buildYear >= 2021;

                                const hhNum = parseInt(
                                    String(apt.total_households || "0").replace(/[^0-9]/g, ""),
                                    10
                                );
                                const isLarge = hhNum >= 1000;

                                return (
                                    <article
                                        key={apt.id}
                                        className={`rounded-[22px] border bg-white overflow-hidden transition-all duration-200 ${selectedApt?.id === apt.id
                                            ? "border-[#8DB7FF] ring-1 ring-[#D8E7FF] shadow-[0_16px_36px_rgba(49,94,251,0.10)]"
                                            : "border-[#E7ECF4] hover:border-[#D4DCE8] shadow-[0_6px_18px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_26px_rgba(15,23,42,0.06)]"
                                            }`}
                                    >
                                        <div
                                            className="p-5 md:p-6 cursor-pointer"
                                            onClick={() => handleAptClick(apt)}
                                        >
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col gap-2.5">
                                                        {/* 🚀 1. 단지명 + 평형 뱃지 나란히 배치 */}
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="text-[17px] md:text-[18px] font-bold text-[#111827] tracking-[-0.02em] truncate">
                                                                {apt.name}
                                                            </h4>
                                                            <span className="px-2.5 py-0.5 rounded-[8px] bg-[#F8FAFC] border border-[#E7ECF4] text-[#475569] text-[12px] font-bold tracking-tight">
                                                                {formatSizeWithPyung(apt.size)}
                                                            </span>
                                                        </div>

                                                        {/* 🚀 2. 스펙 뱃지들을 단지명 아래로 분리 */}
                                                        {(isNew || isLarge) && (
                                                            <div className="flex gap-1.5 flex-wrap">
                                                                {isNew && (
                                                                    <span className="px-2 py-0.5 rounded-[8px] bg-[#FFF7E8] border border-[#F7D88A] text-[#B76A00] text-[11px] font-semibold flex items-center gap-1">
                                                                        <Sparkles size={11} />
                                                                        신축
                                                                    </span>
                                                                )}
                                                                {isLarge && (
                                                                    <span className="px-2 py-0.5 rounded-[8px] bg-[#EEF2FF] border border-[#D9DDFC] text-[#4C3DD1] text-[11px] font-semibold flex items-center gap-1">
                                                                        <Building2 size={11} />
                                                                        대단지
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* 3. 주소 및 거래일/층수 */}
                                                        <div className="flex flex-col gap-1.5 mt-1 text-[13px] text-[#6B7280] font-medium">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <MapPin size={14} className="text-[#9CA3AF] shrink-0" />
                                                                <span className="truncate">{apt.address || "상세 주소 확인 중"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar size={14} className="text-[#9CA3AF]" />
                                                                    {apt.date}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                                                                <span className="flex items-center gap-1.5">
                                                                    <Building size={14} className="text-[#9CA3AF]" />
                                                                    {String(apt.floor).includes('층') ? apt.floor : `${apt.floor}층`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="md:min-w-[130px] flex md:flex-col items-start md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-[#EEF2F7]">
                                                    <p className="text-[18px] md:text-[19px] font-bold text-[#172554] tracking-[-0.02em] leading-none">
                                                        {apt.price}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedApt?.id === apt.id && (
                                            <div className="border-t border-[#EEF2F7] bg-[linear-gradient(180deg,#FCFDFE_0%,#F9FBFE_100%)] px-5 md:px-6 pb-6 pt-5 animate-in slide-in-from-top-4 fade-in duration-300">
                                                <div className="grid grid-cols-3 gap-3 mb-6">
                                                    <div className="rounded-[18px] border border-[#E7ECF4] bg-white px-4 py-4 text-center">
                                                        <div className="w-9 h-9 mx-auto mb-2 rounded-[12px] bg-[#EEF4FF] text-[#315EFB] flex items-center justify-center">
                                                            <Building size={17} />
                                                        </div>
                                                        <p className="text-[12px] text-[#6B7280] font-medium mb-1">
                                                            총 세대수
                                                        </p>
                                                        <p className="text-[15px] font-bold text-[#172554]">
                                                            {detailData?.aptInfo?.total_households
                                                                ? `${Number(
                                                                    detailData.aptInfo.total_households
                                                                ).toLocaleString()}세대`
                                                                : apt?.total_households
                                                                    ? `${Number(apt.total_households).toLocaleString()}세대`
                                                                    : "-"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-[18px] border border-[#E7ECF4] bg-white px-4 py-4 text-center">
                                                        <div className="w-9 h-9 mx-auto mb-2 rounded-[12px] bg-[#FFF7E8] text-[#D97706] flex items-center justify-center">
                                                            <Calendar size={17} />
                                                        </div>
                                                        <p className="text-[12px] text-[#6B7280] font-medium mb-1">
                                                            준공년월
                                                        </p>
                                                        <p className="text-[15px] font-bold text-[#172554]">
                                                            {detailData?.aptInfo?.completion_date ||
                                                                apt?.completion_date ||
                                                                "-"}
                                                        </p>
                                                    </div>

                                                    <div className="rounded-[18px] border border-[#E7ECF4] bg-white px-4 py-4 text-center">
                                                        <div className="w-9 h-9 mx-auto mb-2 rounded-[12px] bg-[#EFFFFA] text-[#0F766E] flex items-center justify-center">
                                                            <Car size={17} />
                                                        </div>
                                                        <p className="text-[12px] text-[#6B7280] font-medium mb-1">
                                                            세대당 주차
                                                        </p>
                                                        <p className="text-[15px] font-bold text-[#172554]">
                                                            {getParkingRatioText(
                                                                detailData?.aptInfo?.parking_count || apt?.parking_count,
                                                                detailData?.aptInfo?.total_households ||
                                                                apt?.total_households
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isDetailLoading ? (
                                                    <div className="rounded-[20px] border border-[#E7ECF4] bg-white py-12 flex flex-col items-center justify-center gap-3">
                                                        <Loader2
                                                            className="animate-spin text-[#315EFB]"
                                                            size={30}
                                                        />
                                                        <span className="text-[14px] font-bold text-[#172554]">
                                                            정밀 시세 분석 중...
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between gap-3 mb-4">
                                                            <h5 className="text-[15px] font-bold text-[#111827] flex items-center gap-2">
                                                                <LineChartIcon size={18} className="text-[#315EFB]" />
                                                                시세 트렌드
                                                            </h5>

                                                            <div className="inline-flex gap-1 p-1 rounded-[12px] border border-[#E7ECF4] bg-white">
                                                                {[1, 2, 5, 10].map((period) => (
                                                                    <button
                                                                        key={period}
                                                                        onClick={() =>
                                                                            setChartPeriod(period as 1 | 2 | 5 | 10)
                                                                        }
                                                                        className={`px-3 py-1.5 rounded-[10px] text-[12px] font-semibold transition-all ${chartPeriod === period
                                                                            ? "bg-[#172554] text-white shadow-sm"
                                                                            : "text-[#6B7280] hover:text-[#111827]"
                                                                            }`}
                                                                    >
                                                                        {period}년
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {chartData.length > 0 && (
                                                            <div className="h-[250px] w-full rounded-[20px] border border-[#E7ECF4] bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)] mb-6">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <AreaChart
                                                                        data={chartData}
                                                                        margin={{
                                                                            top: 10,
                                                                            right: 10,
                                                                            left: -25,
                                                                            bottom: 0,
                                                                        }}
                                                                    >
                                                                        <defs>
                                                                            <linearGradient
                                                                                id="colorPrice"
                                                                                x1="0"
                                                                                y1="0"
                                                                                x2="0"
                                                                                y2="1"
                                                                            >
                                                                                <stop
                                                                                    offset="5%"
                                                                                    stopColor="#315EFB"
                                                                                    stopOpacity={0.22}
                                                                                />
                                                                                <stop
                                                                                    offset="95%"
                                                                                    stopColor="#315EFB"
                                                                                    stopOpacity={0}
                                                                                />
                                                                            </linearGradient>
                                                                        </defs>

                                                                        <CartesianGrid
                                                                            strokeDasharray="3 3"
                                                                            vertical={false}
                                                                            stroke="#EEF2F7"
                                                                        />
                                                                        <XAxis
                                                                            dataKey="displayYear"
                                                                            axisLine={false}
                                                                            tickLine={false}
                                                                            tick={{
                                                                                fontSize: 11,
                                                                                fill: "#94A3B8",
                                                                                fontWeight: 700,
                                                                            }}
                                                                            dy={10}
                                                                            minTickGap={20}
                                                                        />
                                                                        <YAxis
                                                                            domain={["auto", "auto"]}
                                                                            axisLine={false}
                                                                            tickLine={false}
                                                                            tick={{
                                                                                fontSize: 11,
                                                                                fill: "#94A3B8",
                                                                                fontWeight: 700,
                                                                            }}
                                                                            tickFormatter={(val) =>
                                                                                typeof val === "number"
                                                                                    ? val.toFixed(1)
                                                                                    : val
                                                                            }
                                                                        />
                                                                        <RechartsTooltip
                                                                            contentStyle={{
                                                                                borderRadius: "16px",
                                                                                border: "1px solid rgba(255,255,255,0.08)",
                                                                                boxShadow:
                                                                                    "0 14px 32px rgba(15,23,42,0.18)",
                                                                                fontSize: "13px",
                                                                                fontWeight: 700,
                                                                                background: "#172554",
                                                                                color: "white",
                                                                                padding: "10px 14px",
                                                                            }}
                                                                            itemStyle={{ color: "#ffffff" }}
                                                                            formatter={(value: any) => [
                                                                                typeof value === "number"
                                                                                    ? `${value.toFixed(1)}억`
                                                                                    : value,
                                                                                "평균가",
                                                                            ]}
                                                                        />
                                                                        <Area
                                                                            type="monotone"
                                                                            dataKey="price"
                                                                            stroke="#315EFB"
                                                                            strokeWidth={2.6}
                                                                            fillOpacity={1}
                                                                            fill="url(#colorPrice)"
                                                                            activeDot={{
                                                                                r: 5,
                                                                                fill: "#F59E0B",
                                                                                stroke: "#fff",
                                                                                strokeWidth: 2,
                                                                            }}
                                                                            connectNulls={true}
                                                                        />
                                                                    </AreaChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        )}

                                                        <div>
                                                            <h5 className="text-[15px] font-bold text-[#111827] mb-3 flex items-center gap-2">
                                                                <Calendar size={18} className="text-[#F59E0B]" />
                                                                실거래 히스토리
                                                            </h5>

                                                            {detailData?.txList && detailData.txList.length > 0 ? (
                                                                <div className="rounded-[20px] border border-[#E7ECF4] bg-white overflow-hidden shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                                                                    {detailData.txList.map((tx: any, idx: number) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center justify-between px-5 py-4 border-b border-[#F2F5F9] last:border-0 hover:bg-[#FBFCFE] transition-colors"
                                                                        >
                                                                            <div className="flex items-center gap-4">
                                                                                <span className="w-[68px] text-[13px] font-semibold text-[#9CA3AF]">
                                                                                    {tx.date}
                                                                                </span>
                                                                                <div className="flex items-center gap-2.5">
                                                                                    <span className="px-2.5 py-1 rounded-[10px] bg-[#F8FAFC] border border-[#E7ECF4] text-[#475569] text-[11px] font-semibold">
                                                                                        {tx.type}
                                                                                    </span>
                                                                                    <span className="text-[14px] font-semibold text-[#111827]">
                                                                                        {tx.floor}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-[15px] font-bold text-[#172554]">
                                                                                {tx.price}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-[18px] border border-[#E7ECF4] bg-white py-8 text-center text-[13px] font-medium text-[#9CA3AF]">
                                                                    최근 거래 내역이 없습니다.
                                                                </div>
                                                            )}

                                                            {detailData?.hasMore && (
                                                                <button
                                                                    onClick={handleLoadMoreDetail}
                                                                    disabled={isDetailMoreLoading}
                                                                    className="w-full mt-4 py-3.5 rounded-[16px] border border-[#D7E3FF] bg-[#F7FAFF] text-[#315EFB] text-[13px] font-semibold hover:bg-[#315EFB] hover:text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                                >
                                                                    {isDetailMoreLoading ? (
                                                                        <>
                                                                            <Loader2
                                                                                size={14}
                                                                                className="animate-spin"
                                                                            />
                                                                            리스트 불러오는 중...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <ChevronDown size={14} />
                                                                            더보기
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                );
                            })}

                            {hasMore && aptList.length > 0 && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="w-full py-4 rounded-[18px] bg-[linear-gradient(135deg,#172554_0%,#315EFB_100%)] text-white text-[15px] font-bold hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-[0_14px_28px_rgba(49,94,251,0.18)] disabled:opacity-50"
                                >
                                    {isLoadingMore ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            데이터를 분석 중입니다...
                                        </>
                                    ) : (
                                        <>
                                            더 많은 단지 보기 <ChevronDown size={18} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </section>

                    <aside className="xl:col-span-4 flex flex-col gap-4 xl:sticky xl:top-[82px]">
                        <div className="bg-white rounded-[24px] border border-[#E7ECF4] shadow-[0_10px_30px_rgba(15,23,42,0.05)] overflow-hidden">
                            <div className="px-5 py-4 border-b border-[#EEF2F7] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-[14px] bg-[#EEF4FF] text-[#315EFB] flex items-center justify-center">
                                        <MapPin size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-[16px] font-bold text-[#111827]">
                                            지역 인사이트 맵
                                        </h3>
                                        <p className="text-[12px] text-[#6B7280] font-medium">
                                            지역을 선택하면 리스트가 바로 갱신됩니다
                                        </p>
                                    </div>
                                </div>

                                {mapLevel === "provincial" && (
                                    <button
                                        onClick={handleBackToNational}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[12px] border border-[#E7ECF4] bg-white text-[#64748B] hover:text-[#172554] hover:shadow-sm transition-all"
                                    >
                                        <ArrowLeft size={15} />
                                        <span className="text-[12px] font-semibold">전국 보기</span>
                                    </button>
                                )}
                            </div>

                            <div className="h-[600px] bg-[linear-gradient(180deg,#F7FAFF_0%,#F8FAFC_100%)] relative">
                                {mapLevel === "national" && (
                                    <ComposableMap
                                        width={400}
                                        height={600}
                                        projection="geoMercator"
                                        projectionConfig={{ scale: 4500, center: [127.5, 35.8] }}
                                        className="w-full h-full"
                                    >
                                        <ZoomableGroup
                                            minZoom={0.5}
                                            maxZoom={5}
                                            translateExtent={[[-150, -150], [550, 750]]}
                                            onMove={({ zoom }) => setMapZoom(zoom)}
                                        >
                                            <Geographies geography={KOREA_PROVINCES_URL}>
                                                {({ geographies }) => (
                                                    <>
                                                        {geographies.map((geo) => {
                                                            const provinceName =
                                                                geo.properties.name ||
                                                                geo.properties.CTP_KOR_NM ||
                                                                "";
                                                            const isSelected = provinceName
                                                                ? selectedProvince.includes(
                                                                    provinceName.substring(0, 2)
                                                                )
                                                                : false;
                                                            const isHovered = hoveredGeo === geo.rsmKey;

                                                            return (
                                                                <Geography
                                                                    key={geo.rsmKey}
                                                                    geography={geo}
                                                                    onClick={() =>
                                                                        handleProvinceClick(provinceName)
                                                                    }
                                                                    onMouseEnter={() =>
                                                                        setHoveredGeo(geo.rsmKey)
                                                                    }
                                                                    onMouseLeave={() => setHoveredGeo(null)}
                                                                    style={{
                                                                        default: {
                                                                            fill: isSelected
                                                                                ? "#172554"
                                                                                : "#FFFFFF",
                                                                            stroke: "#D9E1EE",
                                                                            strokeWidth: 1,
                                                                            outline: "none",
                                                                            transition: "all .22s ease",
                                                                        },
                                                                        hover: {
                                                                            fill: isSelected
                                                                                ? "#172554"
                                                                                : "#DCE9FF",
                                                                            stroke: isSelected
                                                                                ? "#172554"
                                                                                : "#7EA8FF",
                                                                            strokeWidth: 1,
                                                                            outline: "none",
                                                                            cursor: "pointer",
                                                                            filter: isHovered
                                                                                ? "drop-shadow(0px 8px 14px rgba(49,94,251,0.18))"
                                                                                : "none",
                                                                        },
                                                                        pressed: {
                                                                            fill: "#315EFB",
                                                                            outline: "none",
                                                                        },
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                        {geographies.map((geo) => {
                                                            const provinceName = getShortProvinceName(
                                                                geo.properties.name ||
                                                                geo.properties.CTP_KOR_NM ||
                                                                ""
                                                            );
                                                            return (
                                                                <Marker
                                                                    key={`${geo.rsmKey}-label`}
                                                                    coordinates={geoCentroid(geo)}
                                                                >
                                                                    <text
                                                                        textAnchor="middle"
                                                                        y={3 / mapZoom}
                                                                        style={{
                                                                            fontFamily:
                                                                                "var(--font-pretendard)",
                                                                            fontSize: `${11 / mapZoom}px`,
                                                                            fontWeight: 800,
                                                                            fill: selectedProvince.includes(
                                                                                provinceName.substring(0, 2)
                                                                            )
                                                                                ? "#ffffff"
                                                                                : "#64748B",
                                                                            pointerEvents: "none",
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

                                {mapLevel === "provincial" &&
                                    selectedProvince &&
                                    PROVINCE_INFO[selectedProvince] && (
                                        <ComposableMap
                                            width={400}
                                            height={600}
                                            projection="geoMercator"
                                            projectionConfig={{
                                                scale: PROVINCE_INFO[selectedProvince].scale * 0.85,
                                                center: PROVINCE_INFO[selectedProvince].center,
                                            }}
                                            className="w-full h-full"
                                        >
                                            <ZoomableGroup
                                                minZoom={0.5}
                                                maxZoom={8}
                                                translateExtent={[[-150, -150], [550, 750]]}
                                                onMove={({ zoom }) => setMapZoom(zoom)}
                                            >
                                                <Geographies geography={KOREA_MUNICIPALITIES_URL}>
                                                    {({ geographies }) => {
                                                        const filteredGeos = geographies.filter((geo) =>
                                                            geo.properties.code.startsWith(
                                                                PROVINCE_INFO[selectedProvince].code
                                                            )
                                                        );

                                                        return (
                                                            <>
                                                                {filteredGeos.map((geo) => {
                                                                    const districtName =
                                                                        geo.properties.name ||
                                                                        geo.properties.SIGUNGU_NM ||
                                                                        "";
                                                                    const isSelected =
                                                                        selectedDistrict === districtName ||
                                                                        (!selectedDistrict &&
                                                                            districtName === "강남구" &&
                                                                            selectedProvince === "서울특별시");
                                                                    const isHovered = hoveredGeo === geo.rsmKey;

                                                                    return (
                                                                        <Geography
                                                                            key={geo.rsmKey}
                                                                            geography={geo}
                                                                            onClick={() =>
                                                                                setSelectedDistrict(districtName)
                                                                            }
                                                                            onMouseEnter={() =>
                                                                                setHoveredGeo(geo.rsmKey)
                                                                            }
                                                                            onMouseLeave={() => setHoveredGeo(null)}
                                                                            style={{
                                                                                default: {
                                                                                    fill: isSelected
                                                                                        ? "#172554"
                                                                                        : "#FFFFFF",
                                                                                    stroke: isSelected
                                                                                        ? "#FFFFFF"
                                                                                        : "#D9E1EE",
                                                                                    strokeWidth: isSelected ? 1.5 : 1,
                                                                                    outline: "none",
                                                                                    transition: "all .22s ease",
                                                                                },
                                                                                hover: {
                                                                                    fill: isSelected
                                                                                        ? "#172554"
                                                                                        : "#DCE9FF",
                                                                                    stroke: isSelected
                                                                                        ? "#FFFFFF"
                                                                                        : "#7EA8FF",
                                                                                    strokeWidth: isSelected ? 1.5 : 1,
                                                                                    outline: "none",
                                                                                    cursor: "pointer",
                                                                                    filter: isHovered
                                                                                        ? "drop-shadow(0px 8px 14px rgba(49,94,251,0.18))"
                                                                                        : "none",
                                                                                },
                                                                                pressed: {
                                                                                    fill: "#315EFB",
                                                                                    outline: "none",
                                                                                },
                                                                            }}
                                                                        />
                                                                    );
                                                                })}
                                                                {filteredGeos.map((geo) => {
                                                                    const districtName = (
                                                                        geo.properties.name ||
                                                                        geo.properties.SIGUNGU_NM ||
                                                                        ""
                                                                    ).replace(/\s+/g, "");
                                                                    const isSelected =
                                                                        selectedDistrict === districtName ||
                                                                        (!selectedDistrict &&
                                                                            districtName === "강남구" &&
                                                                            selectedProvince === "서울특별시");

                                                                    return (
                                                                        <Marker
                                                                            key={`${geo.rsmKey}-label`}
                                                                            coordinates={geoCentroid(geo)}
                                                                        >
                                                                            <text
                                                                                textAnchor="middle"
                                                                                y={3 / mapZoom}
                                                                                style={{
                                                                                    fontFamily:
                                                                                        "var(--font-pretendard)",
                                                                                    fontSize: `${11 / mapZoom}px`,
                                                                                    fontWeight: isSelected ? 900 : 800,
                                                                                    fill: isSelected
                                                                                        ? "#ffffff"
                                                                                        : "#172554",
                                                                                    pointerEvents: "none",
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
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}