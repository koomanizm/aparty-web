"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, TrendingUp, MapPin, Calendar } from "lucide-react";

// 🚀 달력과 동일한 지역 필터 키워드 세팅
const REGION_CATEGORIES = ["전체", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];
const REGION_KEYWORDS: { [key: string]: string[] } = {
    "서울/수도권": ["서울", "경기", "인천"],
    "부산/경남": ["부산", "경남", "울산"],
    "대구/경북": ["대구", "경북"],
    "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"],
    "강원/제주": ["강원", "제주"]
};

export default function CompetitionView({ setActiveMenu }: { setActiveMenu: (menu: string) => void }) {
    const [list, setList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRegion, setSelectedRegion] = useState("전체");

    useEffect(() => {
        setIsLoading(true);
        // 🚨 프론트엔드 캐시 완벽 무력화! 주소 뒤에 시간을 붙여서 매번 새로운 요청으로 인식하게 만듭니다.
        fetch(`/api/dashboard/competition?t=${new Date().getTime()}`, { cache: 'no-store' })
            .then(res => res.json())
            .then(res => {
                if (res.data) setList(res.data);
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const filteredList = useMemo(() => {
        return list.filter(item => {
            if (selectedRegion === "전체") return true;
            return REGION_KEYWORDS[selectedRegion].some(kw => item.addr.includes(kw));
        });
    }, [list, selectedRegion]);

    return (
        <div className="w-full bg-[#F5F7FA] pb-32 animate-in fade-in duration-500">
            <div className="bg-white border-b border-[#E5E9F0] shadow-[0_4px_10px_rgba(0,0,0,0.02)]">
                <div className="w-full max-w-[1200px] mx-auto px-5 md:px-6 flex gap-6 overflow-x-auto scrollbar-hide">
                    <button onClick={() => setActiveMenu("calendar")} className="py-4 text-[14px] font-bold text-[#94A3B8] hover:text-[#24324A] transition-colors whitespace-nowrap">
                        청약 일정 달력
                    </button>
                    <button onClick={() => setActiveMenu("competition")} className="py-4 text-[14px] font-black text-[#24324A] border-b-[3px] border-[#24324A] whitespace-nowrap">
                        청약 경쟁률 분석
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 mt-8">
                <div className="mb-6">
                    <h2 className="text-[24px] font-black text-[#24324A] flex items-center gap-2">
                        <TrendingUp className="text-[#C97B49]" /> 최근 6개월 청약 결과 리포트
                    </h2>
                    <p className="text-[#667085] text-[14px] mt-1 font-medium">최근 6개월 이내에 마감된 주요 단지의 경쟁률을 분석합니다.</p>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
                    <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-[#EEF2F6] text-[#7B8794] mr-1">
                        <MapPin size={14} />
                    </div>
                    {REGION_CATEGORIES.map(region => (
                        <button
                            key={region}
                            onClick={() => setSelectedRegion(region)}
                            className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold transition-all border ${selectedRegion === region
                                ? "bg-[#24324A] border-[#24324A] text-white shadow-md"
                                : "bg-white border-[#E3E8EF] text-[#667085] hover:bg-[#F8FAFC]"
                                }`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="h-[400px] flex flex-col items-center justify-center bg-white rounded-[32px] border border-[#E3E8EF] shadow-sm">
                        <Loader2 size={40} className="animate-spin text-[#24324A] mb-4" />
                        <p className="text-[15px] font-bold text-[#98A2B3]">지난 6개월간의 전국 청약 데이터를 분석 중입니다...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredList.length > 0 ? filteredList.map((item) => (
                            <div key={item.id} className="bg-white rounded-[24px] border border-[#E3E8EF] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                <div className="p-6 md:p-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-[#EAF1F8] text-[#4F6B93] text-[11px] font-black px-2 py-0.5 rounded">아파트</span>
                                                <span className="text-[#94A3B8] text-[12px] font-bold flex items-center gap-1">
                                                    <Calendar size={13} /> {item.date} 공고
                                                </span>
                                            </div>
                                            <h3 className="text-[20px] md:text-[22px] font-black text-[#101828] group-hover:text-[#24324A] transition-colors leading-tight">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[#667085] text-[13px] font-medium">
                                                <MapPin size={14} className="text-[#94A3B8]" />
                                                {item.addr}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 md:gap-4">
                                            <div className="bg-[#F8FAFC] border border-[#EEF2F6] rounded-2xl px-5 py-4 text-center min-w-[100px]">
                                                <p className="text-[11px] font-bold text-[#94A3B8] mb-1">평균 경쟁률</p>
                                                <p className="text-[18px] font-black text-[#24324A]">{item.avgRate}<span className="text-[13px] ml-0.5">:1</span></p>
                                            </div>
                                            <div className="bg-[#FFF9F5] border border-[#FFEDE0] rounded-2xl px-5 py-4 text-center min-w-[100px]">
                                                <p className="text-[11px] font-bold text-[#C97B49] mb-1">최고 경쟁률</p>
                                                <p className="text-[18px] font-black text-[#C97B49]">{item.maxRate}<span className="text-[13px] ml-0.5">:1</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 overflow-x-auto scrollbar-hide border border-[#F2F4F7] rounded-xl">
                                        <table className="w-full text-left text-[13px]">
                                            <thead className="bg-[#F9FAFB] text-[#667085] font-bold border-b border-[#F2F4F7]">
                                                <tr>
                                                    <th className="px-4 py-3">주택형</th>
                                                    <th className="px-4 py-3">지역구분</th>
                                                    <th className="px-4 py-3 text-right">공급</th>
                                                    <th className="px-4 py-3 text-right">접수건수</th>
                                                    <th className="px-4 py-3 text-right text-[#24324A]">순위내 경쟁률</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#F2F4F7]">
                                                {item.models.map((model: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-[#FBFCFD] transition-colors">
                                                        <td className="px-4 py-3 font-black text-[#344054]">{model.type}</td>
                                                        <td className="px-4 py-3 text-[#667085] font-medium">{model.region}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-[#667085]">{model.units}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-[#344054]">{model.applied.toLocaleString()}건</td>
                                                        {/* 🚨 경쟁률이 0이면 '0:1' 대신 '미달'로 표시하는 디테일 추가! */}
                                                        <td className="px-4 py-3 text-right font-black text-[#24324A]">
                                                            {model.rate === "0" || model.rate === 0 ? (
                                                                <span className="text-[#94A3B8] font-bold">미달</span>
                                                            ) : (
                                                                `${model.rate} : 1`
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#D0D5DD]">
                                <p className="text-[#98A2B3] font-bold text-[15px]">해당 지역에 최근 6개월 내 마감된 청약 데이터가 없습니다.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}