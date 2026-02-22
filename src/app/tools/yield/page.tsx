"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
        <div className="min-h-screen bg-[#fdfbf7] p-6 pb-20">
            <div className="max-w-5xl mx-auto">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-10">
                    <button onClick={() => router.push('/')} className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all">
                        <ArrowLeft size={20} strokeWidth={3} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                            <BarChart3 size={18} strokeWidth={3} />
                        </div>
                        <h1 className="text-lg font-black text-[#4A403A] tracking-tighter">임대수익률 계산기</h1>
                    </div>
                    <button onClick={() => router.push('/')} className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 transition-all">
                        <Home size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* 왼쪽: 입력 섹션 */}
                    <div className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={18} className="text-orange-500" />
                            <h2 className="text-[16px] font-black text-[#4A403A]">상세 투자 조건 입력</h2>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Building size={16} className="text-gray-400" />
                                <label className="text-sm font-bold text-[#4A403A]">분양가 (매매가)</label>
                            </div>
                            <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Wallet size={16} className="text-gray-400" />
                                    <label className="text-sm font-bold text-[#4A403A]">임대 보증금</label>
                                </div>
                                <input type="text" value={deposit === 0 ? '' : deposit.toLocaleString()} onChange={handleNumberInput(setDeposit)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins size={16} className="text-orange-500" />
                                    <label className="text-sm font-bold text-[#4A403A]">월 임대료</label>
                                </div>
                                <input type="text" value={monthlyRent === 0 ? '' : monthlyRent.toLocaleString()} onChange={handleNumberInput(setMonthlyRent)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-orange-500 text-right focus:ring-4 focus:ring-orange-100 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={16} className="text-blue-500" />
                                    <label className="text-sm font-bold text-[#4A403A]">대출금액</label>
                                </div>
                                <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Percent size={16} className="text-blue-500" />
                                    <label className="text-sm font-bold text-[#4A403A]">대출 금리 (%)</label>
                                </div>
                                <input type="number" step="0.1" value={interestRate === 0 ? '' : interestRate} onChange={handleFloatInput} className="w-full bg-[#fdfbf7] rounded-2xl p-4 text-xl font-black text-[#4A403A] text-right focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
                            </div>
                        </div>
                    </div>

                    {/* 🚀 오른쪽: 결과 리포트 (밸런스 조정됨) */}
                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-[#4A403A] rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>

                            <div className="relative z-10">
                                {/* 라벨 삭제 후 텍스트 여백 최적화 */}
                                <p className="text-white/50 text-xs font-bold mb-2 tracking-tight">대출 활용 시 예상 수익률</p>
                                <h2 className="text-6xl md:text-7xl font-black text-orange-400 mb-10 tracking-tighter">
                                    {result.yieldRate > 0 ? result.yieldRate : 0}<span className="text-2xl font-bold text-white/40 ml-1">%</span>
                                </h2>

                                <div className="space-y-4 border-t border-white/10 pt-8">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/50 font-medium">실제 투자 현금</span>
                                        <span className="font-bold text-white">{result.actualInvestment > 0 ? result.actualInvestment.toLocaleString() : 0} 원</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/50 font-medium">연간 순수익</span>
                                        <span className="font-bold text-orange-400">+{result.netIncome.toLocaleString()} 원</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/5">
                                        <span className="text-[14px] font-bold text-white/70">월 평균 순수익</span>
                                        <span className="text-2xl font-black text-white">{Math.floor(result.netIncome / 12).toLocaleString()} 원</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 하단 비교 카드: 텍스트 강조 유지 */}
                        <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-50 p-2 rounded-lg">
                                    <Info size={16} className="text-gray-400" />
                                </div>
                                <p className="text-sm font-black text-[#4A403A]">전액 현금 투자 수익률</p>
                            </div>
                            <p className="text-2xl font-black text-[#4A403A]">{result.noLoanYieldRate > 0 ? result.noLoanYieldRate : 0}%</p>
                        </div>

                        <button className="w-full bg-orange-500 text-white p-5 rounded-[24px] font-black text-sm shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group active:scale-95">
                            수익률 극대화 전략 상담받기
                            <TrendingUp size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                <p className="mt-12 text-center text-[11px] text-[#4A403A]/30 leading-relaxed font-bold px-10">
                    * 위 계산 결과는 각종 세금 및 부대비용을 제외한 단순 가이드입니다. <br />
                    상세한 투자 분석은 전문 상담을 통해 확인하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}