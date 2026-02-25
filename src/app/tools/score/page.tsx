"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Trophy, Info, CheckCircle2, UserPlus, CalendarClock, AlertCircle } from 'lucide-react';

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
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 🚀 상단 네비게이션 (모든 계산기 통일) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-red-50 p-1.5 rounded-lg text-red-500 shadow-inner">
                        <Trophy size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">청약가점 계산기</span>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <Home size={18} strokeWidth={2.5} />
                </button>
            </nav>

            <div className="max-w-2xl mx-auto px-5 mt-6">

                {/* 🚀 타이틀 영역 */}
                <div className="flex items-center gap-3 mb-6 md:mb-8 px-2">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-inner">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">청약가점 계산</h1>
                        <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">청약홈 기준 내 가점을 정확하게 확인하세요.</p>
                    </div>
                </div>

                {/* 🚀 입력 섹션 (레드 테마 적용 및 모바일 최적화) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 space-y-8 md:space-y-10 mb-8">

                    {/* 1. 무주택 기간 */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <CheckCircle2 size={16} className="text-red-500" strokeWidth={2.5} />
                            <label className="text-[13px] md:text-[15px] font-black text-[#4A403A]">무주택 기간 <span className="text-[11px] md:text-[13px] text-gray-400 font-medium ml-1">(본인 및 세대원 전원)</span></label>
                        </div>
                        <select
                            value={homelessYears}
                            onChange={(e) => setHomelessYears(Number(e.target.value))}
                            className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[16px] md:rounded-[20px] p-4 text-[13px] md:text-[15px] font-black text-red-600 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all cursor-pointer"
                        >
                            <option value={0}>유주택자 또는 만 30세 미만 미혼자 (0점)</option>
                            <option value={1}>1년 미만 (2점)</option>
                            {[...Array(14)].map((_, i) => (
                                <option key={i} value={i + 2}>{i + 1}년 이상 ~ {i + 2}년 미만 ({(i + 2) * 2}점)</option>
                            ))}
                            <option value={15}>15년 이상 (32점)</option>
                        </select>
                        <p className="mt-2 text-[11px] text-gray-400 font-bold px-2">* 만 30세부터 기산 (단, 30세 이전 혼인 시 혼인신고일부터 기산)</p>
                    </div>

                    {/* 2. 부양가족 수 */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <UserPlus size={16} className="text-red-500" strokeWidth={2.5} />
                            <label className="text-[13px] md:text-[15px] font-black text-[#4A403A]">부양가족 수 <span className="text-[11px] md:text-[13px] text-gray-400 font-medium ml-1">(배우자, 자녀, 부모 등)</span></label>
                        </div>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-2.5">
                            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setDependents(num)}
                                    className={`py-3.5 md:py-4 rounded-[14px] md:rounded-2xl font-black text-[13px] md:text-[15px] transition-all ${dependents === num ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-[1.02]' : 'bg-[#fdfbf7] text-[#4A403A]/50 border border-gray-200 hover:bg-red-50 hover:text-red-600'}`}
                                >
                                    {num === 6 ? '6명 이상' : `${num}명`}
                                </button>
                            ))}
                        </div>
                        <p className="mt-2 text-[11px] text-gray-400 font-bold px-2">* 본인 제외 (직계존속은 3년 이상 동일 주민등록등본 기재 시 인정)</p>
                    </div>

                    {/* 3. 청약통장 가입기간 */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <CalendarClock size={16} className="text-red-500" strokeWidth={2.5} />
                            <label className="text-[13px] md:text-[15px] font-black text-[#4A403A]">청약통장 가입기간</label>
                        </div>
                        <select
                            value={bankYears}
                            onChange={(e) => setBankYears(Number(e.target.value))}
                            className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[16px] md:rounded-[20px] p-4 text-[13px] md:text-[15px] font-black text-red-600 focus:ring-2 focus:ring-red-100 focus:border-red-500 outline-none transition-all cursor-pointer"
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

                {/* 🚀 결과 리포트 (레드 그라데이션 박스) */}
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-red-200 relative overflow-hidden">
                    {/* 배경 장식 로고 */}
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <Trophy size={160} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Info size={16} className="text-red-100" />
                            <p className="text-[13px] font-bold text-red-100 tracking-tight">나의 총 예상 청약 가점</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-8 tracking-tighter flex items-baseline gap-1.5">
                            {totalScore} <span className="text-lg md:text-xl font-bold text-red-100">점</span>
                            <span className="text-[12px] md:text-sm font-medium text-red-200 ml-1">/ 84점 만점</span>
                        </h2>

                        <div className="space-y-3 border-t border-red-400/50 pt-5 md:pt-6">
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-red-50">
                                <span>무주택 기간 점수</span>
                                <span className="font-bold">{homelessYears === 0 ? 0 : (homelessYears >= 15 ? 32 : (homelessYears + 1) * 2)}점 <span className="text-red-200 font-normal ml-1">/ 32점</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-red-50">
                                <span>부양가족 점수</span>
                                <span className="font-bold">{5 + (dependents * 5) > 35 ? 35 : 5 + (dependents * 5)}점 <span className="text-red-200 font-normal ml-1">/ 35점</span></span>
                            </div>
                            <div className="flex justify-between items-center text-[12px] md:text-[13px] text-red-50">
                                <span>통장 가입기간 점수</span>
                                <span className="font-bold">{bankYears === 0 ? 1 : (bankYears >= 15 ? 17 : bankYears + 2)}점 <span className="text-red-200 font-normal ml-1">/ 17점</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 안내 문구 */}
                <div className="mt-8 flex items-start gap-2 text-[11px] md:text-[12px] leading-relaxed text-gray-400 bg-gray-50 p-4 rounded-xl">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>본 계산 결과는 사용자가 입력한 정보를 바탕으로 산출된 단순 참고용입니다. 실제 청약 신청 시 반드시 한국부동산원 청약홈(applyhome.co.kr)을 통해 정확한 가점과 자격 요건을 재확인하시기 바랍니다.</p>
                </div>

            </div>
        </main>
    );
}