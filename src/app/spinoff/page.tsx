"use client";

import { useState } from "react";
import { Search, Bell, Monitor, Smartphone, Filter, ChevronRight, CheckCircle2, Map, Star } from "lucide-react";

export default function SpinoffPlayground() {
    const themes = [
        {
            id: "violet-expert", name: "전문가 최종안: Violet 💜",
            primary: "#5A54A8", primaryHover: "#4E4996", accent: "#7A6BFF", accentSoft: "#EEEAFE",
            bg: "#F8F7FE", surface: "#FFFFFF", border: "#E8E5F7", textMain: "#26233A", textSub: "#6F6A86", divider: "#F0EEFA",
            desc: "화이트 80 + 바이올렛 20. 미래감 있는 하이엔드 부동산 포털의 정점.",
            // 전문가가 지정한 정교한 뱃지 상태색
            badges: {
                brand: { bg: "#EEEAFE", text: "#5A54A8", label: "브랜드" },
                new: { bg: "#EEF4FF", text: "#4B6BCE", label: "신규등록" },
                imminent: { bg: "#FFF1F1", text: "#D95C5C", label: "마감임박" },
                popular: { bg: "#F4EEFF", text: "#7A59D1", label: "인기단지" },
                premium: { bg: "#F1EEFF", text: "#6956D6", label: "프리미엄" }
            }
        },
        {
            id: "blue-grid", name: "비교군: 1안 (Blue)",
            primary: "#1E3A5F", primaryHover: "#152a45", accent: "#3B82F6", accentSoft: "#DCEBFF",
            bg: "#F7FAFD", surface: "#FFFFFF", border: "#E3EBF5", textMain: "#1F2937", textSub: "#6B7280", divider: "#E5E7EB",
            desc: "비교를 위한 기존 포털 블루 색상",
            badges: {
                brand: { bg: "#DCEBFF", text: "#1E3A5F", label: "브랜드" },
                new: { bg: "#DBEAFE", text: "#1D4ED8", label: "신규등록" },
                imminent: { bg: "#FEE2E2", text: "#B91C1C", label: "마감임박" },
                popular: { bg: "#F3E8FF", text: "#7E22CE", label: "인기단지" },
                premium: { bg: "#FFEDD5", text: "#C2410C", label: "프리미엄" }
            }
        }
    ];

    const [activeTheme, setActiveTheme] = useState(themes[0]);
    const [viewMode, setViewMode] = useState<'mobile' | 'pc'>('pc'); // 디테일 확인을 위해 PC 뷰를 기본으로
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
                        <h2 className="text-xl font-black text-gray-900 mb-1 tracking-tight">APARTY 바이올렛 실전 UI 테스트 🎨</h2>
                        <p className="text-sm text-gray-600">
                            제안해주신 <strong>버튼 그림자, 필터 칩 상태, 호버/선택 카드, 5종 상태 뱃지</strong>가 모두 적용되었습니다.
                        </p>
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Smartphone size={16} /> 모바일
                        </button>
                        <button
                            onClick={() => setViewMode('pc')}
                            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-md transition-all ${viewMode === 'pc' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Monitor size={16} /> PC 와이드
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-2">
                    {themes.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTheme(t)}
                            className={`px-4 py-2 text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 ${activeTheme.id === t.id ? 'ring-2 ring-offset-2 scale-105' : 'opacity-70 hover:opacity-100'}`}
                            style={{ backgroundColor: t.primary, color: "white", outlineColor: t.primary }}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🖥️ 📱 시뮬레이터 */}
            <div
                className={`w-full shadow-2xl overflow-y-auto no-scrollbar relative transition-all duration-500 ease-in-out ${viewMode === 'mobile' ? 'max-w-[420px] h-[850px] border-x border-t rounded-t-3xl' : 'max-w-[1024px] min-h-[800px] rounded-2xl border'}`}
                style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.border }}
            >

                {/* 1. 헤더 (GNB Active 테스트) */}
                <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 border-b px-4 md:px-6 py-3 md:py-4 flex items-center justify-between" style={{ borderColor: activeTheme.border }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: activeTheme.primary }}>A</div>
                        <h1 className="text-2xl font-black tracking-tighter" style={{ color: activeTheme.primary }}>APARTY</h1>

                        {/* 🚀 GNB 탭 테스트 (기본 글자 vs Active 글자/밑줄) */}
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
                                            <div className="absolute bottom-[-17px] left-0 w-full h-[3px] rounded-t-md" style={{ backgroundColor: activeTheme.accent }}></div>
                                        )}
                                    </span>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <Search size={24} style={{ color: activeTheme.textSub }} className="cursor-pointer" />
                        <Bell size={24} style={{ color: activeTheme.textSub }} className="cursor-pointer" />
                    </div>
                </header>

                <div className={`p-4 md:p-8 flex flex-col gap-8`}>

                    {/* 2. 상태 뱃지 체계 테스트 */}
                    <section>
                        <h3 className="text-sm font-bold mb-3" style={{ color: activeTheme.textSub }}>상태 뱃지 시스템 (브랜드 중심 + 정보 상태 분리)</h3>
                        <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border" style={{ borderColor: activeTheme.border }}>
                            {Object.values(activeTheme.badges).map((badge, idx) => (
                                <span key={idx} className="px-2.5 py-1 text-[11px] font-bold rounded-md" style={{ backgroundColor: badge.bg, color: badge.text }}>
                                    {badge.label}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* 3. 필터 칩 테스트 */}
                    <section>
                        <h3 className="text-sm font-bold mb-3" style={{ color: activeTheme.textSub }}>필터 칩 상태 (기본 vs 선택)</h3>
                        <div className="flex gap-2">
                            <button className="flex items-center gap-1 px-4 py-2 rounded-full text-[13px] font-bold border transition-colors bg-white shadow-sm" style={{ borderColor: activeTheme.border, color: activeTheme.textSub }}>
                                <Filter size={14} /> 맞춤필터
                            </button>
                            {["아파트", "오피스텔", "무순위/잔여"].map((filter) => {
                                const isSelected = activeFilter === filter;
                                return (
                                    <button
                                        key={filter}
                                        onClick={() => setActiveFilter(filter)}
                                        className="px-4 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm"
                                        style={{
                                            backgroundColor: isSelected ? activeTheme.accentSoft : activeTheme.surface,
                                            color: isSelected ? activeTheme.primary : activeTheme.textSub,
                                            borderColor: isSelected ? (activeTheme.id === 'violet-expert' ? '#CFC7F5' : activeTheme.accent) : activeTheme.border,
                                            borderWidth: '1px'
                                        }}
                                    >
                                        {filter}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 4. 카드 컴포넌트 테스트 (기본 vs 호버 vs 선택) */}
                    <section>
                        <h3 className="text-sm font-bold mb-3" style={{ color: activeTheme.textSub }}>카드 컴포넌트 (기본, 호버, 선택 상태 비교)</h3>
                        <div className={`grid ${viewMode === 'pc' ? 'grid-cols-3' : 'grid-cols-1'} gap-5`}>

                            {[1, 2, 3].map((cardId) => {
                                const isHovered = hoveredCard === cardId;
                                const isSelected = selectedCard === cardId;

                                // 전문가 제안 스타일 동적 적용
                                let cardBg = activeTheme.surface;
                                let cardBorder = activeTheme.border;
                                let cardShadow = "none";

                                if (isSelected) {
                                    cardBg = activeTheme.id === 'violet-expert' ? '#FAF9FF' : activeTheme.accentSoft;
                                    cardBorder = activeTheme.accent;
                                    cardShadow = `0 0 0 3px ${activeTheme.id === 'violet-expert' ? 'rgba(122, 107, 255, 0.08)' : 'rgba(59, 130, 246, 0.1)'}`;
                                } else if (isHovered) {
                                    cardBorder = activeTheme.id === 'violet-expert' ? '#CFC7F5' : activeTheme.accent;
                                    cardShadow = `0 10px 30px ${activeTheme.id === 'violet-expert' ? 'rgba(122, 107, 255, 0.08)' : 'rgba(59, 130, 246, 0.1)'}`;
                                }

                                return (
                                    <div
                                        key={cardId}
                                        onMouseEnter={() => setHoveredCard(cardId)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                        onClick={() => setSelectedCard(cardId)}
                                        className="rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden relative"
                                        style={{ backgroundColor: cardBg, borderColor: cardBorder, boxShadow: cardShadow }}
                                    >
                                        <div className="h-[120px] bg-gray-100 flex justify-center items-center text-sm font-medium" style={{ color: activeTheme.textSub }}>
                                            {isSelected && <CheckCircle2 size={32} style={{ color: activeTheme.accent }} className="absolute inset-0 m-auto z-10 opacity-20" />}
                                            이미지 영역
                                            {cardId === 1 && <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold rounded" style={{ backgroundColor: activeTheme.badges.imminent.bg, color: activeTheme.badges.imminent.text }}>{activeTheme.badges.imminent.label}</span>}
                                            {cardId === 2 && <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold rounded" style={{ backgroundColor: activeTheme.badges.popular.bg, color: activeTheme.badges.popular.text }}>{activeTheme.badges.popular.label}</span>}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-[16px] font-extrabold" style={{ color: activeTheme.textMain }}>
                                                    {cardId === 1 ? '기본 상태 카드' : cardId === 2 ? '클릭된(선택) 카드' : '마우스 호버 카드'}
                                                </h4>
                                            </div>
                                            <p className="text-[13px] mb-4" style={{ color: activeTheme.textSub }}>부산광역시 해운대구 우동</p>

                                            {/* 버튼 테스트: 선택된 카드에는 메인 CTA, 나머지는 서브 버튼 */}
                                            {isSelected ? (
                                                <button
                                                    className="w-full py-2.5 rounded-lg text-[13px] font-bold transition-colors"
                                                    style={{
                                                        backgroundColor: activeTheme.primary,
                                                        color: "#FFFFFF",
                                                        boxShadow: `0 8px 24px ${activeTheme.id === 'violet-expert' ? 'rgba(90, 84, 168, 0.18)' : 'rgba(30, 58, 95, 0.2)'}`
                                                    }}
                                                >
                                                    상담하기
                                                </button>
                                            ) : (
                                                <button
                                                    className="w-full py-2.5 rounded-lg text-[13px] font-bold border transition-colors flex items-center justify-center gap-1.5"
                                                    style={{
                                                        backgroundColor: activeTheme.accentSoft,
                                                        color: activeTheme.primary,
                                                        borderColor: activeTheme.id === 'violet-expert' ? '#DCD7F2' : activeTheme.border
                                                    }}
                                                >
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
            </div>
        </div>
    );
}