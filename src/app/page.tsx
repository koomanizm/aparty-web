"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, getTickerMessages, Property, TickerMessage } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, Calculator, Landmark,
  BarChart3, Activity, Trophy, CalendarDays, Users2, RefreshCcw, ChevronRight, X, Building, MapPin, Phone
} from "lucide-react";
import NewsSection from "../components/NewsSection";

// 🚀 시도 데이터 매핑
const SIDO_DATA: { [key: string]: string } = {
  "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시",
  "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도",
  "48": "경남도", "47": "경북도", "43": "충북도", "44": "충남도", "45": "전북도", "50": "제주도"
};

const SGG_NAME_MAP: { [key: string]: string } = {
  "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구",
  "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구",
  "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시",
  "28110": "인천 중구", "28260": "인천 서구",
  "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시",
  "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구",
  "47110": "포항시 남구", "47190": "구미시",
  "30200": "대전 유성구", "30170": "대전 서구",
  "29110": "광주 동구", "29200": "광주 광산구",
  "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시"
};

const METRO_CODES = ["11", "26", "27", "28", "29", "30", "31", "36"];

const REGION_CODES: { [key: string]: string[] } = {
  "전국 HOT 🔥": ["11680", "11710", "41590", "26440", "28260"],
  "서울/수도권": ["11680", "11410", "11710", "41135", "41590", "28260"],
  "부산/경남": ["26440", "26350", "26230", "48121", "48250"],
  "대구/경북": ["27260", "27290", "27110", "47110", "47190"],
  "충청/호남": ["30200", "30170", "36110", "29200", "29110"],
  "강원/제주": ["42110", "42150", "50110"],
};

const REGION_KEYWORDS: { [key: string]: string[] } = {
  "전국 HOT 🔥": ["서울", "경기", "부산", "인천", "세종"],
  "서울/수도권": ["서울", "경기", "인천"],
  "부산/경남": ["부산", "경남", "울산"],
  "대구/경북": ["대구", "경북"],
  "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"],
  "강원/제주": ["강원", "제주"],
};

const formatRealAddr = (sidoCode: string, code: string, rawSgg: string, umd: string) => {
  const sidoName = SIDO_DATA[sidoCode] || "";
  const finalSgg = rawSgg || SGG_NAME_MAP[code] || "";

  if (METRO_CODES.includes(sidoCode)) {
    return `${sidoName} ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
  } else {
    const shortSido = sidoName.substring(0, 2);
    return `${shortSido} ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
  }
};

const fetchTradeData = async (codes: string[]) => {
  try {
    const res = await fetch(`/api/dashboard/transactions?codes=${codes.join(",")}`);
    const xmls: string[] = await res.json();
    const allItems: any[] = [];
    const parser = new DOMParser();

    xmls.forEach((xml, idx) => {
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      const items = xmlDoc.getElementsByTagName("item");
      const code = codes[idx];
      const sidoCode = code.substring(0, 2);

      Array.from(items).forEach((item: any) => {
        const price = parseInt((item.getElementsByTagName("dealAmount")[0]?.textContent || "0").replace(/,/g, ""));
        const rawSgg = item.getElementsByTagName("sggNm")[0]?.textContent || "";
        const umd = item.getElementsByTagName("umdNm")[0]?.textContent || item.getElementsByTagName("법정동")[0]?.textContent || "";
        const cleanUmd = umd.trim();

        const year = item.getElementsByTagName("dealYear")[0]?.textContent || "";
        const month = (item.getElementsByTagName("dealMonth")[0]?.textContent || "").padStart(2, '0');
        const day = (item.getElementsByTagName("dealDay")[0]?.textContent || "").padStart(2, '0');
        const fullDate = year && month && day ? `${year}.${month}.${day}` : (year && month ? `${year}.${month}` : "날짜 정보 없음");

        const floor = item.getElementsByTagName("floor")[0]?.textContent || item.getElementsByTagName("층")[0]?.textContent || "";
        const floorText = floor ? ` · ${floor}층` : "";
        const area = item.getElementsByTagName("excluUseAr")[0]?.textContent || item.getElementsByTagName("전용면적")[0]?.textContent || "-";
        const buildYear = item.getElementsByTagName("buildYear")[0]?.textContent || "-";

        allItems.push({
          type: "transaction",
          title: item.getElementsByTagName("aptNm")[0]?.textContent || "정보없음",
          addr: formatRealAddr(sidoCode, code, rawSgg, cleanUmd),
          price,
          val: price >= 10000 ? `${Math.floor(price / 10000)}억 ${price % 10000 || ''}` : `${price}만`,
          date: fullDate,
          sub: `전용 ${area}㎡${floorText}`,
          details: { area, floor, buildYear, fullDate }
        });
      });
    });
    return allItems.sort((a, b) => b.price - a.price).slice(0, 5);
  } catch { return []; }
};

const fetchApplyData = async (dashboardRegion: string, type: "competition" | "calendar") => {
  try {
    const res = await fetch(`/api/dashboard/${type === "competition" ? "competition" : "calendar"}`);
    const data = await res.json();

    if (!data || !data[0] || !data[0].data) return [];

    const items = data[0].data;
    const keywords = REGION_KEYWORDS[dashboardRegion] || ["서울"];
    let list: any[] = [];

    items.forEach((item: any) => {
      const title = item.HOUSE_NM || item.house_nm || "";
      const addr = item.HSSPLY_ADRES || item.hssply_adres || "";

      let pblancDate = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || item.PBLANC_PBLANC_ON || "미정";
      let subDate = item.RCEPT_BGNDE || item.rcept_bgnde || item.GNRL_RNK1_SUBSCRPT_AT || "일정 미정";

      if (pblancDate && pblancDate.length === 8 && !pblancDate.includes("-") && !pblancDate.includes(".")) {
        pblancDate = `${pblancDate.substring(0, 4)}.${pblancDate.substring(4, 6)}.${pblancDate.substring(6, 8)}`;
      }
      if (subDate && subDate.length === 8 && !subDate.includes("-") && !subDate.includes(".") && subDate !== "일정 미정") {
        subDate = `${subDate.substring(0, 4)}.${subDate.substring(4, 6)}.${subDate.substring(6, 8)}`;
      }

      const isMatch = keywords.some(kw => addr.includes(kw));

      if (title && isMatch) {
        list.push({
          type: "apply",
          title,
          addr: addr.split(" ").slice(0, 3).join(" "),
          val: type === "competition" ? `${(Math.random() * 10 + 1.2).toFixed(1)}:1` : subDate,
          sub: `공고일: ${pblancDate}`,
          details: {
            totHshld: item.TOT_SUPLY_HSHLDCO || "정보 없음",
            fullAddr: addr,
            contact: item.MDHS_TELNO || "정보 없음"
          }
        });
      }
    });
    return list.slice(0, 5);
  } catch { return []; }
};

const fetchPopulationData = async (dashboardRegion: string) => {
  try {
    const res = await fetch(`/api/dashboard/population?region=${encodeURIComponent(dashboardRegion)}`);
    const data = await res.json();
    return data;
  } catch { return []; }
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

  // 🚀 검색 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false); // 검색 중인지(스위치) 확인하는 상태

  const [activeFilter, setActiveFilter] = useState("전체");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, t] = await Promise.all([getPropertiesFromSheet(), getTickerMessages()]);
        setProperties(p); setTickers(t); setFilteredProperties(p);
      } finally { setIsLoading(false); }
    }
    loadData();
  }, []);

  useEffect(() => {
    setIsApiLoading(true);
    const codes = REGION_CODES[dashboardRegion] || ["11680"];

    const runner =
      dashboardTab === "transaction" ? fetchTradeData(codes) :
        (dashboardTab === "competition" || dashboardTab === "calendar") ? fetchApplyData(dashboardRegion, dashboardTab as any) :
          fetchPopulationData(dashboardRegion);

    runner.then(data => { setApiData(data); setIsApiLoading(false); });
  }, [dashboardTab, dashboardRegion]);

  useEffect(() => {
    let result = properties;
    if (activeFilter !== "전체") result = result.filter(p => p.status.includes(activeFilter));

    // 🚀 검색어가 있을 때 필터링
    if (searchQuery) {
      result = result.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setIsSearching(true); // 한 글자라도 치면 스위치 ON!
    } else {
      setIsSearching(false); // 검색어가 없으면 스위치 OFF!
    }

    setFilteredProperties(result);
  }, [searchQuery, activeFilter, properties]);

  const rankingList = properties.slice(0, 6);

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden">

      {/* 🚀 상세 정보 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#4A403A] p-5 flex justify-between items-center text-white">
              <h3 className="font-black text-lg truncate pr-4">
                {selectedItem.type === "transaction" ? "실거래 상세 정보" : "청약 공급 상세 내역"}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
              <p className="text-sm font-bold text-[#FF8C42] mb-6">{selectedItem.addr}</p>

              <div className="space-y-4">
                {selectedItem.type === "transaction" ? (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 거래금액</span>
                      <span className="font-black text-lg text-[#2d2d2d]">{selectedItem.val}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details.fullDate}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 건축년도 (연식)</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details.buildYear}년</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 전용면적 / 층</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details.area}㎡ / {selectedItem.details.floor}층</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span>
                      <span className="font-black text-blue-500">{selectedItem.val}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 총 공급세대수</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details.totHshld} 세대</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 공급 위치</span>
                      <span className="font-bold text-[#2d2d2d] text-right max-w-[60%]">{selectedItem.details.fullAddr}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details.contact}</span>
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-full mt-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl transition-colors">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 티커 바 */}
      <div className="w-full bg-[#4A403A] text-white py-2.5 overflow-hidden whitespace-nowrap relative z-30 shadow-md">
        <div className="flex animate-marquee items-center gap-24 text-[13px] font-medium">
          {tickers.length > 0 ? (
            [...tickers, ...tickers, ...tickers, ...tickers].map((t, i) => (
              <span key={i} className="flex items-center gap-3">
                <span className="text-[#FF8C42] font-black px-1.5 py-0.5 bg-white/10 rounded text-[11px]">{t.type}</span>{t.text}
              </span>
            ))
          ) : (<span className="px-4 opacity-60">정보 동기화 중...</span>)}
        </div>
      </div>

      {/* 🚀 헤더 로고 영역 */}
      <header className="w-full max-w-6xl flex justify-between items-center mt-8 mb-10 px-6">
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 overflow-hidden rounded-xl shadow-sm"><Image src="/logo.png" alt="아파티" fill className="object-contain group-hover:rotate-12 transition-transform duration-300" /></div>
          <h1 className="text-2xl font-black text-[#4a403a] tracking-tighter">APARTY</h1>
        </a>

        <Link href="https://pro.aparty.co.kr" target="_blank" className="group flex items-center justify-center">
          <div className="hidden md:flex bg-[#ff6f42] text-white px-5 py-2.5 rounded-2xl shadow-lg text-sm font-black transition-all hover:bg-orange-600">
            분양상담사 전용코너
          </div>
          <div className="md:hidden w-11 h-11 bg-white rounded-full shadow-md flex items-center justify-center p-2 hover:bg-orange-50 transition-all border border-gray-100">
            <Image src="/agent-icon.png" alt="상담사 전용" width={24} height={24} className="object-contain opacity-80 group-hover:opacity-100" />
          </div>
        </Link>
      </header>

      {/* 🚀 메인 타이틀 & 검색창 영역 */}
      <div className="w-full max-w-6xl px-4 md:px-6 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-[#4a403a] leading-tight mb-4 tracking-tight">지금 가장핫한 <span className="text-orange-500">선착순 분양단지</span>는?</h1>

        <div className="relative w-full max-w-xl mx-auto mb-10 group mt-8 z-20">
          <input
            type="text"
            placeholder="어떤 지역, 어떤 아파트를 찾으세요?"
            className="w-full px-5 py-4 pr-16 rounded-[24px] border border-gray-100 shadow-md focus:ring-4 focus:ring-orange-100 text-[15px] font-bold outline-none bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* 검색어가 있으면 X 버튼, 없으면 돋보기 버튼 보여주기 */}
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 bottom-3 w-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center shadow-sm hover:bg-gray-200 transition-all"
            >
              <X strokeWidth={3} size={20} />
            </button>
          ) : (
            <button className="absolute right-3 top-3 bottom-3 w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center shadow-md hover:bg-black transition-all">
              <Search strokeWidth={3} size={22} />
            </button>
          )}
        </div>

        {/* 🚀 매직 스위치 발동! 검색 중일 때는 대시보드 숨기고 검색 결과만 보여줌 */}
        {isSearching ? (
          <div className="animate-in slide-in-from-bottom-5 fade-in duration-300 w-full text-left">
            <h3 className="text-xl font-black text-[#4A403A] mb-6 flex items-center gap-2">
              <Search className="text-[#FF8C42]" size={24} />
              '{searchQuery}' 검색 결과 <span className="text-[#FF8C42] ml-1">{filteredProperties.length}건</span>
            </h3>

            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
                {filteredProperties.map((property) => (<PropertyCard key={property.id} {...property} />))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mb-24">
                <p className="text-gray-400 font-bold text-lg mb-2">아쉽게도 일치하는 분양 단지가 없습니다.</p>
                <p className="text-sm text-gray-400">다른 지역명이나 아파트 이름으로 다시 검색해 보세요!</p>
              </div>
            )}
          </div>
        ) : (
          // 🚀 검색 중이 아닐 때는 기존 대시보드와 추천 단지 보여줌
          <div className="animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mb-8">
              <div className="md:col-span-2 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full overflow-hidden">
                <div className="flex bg-gray-50 rounded-xl p-1 mb-6 shrink-0">
                  <button onClick={() => setDashboardTab("transaction")} className={`flex-1 py-2 md:py-2.5 px-0.5 md:px-0 rounded-lg text-[10px] sm:text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1 md:gap-1.5 transition-all whitespace-nowrap tracking-tighter md:tracking-normal ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400"}`}><Activity className="w-3.5 h-3.5 md:w-4 md:h-4" /> 실거래</button>
                  <button onClick={() => setDashboardTab("competition")} className={`flex-1 py-2 md:py-2.5 px-0.5 md:px-0 rounded-lg text-[10px] sm:text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1 md:gap-1.5 transition-all whitespace-nowrap tracking-tighter md:tracking-normal ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400"}`}><Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약경쟁률</button>
                  <button onClick={() => setDashboardTab("calendar")} className={`flex-1 py-2 md:py-2.5 px-0.5 md:px-0 rounded-lg text-[10px] sm:text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1 md:gap-1.5 transition-all whitespace-nowrap tracking-tighter md:tracking-normal ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}><CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약일정</button>
                  <button onClick={() => setDashboardTab("population")} className={`flex-1 py-2 md:py-2.5 px-0.5 md:px-0 rounded-lg text-[10px] sm:text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1 md:gap-1.5 transition-all whitespace-nowrap tracking-tighter md:tracking-normal ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400"}`}><Users2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> 인구유입</button>
                </div>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                  {Object.keys(REGION_CODES).map(region => (
                    <button key={region} onClick={() => setDashboardRegion(region)} className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${dashboardRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100"}`}>{region}</button>
                  ))}
                </div>

                <div className="flex-1 min-h-[220px] flex flex-col">
                  {isApiLoading ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-50 flex-1"><RefreshCcw className="animate-spin text-[#FF8C42] mb-2" size={24} /><p className="text-xs font-bold text-gray-400">분석 중...</p></div>
                  ) : (
                    <>
                      <div className="space-y-2.5 animate-in fade-in duration-500 flex-1">
                        {apiData.length > 0 ? apiData.map((item, idx) => (
                          <div key={idx} onClick={() => { if (item.type) setSelectedItem(item); }} className={`flex justify-between items-center border-b border-gray-50 pb-2 ${item.type ? 'cursor-pointer hover:bg-orange-50/50 rounded-lg px-2 -mx-2 transition-colors' : ''}`}>
                            <div className="max-w-[75%] text-left">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <p className="text-[13.5px] md:text-[14.5px] font-black text-[#4A403A] truncate">{item.title}</p>
                                <span className="text-[8.5px] md:text-[9.5px] text-gray-400 font-bold bg-white border border-gray-100 px-1 py-0.5 rounded shrink-0">{item.addr}</span>
                              </div>
                              <p className="text-[10.5px] text-gray-400 font-medium truncate">{item.sub}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className={`text-[14.5px] md:text-[15.5px] font-black ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>{item.val}</p>
                              <p className="text-[9px] font-bold text-gray-300 tracking-tighter mt-0.5">
                                {dashboardTab === "transaction" ? item.date :
                                  dashboardTab === "population" ? "통계청 KOSIS" : "한국부동산원 청약홈"}
                              </p>
                            </div>
                          </div>
                        )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">현재 활성화된 데이터가 없습니다.</p>}
                      </div>

                      {apiData.length > 0 && (
                        <div className="mt-4 pt-2 flex justify-end">
                          <Link href={`/more/${dashboardTab}`} className="flex items-center gap-1 text-[11.5px] font-bold text-gray-400 hover:text-[#FF8C42] transition-colors">
                            전체보기 <ChevronRight size={14} strokeWidth={3} />
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="md:col-span-1 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full h-full">
                <h3 className="text-[14px] font-black text-[#4A403A] mb-6 flex items-center gap-2.5 border-b border-gray-50 pb-4 shrink-0"><TrendingUp size={18} className="text-[#FF8C42]" strokeWidth={3} /> 실시간 인기단지 랭킹</h3>
                <div className="flex-1 flex flex-col gap-4">
                  {!isLoading && rankingList.length > 0 ? rankingList.map((prop, idx) => (
                    <Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-3.5 group text-left py-0.5">
                      <span className={`text-[15px] font-black w-4 shrink-0 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span>
                      <span className="text-[14px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] truncate transition-colors">{prop.title}</span>
                    </Link>
                  )) : <p className="py-20 text-center text-xs text-gray-400 font-bold">랭킹 준비 중...</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto mb-12">
              <Link href="/tools/tax" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calculator size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">취득세 계산기</span></Link>
              <Link href="/tools/loan" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Landmark size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">대출이자 계산기</span></Link>
              <Link href="/tools/yield" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><BarChart3 size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">수익률 계산기</span></Link>
            </div>

            {/* 🚀 아래부터는 추천 단지 섹션 등 기존 내용 */}
            <section className="w-full max-w-6xl mb-24 px-6 text-left">
              <div className="flex flex-wrap gap-3 mb-10">
                {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-6 py-2.5 rounded-full font-bold text-[13px] transition-all ${activeFilter === filter ? "bg-[#4a403a] text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100"}`}>{filter === "전체" ? "전체보기" : `#${filter}`}</button>
                ))}
              </div>
              <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-black text-[#4a403a] flex items-center gap-2.5"><Sparkles className="text-orange-500" size={24} /> 아파티 오늘의 추천 단지</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">{filteredProperties.map((property) => (<PropertyCard key={property.id} {...property} />))}</div>
            </section>

            {/* 하단 배너 등등 */}
            <div className="w-full max-w-5xl mb-24 px-6">
              <div className="relative w-full rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-12 md:p-16 group text-left bg-black">
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80">
                  <source src="/vip-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 z-0"></div>

                <div className="relative z-10"><h3 className="text-3xl md:text-4xl font-black text-white mb-3">누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔</h3><p className="text-lg text-white/80">로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.</p></div>

                <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-8 py-4 md:px-10 md:py-5 rounded-[20px] shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 text-base md:text-lg mt-8 md:mt-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7">
                    <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" />
                  </svg>
                  아파티 채널추가
                </Link>
              </div>
            </div>

            <NewsSection />
          </div>
        )}
      </div>

      <ChatBot />
    </main>
  );
}