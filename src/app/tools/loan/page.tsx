"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-6 pb-24">
            <div className="max-w-4xl mx-auto mt-4 md:mt-0">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2">
                        {/* 메인 페이지의 색상 코드(emerald) 유지하여 아이덴티티 통일 */}
                        <div className="bg-emerald-50 p-2 rounded-xl text-emerald-500 shadow-inner">
                            <Landmark size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">대출 비교 계산기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                {/* 🚀 반응형 패딩(p-6 md:p-8) 및 모서리 곡률 조절 */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 mb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 md:gap-y-10">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Wallet size={16} className="text-[#FF8C42]" />
                                <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">구입할 주택 가액</label>
                            </div>
                            {/* 🚀 모바일과 PC 폰트 크기 반응형 분리 (text-2xl md:text-3xl) */}
                            <input type="text" value={price === 0 ? '' : price.toLocaleString()} onChange={handleNumberInput(setPrice)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            <p className="text-right mt-2 md:mt-3 text-[13px] md:text-sm text-[#4A403A]/50 font-bold">약 {(price / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Coins size={16} className="text-[#FF8C42]" />
                                <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">부부합산 연소득</label>
                            </div>
                            <input type="text" value={income === 0 ? '' : income.toLocaleString()} onChange={handleNumberInput(setIncome)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            <p className="text-right mt-2 md:mt-3 text-[13px] md:text-sm text-[#4A403A]/50 font-bold">약 {(income / 10000000).toFixed(1).replace('.0', '')} 천만 원</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Landmark size={16} className="text-[#FF8C42]" />
                                <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">필요 대출 금액</label>
                            </div>
                            <input type="text" value={loanAmount === 0 ? '' : loanAmount.toLocaleString()} onChange={handleNumberInput(setLoanAmount)} placeholder="0" className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#FF8C42] text-right focus:ring-4 focus:ring-orange-100 focus:border-orange-200 outline-none transition-all placeholder:text-gray-200" />
                            <p className="text-right mt-2 md:mt-3 text-[13px] md:text-sm text-[#4A403A]/50 font-bold">약 {(loanAmount / 100000000).toFixed(1).replace('.0', '')} 억 원</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar size={16} className="text-[#FF8C42]" />
                                <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">대출 상환 기간</label>
                            </div>
                            <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                                {[30, 40, 50].map((y) => (
                                    <button
                                        key={y}
                                        onClick={() => setTerm(y)}
                                        className={`py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[13px] md:text-sm transition-all ${term === y ? 'bg-[#FF8C42] text-white shadow-lg scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/40 border border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        {y}년
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 결과 리포트 섹션 */}
                <div className="flex items-center gap-2 mb-5 md:mb-6 ml-1 md:ml-2 opacity-80">
                    <Info size={18} className="text-[#FF8C42]" />
                    <h2 className="text-[15px] md:text-lg font-black text-[#4A403A]">상품별 예상 월 납입금 <span className="text-[11px] md:text-sm font-bold text-gray-400 ml-1.5">(원리금 균등 기준)</span></h2>
                </div>

                {results && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        {/* 1. 디딤돌 대출 (아파티 오렌지 컬러 적용) */}
                        <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-2 transition-all relative overflow-hidden flex flex-col justify-between ${results.didimdol.eligible ? 'bg-white border-[#FF8C42] shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                            {results.didimdol.eligible && <div className="absolute top-0 right-0 bg-[#FF8C42] text-white text-[10px] md:text-[11px] font-black px-4 py-1.5 rounded-bl-xl tracking-widest">BEST</div>}
                            <div>
                                <span className="text-[10px] md:text-[11px] font-black text-[#FF8C42] tracking-tight">정부 지원 정책자금</span>
                                <h3 className="text-lg md:text-xl font-black text-[#4A403A] mt-1 mb-5 md:mb-6">디딤돌 대출</h3>
                            </div>
                            {results.didimdol.eligible ? (
                                <>
                                    <div className="mb-5 md:mb-6"><p className="text-[11px] md:text-[12px] text-gray-400 font-bold mb-1">적용 예상 금리</p><p className="text-base md:text-lg font-black text-[#4A403A]">{results.didimdol.rate}</p></div>
                                    <div><p className="text-[11px] md:text-[12px] text-gray-400 font-bold mb-1">예상 월 납입금</p><p className="text-2xl md:text-3xl font-black text-[#FF8C42]">{results.didimdol.payment.toLocaleString()} <span className="text-xs md:text-sm text-gray-400 font-bold">원</span></p></div>
                                </>
                            ) : (
                                <p className="text-xs md:text-sm font-bold text-red-400 mt-4 md:mt-10 leading-relaxed pb-4">대출 요건(집값/소득)을<br />초과하여 신청이 어렵습니다.</p>
                            )}
                        </div>

                        {/* 2. 보금자리론 (구분을 위해 블루톤 유지하되 채도 조절) */}
                        <div className={`p-6 md:p-8 rounded-[24px] md:rounded-[32px] border-2 transition-all flex flex-col justify-between ${results.bogeumjari.eligible ? 'bg-white border-blue-400 shadow-xl' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
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

                        {/* 3. 시중은행 주담대 (아파티 다크브라운 적용) */}
                        <div className="bg-[#4A403A] p-6 md:p-8 rounded-[24px] md:rounded-[32px] shadow-2xl text-white relative flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] md:text-[11px] font-black text-[#FF8C42] tracking-tight">일반 시중은행 상품</span>
                                <h3 className="text-lg md:text-xl font-black text-white mt-1 mb-5 md:mb-6">시중은행 주담대</h3>
                            </div>
                            <div className="mb-5 md:mb-6"><p className="text-[11px] md:text-[12px] text-white/40 font-bold mb-1">적용 예상 금리</p><p className="text-base md:text-lg font-black text-white">{results.bank.rate}</p></div>
                            <div><p className="text-[11px] md:text-[12px] text-white/40 font-bold mb-1">예상 월 납입금</p><p className="text-2xl md:text-3xl font-black text-[#FF8C42]">{results.bank.payment.toLocaleString()} <span className="text-xs md:text-sm text-white/40 font-medium">원</span></p></div>
                        </div>
                    </div>
                )}

                {/* 🚀 하단 상담 CTA (카카오톡 링크로 연결) */}
                <div className="mt-12 flex flex-col items-center gap-6">
                    <p className="text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold max-w-lg px-4">
                        위 수치는 단순 시뮬레이션 결과이며 실제 대출 실행 시점의 고시 금리 및 <br className="hidden md:block" />개인별 DSR/LTV 규제 조건에 따라 결과가 다를 수 있습니다.
                    </p>
                    <Link
                        href="http://pf.kakao.com/_EbnAX"
                        target="_blank"
                        className="bg-[#FF8C42] text-white px-8 md:px-10 py-4 md:py-5 rounded-[20px] md:rounded-[24px] font-black text-[15px] md:text-lg shadow-[0_15px_30px_-5px_rgba(255,140,66,0.4)] hover:scale-105 transition-all flex items-center gap-2 md:gap-3 active:scale-95"
                    >
                        {/* 카카오톡 SVG 로고 */}
                        <svg className="w-[20px] h-[20px] md:w-[24px] md:h-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 3C6.47715 3 2 6.35786 2 10.5C2 13.2664 3.76357 15.7143 6.46429 17.0714L5.35714 21L9.64286 18.1429C10.4046 18.3025 11.1917 18.3857 12 18.3857C17.5228 18.3857 22 15.0279 22 10.8857C22 6.74357 17.5228 3.38571 12 3V3Z" fill="white" />
                        </svg>
                        맞춤형 최저금리 상담하기
                    </Link>
                </div>
            </div>
        </div>
    );
}