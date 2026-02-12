"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, Property } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPropertiesFromSheet();
        setProperties(data);
        setFilteredProperties(data);
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

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center py-6 px-6 relative">

      {/* ✅ [수정] 우측 상단 분양상담사 코너 버튼 (화사한 코랄 오렌지: #ff6f42) */}
      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
        <Link
          href="https://pro.aparty.co.kr"
          target="_blank"
          className="flex items-center gap-2 bg-[#ff6f42] hover:bg-[#ff5a28] text-white px-4 py-2.5 md:px-5 md:py-3 rounded-2xl shadow-[0_4px_14px_0_rgba(255,111,66,0.39)] transition-all hover:scale-105 active:scale-95 group"
        >
          {/* 아이콘 이미지 */}
          <div className="w-5 h-5 md:w-6 md:h-6 overflow-hidden">
            <img
              src="/agent-icon.png"
              alt="상담사아이콘"
              className="w-full h-full object-contain group-hover:scale-100 transition-transform"
            />
          </div>
          <span className="text-xs md:text-sm font-black tracking-tight">
            분양상담사 코너
          </span>
          {/* 화사함을 더해줄 작은 화살표 */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-1 group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6" /></svg>
        </Link>
      </div>

      {/* 헤더 영역 (기존 디자인 유지) */}
      <header className="w-full max-w-6xl flex justify-start items-center mb-10 pl-2">
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg">
            <Image
              src="/logo.png"
              alt="아파티로고"
              fill
              className="object-contain group-hover:rotate-12 transition-transform duration-300"
            />
          </div>
          <h1 className="text-2xl font-black text-[#4a403a] tracking-tighter group-hover:text-orange-500 transition-colors">
            APARTY
          </h1>
        </a>
      </header>

      {/* 1. 상단 환영 섹션 */}
      <div className="w-full max-w-4xl mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-[#4a403a] leading-tight mb-3">
          안녕? 난 <span className="text-orange-500">아파티</span>야. <br />
          너에게 딱 맞는 집을 찾아줄게!
        </h1>

        <p className="text-xs md:text-sm text-gray-400 font-medium leading-relaxed mb-10">
          대한민국 모든 프리미엄 아파트,<br className="md:hidden" />
          복잡한 부동산 정보, <br className="hidden md:inline" />
          아파티가 쉽고 정확하게 알려드릴게요.
        </p>

        {/* 검색창 */}
        <div className="relative w-full max-w-lg mx-auto mb-12 group">
          <input
            type="text"
            placeholder="어떤 지역, 어떤 아파트를 찾으세요?"
            className="w-full px-5 py-3.5 pr-14 rounded-2xl border-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] focus:ring-4 focus:ring-orange-100 text-base outline-none placeholder-gray-300 bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-2 top-2 bottom-2 w-10 bg-orange-400 hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95">
            <Search size={20} strokeWidth={3} />
          </button>
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-16">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all ${activeFilter === filter
                ? "bg-[#4a403a] text-white shadow-md transform scale-105"
                : "bg-white text-gray-400 border border-gray-100 hover:border-orange-200 hover:text-orange-500"
                }`}
            >
              {filter === "전체" ? "전체보기" : `#${filter}`}
            </button>
          ))}
        </div>
      </div>

      {/* 리스트 섹션 */}
      <section className="w-full max-w-6xl mb-20">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xl font-bold text-[#4a403a]">
            {activeFilter === "전체" ? "👀 아파티가 찍은 호재 뉴스" : `🔥 ${activeFilter} 단지`}
          </h2>
          <span className="text-sm text-gray-400 font-medium">총 {filteredProperties.length}곳</span>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-300 animate-pulse">데이터 로딩 중...</div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <PropertyCard key={`prop-${property.id || index}`} {...property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white/50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium text-lg">찾으시는 매물이 아직 없네요. 😢</p>
            <p className="text-gray-300 text-sm mt-2">필터를 변경하거나 검색어를 바꿔보세요!</p>
          </div>
        )}
      </section>

      <ChatBot />
    </main>
  );
}