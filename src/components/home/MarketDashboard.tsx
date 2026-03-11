"use client";
import Link from "next/link";
import { Activity, Trophy, CalendarDays, Users2, RefreshCcw, ChevronRight } from "lucide-react";

interface Props {
    dashboardTab: "transaction" | "competition" | "calendar" | "population";
    setDashboardTab: (tab: "transaction" | "competition" | "calendar" | "population") => void;
    dashboardRegion: string;
    setDashboardRegion: (region: string) => void;
    regionCodesList: string[];
    apiData: any[];
    isApiLoading: boolean;
    setSelectedItem: (item: any) => void;
}

export default function MarketDashboard({
    dashboardTab, setDashboardTab, dashboardRegion, setDashboardRegion,
    regionCodesList, apiData, isApiLoading, setSelectedItem
}: Props) {
    return (
        <div className="w-full bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col h-full overflow-hidden">
            <div className="grid grid-cols-2 md:flex bg-gray-50 rounded-xl p-1 mb-4 md:mb-5 shrink-0 gap-1">
                <button onClick={() => setDashboardTab("transaction")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400"}`}><Activity className="w-3.5 h-3.5 md:w-4 md:h-4" /> 실거래가</button>
                <button onClick={() => setDashboardTab("competition")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400"}`}><Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약경쟁률</button>
                <button onClick={() => setDashboardTab("calendar")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}><CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약일정</button>
                <button onClick={() => setDashboardTab("population")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400"}`}><Users2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> 인구유입</button>
            </div>
            <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-1.5 mb-4 md:mb-6 pb-1 w-full">
                {regionCodesList.map(region => (
                    <button key={region} onClick={() => setDashboardRegion(region)} className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-extrabold transition-all ${dashboardRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100"}`}>{region}</button>
                ))}
            </div>
            <div className="flex-1 min-h-[300px] md:min-h-[380px] flex flex-col">
                {isApiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 flex-1"><RefreshCcw className="animate-spin text-[#FF8C42] mb-2" size={24} /></div>
                ) : (
                    <div className="space-y-3 md:space-y-3.5 animate-in fade-in duration-500 flex-1">
                        {apiData.length > 0 ? apiData.map((item, idx) => (
                            <div key={idx} onClick={() => { if (item.type) setSelectedItem(item); }} className="flex justify-between items-center border-b border-gray-50 pb-2 md:pb-3 cursor-pointer hover:bg-orange-50/50 rounded-lg px-2 transition-colors">
                                <div className="flex-1 min-w-0 pr-3 text-left">
                                    <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                                        <p className="text-[13px] md:text-[15px] font-bold text-[#4A403A] truncate min-w-0">{item.title}</p>
                                        <span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-white border border-gray-100 px-1 py-0.5 rounded shrink-0">{item.addr}</span>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] text-gray-400 font-medium truncate w-full">{item.sub} {item.date && `· ${item.date}`}</p>
                                </div>
                                <div className="text-right shrink-0 ml-1"><p className={`text-[13px] md:text-[16px] font-black ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>{item.val}</p></div>
                            </div>
                        )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">데이터를 불러오지 못했습니다.</p>}
                    </div>
                )}
                {apiData.length > 0 && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 flex items-center justify-between border-t border-gray-50">
                        <span className="text-[9px] md:text-[11px] font-bold text-gray-300">자료출처: {dashboardTab === "transaction" ? "국토교통부 실거래가" : dashboardTab === "population" ? "국가통계포털(KOSIS)" : "한국부동산원 (청약홈)"}</span>
                        <Link href={`/more/${dashboardTab}`} className="flex items-center gap-1 text-[11px] md:text-[12px] font-bold text-gray-400 hover:text-[#FF8C42] transition-colors">전체보기 <ChevronRight size={14} strokeWidth={3} /></Link>
                    </div>
                )}
            </div>
        </div>
    );
}