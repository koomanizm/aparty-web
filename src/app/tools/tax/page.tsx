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
        <div className="min-h-screen bg-[#fdfbf7] p-6 pb-20">
            <div className="max-w-xl mx-auto">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                            <Calculator size={18} strokeWidth={3} />
                        </div>
                        <h1 className="text-lg font-black text-[#4A403A] tracking-tighter">취득세 계산기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all"
                    >
                        <Home size={20} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 size={16} className="text-orange-500" />
                            <label className="text-[15px] font-black text-[#4A403A]">매매가액 입력</label>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={price === 0 ? '' : price.toLocaleString()}
                                onChange={handlePriceChange}
                                placeholder="0"
                                className="w-full bg-[#fdfbf7] border-none rounded-[20px] p-6 text-3xl font-black text-orange-500 focus:ring-4 focus:ring-orange-100 text-right outline-none transition-all"
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4A403A]/30 font-bold">₩</span>
                        </div>
                        <p className="text-right mt-3 text-[#4A403A]/50 text-sm font-bold">
                            약 {(price / 100000000).toFixed(1).replace('.0', '')}억 원
                        </p>
                    </div>

                    <div>
                        <label className="block text-[14px] font-black text-[#4A403A] mb-4">전용 면적 선택</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsOver85(false)}
                                className={`py-4 rounded-2xl font-black text-sm transition-all ${!isOver85 ? 'bg-[#4A403A] text-white shadow-lg' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100'}`}
                            >
                                85㎡ 이하 (국평)
                            </button>
                            <button
                                onClick={() => setIsOver85(true)}
                                className={`py-4 rounded-2xl font-black text-sm transition-all ${isOver85 ? 'bg-[#4A403A] text-white shadow-lg' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100'}`}
                            >
                                85㎡ 초과
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[14px] font-black text-[#4A403A] mb-4">취득 후 주택 수</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setHouseCount(num)}
                                    className={`py-4 rounded-2xl font-black text-sm transition-all ${houseCount === num ? 'bg-orange-500 text-white shadow-lg' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100'}`}
                                >
                                    {num === 3 ? '3주택 이상' : `${num}주택`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 결과 리포트 */}
                <div className="mt-8 bg-[#4A403A] rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-70">
                            <Info size={14} />
                            {/* 🚀 한글로 수정 완료! */}
                            <p className="text-xs font-bold tracking-tight">총 납부 예상 세액</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-orange-400 mb-8 tracking-tighter">
                            {result.total.toLocaleString()} <span className="text-xl font-bold text-white/50 ml-1">원</span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-8">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-white/60">적용 세율</span>
                                <span className="text-xl font-black text-white bg-white/10 px-4 py-1.5 rounded-xl">{result.taxRate}%</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">기본 취득세</span>
                                <span className="font-bold">{result.acquisitionTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">지방교육세</span>
                                <span className="font-bold">{result.educationTax.toLocaleString()} 원</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">농어촌특별세</span>
                                <span className="font-bold">{result.agriTax.toLocaleString()} 원</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-10 text-center text-[11px] text-[#4A403A]/30 leading-relaxed font-bold px-6">
                    본 계산 결과는 지방세법 개정 사항을 바탕으로 한 참고용 수치입니다.<br />
                    실제 세액은 취득 일자 및 감면 조건에 따라 다를 수 있으니 전문 세무사와 상담하세요.
                </p>
            </div>
        </div>
    );
}