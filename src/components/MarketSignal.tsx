"use client";

import React, { useState, useEffect } from 'react';
import { Activity, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

// 🚀 샘플 데이터 (추후 API 연동 가능)
const MARKET_DATA = [
    { region: "전국 종합", score: 82, status: "상승세", trend: [75, 78, 80, 79, 82] },
    { region: "서울권역", score: 115, status: "매수자 많음", trend: [102, 108, 110, 112, 115] },
    { region: "부산/경남", score: 65, status: "관망세", trend: [70, 68, 67, 66, 65] },
    { region: "수도권", score: 95, status: "보합", trend: [90, 92, 94, 95, 95] },
];

export default function MarketSignal() {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 🚀 4초마다 지역 자동 스위칭 (스르륵 효과)
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MARKET_DATA.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const data = MARKET_DATA[currentIndex];

    // 게이지 바늘 각도 계산 (0~100 기준 -90deg ~ 90deg)
    const needleRotation = (data.score / 150) * 180 - 90;

    return (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            {/* 상단 다크 헤더 */}
            <div className="bg-[#4A403A] p-5 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Activity size={18} className="text-[#FF8C42]" />
                    <span className="text-[13px] font-black tracking-tight">부동산 투자심리 지수</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentIndex((prev) => (prev === 0 ? MARKET_DATA.length - 1 : prev - 1))} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><ChevronLeft size={16} /></button>
                    <span className="text-[10px] font-bold w-12 text-center opacity-60">{currentIndex + 1} / {MARKET_DATA.length}</span>
                    <button onClick={() => setCurrentIndex((prev) => (prev + 1) % MARKET_DATA.length)} className="p-1 hover:bg-white/10 rounded-lg transition-colors"><ChevronRight size={16} /></button>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col items-center justify-between">
                {/* 1번 영역: 시장 온도계 (게이지) */}
                <div className="relative w-full flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500" key={data.region}>
                    <p className="text-[15px] font-black text-[#4A403A] mb-4">{data.region}</p>

                    {/* 게이지 비주얼 */}
                    <div className="relative w-40 h-20 overflow-hidden">
                        <div className="absolute w-40 h-40 border-[16px] border-gray-100 rounded-full"></div>
                        <div className={`absolute w-40 h-40 border-[16px] border-t-[#FF8C42] border-r-[#FF8C42] rounded-full rotate-45 opacity-20`}></div>
                        {/* 바늘 */}
                        <div
                            className="absolute bottom-0 left-1/2 w-1.5 h-16 bg-[#4A403A] origin-bottom -translate-x-1/2 transition-transform duration-1000 ease-out"
                            style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF8C42] rounded-full shadow-md"></div>
                        </div>
                    </div>

                    <div className="text-center mt-2">
                        <span className="text-3xl font-black text-[#4A403A]">{data.score}</span>
                        <p className={`text-[11px] font-bold mt-1 ${data.score > 100 ? 'text-red-500' : 'text-blue-500'}`}>{data.status}</p>
                    </div>
                </div>

                {/* 구분선 */}
                <div className="w-full h-px bg-gray-50 my-6"></div>

                {/* 2번 영역: 트렌드 그래프 (Sparkline) */}
                <div className="w-full flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                        <TrendingUp size={14} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-400">최근 5주 추이</span>
                    </div>
                    <div className="flex items-end justify-between h-12 gap-2 px-2">
                        {data.trend.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-700 ${i === data.trend.length - 1 ? 'bg-[#FF8C42]' : 'bg-gray-100 group-hover:bg-orange-100'}`}
                                    style={{ height: `${(val / 150) * 100}%` }}
                                ></div>
                                <span className={`text-[8px] font-bold ${i === data.trend.length - 1 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-3 text-center">
                <p className="text-[9px] font-bold text-gray-300">Data Source: KB부동산 / 한국부동산원</p>
            </div>
        </div>
    );
}