"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Trophy, Info, CheckCircle2, UserPlus, CalendarClock } from 'lucide-react';

export default function ScoreCalculator() {
    const router = useRouter();

    // 1. 무주택 기간 점수 (0~15년 이상, 최대 32점)
    const [homelessYears, setHomelessYears] = useState<number>(0);
    // 2. 부양가족 수 (0~6명 이상, 최대 35점)
    const [dependents, setDependents] = useState<number>(0);
    // 3. 청약통장 가입기간 (0~15년 이상, 최대 17점)
    const [bankYears, setBankYears] = useState<number>(0);

    const [totalScore, setTotalScore] = useState(0);

    // 실시간 점수 계산 로직 (청약홈 공식 기준)
    useEffect(() => {
        // 무주택 점수 계산 (미달 시 0점, 1년미만 2점, 이후 1년당 2점씩 추가)
        let s1 = homelessYears === 0 ? 0 : (homelessYears + 1) * 2;
        if (homelessYears >= 15) s1 = 32;

        // 부양가족 점수 계산 (기본 5점 + 1명당 5점)
        let s2 = 5 + (dependents * 5);
        if (dependents >= 6) s2 = 35;

        // 통장 가입기간 점수 계산 (6개월미만 1점, 1년미만 2점, 이후 1년당 1점씩 추가)
        let s3 = 0;
        if (bankYears === 0) s3 = 1; // 6개월 미만
        else if (bankYears === 1) s3 = 2; // 1년 미만
        else s3 = bankYears + 2; // 1년 이상부터
        if (bankYears >= 15) s3 = 17;

        setTotalScore(s1 + s2 + s3);
    }, [homelessYears, dependents, bankYears]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-6 pb-20">
            <div className="max-w-xl mx-auto mt-4 md:mt-0">

                {/* 상단 네비게이션 */}
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <button
                        onClick={() => router.back()}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <ArrowLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-red-50 p-2 rounded-xl text-red-500 shadow-inner">
                            <Trophy size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">청약가점 계산기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-10">

                    {/* 1. 무주택 기간 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">무주택 기간 (본인 및 세대원 전원)</label>
                        </div>
                        <select
                            value={homelessYears}
                            onChange={(e) => setHomelessYears(Number(e.target.value))}
                            className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 font-bold text-[#4A403A] focus:ring-4 focus:ring-orange-100 outline-none appearance-none"
                        >
                            <option value={0}>유주택자 또는 만 30세 미만 미혼자 (0점)</option>
                            <option value={1}>1년 미만 (2점)</option>
                            {[...Array(14)].map((_, i) => (
                                <option key={i} value={i + 2}>{i + 1}년 이상 ~ {i + 2}년 미만 ({(i + 2) * 2}점)</option>
                            ))}
                            <option value={15}>15년 이상 (32점)</option>
                        </select>
                        <p className="mt-2 text-[11px] text-gray-400 font-medium px-2">* 만 30세부터 기산 (단, 30세 이전 혼인 시 혼인신고일부터 기산)</p>
                    </div>

                    {/* 2. 부양가족 수 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <UserPlus size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">부양가족 수 (배우자, 자녀, 부모 등)</label>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setDependents(num)}
                                    className={`py-3 rounded-xl font-black text-sm transition-all ${dependents === num ? 'bg-[#FF8C42] text-white shadow-md' : 'bg-gray-50 text-gray-400'}`}
                                >
                                    {num === 6 ? '6+' : num}명
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[11px] text-gray-400 font-medium px-2">* 본인 제외 (부모님 3년 이상 동일 주민등록등본 기재 시 가능)</p>
                    </div>

                    {/* 3. 청약통장 가입기간 */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarClock size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">청약통장 가입기간</label>
                        </div>
                        <select
                            value={bankYears}
                            onChange={(e) => setBankYears(Number(e.target.value))}
                            className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-4 md:p-5 font-bold text-[#4A403A] focus:ring-4 focus:ring-orange-100 outline-none appearance-none"
                        >
                            <option value={0}>6개월 미만 (1점)</option>
                            <option value={1}>6개월 이상 ~ 1년 미만 (2점)</option>
                            {[...Array(14)].map((_, i) => (
                                <option key={i} value={i + 2}>{i + 1}년 이상 ~ {i + 2}년 미만 ({i + 4}점)</option>
                            ))}
                            <option value={15}>15년 이상 (17점)</option>
                        </select>
                    </div>
                </div>

                {/* 결과 리포트 (다크 브라운 카드) */}
                <div className="mt-6 md:mt-8 bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 opacity-80">
                            <Info size={16} />
                            <p className="text-[13px] font-bold tracking-tight">나의 예상 청약 가점</p>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-[#FF8C42] mb-6 md:mb-8 tracking-tighter">
                            {totalScore} <span className="text-lg md:text-xl font-bold text-white/50 ml-1">점</span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-6 md:pt-8">
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">무주택 기간 점수</span>
                                <span className="font-bold">{homelessYears === 0 ? 0 : (homelessYears >= 15 ? 32 : (homelessYears + 1) * 2)}점 / 32점</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">부양가족 점수</span>
                                <span className="font-bold">{5 + (dependents * 5) > 35 ? 35 : 5 + (dependents * 5)}점 / 35점</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">통장 가입기간 점수</span>
                                <span className="font-bold">{bankYears === 0 ? 1 : (bankYears >= 15 ? 17 : bankYears + 2)}점 / 17점</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 md:mt-10 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold px-4 md:px-6">
                    본 계산 결과는 사용자가 입력한 정보를 바탕으로 산출된 단순 참고용 점수입니다.<br className="hidden md:block" />
                    정확한 가점 확인은 반드시 한국부동산원 청약홈(applyhome.co.kr)을 통해 확인하시기 바랍니다.
                </p>
            </div>
        </div>
    );
}