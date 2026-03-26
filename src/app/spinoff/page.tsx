"use client";

import { useState } from "react";
import { Search, Bell, Monitor, Smartphone, Filter, ChevronRight, CheckCircle2, Map, Star, TrendingUp, MapPin, Home, Building2, User, Calendar, Trophy } from "lucide-react";

export default function SpinoffPlayground() {
    const themes = [
        // ☁️ [NEW] 완벽한 조화와 숨통, 하늘색 계열
        {
            id: "aero-sky", name: "NEW: Aero Sky ✈️", category: "조화로운 스카이",
            primary: "#0EA5E9", primaryHover: "#0284C7", accent: "#38BDF8", accentSoft: "#E0F2FE", blueAccent: "#0EA5E9", blueSoft: "#F0F9FF",
            bg: "#F4FAFF", surface: "#FFFFFF", border: "#BAE6FD", textMain: "#0F172A", textSub: "#64748B",
            desc: "청명하고 시원한 가을 하늘색. 화면이 넓어 보이고, 데이터와 가장 이질감 없이 조화롭게 스며듭니다.",
            badges: { brand: { bg: "#E0F2FE", text: "#0EA5E9", label: "APARTY 추천" }, info: { bg: "#F0F9FF", text: "#0284C7", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#0EA5E9", label: "인기단지" } }
        },
        {
            id: "soft-powder", name: "NEW: Soft Powder ☁️", category: "조화로운 스카이",
            primary: "#6B9DF2", primaryHover: "#5084DB", accent: "#8BB6FF", accentSoft: "#ECF2FF", blueAccent: "#6B9DF2", blueSoft: "#F4F8FF",
            bg: "#F8FBFF", surface: "#FFFFFF", border: "#DCE6F7", textMain: "#1B2433", textSub: "#6C7C93",
            desc: "구름처럼 부드럽고 포근한 파우더 블루. 시각적 피로도가 0에 가까운 궁극의 편안함을 줍니다.",
            badges: { brand: { bg: "#ECF2FF", text: "#6B9DF2", label: "APARTY 추천" }, info: { bg: "#F4F8FF", text: "#5084DB", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#6B9DF2", label: "인기단지" } }
        },

        // 💎 [이전] 퓨어 원색 라인업
        {
            id: "pure-cobalt", name: "이전: Pure Cobalt Blue 💎", category: "극강의 퓨어 원색",
            primary: "#0055FF", primaryHover: "#0044CC", accent: "#00D1FF", accentSoft: "#E5F0FF", blueAccent: "#0055FF", blueSoft: "#E5F0FF",
            bg: "#F4F7FF", surface: "#FFFFFF", border: "#D1E0FF", textMain: "#0A1128", textSub: "#5C6B8A",
            desc: "탁함이 1%도 없는 가장 맑고 쨍한 코발트 블루. 압도적인 속도감과 신뢰.",
            badges: { brand: { bg: "#E5F0FF", text: "#0055FF", label: "APARTY 추천" }, info: { bg: "#E0F7FA", text: "#00BCD4", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#0055FF", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#0055FF", label: "인기단지" } }
        },

        // 🏢 [초격차 중간지대]
        {
            id: "mist-indigo", name: "이전: Mist Indigo (포털형)", category: "초격차 중간지대",
            primary: "#4E5875", primaryHover: "#3d455c", accent: "#6C78C9", accentSoft: "#EEF1FA", blueAccent: "#6C78C9", blueSoft: "#EEF1FA",
            bg: "#F8FAFD", surface: "#FFFFFF", border: "#E2E7F1", textMain: "#243042", textSub: "#7E89A3",
            desc: "차갑고 똑똑한 프롭테크 감성. 흔한 블루를 탈피한 포털형 차별화.",
            badges: { brand: { bg: "#EEF1FA", text: "#4E5875", label: "APARTY 추천" }, info: { bg: "#EEF1FA", text: "#6C78C9", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#6C78C9", label: "인기단지" } }
        },

        // 👑 [하이엔드 딥 라인업]
        {
            id: "premium-dark-violet", name: "이전: Premium Dark 👑", category: "하이엔드 딥",
            primary: "#3F329C", primaryHover: "#342A86", accent: "#5446D4", accentSoft: "#ECE8FF", blueAccent: "#4378F0", blueSoft: "#E0EDFF",
            bg: "#F5F4FE", surface: "#FFFFFF", border: "#D9D4F5", textMain: "#1D193B", textSub: "#6B6791",
            desc: "가장 진하고 무게감 있는 프리미엄. 압도적인 존재감을 뿜어냄.",
            badges: { brand: { bg: "#ECE8FF", text: "#3F329C", label: "APARTY 프리미엄" }, info: { bg: "#E0EDFF", text: "#4378F0", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#5446D4", label: "인기단지" } }
        },

        // 🔄 [기존 대조군]
        {
            id: "original-orange", name: "비교군: 오렌지 오리지널", category: "기존 비교군",
            primary: "#FF7A2F", primaryHover: "#E66A26", accent: "#FF5722", accentSoft: "#FFF0E8", blueAccent: "#3B82F6", blueSoft: "#DBEAFE",
            bg: "#FDFDFD", surface: "#FFFFFF", border: "#F0F0F0", textMain: "#1E293B", textSub: "#64748B",
            desc: "우리가 처음 출발했던 역동적이고 톡톡 튀는 에너지.",
            badges: { brand: { bg: "#FFF0E8", text: "#FF7A2F", label: "APARTY 추천" }, info: { bg: "#DBEAFE", text: "#3B82F6", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#3B82F6", label: "신규등록" }, imminent: { bg: "#FEE2E2", text: "#B91C1C", label: "마감임박" }, popular: { bg: "#FCE7F3", text: "#BE185D", label: "인기단지" } }
        }
    ];

    const [activeTheme, setActiveTheme] = useState(themes[0]);
    const [viewMode, setViewMode] = useState<'mobile' | 'pc'>('pc');
    const [activeTab, setActiveTab] = useState("청약 일정");
    const [activeFilter, setActiveFilter] = useState("아파트");
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [selectedCard, setSelectedCard] = useState<number | null>(2);

    return (
        <div className="min-h-screen bg-gray-200 p-4 md:p-8 font-sans flex flex-col items-center">

            {/* 🛠️ 컨트롤 패널 */}
            <div className="w-full max-w-[1024px] bg-white p-6 rounded-2xl shadow-lg mb-8 border border-gray-300 sticky top-4 z-50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">APARTY 마스터 컬러 컬렉션 (조화/숨통) ☁️</h2>
                        <p className="text-sm text-gray-600">
                            이질감을 없애고 화면에 자연스럽게 스며드는 <strong>[Aero Sky]</strong>와 <strong>[Soft Powder]</strong>를 확인해 보세요.
                        </p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 shrink-0">
                        <button onClick={() => setViewMode('mobile')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Smartphone size={16} /> 모바일
                        </button>
                        <button onClick={() => setViewMode('pc')} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'pc' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            <Monitor size={16} /> PC 와이드
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTheme(t)}
                            className={`px-3 py-2 text-[13px] font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0 border-2 ${activeTheme.id === t.id ? 'scale-105' : 'opacity-70 hover:opacity-100 border-transparent'}`}
                            style={{ backgroundColor: t.primary, color: "white", borderColor: activeTheme.id === t.id ? t.accent : 'transparent' }}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
                <div className="text-[13px] font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    👉 <strong>선택된 테마 분석:</strong> <span className="font-semibold" style={{ color: activeTheme.primary }}>{activeTheme.desc}</span>
                </div>
            </div>

            {/* 🖥️ 📱 시뮬레이터 */}
            <div
                className={`w-full shadow-2xl overflow-y-auto no-scrollbar relative transition-all duration-500 ease-in-out ${viewMode === 'mobile' ? 'max-w-[420px] h-[850px] border-x border-t rounded-t-3xl' : 'max-w-[1024px] min-h-[800px] rounded-2xl border'}`}
                style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}
            >

                {/* 1. 헤더 */}
                <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between transition-colors" style={{ borderColor: activeTheme.border }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-sm transition-colors" style={{ backgroundColor: activeTheme.primary }}>A</div>
                        <h1 className="text-2xl font-black tracking-tighter transition-colors" style={{ color: activeTheme.primary }}>APARTY</h1>

                        {viewMode === 'pc' && (
                            <nav className="ml-8 flex gap-8">
                                {["홈", "청약 일정", "분양 랭킹", "AI 추천"].map((tab) => (
                                    <span
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className="font-bold text-[15px] cursor-pointer relative pb-1 transition-colors"
                                        style={{ color: activeTab === tab ? activeTheme.primary : activeTheme.textSub }}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-[-17px] left-0 w-full h-[3px] rounded-t-md transition-colors" style={{ backgroundColor: activeTheme.primary }}></div>
                                        )}
                                    </span>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Search size={24} style={{ color: activeTheme.textSub }} className="cursor-pointer transition-colors" />
                        <Bell size={24} style={{ color: activeTheme.textSub }} className="cursor-pointer transition-colors" />
                    </div>
                </header>

                <div className={`p-4 md:p-8 flex flex-col gap-6 ${viewMode === 'mobile' ? 'pb-32' : ''}`}>

                    {/* 2. 데이터 패널 */}
                    <section>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold flex items-center gap-1.5 transition-colors" style={{ color: activeTheme.textMain }}>
                                <TrendingUp size={16} style={{ color: activeTheme.blueAccent }} /> 실시간 마켓 데이터
                            </h3>
                            <span className="text-xs font-bold cursor-pointer hover:underline transition-colors" style={{ color: activeTheme.blueAccent }}>데이터 랩 이동 <ChevronRight size={12} className="inline" /></span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-4 rounded-xl bg-white border shadow-sm transition-colors" style={{ borderColor: activeTheme.border }}>
                                <div className="text-[12px] mb-1 transition-colors" style={{ color: activeTheme.textSub }}>청약 경쟁률</div>
                                <div className="text-[20px] font-black transition-colors" style={{ color: activeTheme.blueAccent }}>14.5 : 1</div>
                            </div>
                            <div className="p-4 rounded-xl bg-white border shadow-sm transition-colors" style={{ borderColor: activeTheme.border }}>
                                <div className="text-[12px] mb-1 transition-colors" style={{ color: activeTheme.textSub }}>관심 단지 알림</div>
                                <div className="text-[20px] font-black transition-colors" style={{ color: activeTheme.primary }}>12건</div>
                            </div>
                            {viewMode === 'pc' && (
                                <>
                                    <div className="p-4 rounded-xl bg-white border shadow-sm transition-colors" style={{ borderColor: activeTheme.border }}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded transition-colors" style={{ backgroundColor: activeTheme.badges.info.bg, color: activeTheme.badges.info.text }}>{activeTheme.badges.info.label}</span>
                                        </div>
                                        <div className="text-[12px] font-medium transition-colors" style={{ color: activeTheme.textMain }}>전월 대비 분양가 상승</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white border shadow-sm transition-colors" style={{ borderColor: activeTheme.border }}>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="px-2 py-0.5 text-[10px] font-bold rounded transition-colors" style={{ backgroundColor: activeTheme.badges.brand.bg, color: activeTheme.badges.brand.text }}>{activeTheme.badges.brand.label}</span>
                                        </div>
                                        <div className="text-[12px] font-medium transition-colors" style={{ color: activeTheme.textMain }}>해운대구 센텀 오픈</div>
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* 3. 필터 칩 */}
                    <section>
                        <h3 className="text-sm font-bold mb-3 transition-colors" style={{ color: activeTheme.textSub }}>카테고리 필터</h3>
                        <div className="flex flex-wrap gap-2">
                            <button className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-bold border bg-white shadow-sm transition-colors" style={{ borderColor: activeTheme.border, color: activeTheme.textSub }}>
                                <Filter size={14} /> 맞춤필터
                            </button>
                            {["아파트", "오피스텔", "무순위"].map((filter) => {
                                const isSelected = activeFilter === filter;
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className="px-4 py-2 rounded-full text-[13px] font-bold shadow-sm transition-all"
                                        style={{ backgroundColor: isSelected ? activeTheme.accentSoft : activeTheme.surface, color: isSelected ? activeTheme.primary : activeTheme.textSub, borderColor: isSelected ? activeTheme.primary : activeTheme.border, borderWidth: '1px' }}
                                    >
                                        {filter}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 4. 고밀도 카드 컴포넌트 */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold transition-colors" style={{ color: activeTheme.textSub }}>프리미엄 분양 리스트</h3>
                            {viewMode === 'pc' && <span className="text-[13px] font-bold cursor-pointer transition-colors" style={{ color: activeTheme.textSub }}>더보기 <ChevronRight size={14} className="inline" /></span>}
                        </div>
                        <div className={`grid ${viewMode === 'pc' ? 'grid-cols-3' : 'grid-cols-1'} gap-5`}>

                            {[1, 2, 3].map((cardId) => {
                                const isHovered = hoveredCard === cardId;
                                const isSelected = selectedCard === cardId;

                                let cardBg = activeTheme.surface;
                                let cardBorder = activeTheme.border;
                                let cardShadow = "none";

                                if (isSelected) {
                                    cardBg = activeTheme.bg;
                                    cardBorder = activeTheme.primary;
                                    cardShadow = `0 0 0 3px ${activeTheme.accentSoft}`;
                                } else if (isHovered) {
                                    cardBorder = activeTheme.primary;
                                    cardShadow = `0 10px 30px rgba(0,0,0, 0.08)`;
                                }

                                return (
                                    <div
                                        key={cardId}
                                        onMouseEnter={() => setHoveredCard(cardId)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        onClick={() => setSelectedCard(cardId)}
                                        className="rounded-xl border cursor-pointer overflow-hidden relative transition-all duration-300"
                                        style={{ backgroundColor: cardBg, borderColor: cardBorder, boxShadow: cardShadow }}
                                    >
                                        <div className="h-[140px] bg-gray-100 flex justify-center items-center text-sm font-medium relative transition-colors" style={{ color: activeTheme.textSub }}>
                                            {isSelected && <CheckCircle2 size={32} className="absolute inset-0 m-auto z-10 opacity-20 transition-colors" style={{ color: activeTheme.primary }} />}
                                            현장 조감도
                                            {cardId === 1 && <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold rounded transition-colors" style={{ backgroundColor: activeTheme.badges.imminent.bg, color: activeTheme.badges.imminent.text }}>{activeTheme.badges.imminent.label}</span>}
                                            {cardId === 2 && <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold rounded transition-colors" style={{ backgroundColor: activeTheme.badges.popular.bg, color: activeTheme.badges.popular.text }}>{activeTheme.badges.popular.label}</span>}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-[16px] font-extrabold transition-colors" style={{ color: activeTheme.textMain }}>
                                                    {cardId === 1 ? '일반 카드' : cardId === 2 ? '에코델타 디에트르' : '호버 카드'}
                                                </h4>
                                                <span className="text-[11px] font-bold px-2 py-0.5 rounded transition-colors" style={{ backgroundColor: activeTheme.accentSoft, color: activeTheme.primary }}>84㎡</span>
                                            </div>

                                            <div className="flex items-center gap-1 mb-3 transition-colors">
                                                <MapPin size={11} style={{ color: activeTheme.textSub }} />
                                                <span className="text-[12px] font-medium" style={{ color: activeTheme.textSub }}>부산광역시 강서구 강동동</span>
                                            </div>

                                            <div className="flex gap-4 mb-4 py-3 border-y transition-colors" style={{ borderColor: activeTheme.border }}>
                                                <div>
                                                    <p className="text-[10px] transition-colors" style={{ color: activeTheme.textSub }}>분양가</p>
                                                    <p className="text-[13px] font-bold transition-colors" style={{ color: activeTheme.textMain }}>5.8억 ~ 7.2억</p>
                                                </div>
                                                <div className="w-px transition-colors" style={{ backgroundColor: activeTheme.border }}></div>
                                                <div>
                                                    <p className="text-[10px] transition-colors" style={{ color: activeTheme.textSub }}>입주예정</p>
                                                    <p className="text-[13px] font-bold transition-colors" style={{ color: activeTheme.textMain }}>2028. 10</p>
                                                </div>
                                            </div>

                                            {isSelected ? (
                                                <button className="w-full py-3 rounded-lg text-[13px] font-bold shadow-lg transition-colors" style={{ backgroundColor: activeTheme.primary, color: "#FFFFFF" }}>상담하기</button>
                                            ) : (
                                                <button className="w-full py-3 rounded-lg text-[13px] font-bold border flex items-center justify-center gap-1.5 transition-colors" style={{ backgroundColor: activeTheme.accentSoft, color: activeTheme.primary, borderColor: activeTheme.border }}>
                                                    <Star size={14} /> 관심 등록
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* 🚀 5. 모바일 전용 UI */}
                {viewMode === 'mobile' && (
                    <>
                        <button className="absolute bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center gap-2 text-[14px] font-bold text-white z-50 transition-colors" style={{ backgroundColor: activeTheme.primary }}>
                            <Map size={16} /> 지도에서 찾기
                        </button>

                        <div className="absolute bottom-0 left-0 w-full bg-white border-t flex justify-between px-6 py-3 pb-6 rounded-b-3xl z-50 transition-colors" style={{ borderColor: activeTheme.border }}>
                            <div className="flex flex-col items-center gap-1 cursor-pointer transition-colors" style={{ color: activeTheme.primary }}>
                                <Home size={22} strokeWidth={2.5} />
                                <span className="text-[10px] font-bold">홈</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer transition-colors" style={{ color: activeTheme.textSub }}>
                                <Building2 size={22} />
                                <span className="text-[10px] font-medium">분양정보</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer transition-colors" style={{ color: activeTheme.textSub }}>
                                <Calendar size={22} />
                                <span className="text-[10px] font-medium">청약일정</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 cursor-pointer transition-colors" style={{ color: activeTheme.textSub }}>
                                <User size={22} />
                                <span className="text-[10px] font-medium">MY</span>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
}