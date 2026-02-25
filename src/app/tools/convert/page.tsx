"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Maximize, ArrowUpDown, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AreaConverter() {
    const router = useRouter();

    // 상태 관리: 입력값과 변환 모드 (false: 평->㎡, true: ㎡->평)
    const [inputValue, setInputValue] = useState<string>("34");
    const [isSqmToPyeong, setIsSqmToPyeong] = useState<boolean>(false);

    // 상수: 1평 = 3.305785㎡
    const PY_TO_SQM = 3.305785;

    // 계산 로직
    const getResult = () => {
        const num = parseFloat(inputValue);
        if (isNaN(num)) return "0";

        if (isSqmToPyeong) {
            // ㎡ -> 평
            return (num / PY_TO_SQM).toFixed(2);
        } else {
            // 평 -> ㎡
            return (num * PY_TO_SQM).toFixed(2);
        }
    };

    // 순서 바꾸기 (Swap)
    const handleSwap = () => {
        const currentResult = getResult();
        setIsSqmToPyeong(!isSqmToPyeong);
        setInputValue(currentResult === "0" ? "" : currentResult);
    };

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 🚀 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-500 shadow-inner">
                        <Maximize size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">면적 변환기</span>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <Home size={18} strokeWidth={2.5} />
                </button>
            </nav>

            <div className="max-w-xl mx-auto px-5 mt-6">

                {/* 🚀 타이틀 영역 */}
                <div className="flex items-center gap-3 mb-6 md:mb-8 px-2">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 shadow-inner">
                        <Maximize size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">평형 / ㎡ 변환기</h1>
                        <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">아파트 면적을 가장 빠르고 직관적으로 계산하세요.</p>
                    </div>
                </div>

                {/* 🚀 입력 섹션 (인디고 테마 적용) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3 md:mb-4">
                            <CheckCircle2 size={16} className="text-indigo-500" strokeWidth={2.5} />
                            <label className="text-[13px] md:text-[15px] font-black text-[#4A403A]">
                                {isSqmToPyeong ? "제곱미터(㎡) 입력" : "평수(P) 입력"}
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="0"
                                className="w-full bg-[#fdfbf7] border border-gray-200 rounded-[16px] md:rounded-[20px] p-4 md:p-5 text-2xl md:text-3xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-right outline-none transition-all placeholder:text-gray-200 pr-12"
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg md:text-xl">
                                {isSqmToPyeong ? "㎡" : "평"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 🚀 스왑 버튼 영역 (입력창과 결과창 사이에 동동 떠있는 디자인) */}
                <div className="flex flex-col items-center justify-center -my-4 relative z-20">
                    <button
                        onClick={handleSwap}
                        className="w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-200 flex items-center justify-center hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 border-[5px] border-[#f8f9fa] group"
                    >
                        <ArrowUpDown size={20} strokeWidth={3} className="group-active:rotate-180 transition-transform duration-300" />
                    </button>
                </div>

                {/* 🚀 결과 리포트 (인디고 그라데이션 박스) */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-[24px] md:rounded-[32px] p-6 md:p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden z-10 pt-10">
                    <div className="absolute -right-6 -top-6 opacity-10">
                        <Maximize size={160} />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 opacity-90">
                            <Info size={16} className="text-indigo-100" />
                            <p className="text-[13px] font-bold text-indigo-100 tracking-tight">변환된 크기 결과</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 md:mb-8 tracking-tighter flex items-baseline gap-1.5">
                            {getResult()} <span className="text-xl md:text-2xl font-bold text-indigo-100">
                                {isSqmToPyeong ? "평" : "㎡"}
                            </span>
                        </h2>

                        <div className="space-y-4 border-t border-indigo-400/50 pt-5 md:pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-[12px] md:text-[13px] font-bold text-indigo-100">적용 환산율</span>
                                <span className="text-[12px] md:text-[13px] font-black text-indigo-600 bg-white px-3 py-1.5 rounded-lg shadow-sm">1평 = 3.3058㎡</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm text-indigo-50">
                                <span>입력하신 크기</span>
                                <span className="font-bold">{inputValue || "0"} {isSqmToPyeong ? "㎡" : "평"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단 안내 문구 */}
                <div className="mt-8 flex items-start gap-2 text-[11px] md:text-[12px] leading-relaxed text-gray-400 bg-gray-50 p-4 rounded-xl">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>법정계량단위 사용 의무화에 따라 건물 면적은 ㎡로 표기해야 합니다. 본 계산기는 사용자의 편의를 돕기 위한 단순 환산 도구이며, 실제 건축물대장 및 등기부등본상의 면적과 미세한 소수점 차이가 발생할 수 있습니다.</p>
                </div>

            </div>
        </main>
    );
}