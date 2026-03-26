"use client";

import { useState } from "react";
import { Search, Bell, Monitor, Smartphone, Filter, ChevronRight, CheckCircle2, Map, Star, TrendingUp, MapPin, Home, Building2, User, Calendar, Trophy } from "lucide-react";

export default function SpinoffPlayground() {
    const themes = [
        // ⚡ [NEW] 비비드 하이엔드 (쨍하고 선명한 전기감)
        {
            id: "electric-iris", name: "NEW: Electric Iris ⚡ (강력 추천)", category: "비비드 하이엔드",
            primary: "#5B4DFF", primaryHover: "#4E41EB", accent: "#7A5CFF", accentSoft: "#EFEAFF", blueAccent: "#3A8BFF", blueSoft: "#E8F1FF",
            bg: "#F8F9FF", surface: "#FFFFFF", border: "#DCDFFF", textMain: "#1E2240", textSub: "#6A7193",
            desc: "탁함 Zero! 쨍하지만 싸 보이지 않는 완벽한 밸런스. 브랜드는 퍼플로, 데이터는 블루로 꽂힙니다.",
            badges: { brand: { bg: "#EFEAFF", text: "#5B4DFF", label: "APARTY 추천" }, info: { bg: "#E8F1FF", text: "#3A8BFF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#5B4DFF", label: "인기단지" } }
        },
        {
            id: "neon-indigo", name: "NEW: Neon Indigo 💎", category: "비비드 하이엔드",
            primary: "#4F46FF", primaryHover: "#4238e5", accent: "#765BFF", accentSoft: "#EEF0FF", blueAccent: "#2F8CFF", blueSoft: "#E6EEFF",
            bg: "#F7F8FF", surface: "#FFFFFF", border: "#D9DEFF", textMain: "#1A1C33", textSub: "#686b8c",
            desc: "블루의 시원함이 더 강한 버전. 정보 플랫폼과 검색/필터 UI에서 미친 가독성을 자랑합니다.",
            badges: { brand: { bg: "#EEF0FF", text: "#4F46FF", label: "APARTY 추천" }, info: { bg: "#E6EEFF", text: "#2F8CFF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#4F46FF", label: "인기단지" } }
        },
        {
            id: "bright-royal-violet", name: "NEW: Bright Royal Violet ✨", category: "비비드 하이엔드",
            primary: "#6A4DFF", primaryHover: "#5b3ce5", accent: "#8A63FF", accentSoft: "#F1ECFF", blueAccent: "#4C86FF", blueSoft: "#e8f0ff",
            bg: "#F9F8FF", surface: "#FFFFFF", border: "#E5E0FF", textMain: "#221A40", textSub: "#706399",
            desc: "퍼플의 존재감을 최대로 끌어올려 감각적이고 독보적인 브랜드 인상을 남깁니다.",
            badges: { brand: { bg: "#F1ECFF", text: "#6A4DFF", label: "APARTY 추천" }, info: { bg: "#e8f0ff", text: "#4C86FF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#6A4DFF", label: "인기단지" } }
        },

        // 🏢 [초격차 중간지대]
        {
            id: "mist-indigo", name: "이전: Mist Indigo (포털형)", category: "초격차 중간지대",
            primary: "#4E5875", primaryHover: "#3d455c", accent: "#6C78C9", accentSoft: "#EEF1FA", blueAccent: "#6C78C9", blueSoft: "#EEF1FA",
            bg: "#F8FAFD", surface: "#FFFFFF", border: "#E2E7F1", textMain: "#243042", textSub: "#7E89A3",
            desc: "차갑고 똑똑한 프롭테크 감성. 흔한 블루를 탈피한 포털형 차별화.",
            badges: { brand: { bg: "#EEF1FA", text: "#4E5875", label: "APARTY 추천" }, info: { bg: "#EEF1FA", text: "#6C78C9", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#6C78C9", label: "인기단지" } }
        },
        {
            id: "ink-plum", name: "이전: Ink Plum (브랜드형)", category: "초격차 중간지대",
            primary: "#5B4B6E", primaryHover: "#4a3c59", accent: "#7A68A6", accentSoft: "#F3EFF8", blueAccent: "#7A68A6", blueSoft: "#F3EFF8",
            bg: "#FAF9FC", surface: "#FFFFFF", border: "#E8E1F0", textMain: "#2A2333", textSub: "#8A7B9C",
            desc: "조용한 럭셔리. 부동산 포털의 뻔함을 버린 브랜드형 프리미엄.",
            badges: { brand: { bg: "#F3EFF8", text: "#5B4B6E", label: "APARTY 프리미엄" }, info: { bg: "#F3EFF8", text: "#7A68A6", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#7A68A6", label: "인기단지" } }
        },
        {
            id: "deep-rose-slate", name: "이전: Deep Rose Slate", category: "초격차 중간지대",
            primary: "#6A5563", primaryHover: "#54434e", accent: "#8D6E84", accentSoft: "#F7F2F5", blueAccent: "#8D6E84", blueSoft: "#F7F2F5",
            bg: "#FCFAFB", surface: "#FFFFFF", border: "#EDE4E9", textMain: "#2F2730", textSub: "#9B8592",
            desc: "가장 흔하지 않은 무드. 극강의 브랜드 인상을 주지만 호불호가 갈릴 수 있음.",
            badges: { brand: { bg: "#F7F2F5", text: "#6A5563", label: "APARTY 추천" }, info: { bg: "#F7F2F5", text: "#8D6E84", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#8D6E84", label: "인기단지" } }
        },

        // 👑 [하이엔드 딥 라인업]
        {
            id: "premium-dark-violet", name: "이전: Premium Dark 👑", category: "하이엔드 딥",
            primary: "#3F329C", primaryHover: "#342A86", accent: "#5446D4", accentSoft: "#ECE8FF", blueAccent: "#4378F0", blueSoft: "#E0EDFF",
            bg: "#F5F4FE", surface: "#FFFFFF", border: "#D9D4F5", textMain: "#1D193B", textSub: "#6B6791",
            desc: "가장 진하고 무게감 있는 프리미엄. 압도적인 존재감을 뿜어냄.",
            badges: { brand: { bg: "#ECE8FF", text: "#3F329C", label: "APARTY 프리미엄" }, info: { bg: "#E0EDFF", text: "#4378F0", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#5446D4", label: "인기단지" } }
        },
        {
            id: "ai-royal-indigo", name: "이전: Royal Indigo 🤖", category: "하이엔드 딥",
            primary: "#2D2852", primaryHover: "#231F40", accent: "#6C5CE7", accentSoft: "#EAE6F9", blueAccent: "#2563EB", blueSoft: "#DBEAFE",
            bg: "#F8F8FA", surface: "#FFFFFF", border: "#E2E0EB", textMain: "#191824", textSub: "#6B687A",
            desc: "블랙에 가까운 인디고 구조감 + 쨍한 블루 데이터. PB 수준의 초고급 밸런스.",
            badges: { brand: { bg: "#EAE6F9", text: "#2D2852", label: "APARTY 프리미엄" }, info: { bg: "#DBEAFE", text: "#2563EB", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#2563EB", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#6C5CE7", label: "인기단지" } }
        },
        {
            id: "deep-violet", name: "이전: Deep Violet", category: "하이엔드 딥",
            primary: "#4B3FB3", primaryHover: "#41379C", accent: "#5C4FE1", accentSoft: "#ECE9FF", blueAccent: "#4A7BFF", blueSoft: "#E7F0FF",
            bg: "#F6F5FF", surface: "#FFFFFF", border: "#DDD8F8", textMain: "#211C43", textSub: "#6B6791",
            desc: "블루 기운이 살짝 남아있는 무거운 퍼플.",
            badges: { brand: { bg: "#ECE9FF", text: "#4B3FB3", label: "APARTY 프리미엄" }, info: { bg: "#E7F0FF", text: "#4A7BFF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#5C4FE1", label: "인기단지" } }
        },
        {
            id: "hyper-violet", name: "이전: Hyper Violet", category: "하이엔드 딥",
            primary: "#6257FF", primaryHover: "#564BEF", accent: "#7A5CFF", accentSoft: "#ECE9FF", blueAccent: "#4B8DFF", blueSoft: "#E7F0FF",
            bg: "#F7F8FF", surface: "#FFFFFF", border: "#DDDDF8", textMain: "#1F2140", textSub: "#6C6F93",
            desc: "디지털하고 영리한 플랫폼 느낌이 강한 하이퍼 퍼플.",
            badges: { brand: { bg: "#ECE9FF", text: "#6257FF", label: "APARTY 추천" }, info: { bg: "#E7F0FF", text: "#4B8DFF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#7A5CFF", label: "인기단지" } }
        },
        {
            id: "violet-expert", name: "이전: Dusty Violet", category: "하이엔드 딥",
            primary: "#5A54A8", primaryHover: "#4E4996", accent: "#7A6BFF", accentSoft: "#EEEAFE", blueAccent: "#5A54A8", blueSoft: "#EEEAFE",
            bg: "#F8F7FE", surface: "#FFFFFF", border: "#E8E5F7", textMain: "#26233A", textSub: "#6F6A86",
            desc: "화이트 80 + 은은한 바이올렛 20. 차분한 무드.",
            badges: { brand: { bg: "#EEEAFE", text: "#5A54A8", label: "APARTY 추천" }, info: { bg: "#EEEAFE", text: "#5A54A8", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" }, imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" }, popular: { bg: "#F4EEFF", text: "#7A59D1", label: "인기단지" } }
        },

        // 🔄 [기존 비교군]
        {
            id: "ice-slate", name: "비교군: Ice Slate (블루)", category: "기존 비교군",
            primary: "#31475E", primaryHover: "#26384C", accent: "#4DA3FF", accentSoft: "#E8F4FF", blueAccent: "#4DA3FF", blueSoft: "#E8F4FF",
            bg: "#F8FBFC", surface: "#FFFFFF", border: "#E5EDF3", textMain: "#25313D", textSub: "#73808C",
            desc: "호갱노노, 분양24 느낌의 정석적이고 안전한 블루.",
            badges: { brand: { bg: "#E8F4FF", text: "#31475E", label: "APARTY 추천" }, info: { bg: "#E8F4FF", text: "#4DA3FF", label: "데이터분석" }, new: { bg: "#EEF4FF", text: "#4DA3FF", label: "신규등록" }, imminent: { bg: "#FEE2E2", text: "#B91C1C", label: "마감임박" }, popular: { bg: "#F3E8FF", text: "#7E22CE", label: "인기단지" } }
        },
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
                        <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">APARTY 마스터 컬러 컬렉션 (최종) 🎨</h2>
                        <p className="text-sm text-gray-600">
                            <strong>비비드 하이엔드 (Electric Iris)</strong>가 드디어 추가되었습니다! 흐릿함 없이 쨍하게 꽂히는 브랜드 감성을 확인하세요.
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

            {/* 🖥️ 📱 시뮬레이터 (레이아웃 에러 완벽 수정) */}
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

                {/* 🚀 바텀 탭 공간을 위한 하단 패딩(pb-24) 추가 */}
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