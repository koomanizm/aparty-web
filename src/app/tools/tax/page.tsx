"use client";

import React, { useState, useEffect } from 'react';
// ✅ 1. 페이지 이동을 위한 useRouter를 반드시 불러와야 합니다!
import { useRouter } from 'next/navigation';

export default function TaxCalculator() {
    // ✅ 2. router 기능을 사용할 준비를 합니다.
    const router = useRouter();

    const [price, setPrice] = useState<number>(500000000); // 기본값 5억
    const [isOver85, setIsOver85] = useState<boolean>(false); // 85㎡ 초과 여부
    const [houseCount, setHouseCount] = useState<number>(1); // 주택 수
    const [isRegulated, setIsRegulated] = useState<boolean>(false); // 조정대상지역 여부

    const [result, setResult] = useState({
        taxRate: 0,
        acquisitionTax: 0,
        educationTax: 0,
        agriTax: 0,
        total: 0
    });

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        if (rawValue === '') {
            setPrice(0);
            return;
        }

        if (!isNaN(Number(rawValue))) {
            setPrice(Number(rawValue));
        }
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
        <div className="min-h-screen bg-[#FFF8F0] p-5 pb-20">
            <div className="max-w-md mx-auto">
                {/* 헤더 */}
                <div className="flex items-center gap-3 mb-8">
                    {/* ✅ 3. 디자인이 통일된 새 '홈으로' 버튼 */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#4A403A]/10 text-[#4A403A] text-sm font-bold shadow-sm hover:bg-[#FF8C42] hover:border-[#FF8C42] hover:text-white transition-all group"
                    >
                        <span className="group-hover:-translate-y-1 transition-transform duration-300">🏠</span>
                        홈으로
                    </button>
                    <h1 className="text-2xl font-bold text-[#4A403A]">취득세 계산기</h1>
                </div>

                {/* 입력 카드 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#4A403A]/5 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-3">매매가액 (원)</label>
                        <input
                            type="text"
                            value={price === 0 ? '' : price.toLocaleString()}
                            onChange={handlePriceChange}
                            placeholder="0"
                            className="w-full bg-[#FFF8F0] border-none rounded-xl p-4 text-2xl font-black text-[#FF8C42] focus:ring-2 focus:ring-[#FF8C42] text-right outline-none transition-shadow"
                        />
                        <p className="text-right mt-2 text-[#4A403A]/60 text-sm font-medium">
                            {(price / 100000000).toFixed(1).replace('.0', '')} 억 원
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setIsOver85(false)}
                            className={`py-3.5 rounded-xl font-bold transition-all shadow-sm ${!isOver85 ? 'bg-[#FF8C42] text-white ring-2 ring-[#FF8C42] ring-offset-2' : 'bg-[#FFF8F0] text-[#4A403A]/40 hover:bg-[#ffe8d6]'}`}
                        >
                            85㎡ 이하
                        </button>
                        <button
                            onClick={() => setIsOver85(true)}
                            className={`py-3.5 rounded-xl font-bold transition-all shadow-sm ${isOver85 ? 'bg-[#FF8C42] text-white ring-2 ring-[#FF8C42] ring-offset-2' : 'bg-[#FFF8F0] text-[#4A403A]/40 hover:bg-[#ffe8d6]'}`}
                        >
                            85㎡ 초과
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-3">보유 주택 수 (취득 후 기준)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setHouseCount(num)}
                                    className={`py-3.5 rounded-xl font-bold transition-all shadow-sm ${houseCount === num ? 'bg-[#4A403A] text-white ring-2 ring-[#4A403A] ring-offset-2' : 'bg-[#FFF8F0] text-[#4A403A]/40 hover:bg-[#ffe8d6]'}`}
                                >
                                    {num === 3 ? '3주택 이상' : `${num}주택`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 결과 카드 */}
                <div className="mt-6 bg-[#4A403A] rounded-3xl p-8 text-white shadow-xl animate-float">
                    <p className="text-[#FFF8F0]/70 text-sm mb-1 font-medium">총 납부 예상액</p>
                    <h2 className="text-4xl font-black text-[#FF8C42] mb-6 tracking-tight">
                        {result.total.toLocaleString()} <span className="text-2xl font-bold text-white/80">원</span>
                    </h2>

                    <div className="space-y-3.5 text-sm border-t border-white/10 pt-6">
                        <div className="flex justify-between items-center">
                            <span className="opacity-70 font-medium">적용 세율</span>
                            <span className="font-bold text-lg bg-white/10 px-2.5 py-1 rounded-lg">{result.taxRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">취득세</span>
                            <span className="font-medium">{result.acquisitionTax.toLocaleString()} 원</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">지방교육세</span>
                            <span className="font-medium">{result.educationTax.toLocaleString()} 원</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="opacity-70">농어촌특별세</span>
                            <span className="font-medium">{result.agriTax.toLocaleString()} 원</span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-medium">
                    본 계산기는 참고용이며, 실제 세액은 개별 상황(감면 혜택, 정확한 지역 등)에 따라 다를 수 있습니다.<br />정확한 세금은 세무사 등 전문가에게 확인하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}