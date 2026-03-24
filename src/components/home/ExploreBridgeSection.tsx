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

// 🚀 탐색 브리지 섹션 삭제 완료, 배너 그리드만 남김
import BannerGridSection from "../components/home/BannerGridSection";

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

const PAGE_SCALE = 0.95;
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

    return (
        <main
            className="min-h-screen bg-[#FDFDFD] flex flex-col items-center relative overflow-x-hidden selection:bg-orange-100"
            style={{ zoom: PAGE_SCALE } as any}
        >
            <Script
                strategy="afterInteractive"
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`}
                onLoad={() => ui.setIsMapReady(true)}
            />
            <WelcomePopup />
            <FloatingProButton bottomOffset={ui.bottomOffset} />

            <header className="w-full bg-white flex flex-col items-center z-50 sticky top-0 shadow-sm border-b border-gray-100">
                <div className={`w-full ${MAIN_CONTENT_WIDTH} flex justify-between items-center py-3 px-5 md:px-6 gap-4 md:gap-8`}>
                    <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group cursor-pointer shrink-0">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="아파티" width={40} height={40} className="object-contain" />
                        </div>
                        <div className="hidden md:flex flex-col items-start justify-center">
                            <h1 className="text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">APARTY</h1>
                            <span className="text-[10px] font-medium text-gray-400 leading-none">No.1 분양 플랫폼</span>
                        </div>
                    </Link>

                    <div className="flex-1 max-w-xl relative group">
                        <input
                            type="text"
                            placeholder="지금 가장 핫한 선착순 분양단지는?"
                            className="w-full h-[44px] md:h-[48px] pl-5 pr-12 rounded-full border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-[14px] md:text-[15px] font-bold outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                            value={data.searchQuery}
                            onChange={(e) => data.setSearchQuery(e.target.value)}
                        />
                        {data.searchQuery ? (
                            <button onClick={() => data.setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-full"><X size={16} /></button>
                        ) : (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 pointer-events-none"><Search size={18} strokeWidth={2.5} /></div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <LoginButton />
                        <button className="md:hidden p-1.5 text-[#2E2925] hover:text-[#FF7A2F] transition-colors focus:outline-none">
                            <Menu size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                <div className="w-full border-t border-gray-100 bg-white flex justify-center">
                    <div className={`w-full ${MAIN_CONTENT_WIDTH} flex items-center justify-between h-[48px] md:h-[52px] px-5 md:px-6`}>
                        <div className="flex items-center justify-start h-full overflow-x-auto no-scrollbar gap-5 md:gap-7 whitespace-nowrap">
                            <Link href="/" onClick={handleHomeClick} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${!isSearchActive ? 'font-black text-[#FF7A2F]' : 'font-bold text-gray-500 hover:text-gray-900'}`}>
                                홈
                                {!isSearchActive && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#FF7A2F] rounded-t-md"></span>}
                            </Link>

                            <button onClick={() => scrollToFeed("gallery")} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${isSearchActive && ui.viewMode === 'gallery' ? 'font-black text-[#FF7A2F]' : 'font-bold text-gray-500 hover:text-gray-900'}`}>
                                단지로보기
                                {isSearchActive && ui.viewMode === 'gallery' && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#FF7A2F] rounded-t-md"></span>}
                            </button>

                            <button onClick={() => scrollToFeed("map")} className={`text-[14px] md:text-[16px] relative h-full flex items-center tracking-tight transition-colors ${isSearchActive && ui.viewMode === 'map' ? 'font-black text-[#FF7A2F]' : 'font-bold text-gray-500 hover:text-gray-900'}`}>
                                지도로보기
                                {isSearchActive && ui.viewMode === 'map' && <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#FF7A2F] rounded-t-md"></span>}
                            </button>

                            <Link href="/subscription" className="relative text-[14px] md:text-[15px] font-bold text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center">
                                청약정보
                                <span className="absolute top-[12px] -right-3.5 bg-orange-500 text-white text-[8px] font-black px-1 py-0.5 rounded-[4px] leading-none">N</span>
                            </Link>
                            <Link href="/price" className="text-[14px] md:text-[15px] font-bold text-gray-500 hover:text-gray-900 transition-colors h-full flex items-center">실거래가</Link>

                            <div className="w-px h-3.5 bg-gray-200 mx-1 hidden md:block"></div>

                            <Link href="/notice" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-gray-700 transition-colors h-full flex items-center hidden lg:flex">공지사항</Link>
                            <Link href="/lounge" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-gray-700 transition-colors h-full flex items-center hidden lg:flex">라운지</Link>
                            <Link href="/column" className="text-[13px] md:text-[14px] font-semibold text-gray-400 hover:text-gray-700 transition-colors h-full flex items-center hidden lg:flex">칼럼</Link>
                        </div>

                        <div className="hidden md:flex shrink-0 w-[300px] lg:w-[400px] ml-4 h-full items-center justify-end opacity-90 hover:opacity-100 transition-opacity">
                            <HomeHeroSection tickerNews={tickerNews} />
                        </div>
                    </div>
                </div>
            </header>

            {/* 📱 모바일 본문 */}
            <div className="md:hidden w-full max-w-6xl px-4 text-center pb-8 mt-6">
                <HomeHeroSection tickerNews={tickerNews} />

                {!isSearchActive && data.activeRegion === "전국" && (
                    <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-6 mt-4">
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

                        {/* 🚀 모바일 4구 배너 그리드 */}
                        <div className="w-full mt-2">
                            <BannerGridSection />
                        </div>
                    </div>
                )}

                <section id="property-feed" className="w-full mb-12 mt-4 text-left">
                    <PropertyFeedSection {...data} {...ui} isSearchActive={isSearchActive} />
                </section>
            </div>

            {/* 💻 데스크톱 본문 */}
            <div className="hidden md:block w-full pb-24 relative z-0 mt-8 md:mt-10">
                <div className={`w-full ${DESKTOP_OUTER_WIDTH} mx-auto px-6 flex items-start gap-6 2xl:gap-8`}>
                    <div className={`flex-1 min-w-0 ${MAIN_CONTENT_WIDTH} mx-auto`}>

                        {!isSearchActive && data.activeRegion === "전국" ? (
                            <>
                                <div className="w-full py-0 relative z-10">
                                    <div className="w-full animate-in fade-in duration-500 relative pt-2">
                                        <div
                                            className="grid gap-5 xl:gap-6 items-start text-left w-full relative pt-0 mt-0"
                                            style={{ gridTemplateColumns: "minmax(220px, 2.35fr) minmax(520px, 7.3fr) minmax(220px, 2.35fr)" }}
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

                                <div className="w-full pb-2 pt-10 relative z-10">
                                    <div className="w-full animate-in fade-in duration-500">
                                        <div className={CONTENT_INSET_CLASS}>
                                            {/* 🚀 데스크톱 4구 배너 그리드 */}
                                            <BannerGridSection />
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full pt-4 relative z-10">
                                    <div id="property-feed" className="w-full text-left mb-24">
                                        <div className={CONTENT_INSET_CLASS}>
                                            <PropertyFeedSection {...data} {...ui} isSearchActive={isSearchActive} />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div id="property-feed" className="w-full text-left mb-24 relative z-10">
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