"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, Maximize, ArrowUpDown, Info, CheckCircle2 } from 'lucide-react';

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
                        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-500 shadow-inner">
                            <Maximize size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">평형 변환기</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 입력 섹션 */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 size={18} className="text-[#FF8C42]" strokeWidth={2.5} />
                            <label className="text-[14px] md:text-[15px] font-black text-[#4A403A]">
                                {isSqmToPyeong ? "제곱미터(㎡) 입력" : "평수(P) 입력"}
                            </label>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="0"
                                className="w-full bg-[#fdfbf7] border border-gray-100 rounded-[20px] p-5 md:p-6 text-2xl md:text-3xl font-black text-[#4A403A] focus:ring-4 focus:ring-orange-100 focus:border-orange-200 text-right outline-none transition-all placeholder:text-gray-200"
                            />
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#4A403A]/30 font-black text-lg">
                                {isSqmToPyeong ? "㎡" : "P"}
                            </span>
                        </div>
                    </div>

                    {/* 스왑 버튼 영역 */}
                    <div className="flex justify-center -my-2 relative z-10">
                        <button
                            onClick={handleSwap}
                            className="w-12 h-12 bg-[#FF8C42] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:rotate-180 transition-all duration-500 border-4 border-white"
                        >
                            <ArrowUpDown size={22} strokeWidth={3} />
                        </button>
                    </div>

                    {/* 변환 대상 안내 */}
                    <div className="text-center opacity-40 py-2">
                        <p className="text-xs font-bold text-[#4A403A]">클릭하여 입력 단위를 변경할 수 있습니다</p>
                    </div>
                </div>

                {/* 결과 리포트 (다크 브라운 카드) */}
                <div className="mt-6 md:mt-8 bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 opacity-80">
                            <Info size={16} />
                            <p className="text-[13px] font-bold tracking-tight">변환 결과 내역</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#FF8C42] mb-6 md:mb-8 tracking-tighter">
                            {getResult()} <span className="text-lg md:text-xl font-bold text-white/50 ml-1">
                                {isSqmToPyeong ? "평" : "㎡"}
                            </span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-6 md:pt-8">
                            <div className="flex justify-between items-center">
                                <span className="text-[13px] md:text-sm font-medium text-white/60">적용 환산율</span>
                                <span className="text-sm md:text-base font-black text-[#FF8C42] bg-white/10 px-4 py-1.5 rounded-xl">1평 = 3.3058㎡</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">입력하신 크기</span>
                                <span className="font-bold">{inputValue || "0"} {isSqmToPyeong ? "㎡" : "평"}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] md:text-sm">
                                <span className="text-white/60">변환된 크기</span>
                                <span className="font-bold">{getResult()} {isSqmToPyeong ? "평" : "㎡"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 md:mt-10 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold px-4 md:px-6">
                    법정계량단위 사용 의무화에 따라 건물 면적은 ㎡로 표기해야 합니다.<br className="hidden md:block" />
                    본 계산기는 편의를 위한 단순 환산 수치이며, 실제 대장상의 면적과 차이가 있을 수 있습니다.
                </p>
            </div>
        </div>
    );
}