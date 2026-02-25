"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home, ClipboardCheck, CheckCircle2, Circle, Info, Calendar, Hammer, Key, AlertCircle } from 'lucide-react';

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
        <main className="min-h-screen bg-[#f8f9fa] pb-24">
            {/* 🚀 상단 네비게이션 (모든 유틸리티 디자인 통일) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all"
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                <div className="flex items-center gap-2">
                    <div className="bg-amber-50 p-1.5 rounded-lg text-amber-500 shadow-inner">
                        <ClipboardCheck size={16} strokeWidth={2.5} />
                    </div>
                    <span className="text-sm font-bold text-gray-800 tracking-tight">입주 체크리스트</span>
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
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
                        <ClipboardCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-[#2d2d2d]">입주 체크리스트</h1>
                        <p className="text-[12px] md:text-[13px] text-gray-400 mt-1 font-medium">분양 계약부터 입주까지 누락 없이 꼼꼼하게 점검하세요.</p>
                    </div>
                </div>

                {/* 🚀 리스트 섹션 (화이트 카드 & 앰버 테마 적용) */}
                <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl border border-gray-50 space-y-8 md:space-y-10 mb-8">
                    {CHECKLIST_DATA.map((section, idx) => (
                        <div key={idx}>
                            <div className="flex items-center gap-2.5 mb-4 md:mb-5">
                                {/* 각 단계별 고유 색상은 그대로 유지하여 시각적 분리감 부여 */}
                                <div className={`p-2 rounded-xl shadow-sm ${section.bg} ${section.color}`}>
                                    <section.icon size={18} strokeWidth={2.5} />
                                </div>
                                <h2 className="text-[15px] md:text-[17px] font-black text-[#4A403A]">{section.category}</h2>
                            </div>

                            <div className="grid gap-2.5 md:gap-3">
                                {section.items.map((item) => {
                                    const isChecked = checkedItems.includes(item);
                                    return (
                                        <div
                                            key={item}
                                            onClick={() => toggleItem(item)}
                                            className={`flex items-center gap-3 p-3.5 md:p-4 rounded-[16px] md:rounded-[20px] cursor-pointer transition-all border ${isChecked
                                                ? "bg-amber-50/60 border-amber-200"
                                                : "bg-[#fdfbf7] border-gray-100 hover:bg-white hover:border-amber-100"
                                                }`}
                                        >
                                            {isChecked
                                                ? <CheckCircle2 className="text-amber-500 shrink-0" size={20} strokeWidth={2.5} />
                                                : <Circle className="text-gray-200 shrink-0" size={20} strokeWidth={2.5} />
                                            }
                                            <span className={`text-[13px] md:text-[15px] font-bold transition-all ${isChecked ? "text-amber-500 line-through opacity-60" : "text-[#4A403A]"
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

                {/* 🚀 결과 리포트 (다크 브라운 카드 & 앰버 진행바) */}
                <div className="bg-[#4A403A] rounded-[24px] md:rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3 opacity-80">
                            <Info size={16} />
                            <p className="text-[13px] font-bold tracking-tight">나의 입주 준비 현황</p>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-amber-400 mb-6 md:mb-8 tracking-tighter">
                            {progress} <span className="text-lg md:text-xl font-bold text-white/50 ml-1">% 완료</span>
                        </h2>

                        <div className="space-y-4 border-t border-white/10 pt-6 md:pt-8">
                            <div className="w-full h-3 md:h-4 bg-white/10 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-amber-400 transition-all duration-700 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-[11px] md:text-xs font-medium text-white/40 pt-2">
                                항목을 체크하면 진행도가 자동으로 계산됩니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 하단 안내 문구 (통일된 Alert 디자인) */}
                <div className="mt-8 flex items-start gap-2 text-[11px] md:text-[12px] leading-relaxed text-gray-400 bg-gray-50 p-4 rounded-xl">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>입주 과정은 단지마다 세부 일정이나 필수 점검 항목이 다를 수 있습니다. 반드시 해당 아파트 관리사무소 또는 분양사무실에서 발송하는 공식 안내문을 최종적으로 확인하시기 바랍니다.</p>
                </div>

            </div>
        </main>
    );
}