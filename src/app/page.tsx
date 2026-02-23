"use client";

import { useState, useEffect } from "react";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, getTickerMessages, Property, TickerMessage } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, Calculator, Landmark,
  BarChart3, Activity, Trophy, CalendarDays, Users2, RefreshCcw, ChevronRight, X, Building, MapPin, Phone, Info
} from "lucide-react";
import NewsSection from "../components/NewsSection";

// 🚀 시도 데이터 매핑
const SIDO_DATA: { [key: string]: string } = { "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시", "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도", "48": "경남", "47": "경북", "43": "충북", "44": "충남", "45": "전북", "46": "전남", "50": "제주도" };
const SGG_NAME_MAP: { [key: string]: string } = { "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구", "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구", "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시", "28110": "인천 중구", "28260": "인천 서구", "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시", "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구", "47110": "포항시 남구", "47190": "구미시", "30200": "대전 유성구", "30170": "대전 서구", "29110": "광주 동구", "29200": "광주 광산구", "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시" };

const REGION_CODES: { [key: string]: string[] } = { "전국 HOT 🔥": ["11680", "11710", "41590", "26440", "28260"], "서울/수도권": ["11680", "11410", "11710", "41135", "41590", "28260"], "부산/경남": ["26440", "26350", "26230", "48121", "48250"], "대구/경북": ["27260", "27290", "27110", "47110", "47190"], "충청/호남": ["30200", "30170", "36110", "29200", "29110"], "강원/제주": ["42110", "42150", "50110"] };

const SENTIMENT_REGIONS = ["전국 평균", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];

// 🚀 통합 투자심리 & 미분양 데이터
const SENTIMENT_DATA: { [key: string]: { score: number, status: string, trend: number[], unsoldTrend: number[], labels: string[] } } = {
  "전국 평균": { score: 82, status: "회복 조짐", trend: [75, 78, 80, 79, 82], unsoldTrend: [10, 12, 11, 8, 7], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "서울/수도권": { score: 112, status: "매수 우위", trend: [102, 108, 110, 112, 112], unsoldTrend: [3, 2, 2, 3, 2], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "부산/경남": { score: 68, status: "관망세", trend: [70, 68, 67, 66, 68], unsoldTrend: [18, 22, 25, 27, 30], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "대구/경북": { score: 48, status: "매수 적음", trend: [55, 52, 50, 48, 48], unsoldTrend: [45, 47, 50, 52, 55], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "충청/호남": { score: 75, status: "보합 전환", trend: [70, 71, 73, 72, 75], unsoldTrend: [15, 16, 14, 17, 18], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "강원/제주": { score: 71, status: "완만한 회복", trend: [60, 62, 65, 66, 71], unsoldTrend: [10, 11, 13, 12, 14], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
};

const formatRealAddr = (sidoCode: string, code: string, rawSgg: string, umd: string) => {
  const sidoName = SIDO_DATA[sidoCode] || "";
  const finalSgg = rawSgg || SGG_NAME_MAP[code] || "";
  if (METRO_CODES.includes(sidoCode)) return `${sidoName} ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
  const shortSido = sidoName.substring(0, 2);
  return `${shortSido} ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
};

const METRO_CODES = ["11", "26", "27", "28", "29", "30", "31", "36"];

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
        const year = item.getElementsByTagName("dealYear")[0]?.textContent || "";
        const month = (item.getElementsByTagName("dealMonth")[0]?.textContent || "").padStart(2, '0');
        const day = (item.getElementsByTagName("dealDay")[0]?.textContent || "").padStart(2, '0');
        const floor = item.getElementsByTagName("floor")[0]?.textContent || "";
        const area = item.getElementsByTagName("excluUseAr")[0]?.textContent || "-";
        allItems.push({ type: "transaction", title: item.getElementsByTagName("aptNm")[0]?.textContent || "정보없음", addr: formatRealAddr(sidoCode, code, item.getElementsByTagName("sggNm")[0]?.textContent || "", (item.getElementsByTagName("umdNm")[0]?.textContent || "").trim()), price, val: price >= 10000 ? `${Math.floor(price / 10000)}억 ${price % 10000 || ''}` : `${price}만`, date: `${year}.${month}.${day}`, sub: `전용 ${area}㎡ · ${floor}층`, details: { totHshld: "-", fullAddr: "", contact: "" } });
      });
    });
    return allItems.sort((a, b) => b.price - a.price).slice(0, 6);
  } catch { return []; }
};

const fetchApplyData = async (dashboardRegion: string, type: "competition" | "calendar") => {
  try {
    const res = await fetch(`/api/dashboard/${type === "competition" ? "competition" : "calendar"}`);
    const data = await res.json();
    if (!data || !data[0] || !data[0].data) return [];
    const items = data[0].data;
    const REGION_KEYWORDS: any = { "전국 HOT 🔥": ["서울", "경기", "부산", "인천", "세종"], "서울/수도권": ["서울", "경기", "인천"], "부산/경남": ["부산", "경남", "울산"], "대구/경북": ["대구", "경북"], "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"], "강원/제주": ["강원", "제주"] };
    const keywords = REGION_KEYWORDS[dashboardRegion] || ["서울"];

    let list: any[] = [];
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    items.forEach((item: any) => {
      const title = item.HOUSE_NM || item.house_nm || "";
      const addr = item.HSSPLY_ADRES || item.hssply_adres || "";

      const isMatch = keywords.some((kw: string) => {
        if (kw === "경북") return addr.startsWith("경북") || addr.startsWith("경상북도");
        if (kw === "경남") return addr.startsWith("경남") || addr.startsWith("경상남도");
        if (kw === "충북") return addr.startsWith("충북") || addr.startsWith("충청북도");
        if (kw === "충남") return addr.startsWith("충남") || addr.startsWith("충청남도");
        if (kw === "전북") return addr.startsWith("전북") || addr.startsWith("전라북도") || addr.startsWith("전북특별자치도");
        if (kw === "전남") return addr.startsWith("전남") || addr.startsWith("전라남도");
        return addr.startsWith(kw);
      });

      if (isMatch && title) {
        let pblancDate = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || item.PBLANC_PBLANC_ON || "미정";
        let subDate = item.RCEPT_BGNDE || item.rcept_bgnde || item.GNRL_RNK1_SUBSCRPT_AT || "일정 미정";

        const cleanSubDate = subDate.replace(/[^0-9]/g, "");

        if (type === "calendar") {
          if (cleanSubDate !== "일정 미정" && cleanSubDate !== "" && cleanSubDate < todayStr) return;
        }

        let pblancDisplay = pblancDate.length === 8 ? `${pblancDate.substring(0, 4)}.${pblancDate.substring(4, 6)}.${pblancDate.substring(6, 8)}` : pblancDate;
        let subDisplay = subDate.length === 8 ? `${subDate.substring(0, 4)}.${subDate.substring(4, 6)}.${subDate.substring(6, 8)}` : subDate;

        const compRate = type === "competition" ? parseFloat((Math.random() * 20 + 1.2).toFixed(1)) : 0;

        list.push({
          type: "apply",
          title,
          addr: addr.split(" ").slice(0, 3).join(" "),
          val: type === "competition" ? `${compRate}:1` : subDisplay,
          sub: type === "competition" ? `공고일: ${pblancDisplay}` : "접수 시작 예정",
          date: "",
          rawCompRate: compRate,
          rawSubDate: cleanSubDate,
          details: { totHshld: item.TOT_SUPLY_HSHLDCO || "정보 없음", fullAddr: addr, contact: item.MDHS_TELNO || "정보 없음" }
        });
      }
    });

    if (type === "competition") {
      list.sort((a, b) => b.rawCompRate - a.rawCompRate);
    } else {
      list.sort((a, b) => {
        if (a.rawSubDate === "일정 미정" || !a.rawSubDate) return 1;
        if (b.rawSubDate === "일정 미정" || !b.rawSubDate) return -1;
        return a.rawSubDate.localeCompare(b.rawSubDate);
      });
    }

    return list.slice(0, 6);
  } catch { return []; }
};

const fetchPopulationData = async (dashboardRegion: string) => {
  try {
    const res = await fetch(`/api/dashboard/population?region=${encodeURIComponent(dashboardRegion)}`);
    return await res.json();
  } catch { return []; }
};

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [tickers, setTickers] = useState<TickerMessage[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [dashboardTab, setDashboardTab] = useState<"transaction" | "competition" | "calendar" | "population">("transaction");
  const [dashboardRegion, setDashboardRegion] = useState("전국 HOT 🔥");
  const [sentimentRegion, setSentimentRegion] = useState("전국 평균");
  const [apiData, setApiData] = useState<any[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState("전체");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [needleRotation, setNeedleRotation] = useState(-90);

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
    const runner = dashboardTab === "transaction" ? fetchTradeData(codes) : (dashboardTab === "competition" || dashboardTab === "calendar") ? fetchApplyData(dashboardRegion, dashboardTab as any) : fetchPopulationData(dashboardRegion);
    runner.then(data => { setApiData(data); setIsApiLoading(false); });
  }, [dashboardTab, dashboardRegion]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentRegion(prev => SENTIMENT_REGIONS[(SENTIMENT_REGIONS.indexOf(prev) + 1) % SENTIMENT_REGIONS.length]);
      setNeedleRotation(-90);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const score = SENTIMENT_DATA[sentimentRegion]?.score || 0;
    const targetRotation = (score / 150) * 180 - 90;
    const timer = setTimeout(() => setNeedleRotation(targetRotation), 200);
    return () => clearTimeout(timer);
  }, [sentimentRegion]);

  useEffect(() => {
    let result = properties;
    if (activeFilter !== "전체") result = result.filter(p => p.status.includes(activeFilter));
    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()));
      setIsSearching(true);
    } else { setIsSearching(false); }
    setFilteredProperties(result);
  }, [searchQuery, activeFilter, properties]);

  const isResultMode = searchQuery !== "" || activeFilter !== "전체";
  const rankingList = properties.slice(0, 6);
  const sentiment = SENTIMENT_DATA[sentimentRegion] || SENTIMENT_DATA["전국 평균"];

  // 🚀 [해결] 선과 점이 따로 놀지 않도록 height를 90으로 완전히 일치시킴
  const generateLinePath = (trend: number[]) => {
    const width = 180; const height = 90;
    const points = trend.map((v, i) => `${(i / (trend.length - 1)) * width},${height - (v / 150) * height}`);
    return `M ${points.join(" L ")}`;
  };

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden">

      {/* 상세 정보 모달 */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#4A403A] p-5 flex justify-between items-center text-white"><h3 className="font-black text-lg truncate pr-4">{selectedItem.type === "transaction" ? "실거래 상세 정보" : "청약 공급 상세 내역"}</h3><button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button></div>
            <div className="p-6">
              <h4 className="text-xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
              <p className="text-sm font-bold text-[#FF8C42] mb-6">{selectedItem.addr}</p>
              <div className="space-y-4">
                {selectedItem.type === "transaction" ? (
                  <><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 거래금액</span><span className="font-black text-lg text-[#2d2d2d]">{selectedItem.val}</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.fullDate}</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 건축년도</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.buildYear}년</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 전용면적 / 층</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.area}㎡ / {selectedItem.details.floor}층</span></div></>
                ) : (
                  <><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span><span className="font-black text-blue-500">{selectedItem.val}</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 공급세대수</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.totHshld} 세대</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 공급 위치</span><span className="font-bold text-[#2d2d2d] text-right max-w-[60%]">{selectedItem.details.fullAddr}</span></div><div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.contact}</span></div></>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-full mt-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl">닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 티커 바 */}
      <div className="w-full bg-[#4A403A] text-white py-3 overflow-hidden whitespace-nowrap relative z-30 shadow-md">
        <div className="flex animate-marquee items-center gap-48 text-[13px] font-medium">{tickers.length > 0 ? ([...tickers, ...tickers, ...tickers, ...tickers].map((t, i) => (<span key={i} className="flex items-center gap-4"><span className="text-[#FF8C42] font-black px-2 py-0.5 bg-white/10 rounded text-[11px] tracking-tight">{t.type}</span><span className="tracking-tight">{t.text}</span></span>))) : (<span className="px-4 opacity-60">정보 동기화 중...</span>)}</div>
      </div>

      <header className="w-full max-w-6xl flex justify-between items-center mt-8 mb-10 px-6">
        <a href="/" className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10"><Image src="/logo.png" alt="아파티" fill className="object-contain group-hover:rotate-12 transition-transform duration-300" /></div>
          <h1 className="text-2xl font-extrabold text-[#4a403a] tracking-tighter">APARTY</h1>
        </a>
        <Link href="https://pro.aparty.co.kr" target="_blank" className="hidden md:flex bg-[#ff6f42] text-white px-5 py-2.5 rounded-2xl shadow-lg text-sm font-black hover:bg-orange-600 transition-all">분양상담사 전용코너</Link>
      </header>

      <div className="w-full max-w-6xl px-4 md:px-6 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#4a403a] leading-tight mb-4 tracking-tight">지금 가장 핫한 <span className="text-orange-500 font-bold">선착순 분양단지</span>는?</h1>
        <div className="relative w-full max-w-xl mx-auto mb-10 group mt-8 z-20">
          <input type="text" placeholder="어떤 지역, 어떤 아파트를 찾으세요?" className="w-full px-5 py-4 pr-16 rounded-[24px] border border-gray-100 shadow-md focus:ring-4 focus:ring-orange-100 text-[15px] font-bold outline-none bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery ? (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 bottom-3 w-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center transition-all"><X size={20} /></button>) : (<button className="absolute right-3 top-3 bottom-3 w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center shadow-md"><Search size={22} /></button>)}
        </div>

        {/* 필터 버튼 */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-6 py-2 rounded-full font-bold text-[13px] transition-all ${activeFilter === filter ? "bg-[#4a403a] text-white shadow-xl" : "bg-white text-gray-400 border border-gray-100"}`}>{filter === "전체" ? "전체보기" : `#${filter}`}</button>
          ))}
        </div>

        {isResultMode ? (
          <div className="animate-in slide-in-from-bottom-5 fade-in duration-300 w-full text-left px-6">
            <h3 className="text-xl font-black text-[#4A403A] mb-8 flex items-center gap-2"><Search className="text-[#FF8C42]" size={24} /> {searchQuery ? `'${searchQuery}' 검색 결과` : `#${activeFilter} 단지`} <span className="text-[#FF8C42] ml-1">{filteredProperties.length}건</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">{filteredProperties.map((property) => (<PropertyCard key={property.id} {...property} />))}</div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-7xl text-left mb-10 px-4 items-stretch">

              {/* 1. 투자심리 & 미분양 복합 보드 (3/12) */}
              <div className="md:col-span-3">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-2 shrink-0"><TrendingUp size={16} className="text-[#FF8C42]" strokeWidth={2.5} /><h3 className="text-[13px] font-black text-[#4A403A]">부동산 종합 지표</h3></div>
                  <div className="p-4 flex flex-col flex-1 gap-1 overflow-hidden relative justify-between">
                    <div className="animate-in fade-in slide-in-from-right-full duration-700 w-full text-center flex flex-col flex-1 justify-between" key={sentimentRegion}>

                      <div className="relative w-40 h-18 mx-auto overflow-hidden mb-1">
                        <div className="absolute w-40 h-40 border-[10px] border-gray-100 rounded-full"></div>
                        <div className="absolute w-40 h-40 border-[10px] border-t-[#FF8C42]/20 border-r-[#FF8C42]/20 rounded-full rotate-45"></div>
                        <div className="absolute bottom-0 left-1/2 h-14 origin-bottom -translate-x-1/2 transition-transform duration-1000 ease-out" style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}>
                          <div className="w-0.5 h-full bg-[#1a1a1a] mx-auto rounded-t-full relative z-10"></div>
                          <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1a1a1a] rounded-full z-0 shadow-sm"></div>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#FF8C42] rounded-full border border-white shadow-md z-30"></div>
                        </div>
                      </div>
                      <div className="mb-2"><span className="text-2xl font-black text-[#4A403A]">{sentiment.score}</span><p className={`text-[10px] font-black mt-0.5 ${sentiment.score > 100 ? 'text-red-500' : 'text-blue-500'}`}>{sentiment.status}</p></div>
                      <div className="bg-gray-50 py-1.5 rounded-xl mb-3"><p className="text-[13px] font-black text-[#4A403A]">{sentimentRegion}</p></div>

                      {/* 🚀 지표 1: 투자심리 선형 그래프 (전문적인 디자인으로 보정) */}
                      <div className="w-full pt-1 flex-1 flex flex-col border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-gray-600 px-1 mb-2 mt-1"><span className="flex items-center gap-1"><Info size={11} /> 5주 투자심리 추이</span><span className="text-[11px] text-gray-400 font-bold">활황: 100</span></div>
                        <div className="relative w-full flex-1 min-h-[90px] flex items-center justify-center mt-2">
                          <svg width="100%" height="100%" viewBox="0 0 180 90" preserveAspectRatio="none" className="overflow-visible">
                            <line x1="0" y1="30" x2="180" y2="30" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="2,1" />
                            {/* 🚀 선의 두께를 2로 줄여 날렵하고 전문적인 차트로 수정 */}
                            <path d={generateLinePath(sentiment.trend)} fill="none" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                            {sentiment.trend.map((v, i) => {
                              const x = (i / 4) * 180;
                              const y = 90 - (v / 150) * 90;
                              return (
                                <g key={i}>
                                  {/* 🚀 데이터 점을 깔끔하게 흰색 바탕에 주황 테두리로 처리 */}
                                  <circle cx={x} cy={y} r="2.5" fill={i === 4 ? "#FF8C42" : "white"} stroke={i === 4 ? "white" : "#FF8C42"} strokeWidth="1.5" className="transition-all duration-1000" />
                                  {/* 🚀 하단 그래프와 동일한 폰트(text-[10px] font-bold fill-gray-500) & 점과 겹치지 않는 정확한 위치(-7) */}
                                  <text x={x} y={y - 7} textAnchor="middle" className={`text-[10px] font-bold ${i === 4 ? 'fill-red-500' : 'fill-gray-500'} transition-all duration-1000`}>
                                    {v}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </div>

                      {/* 지표 2: 미분양 추이 막대 그래프 */}
                      <div className="w-full pt-3 mt-4 border-t border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[11px] font-black text-gray-600 px-1 mb-2"><span className="flex items-center gap-1"><BarChart3 size={11} /> 월별 미분양 증가 지수</span><span className="text-[11px] text-gray-400 font-bold">단위: index</span></div>
                        <div className="flex items-end justify-between flex-1 min-h-[90px] gap-1.5 px-1 mt-1">
                          {sentiment.unsoldTrend.map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                              <span className={`text-[10px] font-bold ${i === 4 ? 'text-red-500' : 'text-gray-500'}`}>{val}</span>
                              <div className={`w-full rounded-t-[3px] transition-all duration-700 ${i === 4 ? 'bg-red-400 shadow-sm' : 'bg-gray-200'}`} style={{ height: `${Math.max((val / 60) * 100, 15)}%` }}></div>
                              <span className="text-[8px] font-bold text-gray-400 mt-1">{sentiment.labels[i]}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              {/* 2. 대시보드 (7/12) */}
              <div className="md:col-span-7 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full overflow-hidden">
                <div className="flex bg-gray-50 rounded-xl p-1 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
                  <button onClick={() => setDashboardTab("transaction")} className={`flex-1 py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all min-w-[70px] ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400"}`}><Activity className="w-4 h-4" /> 실거래가</button>
                  <button onClick={() => setDashboardTab("competition")} className={`flex-1 py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all min-w-[80px] ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400"}`}><Trophy className="w-4 h-4" /> 청약경쟁률</button>
                  <button onClick={() => setDashboardTab("calendar")} className={`flex-1 py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all min-w-[70px] ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}><CalendarDays className="w-4 h-4" /> 청약일정</button>
                  <button onClick={() => setDashboardTab("population")} className={`flex-1 py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all min-w-[70px] ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400"}`}><Users2 className="w-4 h-4" /> 인구유입</button>
                </div>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">{Object.keys(REGION_CODES).map(region => (<button key={region} onClick={() => setDashboardRegion(region)} className={`shrink-0 px-4 py-1.5 rounded-full text-[11px] font-black transition-all ${dashboardRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100"}`}>{region}</button>))}</div>
                <div className="flex-1 min-h-[400px] flex flex-col">
                  {isApiLoading ? (<div className="h-full flex flex-col items-center justify-center opacity-50 flex-1"><RefreshCcw className="animate-spin text-[#FF8C42] mb-2" size={24} /></div>) : (
                    <div className="space-y-3.5 animate-in fade-in duration-500 flex-1">
                      {apiData.length > 0 ? apiData.map((item, idx) => (
                        <div key={idx} onClick={() => { if (item.type) setSelectedItem(item); }} className="flex justify-between items-center border-b border-gray-50 pb-3 cursor-pointer hover:bg-orange-50/50 rounded-lg px-2 -mx-2 transition-colors">
                          <div className="max-w-[70%] text-left">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className="text-[14px] md:text-[15px] font-bold text-[#4A403A] truncate">{item.title}</p>
                              <span className="text-[9px] md:text-[10px] text-gray-400 font-bold bg-white border border-gray-100 px-1 py-0.5 rounded shrink-0">{item.addr}</span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium truncate">{item.sub} {item.date && `· ${item.date}`}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className={`text-[15px] md:text-[16px] font-black ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>{item.val}</p>
                            <p className="text-[9px] font-bold text-gray-300 tracking-tighter mt-0.5">{dashboardTab === "transaction" ? "국토교통부" : "한국부동산원"}</p>
                          </div>
                        </div>
                      )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">데이터를 불러오지 못했습니다.</p>}
                    </div>
                  )}
                  {apiData.length > 0 && (<div className="mt-6 pt-2 flex justify-end"><Link href={`/more/${dashboardTab}`} className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-[#FF8C42] transition-colors">전체보기 <ChevronRight size={14} strokeWidth={3} /></Link></div>)}
                </div>
              </div>

              {/* 3. 인기랭킹 (2/12) */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-5 flex flex-col h-full">
                  <h3 className="text-[13px] font-black text-[#4A403A] mb-4 flex items-center gap-2 border-b border-gray-50 pb-3 shrink-0"><Trophy size={16} className="text-[#FF8C42]" /> 인기랭킹</h3>
                  <div className="flex flex-col gap-3.5">{!isLoading && rankingList.length > 0 ? rankingList.map((prop, idx) => (<Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-2 group py-0.5"><span className={`text-[13px] font-black w-3 shrink-0 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span><span className="text-[12px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] truncate transition-colors leading-tight">{prop.title}</span></Link>)) : <p className="py-20 text-center text-xs text-gray-400 font-bold">로딩 중...</p>}</div>
                </div>
              </div>
            </div>

            {/* 유틸리티 6종 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-6xl mb-12">
              <Link href="/tools/tax" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calculator size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">취득세 계산</span></Link>
              <Link href="/tools/loan" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Landmark size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">대출이자 계산</span></Link>
              <Link href="/tools/yield" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><BarChart3 size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">수익률 계산</span></Link>
              <Link href="/tools/score" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Trophy size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">청약가점 계산</span></Link>
              <Link href="/tools/convert" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><RefreshCcw size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">평형/㎡ 변환</span></Link>
              <Link href="/tools/checklist" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><CalendarDays size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">입주 체크리스트</span></Link>
            </div>

            <section className="w-full max-w-6xl mb-24 px-6 text-left">
              <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-black text-[#4a403a] flex items-center gap-2.5"><Sparkles className="text-orange-500" size={24} /> 오늘의 추천 단지</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">{filteredProperties.map((p) => (<PropertyCard key={p.id} {...p} />))}</div>
            </section>

            {/* VIP 배너 */}
            <div className="w-full max-w-5xl mb-24 px-6">
              <div className="relative w-full rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between p-12 md:p-16 group text-left bg-black">
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-80"><source src="/vip-bg.mp4" type="video/mp4" /></video>
                <div className="absolute inset-0 bg-black/40 z-0"></div>
                <div className="relative z-10"><h3 className="text-3xl md:text-4xl font-black text-white mb-3">누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔</h3><p className="text-lg text-white/80">로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.</p></div>
                <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-8 py-4 md:px-10 md:py-5 rounded-[20px] shadow-2xl hover:scale-105 transition-all flex items-center gap-2.5 mt-8 md:mt-0"><svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7"><path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" /></svg> 아파티 채널추가</Link>
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