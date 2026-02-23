"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, ClipboardCheck, CheckCircle2, Circle, Info, Calendar, Hammer, Key } from 'lucide-react';

const CHECKLIST_DATA = [
    {
        category: "1단계: 계약 및 중도금",
        icon: Calendar,
        color: "text-blue-500",
        bg: "bg-blue-50",
        items: ["분양계약서 원본 보관", "옵션 품목 최종 확인", "중도금 대출 신청", "은행 우대금리 확인", "기존 주택 처분 계획"]
    },
    {
        category: "2단계: 사전점검",
        icon: Hammer,
        color: "text-orange-500",
        bg: "bg-orange-50",
        items: ["사전점검 업체 예약", "준비물 챙기기", "벽지/바닥 하자 확인", "창호/배수 상태 확인", "하자 접수 앱 등록"]
    },
    {
        category: "3단계: 입주 및 이사",
        icon: Key,
        color: "text-amber-500",
        bg: "bg-amber-50",
        items: ["관리소 입주 예약", "이사 업체 선정", "입주 잔금 납부", "도시가스/인터넷 신청", "전입신고 완료"]
    }
];

export default function ChecklistPage() {
    const router = useRouter();
    const [checkedItems, setCheckedItems] = useState<string[]>([]);

    const toggleItem = (item: string) => {
        setCheckedItems(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const totalItems = CHECKLIST_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
    const progress = Math.round((checkedItems.length / totalItems) * 100);

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
                        <div className="bg-amber-50 p-2 rounded-xl text-amber-500 shadow-inner">
                            <ClipboardCheck size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-lg md:text-xl font-black text-[#4A403A] tracking-tighter">입주 체크리스트</h1>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 text-[#4A403A] shadow-sm hover:bg-orange-50 hover:text-[#FF8C42] hover:border-orange-200 transition-all"
                    >
                        <Home size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* 리스트 섹션 (화이트 카드) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-50 space-y-10">
                    {CHECKLIST_DATA.map((section, idx) => (
                        <div key={idx}>
                            <div className="flex items-center gap-2 mb-5">
                                <div className={`p-2 rounded-xl ${section.bg} ${section.color}`}>
                                    <section.icon size={18} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-[15px] md:text-lg font-black text-[#4A403A]">{section.category}</h2>
                            </div>

                            <div className="grid gap-2.5">
                                {section.items.map((item) => {
                                    const isChecked = checkedItems.includes(item);
                                    return (
                                        <div
                                            key={item}
                                            onClick={() => toggleItem(item)}
                                            className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${isChecked
                                                    ? "bg-orange-50/50 border-orange-200"
                                                    : "bg-[#fdfbf7] border-gray-100 hover:bg-white hover:border-orange-100"
                                                }`}
                                        >
                                            {isChecked
                                                ? <CheckCircle2 className="text-[#FF8C42]" size={22} strokeWidth={2.5} />
                                                : <Circle className="text-gray-200" size={22} strokeWidth={2.5} />
                                            }
                                            <span className={`text-sm md:text-[15px] font-bold ${isChecked ? "text-[#FF8C42] line-through opacity-60" : "text-[#4A403A]"
                                                }`}>
                                                {item}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* 결과 리포트 (다크 브라운 카드) */}
                <div className="mt-6 md:mt-8 bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 opacity-80">
                            <Info size={16} />
                            <p className="text-[13px] font-bold tracking-tight">나의 입주 준비 현황</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-[#FF8C42] mb-6 md:mb-8 tracking-tighter">
                            {progress} <span className="text-lg md:text-xl font-bold text-white/50 ml-1">% 완료</span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-6 md:pt-8">
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#FF8C42] transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-xs font-medium text-white/40 pt-2">
                                항목을 체크하면 준비도가 자동으로 계산됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-8 md:mt-10 text-center text-[11px] text-[#4A403A]/40 leading-relaxed font-bold px-4 md:px-6">
                    입주 과정은 단지마다 세부 일정이 다를 수 있습니다.<br className="hidden md:block" />
                    반드시 해당 아파트 관리사무소 또는 분양사무실의 공지문을 최종 확인하세요.
                </p>
            </div>
        </div>
    );
}