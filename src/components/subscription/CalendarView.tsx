"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Loader2,
} from "lucide-react";
// 🚀 분리해둔 모달창 컴포넌트를 불러옵니다!
import CalendarDetailModal from "./CalendarDetailModal";

const REGION_CATEGORIES = ["전체", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];
const REGION_KEYWORDS: { [key: string]: string[] } = {
    "서울/수도권": ["서울", "경기", "인천"],
    "부산/경남": ["부산", "경남", "울산"],
    "대구/경북": ["대구", "경북"],
    "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"],
    "강원/제주": ["강원", "제주"]
};

// 🎨 [최종 컬러 완벽 반영] 재공급 색상 업데이트 및 최종 라인업
const TYPE_FILTERS = [
    { id: "전체", label: "전체보기", baseClass: "bg-[#172554] text-white border border-[#172554]" },
    { id: "특별공급", label: "특별공급", baseClass: "bg-[#06bf0c] text-white border border-[#06bf0c]" },
    { id: "1순위", label: "1순위", baseClass: "bg-[#042fc9] text-white border border-[#042fc9]" },
    { id: "2순위", label: "2순위", baseClass: "bg-[#fc670a] text-white border border-[#fc670a]" },
    { id: "무순위", label: "무순위", baseClass: "bg-white text-[#29bf04] border border-[#29bf04]" },
    { id: "임의공급", label: "임의공급", baseClass: "bg-white text-[#6B21A8] border border-[#D8B4FE]" },
    { id: "재공급", label: "재공급", baseClass: "bg-white text-[#f205ab] border border-[#f205ab]" }, // 👈 재공급: #f205ab
    { id: "오피스텔/생숙/도생/민간임대", label: "오피/도생/임대", baseClass: "bg-white text-[#d40606] border border-[#d40606]" },
    { id: "공공지원민간임대", label: "공공지원임대", baseClass: "bg-white text-[#0369A1] border border-[#BAE6FD]" }
];

const getTypeStyle = (type: string) => {
    switch (type) {
        case "무순위":
            return { boxClass: "bg-white border border-[#29bf04]", textClass: "text-[#29bf04] font-bold", label: "무순위", solid: false };
        case "임의공급":
            return { boxClass: "bg-white border border-[#D8B4FE]", textClass: "text-[#6B21A8] font-bold", label: "임의공급", solid: false };
        case "재공급":
            return { boxClass: "bg-white border border-[#f205ab]", textClass: "text-[#f205ab] font-bold", label: "재공급", solid: false }; // 👈 재공급: #f205ab
        case "오피스텔/생숙/도생/민간임대":
            return { boxClass: "bg-white border border-[#d40606]", textClass: "text-[#d40606] font-bold", label: "오피/도생/임대", solid: false };
        case "공공지원민간임대":
            return { boxClass: "bg-white border border-[#BAE6FD]", textClass: "text-[#0369A1] font-bold", label: "공공지원임대", solid: false };
        case "특별공급":
            return { boxClass: "bg-[#06bf0c] border border-[#06bf0c]", textClass: "text-white", label: "특별공급", solid: true };
        case "2순위":
            return { boxClass: "bg-[#fc670a] border border-[#fc670a]", textClass: "text-white", label: "2순위", solid: true };
        case "1순위":
        default:
            return { boxClass: "bg-[#042fc9] border border-[#042fc9]", textClass: "text-white", label: "1순위", solid: true };
    }
};

const fetchCalendarData = async (year: number, month: number) => {
    try {
        const formattedMonth = String(month).padStart(2, "0");
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
                    houseManageNo: item.id?.split("_")[0] || "",
                    houseSecd: item.id?.split("_")[3] || "01",
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
    } catch {
        return [];
    }
};

export default function CalendarView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
    const [selectedRegion, setSelectedRegion] = useState("전체");
    const [selectedType, setSelectedType] = useState("전체");

    useEffect(() => {
        setIsLoading(true);
        fetchCalendarData(currentDate.getFullYear(), currentDate.getMonth() + 1).then(data => {
            setEvents(data);
            setIsLoading(false);
        });
    }, [currentDate]);

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
            const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = filteredEvents.filter(e => e.date === dateString);
            calendarCells.push({ type: "day", day, dateString, events: dayEvents, key: `day-${day}` });
        }
    }

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="bg-white border-b border-[#E5E9F0] shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-[1200px] mx-auto px-5 md:px-6 flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveMenu("calendar")} className="py-4 text-[14px] font-black text-[#24324A] border-b-[3px] border-[#24324A] whitespace-nowrap">
                        청약 일정 달력
                    </button>
                    <button onClick={() => setActiveMenu("competition")} className="py-4 text-[14px] font-bold text-[#94A3B8] hover:text-[#24324A] transition-colors whitespace-nowrap">
                        청약 경쟁률 분석
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-6">
                <div className="flex flex-col gap-3 mb-4 pb-1">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white px-5 md:px-6 py-4 md:py-5 rounded-t-[24px] border border-[#E3E8EF] border-b-0 shadow-sm gap-4 lg:gap-0">
                    <div className="flex items-center gap-3 mb-3 lg:mb-0">
                        <div className="flex items-center gap-1 bg-[#F7F9FC] rounded-full p-1 border border-[#EDF1F5]">
                            <button onClick={prevMonth} className="p-1.5 text-[#8A94A6] hover:text-[#24324A] hover:bg-white rounded-full transition-all shadow-sm">
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>
                            <h2 className="text-[18px] md:text-[22px] font-black text-[#24324A] tracking-tighter w-[100px] md:w-[120px] text-center">
                                {year}. {String(month + 1).padStart(2, "0")}
                            </h2>
                            <button onClick={nextMonth} className="p-1.5 text-[#8A94A6] hover:text-[#24324A] hover:bg-white rounded-full transition-all shadow-sm">
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="text-[12px] md:text-[13px] font-bold text-[#667085] bg-white border border-[#E3E8EF] hover:bg-[#F8FAFC] hover:text-[#24324A] px-4 py-2 rounded-full transition-all shadow-sm"
                        >
                            오늘로 이동
                        </button>
                    </div>

                    <div className="flex flex-col items-start gap-2 w-full lg:w-auto">
                        <div className="flex items-center justify-start gap-1.5 w-full">
                            {TYPE_FILTERS.slice(0, 4).map(filter => {
                                const isActive = selectedType === filter.id;
                                const isDimmed = selectedType !== "전체" && !isActive;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedType(filter.id)}
                                        className={`flex-1 py-1.5 rounded-md text-[11px] md:text-[12px] font-extrabold transition-all shadow-sm whitespace-nowrap ${filter.baseClass} ${isActive ? "ring-2 ring-offset-1 ring-[#D6DCE5] scale-[1.02] shadow-md" : ""
                                            } ${isDimmed ? "opacity-40 hover:opacity-100" : "opacity-100 hover:scale-[1.02]"}`}
                                    >
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
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedType(filter.id)}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] md:text-[11px] font-bold transition-all shadow-sm ${filter.baseClass} ${isActive ? "ring-2 ring-offset-1 ring-[#D6DCE5] scale-[1.02] shadow-md" : ""
                                            } ${isDimmed ? "opacity-40 hover:opacity-100" : "opacity-100 hover:scale-[1.02]"}`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                            <div className="w-px h-3.5 bg-[#D5DBE3] mx-0.5"></div>
                            {TYPE_FILTERS.slice(7, 9).map(filter => {
                                const isActive = selectedType === filter.id;
                                const isDimmed = selectedType !== "전체" && !isActive;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedType(filter.id)}
                                        className={`px-2.5 py-1.5 rounded-md text-[10px] md:text-[11px] font-bold transition-all shadow-sm ${filter.baseClass} ${isActive ? "ring-2 ring-offset-1 ring-[#D6DCE5] scale-[1.02] shadow-md" : ""
                                            } ${isDimmed ? "opacity-40 hover:opacity-100" : "opacity-100 hover:scale-[1.02]"}`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-[#E3E8EF] rounded-b-[24px] shadow-sm overflow-hidden">
                    <div className="grid grid-cols-5 border-b border-[#EEF2F6] bg-[#F8FAFC]">
                        {["월", "화", "수", "목", "금"].map((day, idx) => (
                            <div key={idx} className="py-3.5 text-center text-[13px] font-black text-[#6B7280]">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-5">
                        {isLoading ? (
                            <div className="col-span-5 h-[400px] flex flex-col items-center justify-center">
                                <Loader2 size={32} className="animate-spin text-[#24324A] mb-3" />
                                <p className="text-[13px] font-bold text-[#98A2B3]">청약 일정을 불러오는 중입니다...</p>
                            </div>
                        ) : (
                            calendarCells.map((cell) => (
                                <div
                                    key={cell.key}
                                    className={`min-h-[120px] md:min-h-[140px] p-2 border-b border-r border-[#F0F3F7] ${cell.type === "empty" ? "bg-[#FAFBFD]" : "bg-white hover:bg-[#FBFCFE] transition-colors"
                                        }`}
                                >
                                    {cell.type === "day" && (
                                        <>
                                            <div className="flex justify-between items-start mb-2 px-1">
                                                <span
                                                    className={`text-[13px] md:text-[15px] font-black ${new Date().toISOString().split("T")[0] === cell.dateString
                                                        ? "bg-[#172554] text-white w-6 h-6 flex items-center justify-center rounded-full shadow-md -ml-1 -mt-1"
                                                        : "text-[#475467]"
                                                        }`}
                                                >
                                                    {cell.day}
                                                </span>
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

            {/* 🚀 분리된 모달 컴포넌트를 깔끔하게 호출합니다 */}
            {selectedEvent && (
                <CalendarDetailModal
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                />
            )}
        </div>
    );
}