"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calculator, ArrowLeft, Home, Info, CheckCircle2 } from 'lucide-react';

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
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-6 pb-20">
            <div className="max-w-xl mx-auto mt-4 md:mt-0">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-xl text-blue-500 shadow-inner">
                            <Calculator size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">취득세 계산기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                {/* 🚀 모바일에서는 p-6, PC에서는 p-8로 여백 최적화 */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-8 md:space-y-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <CheckCircle2 size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">매매가액 입력</label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={price === 0 ? '' : price.toLocaleString()}
                                onChange={handlePriceChange}
                                placeholder="0"
                                /* 🚀 글자 크기를 모바일과 PC에 맞게 반응형으로 조절 */
                                className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#FF8C42] focus:ring-4 focus:ring-orange-100 focus:border-orange-200 text-right outline-none transition-all placeholder:text-gray-200"
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4A403A]/30 font-black text-lg">₩</span>
                        </div>
                        <p className="text-right mt-3 text-[#4A403A]/50 text-[13px] md:text-sm font-bold">
                            약 {(price / 100000000).toFixed(1).replace('.0', '')}억 원
                        </p>
                    </div>

                    <div>
                        <label className="block text-[13px] md:text-[14px] font-black text-[#4A403A] mb-3 md:mb-4">전용 면적 선택</label>
                        <div className="grid grid-cols-2 gap-2.5 md:gap-3">
                            <button
                                onClick={() => setIsOver85(false)}
                                className={`py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[13px] md:text-sm transition-all ${!isOver85 ? 'bg-[#4A403A] text-white shadow-lg scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100 hover:bg-gray-50'}`}
                            >
                                85㎡ 이하 (국평)
                            </button>
                            <button
                                onClick={() => setIsOver85(true)}
                                className={`py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[13px] md:text-sm transition-all ${isOver85 ? 'bg-[#4A403A] text-white shadow-lg scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100 hover:bg-gray-50'}`}
                            >
                                85㎡ 초과
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[13px] md:text-[14px] font-black text-[#4A403A] mb-3 md:mb-4">취득 후 주택 수</label>
                        <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setHouseCount(num)}
                                    className={`py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[12px] md:text-sm transition-all ${houseCount === num ? 'bg-[#FF8C42] text-white shadow-lg scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100 hover:bg-gray-50'}`}
                                >
                                    {num === 3 ? '3주택 이상' : `${num}주택`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 결과 리포트 */}
                {/* 🚀 모바일 패딩 축소 및 글자 크기 최적화 */}
                <div className="mt-6 md:mt-8 bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 opacity-80">
                            <Info size={16} />
                            <p className="text-[13px] font-bold tracking-tight">총 납부 예상 세액</p>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-[#FF8C42] mb-6 md:mb-8 tracking-tighter">
                            {result.total.toLocaleString()} <span className="text-lg md:text-xl font-bold text-white/50 ml-1">원</span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-6 md:pt-8">
                            <div className="flex justify-between items-center">
                                <span className="text-[13px] md:text-sm font-medium text-white/60">적용 세율</span>
                                <span className="text-lg md:text-xl font-black text-[#FF8C42] bg-white/10 px-4 py-1.5 rounded-xl">{result.taxRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">기본 취득세</span>
                                <span className="font-bold">{result.acquisitionTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">지방교육세</span>
                                <span className="font-bold">{result.educationTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">농어촌특별세</span>
                                <span className="font-bold">{result.agriTax.toLocaleString()} 원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 md:mt-10 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold px-4 md:px-6">
                    본 계산 결과는 지방세법 개정 사항을 바탕으로 한 참고용 수치입니다.<br className="hidden md:block" />
                    실제 세액은 취득 일자 및 감면 조건에 따라 다를 수 있으니 전문 세무사와 상담하세요.
                </p>
            </div>
        </div>
    );
}