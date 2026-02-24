"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Landmark, ArrowLeft, Home, Wallet, Coins, Calendar, Info, Calculator, AlertCircle } from 'lucide-react';

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

    // 🚀 금액 퀵 추가 버튼 함수
    const addAmount = (setter: any, current: number, amount: number) => {
        setter(current + amount);
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
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-500 shadow-inner">
                        <Calculator size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">대출 비교 계산기</span>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <Home size={18} strokeWidth={2.5} />
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-5 mt-6">

                {/* 🚀 입력 섹션 (에메랄드 테마 + 퀵 버튼 적용) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 mb-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">내 집 마련 대출 계산</h1>
                            <p className="text-[13px] text-gray-400 mt-1 font-medium">정부지원 상품과 시중은행 금리를 한눈에 비교하세요.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
                        {/* 주택 가액 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Wallet size={16} className="text-emerald-500" />
                                <label className="text-sm font-bold text-gray-600">구입할 주택 가액</label>
                            </div>
                            <div className="relative">
                                <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-200 pr-12" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => addAmount(setPrice, price, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1천만</button>
                                <button onClick={() => addAmount(setPrice, price, 50000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+5천만</button>
                                <button onClick={() => addAmount(setPrice, price, 100000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1억</button>
                                <button onClick={() => setPrice(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                            </div>
                        </div>

                        {/* 연소득 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Coins size={16} className="text-emerald-500" />
                                <label className="text-sm font-bold text-gray-600">부부합산 연소득</label>
                            </div>
                            <div className="relative">
                                <input type="text" value={income === 0 ? '' : income.toLocaleString()} onChange={handleNumberInput(setIncome)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-200 pr-12" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => addAmount(setIncome, income, 5000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+500만</button>
                                <button onClick={() => addAmount(setIncome, income, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1천만</button>
                                <button onClick={() => setIncome(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                            </div>
                        </div>

                        {/* 대출 금액 */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Landmark size={16} className="text-emerald-500" />
                                <label className="text-sm font-bold text-gray-600">필요 대출 금액</label>
                            </div>
                            <div className="relative">
                                <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-200 pr-12" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => addAmount(setLoanAmount, loanAmount, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1천만</button>
                                <button onClick={() => addAmount(setLoanAmount, loanAmount, 50000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+5천만</button>
                                <button onClick={() => addAmount(setLoanAmount, loanAmount, 100000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-all">+1억</button>
                                <button onClick={() => setLoanAmount(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                            </div>
                        </div>

                        {/* 대출 기간 */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={16} className="text-emerald-500" />
                                <label className="text-sm font-bold text-gray-600">대출 상환 기간</label>
                            </div>
                            <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                                {[30, 40, 50].map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setTerm(y)}
                                        className={`py-4 rounded-[16px] font-black text-[14px] transition-all ${term === y ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/50 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600'}`}
                                    >
                                        {y}년
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🚀 결과 리포트 섹션 (에메랄드/블루/다크브라운 조합) */}
                <div className="flex items-center gap-2 mb-5 md:mb-6 ml-1 opacity-90">
                    <Info size={18} className="text-emerald-500" />
                    <h2 className="text-[16px] md:text-lg font-black text-[#2d2d2d]">상품별 예상 월 납입금 <span className="text-[12px] md:text-sm font-bold text-gray-400 ml-1.5">(원리금 균등 기준)</span></h2>
                </div>

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                        {/* 1. 디딤돌 대출 (가장 혜택이 좋으므로 에메랄드 메인 컬러 부여) */}
                        <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border transition-all relative overflow-hidden flex flex-col justify-between ${results.didimdol.eligible ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 shadow-xl shadow-emerald-200 text-white' : 'bg-gray-50 border-gray-100 opacity-60 text-gray-400'}`}>
                            {results.didimdol.eligible && <div className="absolute top-0 right-0 bg-yellow-400 text-emerald-900 text-[10px] md:text-[11px] font-black px-4 py-1.5 rounded-bl-xl tracking-widest shadow-sm">BEST</div>}
                            <div>
                                <span className={`text-[10px] md:text-[11px] font-black tracking-tight ${results.didimdol.eligible ? 'text-emerald-100' : 'text-gray-400'}`}>정부 지원 정책자금</span>
                                <h3 className={`text-lg md:text-xl font-black mt-1 mb-5 md:mb-6 ${results.didimdol.eligible ? 'text-white' : 'text-gray-400'}`}>디딤돌 대출</h3>
                            </div>
                            {results.didimdol.eligible ? (
                                <>
                                    <div className="mb-5 md:mb-6"><p className="text-[11px] md:text-[12px] text-emerald-100 font-bold mb-1">적용 예상 금리</p><p className="text-base md:text-lg font-black text-white">{results.didimdol.rate}</p></div>
                                    <div><p className="text-[11px] md:text-[12px] text-emerald-100 font-bold mb-1">예상 월 납입금</p><p className="text-2xl md:text-3xl font-black text-white">{results.didimdol.payment.toLocaleString()} <span className="text-xs md:text-sm font-medium opacity-80">원</span></p></div>
                                </>
                            ) : (
                                <p className="text-xs md:text-sm font-bold text-red-400 mt-4 md:mt-10 leading-relaxed pb-4">대출 요건(집값/소득)을<br />초과하여 신청이 어렵습니다.</p>
                            )}
                        </div>

                        {/* 2. 보금자리론 (차분한 블루톤 유지) */}
                        <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-2 transition-all flex flex-col justify-between ${results.bogeumjari.eligible ? 'bg-white border-blue-400 shadow-xl shadow-blue-100/50' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                            <div>
                                <span className="text-[10px] md:text-[11px] font-black text-blue-500 tracking-tight">정부 지원 대출 상품</span>
                                <h3 className="text-lg md:text-xl font-black text-[#4A403A] mt-1 mb-5 md:mb-6">보금자리론</h3>
                            </div>
                            {results.bogeumjari.eligible ? (
                                <>
                                    <div className="mb-5 md:mb-6"><p className="text-[11px] md:text-[12px] text-gray-400 font-bold mb-1">적용 예상 금리</p><p className="text-base md:text-lg font-black text-[#4A403A]">{results.bogeumjari.rate}</p></div>
                                    <div><p className="text-[11px] md:text-[12px] text-gray-400 font-bold mb-1">예상 월 납입금</p><p className="text-2xl md:text-3xl font-black text-blue-500">{results.bogeumjari.payment.toLocaleString()} <span className="text-xs md:text-sm text-gray-400 font-bold">원</span></p></div>
                                </>
                            ) : (
                                <p className="text-xs md:text-sm font-bold text-red-400 mt-4 md:mt-10 leading-relaxed pb-4">상품 한도 또는<br />주택 가액을 확인해주세요.</p>
                            )}
                        </div>

                        {/* 3. 시중은행 주담대 (아파티 고유의 다크브라운 적용) */}
                        <div className="bg-[#4A403A] p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl text-white relative flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] md:text-[11px] font-black text-emerald-400 tracking-tight">일반 시중은행 상품</span>
                                <h3 className="text-lg md:text-xl font-black text-white mt-1 mb-5 md:mb-6">시중은행 주담대</h3>
                            </div>
                            <div className="mb-5 md:mb-6"><p className="text-[11px] md:text-[12px] text-white/40 font-bold mb-1">적용 예상 금리</p><p className="text-base md:text-lg font-black text-white">{results.bank.rate}</p></div>
                            <div><p className="text-[11px] md:text-[12px] text-white/40 font-bold mb-1">예상 월 납입금</p><p className="text-2xl md:text-3xl font-black text-emerald-400">{results.bank.payment.toLocaleString()} <span className="text-xs md:text-sm text-white/40 font-medium">원</span></p></div>
                        </div>
                    </div>
                )}

                {/* 🚀 하단 안내 문구 및 카카오톡 상담 버튼 */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex items-start gap-2 text-[12px] leading-relaxed text-gray-400 bg-gray-50 p-4 rounded-xl max-w-2xl">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <p>위 수치는 단순 시뮬레이션 결과이며 실제 대출 실행 시점의 고시 금리 및 개인별 DSR/LTV 규제 조건에 따라 결과가 다를 수 있습니다. 자금 계획 시 참고용으로만 활용해 주세요.</p>
                    </div>


                </div>
            </div>
        </main>
    );
}