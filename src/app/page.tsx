// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import WelcomePopup from "../components/WelcomePopup";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import LoginButton from "../components/LoginButton";
import NewsSection from "../components/NewsSection";

// 분리된 컴포넌트 & 훅 Import
import HomeInsightSection from "../components/home/HomeInsightSection";
import HomeHeroSection from "../components/home/HomeHeroSection";
import PropertyFeedSection from "../components/home/PropertyFeedSection";
import DashboardDetailModal from "../components/home/DashboardDetailModal";
import FloatingProButton from "../components/home/FloatingProButton";
import HomeQuickLinks from "../components/home/HomeQuickLinks";
import VipBanner from "../components/home/VipBanner";
import PointBanner from "../components/home/PointBanner";

import LeftInsightBoard from "../components/home/LeftInsightBoard";
import CenterRecommend from "../components/home/CenterRecommend";
import RightUtilities from "../components/home/RightUtilities";

import { useDashboardData } from "../hooks/useDashboardData";
import { useHomeData } from "../hooks/useHomeData";
import { useHomeUi } from "../hooks/useHomeUi";

const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

const SENTIMENT_DATA: any = {
    "전국 평균": { score: 82, status: "회복 조짐", trend: [75, 78, 80, 79, 82], unsoldTrend: [10, 12, 11, 8, 7], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "서울/수도권": { score: 112, status: "매수 우위", trend: [102, 108, 110, 112, 112], unsoldTrend: [3, 2, 2, 3, 2], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "부산/경남": { score: 68, status: "관망세", trend: [70, 68, 67, 66, 68], unsoldTrend: [18, 22, 25, 27, 30], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "대구/경북": { score: 48, status: "매수 적음", trend: [55, 52, 50, 48, 48], unsoldTrend: [45, 47, 50, 52, 55], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "충청/호남": { score: 75, status: "보합 전환", trend: [70, 71, 73, 72, 75], unsoldTrend: [15, 16, 14, 17, 18], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
    "강원/제주": { score: 71, status: "완만한 회복", trend: [60, 62, 65, 66, 71], unsoldTrend: [10, 11, 13, 12, 14], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] }
};
const SENTIMENT_REGIONS = Object.keys(SENTIMENT_DATA);

export default function Home() {
    const data = useHomeData();
    const ui = useHomeUi(data.notices.length);
    const dashboard = useDashboardData();
    const [sentimentRegion, setSentimentRegion] = useState("전국 평균");

    useEffect(() => {
        const interval = setInterval(() => {
            setSentimentRegion(prev => SENTIMENT_REGIONS[(SENTIMENT_REGIONS.indexOf(prev) + 1) % SENTIMENT_REGIONS.length]);
        }, 4500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const score = SENTIMENT_DATA[sentimentRegion]?.score || 0;
        ui.setNeedleRotation((score / 150) * 180 - 90);
    }, [sentimentRegion, ui]);

    const isSearchActive = data.searchQuery || (data.isFilterApplied && data.activeFilter !== "전체");

    const handleHomeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        data.setSearchQuery("");
        data.setActiveFilter("전체");
        data.setActiveRegion("전국");
        data.setIsFilterApplied(false);
        data.setCurrentPage(1);
        ui.setViewMode('gallery');
        ui.setIsFullScreen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-white flex flex-col items-center relative overflow-x-hidden selection:bg-orange-100">
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`} onLoad={() => ui.setIsMapReady(true)} />
            <WelcomePopup />
            <FloatingProButton bottomOffset={ui.bottomOffset} />

            <header className="w-full bg-white flex justify-center z-10 pt-2 pb-1 relative shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                <div className="w-full max-w-[1200px] flex justify-between items-center py-3 px-5 md:px-6">
                    <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group cursor-pointer">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="아파티" width={40} height={40} className="object-contain" />
                        </div>
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="text-lg md:text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">APARTY</h1>
                            <span className="text-[9px] md:text-[10px] font-medium text-gray-400 leading-none">No. 1 부동산 분양 정보 플랫폼</span>
                        </div>
                    </Link>
                    <LoginButton />
                </div>
            </header>

            {/* 📱 모바일 화면 (md:hidden) */}
            <div className="md:hidden w-full max-w-6xl px-4 text-center mt-2 pb-8">
                <HomeHeroSection {...data} tickerIndex={ui.tickerIndex} isTransitioning={ui.isTransitioning} realtimeRankings={data.realtimeRankings} />
                {!isSearchActive && data.activeRegion === "전국" && (
                    <div className="animate-in fade-in duration-500 w-full flex flex-col items-center gap-6 mt-6">
                        <HomeInsightSection {...dashboard} sentimentRegion={sentimentRegion} sentiment={SENTIMENT_DATA[sentimentRegion]} needleRotation={ui.needleRotation} realtimeRankings={data.realtimeRankings} properties={data.properties} setSelectedItem={ui.setSelectedItem} />
                        <HomeQuickLinks />
                        <VipBanner />
                    </div>
                )}
                <section className="w-full mb-12 mt-6 text-left">
                    <PropertyFeedSection {...data} {...ui} />
                </section>
            </div>

            {/* 💻 PC 화면 (hidden md:block) */}
            <div className="hidden md:block w-full text-center pb-24 relative z-0">

                <div className="w-full bg-white flex justify-center pt-2 pb-0 z-50 relative">
                    <div className="w-full max-w-[1200px] px-6">
                        <HomeHeroSection {...data} tickerIndex={ui.tickerIndex} isTransitioning={ui.isTransitioning} realtimeRankings={data.realtimeRankings} />
                    </div>
                </div>

                {!isSearchActive && data.activeRegion === "전국" ? (
                    <>
                        <div className="w-full bg-white py-0 relative z-10">
                            <div className="w-full max-w-[1200px] mx-auto px-6 animate-in fade-in duration-500 relative pt-2">
                                <div className="grid gap-6 items-start text-left w-full relative pt-0 mt-0" style={{ gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 7.1fr) minmax(0, 2.4fr)' }}>
                                    <LeftInsightBoard dashboard={dashboard} ui={ui} sentimentRegion={sentimentRegion} SENTIMENT_DATA={SENTIMENT_DATA} />

                                    <CenterRecommend properties={data.properties} />

                                    <RightUtilities />
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-white pb-10 pt-12 relative z-10">
                            <div className="w-full max-w-[1200px] mx-auto px-6 animate-in fade-in duration-500">
                                <VipBanner />
                            </div>
                        </div>

                        <div className="w-full bg-white rounded-t-[40px] pt-12 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            <div className="w-full max-w-[1200px] mx-auto px-6 text-left mb-24">
                                {/* 🚀 FIX: 불필요한 "전체 분양 현장 탐색" <h2> 태그 삭제 완료! */}
                                <PropertyFeedSection {...data} {...ui} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full max-w-[1200px] mx-auto mt-8 text-left mb-24 px-6 bg-white relative z-10">
                        <PropertyFeedSection {...data} {...ui} />
                    </div>
                )}
            </div>

            {/* 하단 포인트 & 뉴스 배치 */}
            {!isSearchActive && data.activeRegion === "전국" && (
                <div className="animate-in fade-in duration-500 w-full flex flex-col items-center mb-24 px-4 md:px-6 max-w-[1200px] bg-white">
                    <PointBanner />
                    <NewsSection />
                </div>
            )}

            <DashboardDetailModal {...ui} />
            <ChatBot />
        </main>
    );
}