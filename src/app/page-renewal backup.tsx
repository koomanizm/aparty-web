"use client";

import { useState, useEffect } from "react";
import ChatBot from "../components/ChatBot";
import WelcomePopup from "../components/WelcomePopup";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import LoginButton from "../components/LoginButton";
import NewsSection from "../components/NewsSection";

// 🚀 분리된 컴포넌트 & 훅 Import
import HomeInsightSection from "../components/home/HomeInsightSection";
import HomeHeroSection from "../components/home/HomeHeroSection";
import PropertyFeedSection from "../components/home/PropertyFeedSection";
import DashboardDetailModal from "../components/home/DashboardDetailModal";
import FloatingProButton from "../components/home/FloatingProButton";
import HomeQuickLinks from "../components/home/HomeQuickLinks";
import VipBanner from "../components/home/VipBanner";
import PointBanner from "../components/home/PointBanner";
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
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden selection:bg-orange-100">
      <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`} onLoad={() => ui.setIsMapReady(true)} />
      <WelcomePopup />
      <FloatingProButton bottomOffset={ui.bottomOffset} />

      <header className="w-full max-w-6xl flex justify-between items-center mt-4 md:mt-6 mb-4 md:mb-6 px-5 md:px-6">
        <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group cursor-pointer">
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300"><Image src="/logo.png" alt="아파티" width={40} height={40} className="object-contain" /></div>
          <div className="flex flex-col items-start justify-center"><h1 className="text-lg md:text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">APARTY</h1><span className="text-[9px] md:text-[10px] font-medium text-gray-400 leading-none">No. 1 부동산 분양 정보 플랫폼</span></div>
        </Link>
        <LoginButton />
      </header>

      <div className="w-full max-w-6xl px-4 md:px-6 text-center mt-2 md:mt-6">
        <HomeHeroSection {...data} tickerIndex={ui.tickerIndex} isTransitioning={ui.isTransitioning} />

        {/* 🚀 상단 인사이트 & 퀵링크 & VIP 배너 순차 배치 */}
        {!isSearchActive && data.activeRegion === "전국" && (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
            <HomeInsightSection {...dashboard} sentimentRegion={sentimentRegion} sentiment={SENTIMENT_DATA[sentimentRegion]} needleRotation={ui.needleRotation} realtimeRankings={data.realtimeRankings} properties={data.properties} setSelectedItem={ui.setSelectedItem} />
            <HomeQuickLinks />
            <VipBanner />
          </div>
        )}

        {/* 🚀 매물 리스트 (가장 핵심적인 중앙 배치) */}
        <section className="w-full max-w-6xl mb-12 md:mb-24 px-4 md:px-6 mt-0 md:mt-2 text-left">
          <PropertyFeedSection {...data} {...ui} />
        </section>

        {/* 🚀 하단 포인트 & 뉴스 배치 */}
        {!isSearchActive && data.activeRegion === "전국" && (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
            <PointBanner />
            <NewsSection />
          </div>
        )}
      </div>

      <DashboardDetailModal {...ui} />
      <ChatBot />
    </main>
  );
}

