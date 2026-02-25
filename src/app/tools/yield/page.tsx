"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, ArrowLeft, Home, Coins, Building, Wallet, Percent, TrendingUp, Info, CheckCircle2 } from 'lucide-react';

export default function YieldCalculator() {
    const router = useRouter();

    const [price, setPrice] = useState<number>(500000000);
    const [deposit, setDeposit] = useState<number>(30000000);
    const [monthlyRent, setMonthlyRent] = useState<number>(1500000);
    const [loanAmount, setLoanAmount] = useState<number>(300000000);
    const [interestRate, setInterestRate] = useState<number>(4.5);

    const [result, setResult] = useState({
        actualInvestment: 0,
        annualRent: 0,
        annualInterest: 0,
        netIncome: 0,
        yieldRate: 0,
        noLoanYieldRate: 0
    });

    const handleNumberInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '') { setter(0); return; }
        if (!isNaN(Number(rawValue))) setter(Number(rawValue));
    };

    const handleFloatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') { setInterestRate(0); return; }
        if (!isNaN(Number(val))) setInterestRate(Number(val));
    };

    // 🚀 금액 퀵 추가 버튼 함수
    const addAmount = (setter: any, current: number, amount: number) => {
        setter(current + amount);
    };

    useEffect(() => {
        const actualInvestment = price - deposit - loanAmount;
        const annualRent = monthlyRent * 12;
        const annualInterest = loanAmount * (interestRate / 100);
        const netIncome = annualRent - annualInterest;

        let yieldRate = 0;
        if (actualInvestment > 0) {
            yieldRate = (netIncome / actualInvestment) * 100;
        }

        const noLoanInvestment = price - deposit;
        let noLoanYieldRate = 0;
        if (noLoanInvestment > 0) {
            noLoanYieldRate = (annualRent / noLoanInvestment) * 100;
        }

        setResult({
            actualInvestment,
            annualRent,
            annualInterest,
            netIncome,
            yieldRate: Number(yieldRate.toFixed(2)),
            noLoanYieldRate: Number(noLoanYieldRate.toFixed(2))
        });
    }, [price, deposit, monthlyRent, loanAmount, interestRate]);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 🚀 상단 네비게이션 (모든 계산기 통일) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-orange-50 p-1.5 rounded-lg text-[#FF8C42] shadow-inner">
                        <BarChart3 size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">임대수익률 계산기</span>
                </div>
                <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <Home size={18} strokeWidth={2.5} />
                </button>
            </nav>

            <div className="max-w-5xl mx-auto px-5 mt-6">

                {/* 🚀 타이틀 영역 */}
                <div className="flex items-center gap-3 mb-6 md:mb-8 px-2">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF8C42] shadow-inner">
                        <BarChart3 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">임대수익률 분석</h1>
                        <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">실투자금 대비 정확한 연간/월간 순수익을 확인하세요.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

                    {/* 왼쪽: 입력 섹션 (오렌지 톤앤매너 완벽 적용) */}
                    <div className="lg:col-span-3 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 space-y-8 md:space-y-10">

                        {/* 1. 분양가(매매가) */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building size={16} className="text-[#FF8C42]" />
                                <label className="text-[13px] md:text-[14px] font-bold text-gray-600">분양가 (매매가)</label>
                            </div>
                            <div className="relative">
                                <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF8C42] outline-none transition-all placeholder:text-gray-200 pr-12" />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                            </div>
                            {/* 🚀 퀵 버튼 */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => addAmount(setPrice, price, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+1천만</button>
                                <button onClick={() => addAmount(setPrice, price, 50000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+5천만</button>
                                <button onClick={() => addAmount(setPrice, price, 100000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+1억</button>
                                <button onClick={() => setPrice(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                            </div>
                        </div>

                        {/* 2. 임대 보증금 & 월 임대료 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Wallet size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-[14px] font-bold text-gray-600">임대 보증금</label>
                                </div>
                                <div className="relative">
                                    <input type="text" value={deposit === 0 ? '' : deposit.toLocaleString()} onChange={handleNumberInput(setDeposit)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF8C42] outline-none transition-all placeholder:text-gray-200 pr-12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <button onClick={() => addAmount(setDeposit, deposit, 5000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+500만</button>
                                    <button onClick={() => addAmount(setDeposit, deposit, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+1천만</button>
                                    <button onClick={() => setDeposit(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-[14px] font-bold text-gray-600">월 임대료</label>
                                </div>
                                <div className="relative">
                                    <input type="text" value={monthlyRent === 0 ? '' : monthlyRent.toLocaleString()} onChange={handleNumberInput(setMonthlyRent)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF8C42] outline-none transition-all placeholder:text-gray-200 pr-12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <button onClick={() => addAmount(setMonthlyRent, monthlyRent, 100000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+10만</button>
                                    <button onClick={() => addAmount(setMonthlyRent, monthlyRent, 500000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+50만</button>
                                    <button onClick={() => setMonthlyRent(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                                </div>
                            </div>
                        </div>

                        {/* 3. 대출 조건 (파란색을 지우고 오렌지로 통일) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 pt-8 border-t border-gray-100">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-[14px] font-bold text-gray-600">대출 금액</label>
                                </div>
                                <div className="relative">
                                    <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF8C42] outline-none transition-all placeholder:text-gray-200 pr-12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">원</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <button onClick={() => addAmount(setLoanAmount, loanAmount, 10000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+1천만</button>
                                    <button onClick={() => addAmount(setLoanAmount, loanAmount, 50000000)} className="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 text-[12px] font-bold rounded-lg hover:bg-orange-50 hover:text-[#FF8C42] transition-all">+5천만</button>
                                    <button onClick={() => setLoanAmount(0)} className="px-3 py-1.5 bg-gray-100 text-gray-400 text-[12px] font-bold rounded-lg hover:bg-red-50 hover:text-red-500 transition-all ml-auto">초기화</button>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Percent size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-[14px] font-bold text-gray-600">대출 금리</label>
                                </div>
                                <div className="relative">
                                    <input type="number" step="0.1" value={interestRate === 0 ? '' : interestRate} onChange={handleFloatInput} placeholder="0.0" className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[20px] p-4 text-xl md:text-2xl font-black text-[#4A403A] text-right focus:ring-2 focus:ring-orange-100 focus:border-[#FF8C42] outline-none transition-all placeholder:text-gray-200 pr-12" />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 결과 리포트 (다크브라운 & 오렌지 하이라이트 유지) */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">

                        {/* 메인 결과 카드 */}
                        <div className="bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                            <div className="relative z-10">
                                <p className="text-white/60 text-[12px] md:text-[13px] font-bold mb-2 md:mb-3 tracking-tight">대출 활용 시 예상 수익률</p>
                                <h2 className="text-5xl md:text-6xl font-black text-[#FF8C42] mb-8 md:mb-10 tracking-tighter flex items-baseline">
                                    {result.yieldRate > 0 ? result.yieldRate : 0}<span className="text-xl md:text-2xl font-bold text-white/40 ml-1.5">%</span>
                                </h2>

                                <div className="space-y-4 md:space-y-5 border-t border-white/10 pt-6 md:pt-8">
                                    <div className="flex justify-between items-center text-[13px] md:text-sm">
                                        <span className="text-white/60 font-medium">실제 투자 현금</span>
                                        <span className="font-bold text-white">{result.actualInvestment > 0 ? result.actualInvestment.toLocaleString() : 0} 원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[13px] md:text-sm">
                                        <span className="text-white/60 font-medium">연간 순수익</span>
                                        <span className="font-bold text-[#FF8C42]">+{result.netIncome.toLocaleString()} 원</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/5">
                                        <span className="text-[13px] md:text-[14px] font-bold text-white/80">월 평균 순수익</span>
                                        <span className="text-xl md:text-2xl font-black text-white">{Math.floor(result.netIncome / 12).toLocaleString()} 원</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 하단 비교 카드 */}
                        <div className="bg-white rounded-[20px] md:rounded-[24px] p-5 md:p-6 border border-gray-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <Info size={16} className="text-gray-400" />
                                </div>
                                <p className="text-[12px] md:text-[13px] font-black text-gray-600">전액 현금 투자 시</p>
                            </div>
                            <p className="text-lg md:text-xl font-black text-gray-400">{result.noLoanYieldRate > 0 ? result.noLoanYieldRate : 0}%</p>
                        </div>


                    </div>
                </div>

                <div className="mt-10 mb-8 px-4 flex justify-center">
                    <p className="text-center text-[11px] text-gray-400 leading-relaxed font-medium bg-gray-50 px-6 py-4 rounded-xl max-w-2xl">
                        * 위 계산 결과는 취득세 및 중개수수료 등의 부대비용을 제외한 단순 참고용 가이드입니다. <br className="hidden md:block" />
                        상세한 투자 분석과 세금 관련 문의는 전문 상담을 통해 확인하시기 바랍니다.
                    </p>
                </div>
            </div>
        </main>
    );
}