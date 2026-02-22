"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, getTickerMessages, Property, TickerMessage } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import { Search, Sparkles, Flame, TrendingUp, ChevronRight, Calculator, Landmark, BarChart3 } from "lucide-react";
import NewsSection from "../components/NewsSection";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tickers, setTickers] = useState<TickerMessage[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  useEffect(() => {
    async function loadData() {
      try {
        const [propData, tickerData] = await Promise.all([
          getPropertiesFromSheet(),
          getTickerMessages()
        ]);
        setProperties(propData);
        setTickers(tickerData);
        setFilteredProperties(propData);
      } catch (err) {
        console.error("데이터 로드 실패", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    let result = properties;
    if (activeFilter !== "전체") {
      result = result.filter(p => p.status.includes(activeFilter));
    }
    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProperties(result);
  }, [searchQuery, activeFilter, properties]);

  const rankingList = properties.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden">

      {/* 실시간 티커 */}
      <div className="w-full bg-[#4A403A] text-white py-2.5 overflow-hidden whitespace-nowrap relative z-30 shadow-md">
        <div className="flex animate-marquee items-center gap-24 text-[13px] font-medium">
          {tickers.length > 0 ? (
            <>
              {tickers.concat(tickers).map((t, i) => (
                <span key={`${t.id}-${i}`} className="flex items-center gap-3">
                  <span className="text-[#FF8C42] font-black px-1.5 py-0.5 bg-white/10 rounded text-[11px]">{t.type}</span>
                  {t.text}
                </span>
              ))}
            </>
          ) : (
            <span className="flex items-center gap-2 italic opacity-60 px-4">최신 분양 소식을 동기화하고 있습니다...</span>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 50s linear infinite;
        }
      `}</style>

      {/* 헤더 */}
      <header className="w-full max-w-6xl flex justify-between items-center mt-8 mb-10 px-6">
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm">
            <Image src="/logo.png" alt="아파티로고" fill className="object-contain group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl font-black text-[#4a403a] tracking-tighter">APARTY</h1>
        </a>
        <Link
          href="https://pro.aparty.co.kr"
          target="_blank"
          className="bg-[#ff6f42] hover:bg-[#ff5a28] text-white px-5 py-2.5 rounded-2xl shadow-lg transition-all text-sm font-black"
        >
          상담사 전용
        </Link>
      </header>

      {/* 환영 섹션 */}
      <div className="w-full max-w-5xl px-6 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#4a403a] leading-tight mb-4">
          지금 가장 핫한 <br className="md:hidden" />
          <span className="text-orange-500">선착순 분양단지</span>는?
        </h1>

        {/* 검색창 */}
        <div className="relative w-full max-w-xl mx-auto mb-12 group mt-8">
          <input
            type="text"
            placeholder="어떤 지역, 어떤 아파트를 찾으세요?"
            className="w-full px-4 py-3.5 md:px-6 md:py-4 pr-14 md:pr-16 rounded-[20px] md:rounded-[24px] border-none shadow-[0_15px_50px_-15px_rgba(0,0,0,0.12)] focus:ring-4 focus:ring-orange-100 text-[13px] md:text-base font-bold outline-none bg-white transition-all placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-2 top-2 bottom-2 md:right-3 md:top-3 md:bottom-3 w-10 md:w-12 bg-[#4A403A] text-white rounded-[14px] md:rounded-2xl flex items-center justify-center shadow-md hover:bg-black transition-colors">
            <Search strokeWidth={3} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
          </button>
        </div>

        {/* 인기 랭킹(좌) + 자금 도우미(우) */}
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-6 mb-8 text-left">

          {/* 좌측: 인기 단지 랭킹 */}
          <div className="flex-1 bg-white rounded-[24px] md:rounded-[32px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-gray-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-gray-50 pb-4 md:pb-5">
              <div className="bg-orange-50 p-2 rounded-lg">
                <TrendingUp size={20} className="text-[#FF8C42]" strokeWidth={3} />
              </div>
              <h3 className="text-[14px] md:text-[15px] font-black text-[#4A403A]">실시간 인기 단지 랭킹</h3>
              <span className="text-[10px] text-gray-300 font-medium ml-auto hidden sm:block">02.22 12:30 기준</span>
            </div>

            {!isLoading && rankingList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 md:gap-y-4">
                {rankingList.map((prop, idx) => (
                  <Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-3 py-1 group/item">
                    <span className={`text-[15px] md:text-[16px] font-black w-5 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span>
                    <span className="text-[13px] md:text-[14px] font-bold text-[#4A403A] truncate group-hover/item:text-[#FF8C42] transition-colors">{prop.title}</span>
                    <ChevronRight size={14} className="text-gray-200 ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-sm font-bold text-gray-400">랭킹 데이터를 불러오는 중입니다...</div>
            )}
          </div>

          {/* 🚀 우측(PC) / 하단(모바일): 자금 계획 도우미 (가운데 정렬 완벽 적용) */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3 md:gap-4 w-full md:w-[240px] shrink-0">
            <Link href="/tools/tax" className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 p-4 md:p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:border-orange-200 hover:shadow-md transition-all group h-full">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Calculator size={20} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <span className="text-[12px] md:text-[14px] font-black text-[#4A403A] text-center leading-tight">취득세<br className="block md:hidden" /> 계산</span>
            </Link>
            <Link href="/tools/loan" className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 p-4 md:p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:border-orange-200 hover:shadow-md transition-all group h-full">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-50 text-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Landmark size={20} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <span className="text-[12px] md:text-[14px] font-black text-[#4A403A] text-center leading-tight">대출<br className="block md:hidden" /> 비교</span>
            </Link>
            <Link href="/tools/yield" className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 p-4 md:p-5 bg-white border border-gray-100 rounded-[24px] shadow-sm hover:border-orange-200 hover:shadow-md transition-all group h-full">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 text-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <BarChart3 size={20} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px]" />
              </div>
              <span className="text-[12px] md:text-[14px] font-black text-[#4A403A] text-center leading-tight">수익률<br className="block md:hidden" /> 계산</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 리스트 섹션 */}
      <section className="w-full max-w-6xl mb-24 px-6">

        {/* 해시태그 필터 */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-10">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2.5 rounded-full font-bold text-[13px] transition-all ${activeFilter === filter
                ? "bg-[#4a403a] text-white shadow-xl"
                : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                }`}
            >
              {filter === "전체" ? "전체보기" : `#${filter}`}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-black text-[#4a403a] flex items-center gap-2">
            <Sparkles className="text-orange-500" size={24} /> {activeFilter === "전체" ? "아파티 큐레이션" : `${activeFilter} 추천 단지`}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </section>

      {/* 배너 섹션 */}
      <div className="w-full max-w-5xl mb-24 px-6">
        <div className="relative w-full rounded-[32px] md:rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-8 md:p-14 gap-6 md:gap-0 group">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0" src="/vip-bg.mp4" />
          <div className="absolute inset-0 bg-black/40 z-0"></div>

          <div className="relative z-10 text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-black text-white mb-2 md:mb-3">
              누구보다 빠른 <br className="md:hidden" /><span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔
            </h3>
            <p className="text-sm md:text-lg text-white/80">
              로얄동·로얄층 마감 전, 부산 정보를 가장 먼저 알려드립니다!
            </p>
          </div>

          <Link
            href="http://pf.kakao.com/_EbnAX"
            target="_blank"
            className="relative z-10 w-full md:w-auto text-center justify-center bg-[#FF8C42] text-white font-black px-6 py-3.5 md:px-10 md:py-5 rounded-[16px] md:rounded-[20px] shadow-2xl hover:scale-105 transition-all flex items-center gap-2 md:gap-3"
          >
            <svg className="w-[18px] h-[18px] md:w-[24px] md:h-[24px]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3C6.47715 3 2 6.35786 2 10.5C2 13.2664 3.76357 15.7143 6.46429 17.0714L5.35714 21L9.64286 18.1429C10.4046 18.3025 11.1917 18.3857 12 18.3857C17.5228 18.3857 22 15.0279 22 10.8857C22 6.74357 17.5228 3.38571 12 3V3Z" fill="white" />
            </svg>
            <span className="text-base md:text-lg">아파티 채널추가 하기</span>
          </Link>
        </div>
      </div>

      <NewsSection />
      <ChatBot />
    </main>
  );
}