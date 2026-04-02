"use client";

import { useState } from "react";
import { Search, MapPin, Building2, Calendar, ChevronRight, X, LineChart as LineChartIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

const KOREA_PROVINCES_URL = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo_simple.json";

// 🚀 기획에 맞춘 단지별 가상 데이터 (클릭 시 펼쳐질 10년 차트 데이터 포함)
const MOCK_APTS = [
    {
        id: 1, name: "은마아파트", size: "84㎡", price: "24.5억", date: "26.03.15", floor: "12층", type: "up", change: "+1.2억",
        history: [{ year: "16년", price: 11.2 }, { year: "18년", price: 15.0 }, { year: "20년", price: 21.0 }, { year: "22년", price: 24.5 }, { year: "24년", price: 21.5 }, { year: "26년", price: 24.5 }]
    },
    {
        id: 2, name: "래미안퍼스티지", size: "84㎡", price: "32.0억", date: "26.03.12", floor: "8층", type: "up", change: "+0.5억",
        history: [{ year: "16년", price: 15.2 }, { year: "18년", price: 20.0 }, { year: "20년", price: 28.0 }, { year: "22년", price: 34.0 }, { year: "24년", price: 29.5 }, { year: "26년", price: 32.0 }]
    },
    {
        id: 3, name: "잠실엘스", size: "84㎡", price: "22.8억", date: "26.03.10", floor: "21층", type: "flat", change: "보합",
        history: [{ year: "16년", price: 10.5 }, { year: "18년", price: 14.5 }, { year: "20년", price: 19.5 }, { year: "22년", price: 23.5 }, { year: "24년", price: 19.0 }, { year: "26년", price: 22.8 }]
    },
    {
        id: 4, name: "마포래미안푸르지오", size: "84㎡", price: "18.5억", date: "26.03.08", floor: "15층", type: "down", change: "-0.3억",
        history: [{ year: "16년", price: 8.5 }, { year: "18년", price: 12.0 }, { year: "20년", price: 16.5 }, { year: "22년", price: 19.0 }, { year: "24년", price: 17.5 }, { year: "26년", price: 18.5 }]
    },
    {
        id: 5, name: "아크로리버파크", size: "84㎡", price: "35.5억", date: "26.03.05", floor: "25층", type: "up", change: "+2.0억",
        history: [{ year: "16년", price: 17.5 }, { year: "18년", price: 23.0 }, { year: "20년", price: 31.0 }, { year: "22년", price: 37.0 }, { year: "24년", price: 32.5 }, { year: "26년", price: 35.5 }]
    },
];

export default function RealPriceView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [selectedApt, setSelectedApt] = useState<any>(null);

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto px-4 mt-6">

                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* 좌측: 고정된 지역 선택 지도 (TransactionView 재활용 구조) */}
                    <div className="w-full lg:w-[40%] sticky top-[80px] bg-white rounded-[24px] border border-[#E3E8EF] shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-[#E3E8EF] bg-white z-10 flex items-center justify-between">
                            <h3 className="text-[16px] font-black text-[#172554] flex items-center gap-2">
                                <MapPin size={18} className="text-[#042fc9]" /> 지역 선택
                            </h3>
                        </div>
                        <div className="h-[400px] lg:h-[600px] w-full bg-[#F1F5F9] flex items-center justify-center">
                            <ComposableMap width={400} height={600} projection="geoMercator" projectionConfig={{ scale: 4000, center: [127.5, 35.1] }} className="w-full h-full animate-in fade-in">
                                <ZoomableGroup minZoom={0.5} maxZoom={5}>
                                    <Geographies geography={KOREA_PROVINCES_URL}>
                                        {({ geographies }) => (
                                            <>
                                                {geographies.map((geo) => (
                                                    <Geography
                                                        key={geo.rsmKey}
                                                        geography={geo}
                                                        style={{
                                                            default: { fill: "#E2E8F0", stroke: "#CBD5E1", strokeWidth: 0.8, outline: "none" },
                                                            hover: { fill: "#042fc9", stroke: "#042fc9", strokeWidth: 1.5, outline: "none", cursor: "pointer" },
                                                            pressed: { fill: "#172554", outline: "none" }
                                                        }}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </Geographies>
                                </ZoomableGroup>
                            </ComposableMap>
                        </div>
                    </div>

                    {/* 우측: 실거래가 리스트 및 10년 차트 아코디언 */}
                    <div className="w-full lg:w-[60%] flex flex-col gap-4">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-[20px] font-black text-[#172554]">
                                📍 서울특별시 <span className="text-[#042fc9]">강남구</span> 실거래가
                            </h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input type="text" placeholder="단지명 검색" className="pl-9 pr-4 py-2 bg-white border border-[#E3E8EF] rounded-full text-[13px] font-bold outline-none focus:border-[#042fc9] transition-colors" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {MOCK_APTS.map((apt) => (
                                <div key={apt.id} className={`bg-white rounded-[20px] border transition-all duration-300 overflow-hidden ${selectedApt?.id === apt.id ? 'border-[#042fc9] shadow-md ring-2 ring-[#042fc9]/10' : 'border-[#E3E8EF] hover:border-[#CBD5E1] shadow-sm'}`}>
                                    {/* 리스트 아이템 (클릭 영역) */}
                                    <div
                                        className="p-5 cursor-pointer flex items-center justify-between"
                                        onClick={() => setSelectedApt(selectedApt?.id === apt.id ? null : apt)}
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-[18px] font-black text-[#101828]">{apt.name}</h4>
                                                <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475467] text-[11px] font-bold rounded-md">{apt.size}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[13px] font-semibold text-[#667085]">
                                                <span className="flex items-center gap-1"><Calendar size={14} /> {apt.date}</span>
                                                <span className="flex items-center gap-1"><Building2 size={14} /> {apt.floor}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <p className="text-[22px] font-black text-[#172554] leading-none">{apt.price}</p>
                                            <div className={`flex items-center text-[12px] font-bold ${apt.type === 'up' ? 'text-[#d40606]' : apt.type === 'down' ? 'text-[#042fc9]' : 'text-[#667085]'}`}>
                                                {apt.type === 'up' && <ArrowUpRight size={14} className="mr-0.5" />}
                                                {apt.type === 'down' && <ArrowDownRight size={14} className="mr-0.5" />}
                                                {apt.type === 'flat' && <Minus size={14} className="mr-0.5" />}
                                                {apt.change}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🚀 10년 차트 펼쳐지는 영역 (선택된 단지만 보임) */}
                                    {selectedApt?.id === apt.id && (
                                        <div className="px-5 pb-5 pt-2 border-t border-[#F1F5F9] bg-[#FAFAFA] animate-in slide-in-from-top-4 fade-in">
                                            <div className="flex items-center justify-between mb-4 mt-2">
                                                <h5 className="text-[14px] font-black text-[#344054] flex items-center gap-1.5">
                                                    <LineChartIcon size={16} className="text-[#042fc9]" /> 최근 10년 실거래가 추이 (억)
                                                </h5>
                                                <button className="text-[11px] font-bold text-[#042fc9] bg-[#EEF2FF] px-2.5 py-1 rounded-md hover:bg-[#042fc9] hover:text-white transition-colors">
                                                    단지 상세정보 보기
                                                </button>
                                            </div>
                                            <div className="h-[220px] w-full bg-white rounded-xl p-3 border border-[#E3E8EF]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={apt.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3E8EF" />
                                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} dy={10} />
                                                        <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#667085' }} tickFormatter={(val) => typeof val === 'number' ? val.toFixed(1) : val} />
                                                        <RechartsTooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            formatter={(value: any) => [typeof value === 'number' ? `${value.toFixed(1)}억` : value, "매매가"]}
                                                        />
                                                        <Line type="monotone" dataKey="price" stroke="#042fc9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#042fc9' }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}