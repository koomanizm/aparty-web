"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, ArrowLeft, Home, Wallet, Coins, Calendar, MessageSquare, Info } from 'lucide-react';

export default function LoanCalculator() {
    const router = useRouter();

    const [price, setPrice] = useState<number>(500000000);
    const [income, setIncome] = useState<number>(60000000);
    const [loanAmount, setLoanAmount] = useState<number>(300000000);
    const [term, setTerm] = useState<number>(30);

    const [results, setResults] = useState<any>(null);

    const handleNumberInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '') { setter(0); return; }
        if (!isNaN(Number(rawValue))) setter(Number(rawValue));
    };

    const calculateMonthlyPayment = (principal: number, annualRate: number, years: number) => {
        if (principal <= 0) return 0;
        const monthlyRate = (annualRate / 100) / 12;
        const months = years * 12;
        const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        return Math.floor(payment);
    };

    useEffect(() => {
        const didimdolEligible = price <= 600000000 && income <= 85000000 && loanAmount <= 400000000;
        const didimdolPayment = calculateMonthlyPayment(loanAmount, 2.5, term);

        const bogeumjariEligible = price <= 600000000 && loanAmount <= 360000000;
        const bogeumjariPayment = calculateMonthlyPayment(loanAmount, 4.2, term);

        const bankPayment = calculateMonthlyPayment(loanAmount, 4.5, term);

        setResults({
            didimdol: { eligible: didimdolEligible, payment: didimdolPayment, rate: "연 2.0~3.1%" },
            bogeumjari: { eligible: bogeumjariEligible, payment: bogeumjariPayment, rate: "연 4.2~4.5%" },
            bank: { eligible: true, payment: bankPayment, rate: "연 4.0~5.0%" }
        });
    }, [price, income, loanAmount, term]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-6 pb-20">
            <div className="max-w-4xl mx-auto">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-50 p-2 rounded-lg text-emerald-500">
                            <Landmark size={18} strokeWidth={3} />
                        </div>
                        <h1 className="text-lg font-black text-[#4A403A] tracking-tighter">대출 비교 계산기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all"
                    >
                        <Home size={20} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                <div className="bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Wallet size={16} className="text-emerald-500" />
                                <label className="text-sm font-black text-[#4A403A]">구입할 주택 가액</label>
                            </div>
                            <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-emerald-100 outline-none transition-all" />
                            <p className="text-right mt-2 text-xs text-gray-400 font-bold">{(price / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Coins size={16} className="text-orange-500" />
                                <label className="text-sm font-black text-[#4A403A]">부부합산 연소득</label>
                            </div>
                            <input type="text" value={income === 0 ? '' : income.toLocaleString()} onChange={handleNumberInput(setIncome)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                            <p className="text-right mt-2 text-xs text-gray-400 font-bold">{(income / 10000000).toFixed(1).replace('.0', '')} 천만 원</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Landmark size={16} className="text-blue-500" />
                                <label className="text-sm font-black text-[#4A403A]">필요 대출 금액</label>
                            </div>
                            <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-orange-500 text-right focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                            <p className="text-right mt-2 text-xs text-gray-400 font-bold">{(loanAmount / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={16} className="text-[#4A403A]" />
                                <label className="text-sm font-black text-[#4A403A]">대출 상환 기간</label>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[30, 40, 50].map((y) => (
                                    <button key={y} onClick={() => setTerm(y)} className={`py-4 rounded-xl font-black text-sm transition-all ${term === y ? 'bg-[#4A403A] text-white shadow-lg' : 'bg-[#fdfbf7] text-[#4A403A]/30 border border-gray-50'}`}>{y}년</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 리포트 섹션 */}
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <Info size={18} className="text-orange-500" />
                    <h2 className="text-lg font-black text-[#4A403A]">상품별 예상 월 납입금 <span className="text-sm font-medium text-gray-400 ml-2">(원리금 균등 기준)</span></h2>
                </div>

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. 디딤돌 대출 */}
                        <div className={`p-8 rounded-[32px] border-2 transition-all relative overflow-hidden ${results.didimdol.eligible ? 'bg-white border-orange-500 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                            {results.didimdol.eligible && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-bl-xl tracking-widest">BEST</div>}
                            {/* 🚀 한글로 수정됨 */}
                            <span className="text-[10px] font-black text-orange-500 tracking-tight">정부 지원 정책자금</span>
                            <h3 className="text-xl font-black text-[#4A403A] mt-1 mb-6">디딤돌 대출</h3>
                            {results.didimdol.eligible ? (
                                <>
                                    <div className="mb-6"><p className="text-[11px] text-gray-400 font-bold mb-1">적용 예상 금리</p><p className="text-lg font-black text-[#4A403A]">{results.didimdol.rate}</p></div>
                                    <div><p className="text-[11px] text-gray-400 font-bold mb-1">예상 월 납입금</p><p className="text-2xl font-black text-orange-500">{results.didimdol.payment.toLocaleString()} <span className="text-sm text-gray-400">원</span></p></div>
                                </>
                            ) : (
                                <p className="text-xs font-bold text-red-400 mt-10 leading-relaxed">대출 요건(집값/소득)을<br />초과하여 신청이 어렵습니다.</p>
                            )}
                        </div>

                        {/* 2. 보금자리론 */}
                        <div className={`p-8 rounded-[32px] border-2 transition-all ${results.bogeumjari.eligible ? 'bg-white border-blue-500 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-50'}`}>
                            {/* 🚀 한글로 수정됨 */}
                            <span className="text-[10px] font-black text-blue-500 tracking-tight">정부 지원 대출 상품</span>
                            <h3 className="text-xl font-black text-[#4A403A] mt-1 mb-6">보금자리론</h3>
                            {results.bogeumjari.eligible ? (
                                <>
                                    <div className="mb-6"><p className="text-[11px] text-gray-400 font-bold mb-1">적용 예상 금리</p><p className="text-lg font-black text-[#4A403A]">{results.bogeumjari.rate}</p></div>
                                    <div><p className="text-[11px] text-gray-400 font-bold mb-1">예상 월 납입금</p><p className="text-2xl font-black text-blue-500">{results.bogeumjari.payment.toLocaleString()} <span className="text-sm text-gray-400">원</span></p></div>
                                </>
                            ) : (
                                <p className="text-xs font-bold text-red-400 mt-10 leading-relaxed">상품 한도 또는<br />주택 가액을 확인해주세요.</p>
                            )}
                        </div>

                        {/* 3. 시중은행 주담대 */}
                        <div className="bg-[#4A403A] p-8 rounded-[32px] shadow-2xl text-white relative">
                            {/* 🚀 한글로 수정됨 */}
                            <span className="text-[10px] font-black text-orange-400 tracking-tight">일반 시중은행 상품</span>
                            <h3 className="text-xl font-black text-white mt-1 mb-6">시중은행 주담대</h3>
                            <div className="mb-6"><p className="text-[11px] text-white/40 font-bold mb-1">적용 예상 금리</p><p className="text-lg font-black text-white">{results.bank.rate}</p></div>
                            <div><p className="text-[11px] text-white/40 font-bold mb-1">예상 월 납입금</p><p className="text-2xl font-black text-orange-400">{results.bank.payment.toLocaleString()} <span className="text-sm text-white/40 font-medium">원</span></p></div>
                        </div>
                    </div>
                )}

                {/* 하단 상담 CTA */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-center text-[11px] text-[#4A403A]/30 leading-relaxed font-bold max-w-lg">
                        위 수치는 단순 시뮬레이션 결과이며 실제 대출 실행 시점의 고시 금리 및 <br />개인별 DSR/LTV 규제 조건에 따라 결과가 다를 수 있습니다.
                    </p>
                    <button className="bg-orange-500 text-white px-10 py-5 rounded-[24px] font-black text-lg shadow-[0_15px_30px_-5px_rgba(249,115,22,0.4)] hover:scale-105 transition-all flex items-center gap-3 active:scale-95">
                        <MessageSquare size={22} fill="white" />
                        맞춤형 최저금리 상담하기
                    </button>
                </div>
            </div>
        </div>
    );
}