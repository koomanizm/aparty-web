"use client";

// 🚀 여기에 Activity 가 빠져있어서 추가했습니다!
import { X, MapPin, TrendingUp, CalendarDays, Building, Trophy, Users2, Phone, RefreshCcw, Activity } from "lucide-react";

interface Props {
    selectedItem: any;
    setSelectedItem: (item: any) => void;
    historyData: any[];
    isHistoryLoading: boolean;
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
}

export default function DashboardDetailModal({
    selectedItem,
    setSelectedItem,
    historyData,
    isHistoryLoading,
    activeIndex,
    setActiveIndex,
}: Props) {
    if (!selectedItem) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => { setSelectedItem(null); setActiveIndex(null); }}>
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="bg-[#4A403A] p-6 flex justify-between items-center text-white">
                    <h3 className="font-black text-lg truncate pr-4">{selectedItem.type === "transaction" ? "단지 실거래 분석" : "공급 상세 내역"}</h3>
                    <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-7 max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <h4 className="text-2xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
                    <p className="text-sm font-bold text-[#FF8C42] mb-6 flex items-center gap-1"><MapPin size={14} /> {selectedItem.details?.fullAddr || selectedItem.addr}</p>

                    {selectedItem.type === "transaction" && (
                        <div className="mb-8 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-[13px] font-black text-gray-700 flex items-center gap-1.5"><TrendingUp size={16} className="text-blue-500" /> 최근 1년 실거래 추이</h5>
                                <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">단위: 만원</span>
                            </div>
                            <div className="h-6 mb-3 flex items-center justify-center">
                                {activeIndex !== null && historyData[activeIndex] ? (
                                    <div className="animate-in fade-in zoom-in duration-200 flex items-center gap-2">
                                        <span className="text-[11px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{historyData[activeIndex].date}</span>
                                        <span className="text-[14px] font-black text-[#4A403A]">{historyData[activeIndex].price.toLocaleString()}만원</span>
                                    </div>
                                ) : historyData.length > 0 && (
                                    <span className="text-[10px] text-gray-300 font-bold">그래프의 점을 클릭해 정확한 가격을 확인하세요!</span>
                                )}
                            </div>
                            {isHistoryLoading ? (
                                <div className="h-[120px] flex flex-col items-center justify-center text-gray-400 text-[11px] animate-pulse">
                                    <RefreshCcw size={20} className="animate-spin mb-2" />데이터 분석 중...
                                </div>
                            ) : historyData.length > 1 ? (
                                <div className="relative w-full h-[130px] mt-2">
                                    <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                        <line x1="0" y1="0" x2="300" y2="0" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                                        <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                                        {(() => {
                                            const minPrice = Math.min(...historyData.map(d => d.price));
                                            const maxPrice = Math.max(...historyData.map(d => d.price));
                                            const range = maxPrice - minPrice || 1000;
                                            const points = historyData.map((d, i) => {
                                                const x = (i / (historyData.length - 1)) * 300;
                                                const y = 100 - ((d.price - minPrice) / range) * 80 - 10;
                                                return `${x},${y}`;
                                            }).join(" ");
                                            return (
                                                <>
                                                    <path d={`M ${points}`} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                    {historyData.map((d, i) => {
                                                        const x = (i / (historyData.length - 1)) * 300;
                                                        const y = 100 - ((d.price - minPrice) / range) * 80 - 10;
                                                        const isActive = activeIndex === i;
                                                        return (
                                                            <g key={i} onClick={() => setActiveIndex(i)} className="cursor-pointer group">
                                                                {isActive && <line x1={x} y1="0" x2={x} y2="100" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2,2" />}
                                                                <circle cx={x} cy={y} r={isActive ? "6" : "3.5"} fill={isActive ? "#3B82F6" : "white"} stroke="#3B82F6" strokeWidth="2.5" className="transition-all" />
                                                                <circle cx={x} cy={y} r="15" fill="transparent" />
                                                                <text x={x} y={120} textAnchor="middle" fontSize="9" fill={isActive ? "#3B82F6" : "#9CA3AF"} fontWeight={isActive ? "900" : "bold"}>{d.date}</text>
                                                            </g>
                                                        );
                                                    })}
                                                </>
                                            );
                                        })()}
                                    </svg>
                                </div>
                            ) : (<div className="h-[120px] flex items-center justify-center text-gray-400 text-[11px] italic">거래 데이터가 분석 중이거나 이력이 적습니다.</div>)}
                        </div>
                    )}

                    <div className="space-y-4">
                        {selectedItem.type === "transaction" ? (
                            <>
                                <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 최근 실거래가</span><span className="font-black text-xl text-[#FF8C42]">{selectedItem.val}</span></div>
                                <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.fullDate || selectedItem.date || "-"}</span></div>
                                <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 연식 / 층수</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.buildYear}년 / {selectedItem.details?.floor}층</span></div>
                                <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><TrendingUp size={16} /> 전용면적</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.area}㎡</span></div>
                            </>
                        ) : (
                            <>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span><span className="font-black text-blue-500">{selectedItem.val}</span></div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 모집공고일</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.rcritPblancDe || "-"}</span></div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 공급세대</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.totHshld}</span></div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.contact}</span></div>
                            </>
                        )}
                    </div>
                    <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="w-full mt-10 py-4 bg-[#4A403A] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">확인</button>
                </div>
            </div>
        </div>
    );
}