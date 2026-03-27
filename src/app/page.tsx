"use client";

import { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import WelcomePopup from "../components/WelcomePopup";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import LoginButton from "../components/LoginButton";

import HomeInsightSection from "../components/home/HomeInsightSection";
import HomeHeroSection from "../components/home/HomeHeroSection";
import PropertyFeedSection from "../components/home/PropertyFeedSection";
import DashboardDetailModal from "../components/home/DashboardDetailModal";
import FloatingProButton from "../components/home/FloatingProButton";
import HomeQuickLinks from "../components/home/HomeQuickLinks";

import TrendingHorizontalScroll from "../components/home/TrendingHorizontalScroll";
import BannerGridSection from "../components/home/BannerGridSection";
import AiConciergeBar from "../components/home/AiConciergeBar";

import TrustRibbonBanner from "../components/home/TrustRibbonBanner";
import ColumnRibbonBanner from "../components/home/ColumnRibbonBanner";

import LeftInsightBoard from "../components/home/LeftInsightBoard";
import CenterRecommend from "../components/home/CenterRecommend";
import RightUtilities from "../components/home/RightUtilities";

import { useDashboardData } from "../hooks/useDashboardData";
import { useHomeData } from "../hooks/useHomeData";
import { useHomeUi } from "../hooks/useHomeUi";

const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl?: string;
}

const SENTIMENT_DATA: any = {
    "전국 평균": { score: 82, status: "회복 조짐", trend: [75, 78, 80, 79, 82], unsoldTrend: [10, 12, 11, 8, 7], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "서울/수도권": { score: 112, status: "매수 우위", trend: [102, 108, 110, 112, 112], unsoldTrend: [3, 2, 2, 3, 2], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "부산/경남": { score: 68, status: "관망세", trend: [70, 68, 67, 66, 68], unsoldTrend: [18, 22, 25, 27, 30], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "대구/경북": { score: 48, status: "매수 적음", trend: [55, 52, 50, 48, 48], unsoldTrend: [45, 47, 50, 52, 55], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "충청/호남": { score: 75, status: "보합 전환", trend: [70, 71, 73, 72, 75], unsoldTrend: [15, 16, 14, 17, 18], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "강원/제주": { score: 71, status: "완만한 회복", trend: [60, 62, 65, 66, 71], unsoldTrend: [10, 11, 13, 12, 14], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
};

const SENTIMENT_REGIONS = Object.keys(SENTIMENT_DATA);

const PAGE_SCALE = 1;

const MAIN_CONTENT_WIDTH = "max-w-[1200px]";
const DESKTOP_OUTER_WIDTH = "max-w-[1600px]";
const CONTENT_INSET_CLASS = "px-3";

export default function Home() {
    const data = useHomeData();
    const ui = useHomeUi(data.notices.length);
    const dashboard = useDashboardData();
    const [sentimentRegion, setSentimentRegion] = useState("전국 평균");
    const [tickerNews, setTickerNews] = useState<NewsItem[]>([]);
    const [isExploreMode, setIsExploreMode] = useState(false);

    const searchPlaceholders = [
        "지금 가장 핫한 선착순 분양단지는?",
        "소액으로 가능한 부산 갭투자 현장은?",
        "청약 통장 필요 없는 프리미엄 줍줍은?",
        "실거주하기 좋은 역세권 신축 아파트는?"
    ];
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    useEffect(() => {
        async function fetchTickerNews() {
            try {
                const res = await fetch(`/api/news?q=부동산+이슈`);
                const newsData = await res.json();
                if (newsData && newsData.length > 0) setTickerNews(newsData.slice(0, 4));
            } catch (err) { console.error("Failed to fetch ticker news:", err); }
        }
        fetchTickerNews();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setSentimentRegion((prev) => SENTIMENT_REGIONS[(SENTIMENT_REGIONS.indexOf(prev) + 1) % SENTIMENT_REGIONS.length]);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const placeholderTimer = setInterval(() => {
            if (!isSearchFocused && !data.searchQuery) {
                setPlaceholderIdx((prev) => (prev + 1) % searchPlaceholders.length);
            }
        }, 3000);
        return () => clearInterval(placeholderTimer);
    }, [isSearchFocused, data.searchQuery]);

    useEffect(() => {
        const score = SENTIMENT_DATA[sentimentRegion]?.score || 0;
        ui.setNeedleRotation((score / 150) * 180 - 90);
    }, [sentimentRegion, ui]);

    const isSearchActive = data.searchQuery || (data.isFilterApplied && data.activeFilter !== "전체") || isExploreMode;

    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        data.setSearchQuery("");
        data.setActiveFilter("전체");
        data.setActiveRegion("전국");
        data.setIsFilterApplied(false);
        data.setCurrentPage(1);
        ui.setViewMode("gallery");
        ui.setIsFullScreen(false);
        setIsExploreMode(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const scrollToFeed = (mode: "gallery" | "map") => {
        ui.setViewMode(mode);
        setIsExploreMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleQuickSearch = (query: string) => {
        data.setSearchQuery(query);
        setIsSearchFocused(false);
        const feed = document.getElementById("property-feed");
        if (feed) window.scrollTo({ top: feed.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
    };

    return (
        <main
            /* 🚀 기존 bg-bg-base (푸른빛 회색) 삭제하고, 완벽한 화이트(bg-white)로 교체! */
            className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden selection:bg-accent-action/20"
            style={{ zoom: PAGE_SCALE } as any}
        >
            <Script
                strategy="afterInteractive"
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`}
                onLoad={() => ui.setIsMapReady(true)}
            />
            <WelcomePopup />
            <FloatingProButton bottomOffset={ui.bottomOffset} />

            <header className="w-full bg-surface flex flex-col items-center z-50 sticky top-0 shadow-sm border-b border-border-light">
                {!isSearchActive && data.activeRegion === "전국" && (
                    <TrustRibbonBanner />
                )}

                <div className={`w-full ${MAIN_CONTENT_WIDTH} flex justify-between items-center py-3 px-5 md:px-6 gap-4 md:gap-8`}>
                    <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group cursor-pointer shrink-0">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="아파티" width={40} height={40} className="object-contain" />
                        </div>
                        <div className="hidden md:flex flex-col items-start justify-center">
                            <h1 className="text-xl font-extrabold text-primary tracking-tighter leading-none mb-0.5">APARTY</h1>
                            <span className="text-[10px] font-medium text-text-sub leading-none">No.1 분양 플랫폼</span>
                        </div>
                    </Link>

                    <div className="flex-1 max-w-xl relative group z-[60]">
                        <input
                            type="text"
                            placeholder={searchPlaceholders[placeholderIdx]}
                            className="w-full h-[44px] md:h-[48px] pl-5 pr-12 rounded-full border border-border-light bg-gray-50 focus:bg-surface focus:border-accent-action focus:ring-2 focus:ring-accent-action/20 text-[14px] md:text-[15px] font-bold outline-none transition-all placeholder:text-gray-400 placeholder:font-medium transition-placeholder duration-500"
                            value={data.searchQuery}
                            onChange={(e) => data.setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        />
                        {data.searchQuery ? (
                            <button onClick={() => data.setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full"><X size={16} /></button>
                        ) : (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-accent-action pointer-events-none"><Search size={18} strokeWidth={2.5} /></div>
                        )}

                        {isSearchFocused && !data.searchQuery && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-surface rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-border-light p-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[11px] font-bold text-gray-400 mb-2.5 px-1">어떤 분양을 찾으시나요?</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: '🏠 실거주 내집마련', q: '실거주' },
                                        { label: '💰 소액 갭투자', q: '소액' },
                                        { label: '🌊 오션뷰 로열층', q: '오션뷰' },
                                        { label: '🚨 마감임박 줍줍', q: '마감임박' }
                                    ].map((tag, idx) => (
                                        <div key={idx}>
                                            <button
                                                onMouseDown={(e) => { e.preventDefault(); handleQuickSearch(tag.q); }}
                                                className="px-3 py-1.5 bg-gray-50 border border-border-light rounded-[10px] text-[12px] font-bold text-text-main hover:bg-[#EEF2FF] hover:border-accent-action/30 hover:text-accent-action transition-colors"
                                            >
                                                {tag.label}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <LoginButton />
                        <button className="md:hidden p-1.5 text-text-main hover:text-accent-action transition-colors focus:outline-none">
                            <Menu size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="w-full border-t border-border-light bg-surface flex justify-center">
                    <div className={`w-full ${MAIN_CONTENT_WIDTH} flex items-center justify-between h-[48px] md:h-[52px] px-5 md:px-6`}>
                        <div className="flex items-center justify-start h-full overflow-x-auto no-scrollbar gap-5 md:gap-7 whitespace-nowrap">

                            <Link href="/" onClick={handleHomeClick} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${!isSearchActive ? 'font-black text-accent-action' : 'font-bold text-text-sub hover:text-accent-action'}`}>
                                홈
                                {!isSearchActive && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-accent-action rounded-t-md"></span>}
                            </Link>

                            <button onClick={() => scrollToFeed("gallery")} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${isSearchActive && ui.viewMode === 'gallery' ? 'font-black text-accent-action' : 'font-bold text-text-sub hover:text-accent-action'}`}>
                                단지로보기
                                {isSearchActive && ui.viewMode === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-accent-action rounded-t-md"></span>}
                            </button>

                            <button onClick={() => scrollToFeed("map")} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${isSearchActive && ui.viewMode === 'map' ? 'font-black text-accent-action' : 'font-bold text-text-sub hover:text-accent-action'}`}>
                                지도로보기
                                {isSearchActive && ui.viewMode === 'map' && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-accent-action rounded-t-md"></span>}
                            </button>

                            <Link href="/subscription" className="relative text-[14px] md:text-[15px] font-bold text-text-sub hover:text-accent-action transition-colors h-full flex items-center">
                                청약정보
                                <span className="absolute top-[12px] -right-3.5 bg-accent-action text-white text-[8px] font-black px-1 py-0.5 rounded-[4px] leading-none">N</span>
                            </Link>
                            <Link href="/price" className="text-[14px] md:text-[15px] font-bold text-text-sub hover:text-accent-action transition-colors h-full flex items-center">실거래가</Link>

                            <div className="w-px h-3.5 bg-border-light mx-1 hidden md:block"></div>

                            <Link href="/notice" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-accent-action transition-colors h-full flex items-center hidden lg:flex">공지사항</Link>
                            <Link href="/lounge" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-accent-action transition-colors h-full flex items-center hidden lg:flex">라운지</Link>
                            <Link href="/column" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-accent-action transition-colors h-full flex items-center hidden lg:flex">칼럼</Link>
                        </div>

                        <div className="hidden md:flex shrink-0 w-[300px] lg:w-[400px] ml-4 h-full items-center justify-end opacity-90 hover:opacity-100 transition-opacity">
                            <HomeHeroSection tickerNews={tickerNews} />
                        </div>
                    </div>
                </div>
            </header>

            <div className="md:hidden w-full max-w-6xl px-4 text-center pb-8 mt-4">
                <HomeHeroSection tickerNews={tickerNews} />

                {!isSearchActive && data.activeRegion === "전국" && (
                    <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-4 mt-2">
                        <HomeInsightSection
                            {...dashboard}
                            sentimentRegion={sentimentRegion}
                            sentiment={SENTIMENT_DATA[sentimentRegion]}
                            needleRotation={ui.needleRotation}
                            realtimeRankings={data.realtimeRankings}
                            properties={data.properties}
                            setSelectedItem={ui.setSelectedItem}
                        />
                        <HomeQuickLinks />

                        <div className="w-full mt-4">
                            <ColumnRibbonBanner />
                        </div>

                        <div className="w-full mt-2 mb-2">
                            <TrendingHorizontalScroll properties={data.properties} />
                        </div>
                    </div>
                )}

                <section id="property-feed" className="w-full mb-8 text-left mt-2">
                    <PropertyFeedSection {...data} {...ui} isSearchActive={isSearchActive} />
                </section>

                {!isSearchActive && data.activeRegion === "전국" && (
                    <div className="w-full pt-2 pb-10 flex flex-col gap-6">
                        <BannerGridSection />
                        <AiConciergeBar />
                    </div>
                )}
            </div>

            <div className="hidden md:block w-full pb-24 mt-6 md:mt-8">
                <div className={`w-full ${DESKTOP_OUTER_WIDTH} mx-auto px-6 flex items-start gap-6 2xl:gap-8`}>
                    <div className={`flex-1 min-w-0 ${MAIN_CONTENT_WIDTH} mx-auto`}>

                        {!isSearchActive && data.activeRegion === "전국" ? (
                            <>
                                <div className="w-full py-0">
                                    <div className="w-full animate-in fade-in duration-500 pt-0 flex justify-center">
                                        <div
                                            className="grid gap-3 xl:gap-4 items-start text-left w-full max-w-[1200px] pt-0 mt-0"
                                            style={{ gridTemplateColumns: "minmax(260px, 250px) minmax(480px, 1fr) minmax(220px, 280px)" }}
                                        >
                                            <LeftInsightBoard
                                                dashboard={dashboard}
                                                ui={ui}
                                                sentimentRegion={sentimentRegion}
                                                SENTIMENT_DATA={SENTIMENT_DATA}
                                            />
                                            <CenterRecommend properties={data.properties} />
                                            <RightUtilities
                                                realtimeRankings={data.realtimeRankings}
                                                properties={data.properties}
                                                setSearchQuery={data.setSearchQuery}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full pt-10 pb-2">
                                    <div className={CONTENT_INSET_CLASS}>
                                        <ColumnRibbonBanner />
                                    </div>
                                </div>

                                <div className="w-full pt-4 pb-2">
                                    <div className={CONTENT_INSET_CLASS}>
                                        <TrendingHorizontalScroll properties={data.properties} />
                                    </div>
                                </div>

                                <div className="w-full pt-4">
                                    <div id="property-feed" className="w-full text-left">
                                        <div className={CONTENT_INSET_CLASS}>
                                            <PropertyFeedSection {...data} {...ui} isSearchActive={isSearchActive} />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full pb-12 pt-8">
                                    <div className="w-full animate-in fade-in duration-500">
                                        <div className={CONTENT_INSET_CLASS}>
                                            <BannerGridSection />
                                            <div className="mt-8">
                                                <AiConciergeBar />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div id="property-feed" className="w-full text-left mb-24">
                                <div className={CONTENT_INSET_CLASS}>
                                    <PropertyFeedSection {...data} {...ui} isSearchActive={isSearchActive} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DashboardDetailModal {...ui} />
            <ChatBot />
        </main>
    );
}