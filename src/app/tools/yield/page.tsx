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
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-6 pb-24">
            <div className="max-w-5xl mx-auto mt-4 md:mt-0">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all">
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-50 p-2 rounded-xl text-[#FF8C42] shadow-inner">
                            <BarChart3 size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">임대수익률 계산기</h1>
                    </div>
                    <button onClick={() => router.push('/')} className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all">
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">

                    {/* 왼쪽: 입력 섹션 */}
                    <div className="lg:col-span-3 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <h2 className="text-[15px] md:text-[16px] font-black text-[#4A403A]">상세 투자 조건 입력</h2>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Building size={16} className="text-[#FF8C42]" />
                                <label className="text-[13px] md:text-sm font-bold text-[#4A403A]">분양가 (매매가)</label>
                            </div>
                            <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            <p className="text-right mt-2 text-[12px] md:text-[13px] text-[#4A403A]/50 font-bold">약 {(price / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Wallet size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-sm font-bold text-[#4A403A]">임대 보증금</label>
                                </div>
                                <input type="text" value={deposit === 0 ? '' : deposit.toLocaleString()} onChange={handleNumberInput(setDeposit)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 text-xl md:text-2xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Coins size={16} className="text-[#FF8C42]" />
                                    <label className="text-[13px] md:text-sm font-bold text-[#4A403A]">월 임대료</label>
                                </div>
                                <input type="text" value={monthlyRent === 0 ? '' : monthlyRent.toLocaleString()} onChange={handleNumberInput(setMonthlyRent)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 text-xl md:text-2xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            </div>
                        </div>

                        {/* 대출 부분은 직관성을 위해 파란색(Blue) 계열 포인트 유지 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <TrendingUp size={16} className="text-blue-500" />
                                    <label className="text-[13px] md:text-sm font-bold text-[#4A403A]">대출금액</label>
                                </div>
                                <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 text-xl md:text-2xl font-black text-blue-500 text-right focus:ring-4 focus:ring-blue-100 focus:border-blue-200 outline-none transition-all placeholder:text-gray-200" />
                                <p className="text-right mt-2 text-[12px] md:text-[13px] text-[#4A403A]/50 font-bold">약 {(loanAmount / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Percent size={16} className="text-blue-500" />
                                    <label className="text-[13px] md:text-sm font-bold text-[#4A403A]">대출 금리 (%)</label>
                                </div>
                                <input type="number" step="0.1" value={interestRate === 0 ? '' : interestRate} onChange={handleFloatInput} placeholder="0.0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 text-xl md:text-2xl font-black text-blue-500 text-right focus:ring-4 focus:ring-blue-100 focus:border-blue-200 outline-none transition-all placeholder:text-gray-200" />
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 결과 리포트 */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">

                        {/* 메인 결과 카드 */}
                        <div className="bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                            <div className="relative z-10">
                                <p className="text-white/60 text-[11px] md:text-xs font-bold mb-2 md:mb-3 tracking-tight">대출 활용 시 예상 수익률</p>
                                <h2 className="text-5xl md:text-7xl font-black text-[#FF8C42] mb-8 md:mb-10 tracking-tighter">
                                    {result.yieldRate > 0 ? result.yieldRate : 0}<span className="text-xl md:text-2xl font-bold text-white/40 ml-1">%</span>
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
                                <p className="text-[13px] md:text-sm font-black text-[#4A403A]">전액 현금 투자 수익률</p>
                            </div>
                            <p className="text-xl md:text-2xl font-black text-[#4A403A]">{result.noLoanYieldRate > 0 ? result.noLoanYieldRate : 0}%</p>
                        </div>

                        {/* 🚀 카카오톡 맞춤 상담 CTA 버튼 */}
                        <Link
                            href="http://pf.kakao.com/_EbnAX"
                            target="_blank"
                            className="w-full bg-[#FF8C42] text-white p-4 md:p-5 rounded-[20px] md:rounded-[24px] font-black text-[15px] md:text-lg shadow-[0_15px_30px_-5px_rgba(255,140,66,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2 md:gap-3 group active:scale-95"
                        >
                            <svg className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C6.47715 3 2 6.35786 2 10.5C2 13.2664 3.76357 15.7143 6.46429 17.0714L5.35714 21L9.64286 18.1429C10.4046 18.3025 11.1917 18.3857 12 18.3857C17.5228 18.3857 22 15.0279 22 10.8857C22 6.74357 17.5228 3.38571 12 3V3Z" fill="white" />
                            </svg>
                            수익률 극대화 맞춤 상담하기
                        </Link>
                    </div>
                </div>

                <p className="mt-10 md:mt-12 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold px-6">
                    * 위 계산 결과는 각종 세금 및 부대비용을 제외한 단순 가이드입니다. <br className="hidden md:block" />
                    상세한 투자 분석은 전문 상담을 통해 확인하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}