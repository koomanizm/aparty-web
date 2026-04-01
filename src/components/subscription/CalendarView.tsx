"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Phone, Building, X, Loader2, FileText, ExternalLink } from "lucide-react";

const REGION_CATEGORIES = ["전체", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];
const REGION_KEYWORDS: { [key: string]: string[] } = {
    "서울/수도권": ["서울", "경기", "인천"],
    "부산/경남": ["부산", "경남", "울산"],
    "대구/경북": ["대구", "경북"],
    "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"],
    "강원/제주": ["강원", "제주"]
};

const TYPE_FILTERS = [
    { id: "전체", label: "전체보기", baseClass: "bg-slate-800 text-white border border-slate-800" },
    { id: "특별공급", label: "특별공급", baseClass: "bg-orange-500 text-white border border-orange-500" },
    { id: "1순위", label: "1순위", baseClass: "bg-blue-500 text-white border border-blue-500" },
    { id: "2순위", label: "2순위", baseClass: "bg-green-600 text-white border border-green-600" },
    { id: "무순위", label: "무순위", baseClass: "bg-white text-red-500 border border-red-300" },
    { id: "임의공급", label: "임의공급", baseClass: "bg-white text-rose-500 border border-rose-300" },
    { id: "재공급", label: "재공급", baseClass: "bg-white text-pink-600 border border-pink-300" },
    { id: "오피스텔/생숙/도생/민간임대", label: "오피/도생/임대", baseClass: "bg-white text-gray-500 border border-gray-300" },
    { id: "공공지원민간임대", label: "공공지원임대", baseClass: "bg-white text-blue-700 border border-blue-300" }
];

const getTypeStyle = (type: string) => {
    switch (type) {
        case "무순위": return { boxClass: "bg-white border border-red-300", textClass: "text-red-500 font-bold", label: "무순위", solid: false };
        case "임의공급": return { boxClass: "bg-white border border-rose-300", textClass: "text-rose-500 font-bold", label: "임의공급", solid: false };
        case "재공급": return { boxClass: "bg-white border border-pink-300", textClass: "text-pink-600 font-bold", label: "재공급", solid: false };
        case "오피스텔/생숙/도생/민간임대": return { boxClass: "bg-white border border-gray-300", textClass: "text-gray-500 font-bold", label: "오피/도생/임대", solid: false };
        case "공공지원민간임대": return { boxClass: "bg-white border border-blue-300", textClass: "text-blue-700 font-bold", label: "공공지원임대", solid: false };
        case "특별공급": return { boxClass: "bg-orange-500 border border-orange-500", textClass: "text-white", label: "특별공급", solid: true };
        case "2순위": return { boxClass: "bg-green-600 border border-green-600", textClass: "text-white", label: "2순위", solid: true };
        case "1순위":
        default:
            return { boxClass: "bg-blue-500 border border-blue-500", textClass: "text-white", label: "1순위", solid: true };
    }
};

const fetchCalendarData = async (year: number, month: number) => {
    try {
        const formattedMonth = String(month).padStart(2, '0');
        const res = await fetch(`/api/dashboard/calendar?year=${year}&month=${formattedMonth}`);
        const data = await res.json();
        if (!data || !data[0] || !data[0].data) return [];
        const items = data[0].data;
        let list: any[] = [];

        items.forEach((item: any) => {
            const addr = item.HSSPLY_ADRES || item.hssply_adres || "";
            let rawDate = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || item.PBLANC_PBLANC_ON || "";
            let formattedDate = "";
            if (rawDate.length === 8) formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
            else if (rawDate.includes("-")) formattedDate = rawDate;

            if (formattedDate) {
                list.push({
                    id: item.id || Math.random().toString(),
                    houseManageNo: item.id?.split('_')[0] || "",
                    houseSecd: item.id?.split('_')[3] || "01",
                    date: formattedDate,
                    title: item.HOUSE_NM || item.house_nm || "정보 없음",
                    addr: addr.split(" ").slice(0, 3).join(" "),
                    fullAddr: addr,
                    type: item.CUSTOM_TYPE || "1순위",
                    totHshld: item.TOT_SUPLY_HSHLDCO || "-",
                    contact: item.MDHS_TELNO || "청약홈 확인 요망"
                });
            }
        });
        return list;
    } catch { return []; }
};

export default function CalendarView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 모달창 State
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<any | null>(null);

    const [selectedRegion, setSelectedRegion] = useState("전체");
    const [selectedType, setSelectedType] = useState("전체");

    useEffect(() => {
        setIsLoading(true);
        fetchCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1).then(data => {
            setEvents(data);
            setIsLoading(false);
        });
    }, [currentDate]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.houseManageNo) {
            setIsDetailLoading(true);

            let sec = "01";
            if (["무순위", "임의공급", "재공급"].includes(selectedEvent.type)) sec = "04";
            else if (selectedEvent.type === "오피스텔/생숙/도생/민간임대") sec = "02";
            else if (selectedEvent.type === "공공지원민간임대") sec = "05";

            fetch(`/api/dashboard/calendar/detail?houseManageNo=${selectedEvent.houseManageNo}&houseSecd=${sec}`)
                .then(res => res.json())
                .then(data => {
                    setDetailData(data);
                    setIsDetailLoading(false);
                })
                .catch(() => setIsDetailLoading(false));
        } else {
            setDetailData(null);
        }
    }, [selectedEvent]);

    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            const regionMatch = selectedRegion === "전체" || REGION_KEYWORDS[selectedRegion].some(kw => e.addr.includes(kw));
            const typeMatch = selectedType === "전체" || e.type === selectedType;
            return regionMatch && typeMatch;
        });
    }, [events, selectedRegion, selectedType]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const calendarCells = [];
    let emptyCellsCount = 0;
    if (firstDayOfMonth >= 1 && firstDayOfMonth <= 5) emptyCellsCount = firstDayOfMonth - 1;

    for (let i = 0; i < emptyCellsCount; i++) calendarCells.push({ type: "empty", key: `empty-${i}` });

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDayOfWeek = new Date(year, month, day).getDay();
        if (currentDayOfWeek !== 0 && currentDayOfWeek !== 6) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = filteredEvents.filter(e => e.date === dateString);
            calendarCells.push({ type: "day", day, dateString, events: dayEvents, key: `day-${day}` });
        }
    }

    return (
        <div className="w-full bg-[#F8FAFC] pb-32 animate-in fade-in duration-500">
            <div className="bg-white border-b border-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-[1200px] mx-auto px-5 md:px-6 flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveMenu('calendar')} className="py-4 text-[14px] font-black text-[#172554] border-b-[3px] border-[#172554] whitespace-nowrap">청약 일정 달력</button>
                    <button onClick={() => setActiveMenu('competition')} className="py-4 text-[14px] font-bold text-slate-400 hover:text-[#172554] transition-colors whitespace-nowrap">청약 경쟁률 분석</button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-6">

                <div className="flex flex-col gap-3 mb-4 pb-1">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 mr-1">
                            <MapPin size={14} />
                        </div>
                        {REGION_CATEGORIES.map(region => (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${selectedRegion === region
                                        ? "bg-[#172554] border-[#172554] text-white shadow-md"
                                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white px-5 md:px-6 py-4 md:py-5 rounded-t-[24px] border border-slate-200 border-b-0 shadow-sm gap-4 lg:gap-0">

                    <div className="flex items-center gap-3 mb-3 lg:mb-0">
                        <div className="flex items-center gap-1 bg-slate-50 rounded-full p-1 border border-slate-100">
                            <button onClick={prevMonth} className="p-1.5 text-slate-400 hover:text-[#172554] hover:bg-white rounded-full transition-all shadow-sm"><ChevronLeft size={20} strokeWidth={3} /></button>
                            <h2 className="text-[18px] md:text-[22px] font-black text-[#172554] tracking-tighter w-[100px] md:w-[120px] text-center">{year}. {String(month + 1).padStart(2, '0')}</h2>
                            <button onClick={nextMonth} className="p-1.5 text-slate-400 hover:text-[#172554] hover:bg-white rounded-full transition-all shadow-sm"><ChevronRight size={20} strokeWidth={3} /></button>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="text-[12px] md:text-[13px] font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#172554] px-4 py-2 rounded-full transition-all shadow-sm">
                            오늘로 이동
                        </button>
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full lg:w-auto">
                        <div className="flex items-center justify-start gap-1.5 w-full">
                            {TYPE_FILTERS.slice(0, 4).map(filter => {
                                const isActive = selectedType === filter.id;
                                const isDimmed = selectedType !== "전체" && !isActive;
                                return (
                                    <button key={filter.id} onClick={() => setSelectedType(filter.id)} className={`flex-1 py-1.5 rounded-md text-[11px] md:text-[12px] font-extrabold transition-all shadow-sm whitespace-nowrap ${filter.baseClass} ${isActive ? 'ring-2 ring-offset-1 ring-slate-300 scale-[1.02] shadow-md' : ''} ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100 hover:scale-[1.02]'}`}>
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex flex-wrap items-center justify-start gap-1.5 w-full">
                            {TYPE_FILTERS.slice(4, 7).map(filter => {
                                const isActive = selectedType === filter.id;
                                const isDimmed = selectedType !== "전체" && !isActive;
                                return (
                                    <button key={filter.id} onClick={() => setSelectedType(filter.id)} className={`px-2.5 py-1.5 rounded-md text-[10px] md:text-[11px] font-bold transition-all shadow-sm ${filter.baseClass} ${isActive ? 'ring-2 ring-offset-1 ring-slate-300 scale-[1.02] shadow-md' : ''} ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100 hover:scale-[1.02]'}`}>
                                        {filter.label}
                                    </button>
                                );
                            })}
                            <div className="w-px h-3.5 bg-slate-300 mx-0.5"></div>
                            {TYPE_FILTERS.slice(7, 9).map(filter => {
                                const isActive = selectedType === filter.id;
                                const isDimmed = selectedType !== "전체" && !isActive;
                                return (
                                    <button key={filter.id} onClick={() => setSelectedType(filter.id)} className={`px-2.5 py-1.5 rounded-md text-[10px] md:text-[11px] font-bold transition-all shadow-sm ${filter.baseClass} ${isActive ? 'ring-2 ring-offset-1 ring-slate-300 scale-[1.02] shadow-md' : ''} ${isDimmed ? 'opacity-40 hover:opacity-100' : 'opacity-100 hover:scale-[1.02]'}`}>
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-b-[24px] shadow-sm overflow-hidden">
                    <div className="grid grid-cols-5 border-b border-slate-100 bg-slate-50">
                        {['월', '화', '수', '목', '금'].map((day, idx) => (
                            <div key={idx} className="py-3.5 text-center text-[13px] font-black text-slate-500">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-5">
                        {isLoading ? (
                            <div className="col-span-5 h-[400px] flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-[#172554] mb-3" />
                                <p className="text-[13px] font-bold text-slate-400">청약 일정을 불러오는 중입니다...</p>
                            </div>
                        ) : (
                            calendarCells.map((cell) => (
                                <div key={cell.key} className={`min-h-[120px] md:min-h-[140px] p-2 border-b border-r border-slate-100 ${cell.type === 'empty' ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30 transition-colors'}`}>
                                    {cell.type === 'day' && (
                                        <>
                                            <div className="flex justify-between items-start mb-2 px-1">
                                                <span className={`text-[13px] md:text-[15px] font-black ${new Date().toISOString().split('T')[0] === cell.dateString ? 'bg-[#172554] text-white w-6 h-6 flex items-center justify-center rounded-full shadow-md -ml-1 -mt-1' : 'text-slate-700'}`}>{cell.day}</span>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                {cell.events?.map((event: any, idx: number) => {
                                                    const style = getTypeStyle(event.type);
                                                    return (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSelectedEvent(event)}
                                                            className={`text-left w-full rounded-md px-2 py-1.5 transition-all shadow-sm hover:shadow-md hover:scale-[1.02] ${style.boxClass}`}
                                                        >
                                                            <p className={`text-[11px] md:text-[12px] truncate ${style.textClass}`}>{event.title}</p>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* 🚀 럭셔리 API 연동 모달창 (숨김 처리 없이 모든 칸 무조건 고정 출력!) */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                        <div className="sticky top-0 z-10 h-[80px] bg-gradient-to-r from-[#172554] to-[#1e3a8a] flex items-center px-6">
                            <div className="absolute top-4 right-4">
                                <button onClick={() => setSelectedEvent(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                    <X size={20} strokeWidth={2.5} />
                                </button>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md shadow-sm bg-white/10 border border-white/20 backdrop-blur-md`}>
                                <span className={`text-[12px] font-black text-white`}>
                                    {getTypeStyle(selectedEvent.type).label}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h4 className="text-[22px] md:text-[26px] font-black text-slate-900 leading-tight break-keep mb-6">
                                {selectedEvent.title}
                            </h4>

                            {isDetailLoading ? (
                                <div className="space-y-4 animate-pulse">
                                    <div className="h-24 bg-slate-100 rounded-2xl w-full"></div>
                                    <div className="h-32 bg-slate-100 rounded-2xl w-full"></div>
                                    <div className="flex items-center justify-center gap-2 mt-8 text-slate-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span className="text-[13px] font-bold">국가 공공데이터 망에서 실시간 분석 중입니다...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">

                                    {/* 1. 입주자모집공고 주요정보 (무조건 노출) */}
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                                            <FileText size={16} className="text-[#172554]" />
                                            <h5 className="text-[14px] font-black text-[#172554]">입주자모집공고 주요정보</h5>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">공급위치</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900 break-keep">
                                                    {detailData?.data?.loc && detailData.data.loc !== "-" ? detailData.data.loc : selectedEvent.fullAddr}
                                                </div>
                                            </div>
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">공급규모</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900 break-keep">
                                                    {detailData?.data?.scale && detailData.data.scale !== "-" ? detailData.data.scale : `총 ${selectedEvent.totHshld} 세대`}
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">문의처</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[14px] font-black text-rose-600">
                                                    {detailData?.data?.contact && detailData.data.contact !== "-" ? detailData.data.contact : selectedEvent.contact}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. 주택형별 공급 정보 (데이터가 있을 때만 테이블 노출) */}
                                    {detailData?.data?.models && detailData.data.models.length > 0 && (
                                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Building size={16} className="text-[#172554]" />
                                                    <h5 className="text-[14px] font-black text-[#172554]">주택형별 공급 정보</h5>
                                                </div>
                                                <span className="text-[10px] md:text-[11px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                                                    부동산원 검증 데이터
                                                </span>
                                            </div>
                                            <div className="overflow-x-auto scrollbar-hide">
                                                <table className="w-full text-[12px] md:text-[13px] text-center whitespace-nowrap min-w-[400px]">
                                                    <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-100">
                                                        <tr>
                                                            <th className="py-2.5 px-3">주택형</th>
                                                            <th className="py-2.5 px-3">전용면적</th>
                                                            <th className="py-2.5 px-3">일반공급</th>
                                                            <th className="py-2.5 px-3">특별공급</th>
                                                            <th className="py-2.5 px-3 text-rose-600">최고분양가</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {detailData.data.models.map((model: any, idx: number) => (
                                                            <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                                                <td className="py-3 px-3">
                                                                    <span className="px-2 py-1 bg-[#172554] text-white text-[11px] md:text-[12px] font-black rounded-md">
                                                                        {model.shortType}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-3 text-slate-500 font-bold">
                                                                    {model.area !== "-" ? `${model.area}㎡` : "-"}
                                                                </td>
                                                                <td className="py-3 px-3 font-bold text-slate-700">
                                                                    {model.gnUnits !== "-" ? `${model.gnUnits}세대` : "-"}
                                                                </td>
                                                                <td className="py-3 px-3 font-bold text-slate-700">
                                                                    {model.spUnits !== "-" ? `${model.spUnits}세대` : "-"}
                                                                </td>
                                                                <td className="py-3 px-3 font-black text-rose-600">
                                                                    {model.price}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* 🚀 3. 청약일정 (무조건 틀 유지, 없으면 "-" 표시) */}
                                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                                        <div className="bg-blue-50/50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                                            <CalendarDays size={16} className="text-blue-700" />
                                            <h5 className="text-[14px] font-black text-blue-900">청약일정</h5>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">모집공고일</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900">
                                                    {detailData?.data?.noticeDate && detailData.data.noticeDate !== "-" ? detailData.data.noticeDate : "청약홈 확인 요망"}
                                                </div>
                                            </div>
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">특별공급</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900">
                                                    {detailData?.data?.dateSp && detailData.data.dateSp !== "-" ? detailData.data.dateSp : "-"}
                                                </div>
                                            </div>
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">1순위 / 청약접수</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-black text-blue-700">
                                                    {detailData?.data?.date1 && detailData.data.date1 !== "-" ? detailData.data.date1 : selectedEvent.date}
                                                </div>
                                            </div>
                                            <div className="flex border-b border-slate-100">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">2순위</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900">
                                                    {detailData?.data?.date2 && detailData.data.date2 !== "-" ? detailData.data.date2 : "-"}
                                                </div>
                                            </div>
                                            <div className="flex border-b border-slate-100 bg-rose-50/20">
                                                <div className="w-1/3 sm:w-1/4 bg-rose-50/50 p-3 flex items-center text-[12px] font-bold text-rose-500">당첨자 발표일</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-black text-rose-600">
                                                    {detailData?.data?.winnerDate && detailData.data.winnerDate !== "-" ? detailData.data.winnerDate : "청약홈 확인 요망"}
                                                </div>
                                            </div>
                                            <div className="flex">
                                                <div className="w-1/3 sm:w-1/4 bg-slate-50 p-3 flex items-center text-[12px] font-bold text-slate-500">계약체결일</div>
                                                <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-slate-900">
                                                    {detailData?.data?.contractDate && detailData.data.contractDate !== "-" ? detailData.data.contractDate : "청약홈 확인 요망"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            )}

                            <div className="mt-8 flex gap-3">
                                <a
                                    href="https://www.applyhome.co.kr"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[14px] md:text-[15px] rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    청약홈 원본 보기
                                    <ExternalLink size={16} />
                                </a>
                                <button onClick={() => setSelectedEvent(null)} className="flex-1 py-4 bg-[#172554] hover:bg-[#1e3a8a] text-white font-black text-[14px] md:text-[15px] rounded-xl shadow-lg transition-all active:scale-95">
                                    확인 완료
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}