"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, ArrowLeft, Home, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function TaxCalculator() {
    const router = useRouter();

    const [price, setPrice] = useState<number>(500000000);
    const [isOver85, setIsOver85] = useState<boolean>(false);
    const [houseCount, setHouseCount] = useState<number>(1);
    const [isRegulated, setIsRegulated] = useState<boolean>(false);

    const [result, setResult] = useState({
        taxRate: 0,
        acquisitionTax: 0,
        educationTax: 0,
        agriTax: 0,
        total: 0
    });

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '') { setPrice(0); return; }
        if (!isNaN(Number(rawValue))) { setPrice(Number(rawValue)); }
    };

    // 🚀 금액 퀵 추가 버튼을 위한 함수
    const addAmount = (amount: number) => {
        setPrice(prev => prev + amount);
    };

    useEffect(() => {
        let rate = 0;
        let agriRate = isOver85 ? 0.2 : 0;

        if (houseCount === 1) {
            if (price <= 600000000) rate = 1;
            else if (price <= 900000000) rate = (price * (2 / 300000000) - 3);
            else rate = 3;
        } else if (houseCount === 2) {
            rate = isRegulated ? 8 : (price <= 600000000 ? 1 : (price <= 900000000 ? (price * (2 / 300000000) - 3) : 3));
        } else {
            rate = isRegulated ? 12 : 8;
        }

        const acquisitionTax = Math.floor(price * (rate / 100));
        const educationTax = Math.floor(acquisitionTax * 0.1);
        const agriTax = Math.floor(price * (agriRate / 100));

        setResult({
            taxRate: Number(rate.toFixed(2)),
            acquisitionTax,
            educationTax,
            agriTax,
            total: acquisitionTax + educationTax + agriTax
        });
    }, [price, isOver85, houseCount, isRegulated]);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 🚀 상단 네비게이션 (대출이자 계산기와 통일감 부여) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 p-1.5 rounded-lg text-blue-500 shadow-inner">
                        <Calculator size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">취득세 계산기</span>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <Home size={18} strokeWidth={2.5} />
                </button>
            </nav>

            <div className="max-w-2xl mx-auto px-5 mt-6">

                {/* 🚀 입력 섹션 (블루 테마 적용 및 모바일 최적화) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 mb-8">

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                            <Calculator size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">부동산 취득세 계산</h1>
                            <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">주택 수와 면적에 따른 정확한 세금을 확인하세요.</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* 매매가액 입력 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 size={16} className="text-blue-500" strokeWidth={2.5} />
                                <label className="text-[13px] md:text-[14px] font-bold text-gray-600">구입할 주택 가액</label>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={price === 0 ? '' : price.toLocaleString()}
                                    onChange={handlePriceChange}
                                    placeholder="0"
                                    // 🚀 포커스 시 파란색 링이 생기도록 변경
                                    className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-blue-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 text-right outline-none transition-all placeholder:text-gray-200 pr-12"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                            </div>

                            {/* 🚀 퀵 금액 추가 버튼 신규 장착! */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => addAmount(10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">+1천만</button>
                                <button onClick={() => addAmount(50000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">+5천만</button>
                                <button onClick={() => addAmount(100000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">+1억</button>
                                <button onClick={() => setPrice(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                            </div>
                        </div>

                        {/* 전용 면적 선택 */}
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-gray-600 mb-2">전용 면적 선택</label>
                            <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                                {/* 🚀 선택 시 블루 테마가 적용되도록 수정 */}
                                <button
                                    onClick={() => setIsOver85(false)}
                                    className={`py-3.5 md:py-4 rounded-[16px] font-black text-[13px] md:text-[14px] transition-all ${!isOver85 ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'}`}
                                >
                                    85㎡ 이하 (국평)
                                </button>
                                <button
                                    onClick={() => setIsOver85(true)}
                                    className={`py-3.5 md:py-4 rounded-[16px] font-black text-[13px] md:text-[14px] transition-all ${isOver85 ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'}`}
                                >
                                    85㎡ 초과
                                </button>
                            </div>
                        </div>

                        {/* 취득 후 주택 수 */}
                        <div>
                            <label className="block text-[13px] md:text-[14px] font-bold text-gray-600 mb-2">취득 후 주택 수</label>
                            <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                                {[1, 2, 3].map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setHouseCount(num)}
                                        className={`py-3.5 md:py-4 rounded-[16px] font-black text-[12px] md:text-[14px] transition-all ${houseCount === num ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/50 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'}`}
                                    >
                                        {num === 3 ? '3주택 이상' : `${num}주택`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🚀 결과 리포트 (블루 그라데이션 박스) */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                    {/* 배경 장식 로고 */}
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <Calculator size={160} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Info size={16} className="text-blue-100" />
                            <p className="text-[13px] font-bold text-blue-100 tracking-tight">총 납부 예상 세액</p>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-6 md:mb-8 tracking-tighter flex items-baseline gap-1.5">
                            {result.total.toLocaleString()} <span className="text-lg md:text-xl font-bold text-blue-100">원</span>
                        </h2>

                        <div className="space-y-3 border-t border-blue-400/50 pt-5 md:pt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[12px] md:text-[13px] font-bold text-blue-100">적용 취득세율</span>
                                <span className="text-[13px] md:text-sm font-black text-blue-600 bg-white px-3 py-1 rounded-lg shadow-sm">{result.taxRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-blue-50">
                                <span>기본 취득세</span>
                                <span className="font-bold">{result.acquisitionTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-blue-50">
                                <span>지방교육세</span>
                                <span className="font-bold">{result.educationTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-blue-50">
                                <span>농어촌특별세</span>
                                <span className="font-bold">{result.agriTax.toLocaleString()} 원</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 안내 문구 */}
                <div className="mt-8 flex items-start gap-2 text-[11px] md:text-[12px] leading-relaxed text-gray-400 bg-gray-50 p-4 rounded-xl">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>본 계산 결과는 지방세법 개정 사항을 바탕으로 한 단순 시뮬레이션입니다. 실제 세액은 취득 일자 및 생애최초 등 개별 감면 조건에 따라 달라질 수 있으므로, 정확한 세액은 전문 세무사나 관할 시군구청을 통해 확인해 주시기 바랍니다.</p>
                </div>

            </div>
        </main>
    );
}