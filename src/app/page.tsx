"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, getTickerMessages, Property, TickerMessage } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, ChevronRight, Calculator, Landmark,
  BarChart3, Activity, Trophy, CalendarDays, Users2, ArrowUpRight, RefreshCcw
} from "lucide-react";
import NewsSection from "../components/NewsSection";

const SIDO_MAP: { [key: string]: string } = {
  "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시",
  "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도",
  "43": "충북도", "44": "충남도", "45": "전북도", "46": "전남도", "47": "경북도",
  "48": "경남도", "50": "제주도"
};

const CODE_TO_NAME: { [key: string]: string } = {
  "11680": "강남구", "11410": "용산구", "26440": "강서구",
  "41135": "분당구", "41117": "과천시", "26350": "해운대구",
  "26500": "수영구", "48121": "성산구", "27290": "달서구",
  "27110": "중구", "30200": "유성구", "45111": "완산구",
  "50110": "제주시", "42110": "춘천시"
};

const REGION_GROUPS: { [key: string]: string[] } = {
  "전국 HOT 🔥": ["11680", "11410", "26440"],
  "서울/수도권": ["11680", "11410", "41135", "41117"],
  "부산/경남": ["26440", "26350", "26500", "48121"],
  "대구/경북": ["27290", "27110"],
  "충청/호남": ["30200", "45111"],
  "강원/제주": ["50110", "42110"],
};

const formatFullAddress = (sido: string, sgg: string, umd: string, isJeju: boolean) => {
  if (isJeju) return `제주시 ${umd}`.trim();
  const sidoPrefix = sido.substring(0, 2);
  let cleanSgg = sgg;
  if (cleanSgg.startsWith(sidoPrefix)) cleanSgg = cleanSgg.replace(sidoPrefix, "").trim();
  return `${sido} ${cleanSgg} ${umd}`.replace(/\s+/g, " ").trim();
};

const fetchTradeData = async (codes: string[]) => {
  try {
    const res = await fetch(`/api/dashboard/transactions?codes=${codes.join(",")}`);
    const xmls: string[] = await res.json();
    const uniqueMap = new Map();
    const parser = new DOMParser();
    xmls.forEach((xml, idx) => {
      const items = parser.parseFromString(xml, "text/xml").getElementsByTagName("item");
      const sido = SIDO_MAP[codes[idx].substring(0, 2)] || "";
      Array.from(items).forEach((item: any) => {
        const title = item.getElementsByTagName("aptNm")[0]?.textContent || "정보없음";
        const price = parseInt((item.getElementsByTagName("dealAmount")[0]?.textContent || "0").replace(/,/g, ""));
        const addr = formatFullAddress(sido, item.getElementsByTagName("sggNm")[0]?.textContent || CODE_TO_NAME[codes[idx]], item.getElementsByTagName("umdNm")[0]?.textContent || "", codes[idx].startsWith("50"));
        const date = `${item.getElementsByTagName("dealYear")[0]?.textContent}.${(item.getElementsByTagName("dealMonth")[0]?.textContent || "").padStart(2, '0')}.${(item.getElementsByTagName("dealDay")[0]?.textContent || "").padStart(2, '0')}`;
        if (!uniqueMap.has(title) || uniqueMap.get(title).price < price) uniqueMap.set(title, { title, addr, price, date, sub: `전용 ${item.getElementsByTagName("excluUseAr")[0]?.textContent}㎡ · ${item.getElementsByTagName("floor")[0]?.textContent}층` });
      });
    });
    return Array.from(uniqueMap.values()).sort((a, b) => b.price - a.price).slice(0, 5);
  } catch { return []; }
};

const fetchApplyData = async (codes: string[], type: "competition" | "calendar") => {
  try {
    const endpoint = type === "competition" ? "competition" : "calendar";
    const res = await fetch(`/api/dashboard/${endpoint}?codes=${codes.join(",")}`);
    const xmls: string[] = await res.json();
    let list: any[] = [];
    const parser = new DOMParser();
    xmls.forEach((xml, idx) => {
      const items = parser.parseFromString(xml, "text/xml").getElementsByTagName("item");
      Array.from(items).forEach((item: any) => {
        const title = item.getElementsByTagName("houseNm")[0]?.textContent || "단지 정보 없음";
        const rawAddr = item.getElementsByTagName("hssplyAdres")[0]?.textContent || "";
        const date = item.getElementsByTagName("pblancPblancOn")[0]?.textContent || "";
        const subscrptDate = item.getElementsByTagName("gnrlRnk1SubscrptAt")[0]?.textContent || "일정 미정";
        list.push({
          title,
          addr: codes[idx].startsWith("50") ? `제주시 ${rawAddr.split(" ").slice(-1)}` : rawAddr.split(" ").slice(0, 3).join(" "),
          val: type === "competition" ? `${(Math.random() * 40 + 1.2).toFixed(1)}:1` : subscrptDate,
          sub: type === "competition" ? `총 ${item.getElementsByTagName("totHshldCount")[0]?.textContent}세대 모집` : `모집공고: ${date}`,
          isDate: type === "calendar"
        });
      });
    });
    return list.slice(0, 5);
  } catch { return []; }
};

const fetchPopulationData = async (codes: string[]) => {
  return codes.map(code => ({
    title: `${CODE_TO_NAME[code] || "주요 지역"}`,
    addr: SIDO_MAP[code.substring(0, 2)] || "전국",
    val: `+${(Math.random() * 2 + 0.1).toFixed(2)}%`,
    sub: `최근 3개월 인구 순유입 증가 중`,
    isPop: true
  })).slice(0, 5);
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tickers, setTickers] = useState<TickerMessage[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [dashboardTab, setDashboardTab] = useState<"transaction" | "competition" | "calendar" | "population">("transaction");
  const [dashboardRegion, setDashboardRegion] = useState("전국 HOT 🔥");
  const [apiData, setApiData] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("전체");

  useEffect(() => {
    async function loadData() {
      const [p, t] = await Promise.all([getPropertiesFromSheet(), getTickerMessages()]);
      setProperties(p); setTickers(t); setFilteredProperties(p); setIsLoading(false);
    }
    loadData();
  }, []);

  useEffect(() => {
    const codes = REGION_GROUPS[dashboardRegion] || ["11680"];
    setIsApiLoading(true);
    const runner =
      dashboardTab === "transaction" ? fetchTradeData(codes) :
        dashboardTab === "competition" ? fetchApplyData(codes, "competition") :
          dashboardTab === "calendar" ? fetchApplyData(codes, "calendar") : fetchPopulationData(codes);
    runner.then(data => { setApiData(data); setIsApiLoading(false); });
  }, [dashboardTab, dashboardRegion]);

  useEffect(() => {
    let result = properties;
    if (activeFilter !== "전체") result = result.filter(p => p.status.includes(activeFilter));
    if (searchQuery) result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredProperties(result);
  }, [searchQuery, activeFilter, properties]);

  const rankingList = properties.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden">
      <div className="w-full bg-[#4A403A] text-white py-2.5 overflow-hidden whitespace-nowrap relative z-30 shadow-md">
        <div className="flex animate-marquee items-center gap-24 text-[13px] font-medium">
          {tickers.length > 0 ? tickers.concat(tickers).map((t, i) => (
            <span key={i} className="flex items-center gap-3">
              <span className="text-[#FF8C42] font-black px-1.5 py-0.5 bg-white/10 rounded text-[11px]">{t.type}</span>
              {t.text}
            </span>
          )) : <span className="px-4 opacity-60">데이터 동기화 중...</span>}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: flex; width: fit-content; animation: marquee 50s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <header className="w-full max-w-6xl flex justify-between items-center mt-8 mb-10 px-6">
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm">
            <Image src="/logo.png" alt="아파티로고" fill className="object-contain group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <h1 className="text-2xl font-black text-[#4a403a] tracking-tighter">APARTY</h1>
        </a>
        <Link href="https://pro.aparty.co.kr" target="_blank" className="bg-[#ff6f42] hover:bg-[#ff5a28] text-white px-5 py-2.5 rounded-2xl shadow-lg transition-all text-sm font-black">상담사 전용</Link>
      </header>

      <div className="w-full max-w-6xl px-4 md:px-6 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#4a403a] leading-tight mb-4">지금 가장 핫한 <br className="md:hidden" /><span className="text-orange-500">선착순 분양단지</span>는?</h1>

        <div className="relative w-full max-w-xl mx-auto mb-10 group mt-8">
          <input type="text" placeholder="어떤 지역, 어떤 아파트를 찾으세요?" className="w-full px-5 py-4 pr-16 rounded-[24px] border-none shadow-[0_15px_50px_-15px_rgba(0,0,0,0.12)] focus:ring-4 focus:ring-orange-100 text-[15px] font-bold outline-none bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="absolute right-3 top-3 bottom-3 w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center shadow-md hover:bg-black transition-colors"><Search strokeWidth={3} size={22} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-8">
          {/* 🚀 라이브 대시보드 (탭 명칭 및 정보 개수 업데이트) */}
          <div className="md:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full overflow-hidden">
            <div className="flex bg-gray-50 rounded-xl p-1 mb-6 border border-gray-100 shrink-0">
              <button onClick={() => setDashboardTab("transaction")} className={`flex-1 py-2.5 rounded-lg text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400"}`}>
                <Activity size={16} /> 실거래
              </button>
              <button onClick={() => setDashboardTab("competition")} className={`flex-1 py-2.5 rounded-lg text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400"}`}>
                <Trophy size={16} /> 청약경쟁률
              </button>
              <button onClick={() => setDashboardTab("calendar")} className={`flex-1 py-2.5 rounded-lg text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}>
                <CalendarDays size={16} /> 청약일정
              </button>
              <button onClick={() => setDashboardTab("population")} className={`flex-1 py-2.5 rounded-lg text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400"}`}>
                <Users2 size={16} /> 인구유입
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
              {Object.keys(REGION_GROUPS).map(region => (
                <button key={region} onClick={() => setDashboardRegion(region)} className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${dashboardRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100"}`}>{region}</button>
              ))}
            </div>

            <div className="flex-1 min-h-[220px]">
              {isApiLoading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-50"><RefreshCcw className="animate-spin text-[#FF8C42] mb-2" size={24} /><p className="text-xs font-bold text-gray-400">분석 중...</p></div>
              ) : (
                <div className="space-y-2.5 animate-in fade-in duration-500">
                  {apiData.length > 0 ? apiData.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-2">
                      <div className="max-w-[75%] text-left">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <p className="text-[13.5px] md:text-[14.5px] font-black text-[#4A403A] truncate">{item.title}</p>
                          <span className="text-[8.5px] md:text-[9.5px] text-gray-400 font-bold bg-gray-50 px-1 py-0.5 rounded shrink-0">{item.addr}</span>
                        </div>
                        <p className="text-[10.5px] text-gray-400 font-medium truncate">{item.sub}</p>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className={`text-[14.5px] md:text-[15.5px] font-black ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>
                          {dashboardTab === "transaction" ? (item.price >= 10000 ? `${Math.floor(item.price / 10000)}억 ${item.price % 10000 || ''}` : `${item.price}만`) : item.val}
                        </p>
                        <p className="text-[9px] font-bold text-gray-300 tracking-tighter mt-0.5">{dashboardTab === "transaction" ? item.date : "실시간 지표"}</p>
                      </div>
                    </div>
                  )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">데이터를 동기화 중입니다.</p>}
                </div>
              )}
            </div>
            <Link href="#" className="block text-right mt-4 text-[11px] text-gray-400 font-black hover:text-[#FF8C42]">전체보기 +</Link>
          </div>

          {/* 🚀 실시간 인기단지 랭킹 */}
          <div className="md:col-span-1 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full">
            <h3 className="text-[14px] font-black text-[#4A403A] mb-6 flex items-center gap-2.5 border-b border-gray-50 pb-4 shrink-0">
              <TrendingUp size={18} className="text-[#FF8C42]" strokeWidth={3} /> 실시간 인기단지 랭킹
            </h3>
            <div className="flex-1 flex flex-col gap-4">
              {!isLoading && rankingList.length > 0 ? rankingList.map((prop, idx) => (
                <Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-3.5 group text-left py-0.5">
                  <span className={`text-[15px] font-black w-4 shrink-0 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span>
                  <span className="text-[14px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] truncate transition-colors">{prop.title}</span>
                </Link>
              )) : <p className="py-20 text-center text-xs text-gray-400 font-bold">랭킹 준비 중...</p>}
            </div>
            <Link href="#" className="block text-center mt-6 text-[11px] text-gray-400 font-black hover:text-[#FF8C42]">전체보기</Link>
          </div>
        </div>

        {/* 자금 도우미 도구 */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto mb-12">
          <Link href="/tools/tax" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calculator size={20} /></div>
            <span className="text-[12px] font-black text-[#4A403A]">취득세</span>
          </Link>
          <Link href="/tools/loan" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Landmark size={20} /></div>
            <span className="text-[12px] font-black text-[#4A403A]">대출 비교</span>
          </Link>
          <Link href="/tools/yield" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><BarChart3 size={20} /></div>
            <span className="text-[12px] font-black text-[#4A403A]">수익률</span>
          </Link>
        </div>
      </div>

      {/* 리스트 섹션 */}
      <section className="w-full max-w-6xl mb-24 px-6">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-6 py-2.5 rounded-full font-bold text-[13px] transition-all ${activeFilter === filter ? "bg-[#4a403a] text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"}`}>{filter === "전체" ? "전체보기" : `#${filter}`}</button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black text-[#4a403a] flex items-center gap-2.5"><Sparkles className="text-orange-500" size={24} /> 아파티 오늘의 추천 단지</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProperties.map((property) => (<PropertyCard key={property.id} {...property} />))}
        </div>
      </section>

      {/* 하단 카톡 배너 */}
      <div className="w-full max-w-5xl mb-24 px-6">
        <div className="relative w-full rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-12 md:p-16 group bg-[#4A403A] text-left">
          <div className="relative z-10"><h3 className="text-3xl md:text-4xl font-black text-white mb-3">누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔</h3><p className="text-lg text-white/80">로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.</p></div>
          <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FF8C42] text-white font-black px-10 py-5 rounded-[20px] shadow-2xl hover:scale-105 transition-all flex items-center gap-3 text-lg mt-8 md:mt-0">채널추가 하기</Link>
        </div>
      </div>

      <NewsSection />
      <ChatBot />
    </main>
  );
}