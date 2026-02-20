"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function YieldCalculator() {
    const router = useRouter();

    // 기본값 세팅 (예: 5억 분양, 보증금 3천, 월세 150, 대출 3억, 금리 4.5%)
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
        noLoanYieldRate: 0 // 대출 없을 때의 수익률 (비교용)
    });

    // 금액 입력용 콤마 변환 핸들러
    const handleNumberInput = (setter: any) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');
        if (rawValue === '') { setter(0); return; }
        if (!isNaN(Number(rawValue))) setter(Number(rawValue));
    };

    // 이자율 입력용 핸들러 (소수점 허용)
    const handleFloatInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val === '') { setInterestRate(0); return; }
        if (!isNaN(Number(val))) setInterestRate(Number(val));
    };

    // 수익률 계산 로직
    useEffect(() => {
        // 1. 실투자금 = 분양가 - 보증금 - 대출금
        const actualInvestment = price - deposit - loanAmount;

        // 2. 연 임대수익 = 월세 * 12
        const annualRent = monthlyRent * 12;

        // 3. 연 대출이자 = 대출금 * (이자율 / 100)
        const annualInterest = loanAmount * (interestRate / 100);

        // 4. 순수익 = 연 임대수익 - 연 대출이자
        const netIncome = annualRent - annualInterest;

        // 5. 대출 포함 수익률 (레버리지 수익률)
        let yieldRate = 0;
        if (actualInvestment > 0) {
            yieldRate = (netIncome / actualInvestment) * 100;
        }

        // 6. 대출 미포함 수익률 (전액 현금 투자 시)
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
                    <h1 className="text-2xl font-bold text-[#4A403A]">임대수익률 계산기</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* 왼쪽: 정보 입력창 (3칸 차지) */}
                    <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-[#4A403A]/5 space-y-5">
                        <h2 className="text-lg font-bold text-[#4A403A] mb-2 flex items-center gap-2">
                            <span>📝</span> 투자 조건 입력
                        </h2>

                        <div>
                            <label className="block text-sm font-bold text-[#4A403A] mb-2">분양가 (매매가)</label>
                            <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-lg font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-[#4A403A] mb-2">임대 보증금</label>
                                <input type="text" value={deposit === 0 ? '' : deposit.toLocaleString()} onChange={handleNumberInput(setDeposit)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-lg font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A403A] mb-2">월 임대료</label>
                                <input type="text" value={monthlyRent === 0 ? '' : monthlyRent.toLocaleString()} onChange={handleNumberInput(setMonthlyRent)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-lg font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <label className="block text-sm font-bold text-[#4A403A] mb-2">대출 금액</label>
                                <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-lg font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A403A] mb-2">연 이자율 (%)</label>
                                <input type="number" step="0.1" value={interestRate === 0 ? '' : interestRate} onChange={handleFloatInput} placeholder="0.0" className="w-full bg-[#FFF8F0] rounded-xl p-3 text-lg font-black text-[#FF8C42] text-right focus:ring-2 focus:ring-[#FF8C42] outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 결과 카드 (2칸 차지) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* 핵심: 대출 레버리지 수익률 */}
                        <div className="bg-[#4A403A] rounded-3xl p-6 text-white shadow-xl animate-float">
                            <span className="inline-block bg-[#FF8C42] text-white text-[10px] font-bold px-2 py-1 rounded-full mb-3">대출 활용 시 (레버리지)</span>
                            <p className="text-[#FFF8F0]/70 text-sm mb-1 font-medium">예상 연 수익률</p>
                            <h2 className="text-5xl font-black text-[#FF8C42] mb-6 tracking-tight">
                                {result.yieldRate > 0 ? result.yieldRate : 0}<span className="text-2xl font-bold text-white/80">%</span>
                            </h2>

                            <div className="space-y-2.5 text-sm border-t border-white/10 pt-5">
                                <div className="flex justify-between items-center">
                                    <span className="opacity-70">실제 투자금</span>
                                    <span className="font-bold">{result.actualInvestment > 0 ? result.actualInvestment.toLocaleString() : 0} 원</span>
                                </div>
                                <div className="flex justify-between items-center text-[#FF8C42]">
                                    <span className="opacity-90">연 임대수익</span>
                                    <span className="font-bold">+{result.annualRent.toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between items-center text-red-300">
                                    <span className="opacity-90">연 은행이자</span>
                                    <span className="font-bold">-{Math.floor(result.annualInterest).toLocaleString()} 원</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                                    <span className="opacity-70">월 순수익</span>
                                    <span className="font-bold text-lg">{Math.floor(result.netIncome / 12).toLocaleString()} 원</span>
                                </div>
                            </div>
                        </div>

                        {/* 비교용: 대출 없을 때 수익률 */}
                        <div className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-sm flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">대출 없이 전액 현금 투자 시</p>
                                <p className="text-sm text-[#4A403A]">단순 수익률</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-gray-400">{result.noLoanYieldRate > 0 ? result.noLoanYieldRate : 0}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-medium">
                    본 계산 결과는 취득세, 재산세, 중개보수 등 부대비용을 제외한 단순 가이드라인입니다.<br />정확한 투자 분석은 현장 상담을 통해 확인하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}