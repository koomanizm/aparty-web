"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoanCalculator() {
    const router = useRouter();

    const [price, setPrice] = useState<number>(500000000); // 집값 5억
    const [income, setIncome] = useState<number>(60000000); // 연소득 6천
    const [loanAmount, setLoanAmount] = useState<number>(300000000); // 필요 대출금 3억
    const [term, setTerm] = useState<number>(30); // 대출기간 30년

    const [results, setResults] = useState<any>(null);

    // 콤마 자동 생성 핸들러 (집값, 소득, 대출금 공통)
    const handleNumberInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '') { setter(0); return; }
        if (!isNaN(Number(rawValue))) setter(Number(rawValue));
    };

    // 원리금 균등 상환 계산 공식 (월 납입금)
    const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
        if (principal <= 0) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;
        const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return Math.floor(payment);
    };

    useEffect(() => {
        // 1. 디딤돌 대출 (금리 약 2.5%, 집값 6억 이하, 소득 6천(신혼 8.5천) 이하, 한도 2.5~4억)
        const didimdolEligible = price <= 600000000 && income <= 85000000 && loanAmount <= 400000000;
        const didimdolPayment = calculateMonthlyPayment(loanAmount, 2.5, term);

        // 2. 보금자리론 (금리 약 4.2%, 집값 6억 이하, 한도 3.6억)
        const bogeumjariEligible = price <= 600000000 && loanAmount <= 360000000;
        const bogeumjariPayment = calculateMonthlyPayment(loanAmount, 4.2, term);

        // 3. 시중은행 주담대 (금리 약 4.5%, 규제 덜함)
        const bankPayment = calculateMonthlyPayment(loanAmount, 4.5, term);

        setResults({
            didimdol: { eligible: didimdolEligible, payment: didimdolPayment, rate: "연 2.0~3.15%" },
            bogeumjari: { eligible: bogeumjariEligible, payment: bogeumjariPayment, rate: "연 4.2~4.5%" },
            bank: { eligible: true, payment: bankPayment, rate: "연 4.0~5.0%" }
        });
    }, [price, income, loanAmount, term]);

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-5 pb-20">
            <div className="max-w-3xl mx-auto">
                {/* 헤더 */}
                <div className="flex items-center gap-3 mb-8">
                    {/* 🏠 공통 '홈으로' 버튼 */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-[#4A403A]/10 text-[#4A403A] text-sm font-bold shadow-sm hover:bg-[#FF8C42] hover:border-[#FF8C42] hover:text-white transition-all group"
                    >
                        <span className="group-hover:-translate-y-1 transition-transform duration-300">🏠</span>
                        홈으로
                    </button>
                    <h1 className="text-2xl font-bold text-[#4A403A]">주택대출 비교 계산기</h1>
                </div>

                {/* 정보 입력창 */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#4A403A]/5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-2">구입할 집값 (원)</label>
                        <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-xl font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                        <p className="text-right mt-1 text-xs text-gray-500 font-medium">{(price / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-2">부부합산 연소득 (원)</label>
                        <input type="text" value={income === 0 ? '' : income.toLocaleString()} onChange={handleNumberInput(setIncome)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-xl font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                        <p className="text-right mt-1 text-xs text-gray-500 font-medium">{(income / 10000000).toFixed(1).replace('.0', '')} 천만 원</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-2">필요한 대출금 (원)</label>
                        <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-xl font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                        <p className="text-right mt-1 text-xs text-gray-500 font-medium">{(loanAmount / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-[#4A403A] mb-2">대출 기간</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[30, 40, 50].map((y) => (
                                <button key={y} onClick={() => setTerm(y)} className={`py-3 rounded-xl font-bold transition-all shadow-sm ${term === y ? 'bg-[#4A403A] text-white' : 'bg-[#FFF8F0] text-[#4A403A]/50 hover:bg-[#ffe8d6]'}`}>{y}년</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3종 비교 결과 카드 */}
                <h2 className="text-xl font-bold text-[#4A403A] mb-4">💡 예상 월 상환액 (원리금 균등)</h2>
                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* 1. 디딤돌 대출 */}
                        <div className={`p-6 rounded-3xl border-2 transition-all ${results.didimdol.eligible ? 'bg-white border-[#FF8C42] shadow-md transform hover:-translate-y-1' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${results.didimdol.eligible ? 'bg-[#FF8C42]/10 text-[#FF8C42]' : 'bg-gray-200 text-gray-500'}`}>국책대출</span>
                                    <h3 className="text-lg font-black text-[#4A403A] mt-1">디딤돌 대출</h3>
                                </div>
                            </div>
                            {results.didimdol.eligible ? (
                                <>
                                    <p className="text-sm text-gray-500 mb-1">예상 금리: {results.didimdol.rate}</p>
                                    <p className="text-2xl font-black text-[#FF8C42]">{results.didimdol.payment.toLocaleString()} <span className="text-sm text-gray-500">원/월</span></p>
                                </>
                            ) : (
                                <p className="text-sm font-bold text-red-400 mt-4">집값, 소득 또는 한도 초과로 대상이 아닐 수 있습니다.</p>
                            )}
                        </div>

                        {/* 2. 보금자리론 */}
                        <div className={`p-6 rounded-3xl border-2 transition-all ${results.bogeumjari.eligible ? 'bg-white border-[#3b82f6] shadow-md transform hover:-translate-y-1' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${results.bogeumjari.eligible ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-gray-200 text-gray-500'}`}>국책대출</span>
                                    <h3 className="text-lg font-black text-[#4A403A] mt-1">보금자리론</h3>
                                </div>
                            </div>
                            {results.bogeumjari.eligible ? (
                                <>
                                    <p className="text-sm text-gray-500 mb-1">예상 금리: {results.bogeumjari.rate}</p>
                                    <p className="text-2xl font-black text-[#3b82f6]">{results.bogeumjari.payment.toLocaleString()} <span className="text-sm text-gray-500">원/월</span></p>
                                </>
                            ) : (
                                <p className="text-sm font-bold text-red-400 mt-4">집값 또는 한도 초과로 대상이 아닐 수 있습니다.</p>
                            )}
                        </div>

                        {/* 3. 시중은행 주담대 */}
                        <div className="bg-[#4A403A] p-6 rounded-3xl border-2 border-[#4A403A] shadow-md transform hover:-translate-y-1 text-white">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/20 text-white">일반대출</span>
                                    <h3 className="text-lg font-black text-white mt-1">시중은행 주담대</h3>
                                </div>
                            </div>
                            <p className="text-sm text-white/70 mb-1">예상 금리: {results.bank.rate}</p>
                            <p className="text-2xl font-black text-[#FF8C42]">{results.bank.payment.toLocaleString()} <span className="text-sm text-white/70">원/월</span></p>
                        </div>
                    </div>
                )}

                <p className="mt-8 text-center text-xs text-[#4A403A]/50 leading-relaxed font-medium">
                    본 계산 결과는 단순 참고용 가이드라인이며, 실제 금리와 한도는 <br className="hidden md:block" />신용점수, DSR 규제, 다자녀 혜택 등에 따라 크게 달라질 수 있습니다.
                </p>

                {/* 영업 수익화 포인트: 상담 연결 버튼 */}
                <div className="mt-8 flex justify-center">
                    <button className="bg-[#FF8C42] text-white px-8 py-4 rounded-full font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                        <span>💬</span> 내 조건에 맞는 최저금리 상담하기
                    </button>
                </div>
            </div>
        </div>
    );
}