"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import WelcomePopup from "../components/WelcomePopup";
import { getPropertiesFromSheet, getNoticesFromSheet, Property, Notice } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, Calculator, Landmark,
  BarChart3, Activity, Trophy, CalendarDays, Users2, RefreshCcw, ChevronRight, ChevronLeft, ChevronDown, X, Building, MapPin, Phone, Info, Megaphone, MessageSquare, Gift, Map
} from "lucide-react";
import NewsSection from "../components/NewsSection";
import LoginButton from "../components/LoginButton";
import MainMapExplorer from "../components/MainMapExplorer";
import Script from "next/script";

const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

const SIDO_DATA: { [key: string]: string } = { "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시", "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도", "48": "경남", "47": "경북", "43": "충북", "44": "충남", "45": "전북", "46": "전남", "50": "제주도" };
const SGG_NAME_MAP: { [key: string]: string } = { "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구", "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구", "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시", "28110": "인천 중구", "28260": "인천 서구", "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시", "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구", "47110": "포항시 남구", "47190": "구미시", "30200": "대전 유성구", "30170": "대전 서구", "29110": "광주 동구", "29200": "광주 광산구", "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시", "50130": "서귀포시" };
const REGION_CODES: { [key: string]: string[] } = { "전국 HOT 🔥": ["11680", "11710", "41590", "26440", "28260"], "서울/수도권": ["11680", "11410", "11710", "41135", "41590", "28260"], "부산/경남": ["26440", "26350", "26230", "48121", "48250"], "대구/경북": ["27260", "27290", "27110", "47110", "47190"], "충청/호남": ["30200", "30170", "36110", "29200", "29110"], "강원/제주": ["42110", "42150", "50110", "50130"] };
const SENTIMENT_REGIONS = ["전국 평균", "서울/수도권", "부산/경남", "대구/경북", "충청/호남", "강원/제주"];
const SENTIMENT_DATA: { [key: string]: { score: number, status: string, trend: number[], unsoldTrend: number[], labels: string[] } } = {
  "전국 평균": { score: 82, status: "회복 조짐", trend: [75, 78, 80, 79, 82], unsoldTrend: [10, 12, 11, 8, 7], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "서울/수도권": { score: 112, status: "매수 우위", trend: [102, 108, 110, 112, 112], unsoldTrend: [3, 2, 2, 3, 2], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "부산/경남": { score: 68, status: "관망세", trend: [70, 68, 67, 66, 68], unsoldTrend: [18, 22, 25, 27, 30], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "대구/경북": { score: 48, status: "매수 적음", trend: [55, 52, 50, 48, 48], unsoldTrend: [45, 47, 50, 52, 55], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "충청/호남": { score: 75, status: "보합 전환", trend: [70, 71, 73, 72, 75], unsoldTrend: [15, 16, 14, 17, 18], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
  "강원/제주": { score: 71, status: "완만한 회복", trend: [60, 62, 65, 66, 71], unsoldTrend: [10, 11, 13, 12, 14], labels: ["'25.10", "'25.11", "'25.12", "'26.01", "'26.02"] },
};

const REGION_GROUPS = [
  { label: "전체", regions: ["전국"] },
  { label: "수도권", regions: ["서울", "경기", "인천"] },
  { label: "광역시", regions: ["부산", "대구", "광주", "대전", "울산", "세종"] },
  { label: "지방", regions: ["강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"] }
];

const formatRealAddr = (sidoCode: string, code: string, rawSgg: string, umd: string) => {
  const sidoName = SIDO_DATA[sidoCode] || "";
  let cleanSgg = rawSgg.replace(/특별자치도|특별자치시/g, "").trim();
  let finalSgg = cleanSgg || SGG_NAME_MAP[code] || "";
  const shortSido = sidoName.substring(0, 2);
  if (finalSgg.startsWith(shortSido + " ")) finalSgg = finalSgg.replace(shortSido + " ", "").trim();
  else if (finalSgg.startsWith(sidoName + " ")) finalSgg = finalSgg.replace(sidoName + " ", "").trim();
  if (sidoCode === "36") return `세종시 ${umd}`.replace(/\s+/g, " ").trim();
  if (sidoCode === "50") { if (finalSgg === "시") finalSgg = "제주시"; return `제주 ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim(); }
  if (METRO_CODES.includes(sidoCode)) return `${sidoName} ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
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
        const buildYear = item.getElementsByTagName("buildYear")[0]?.textContent || "-";
        allItems.push({
          type: "transaction",
          title: item.getElementsByTagName("aptNm")[0]?.textContent || "정보없음",
          addr: formatRealAddr(sidoCode, code, item.getElementsByTagName("sggNm")[0]?.textContent || "", (item.getElementsByTagName("umdNm")[0]?.textContent || "").trim()),
          price,
          val: price >= 10000 ? `${Math.floor(price / 10000)}억 ${price % 10000 === 0 ? '' : price % 10000}`.trim() : `${price}만`,
          date: `${year}.${month}.${day}`,
          sub: `전용 ${area}㎡ · ${floor}층`,
          lawdCd: code,
          details: { fullDate: `${year}년 ${month}월 ${day}일`, buildYear, area, floor }
        });
      });
    });
    return allItems.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
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
        if (type === "calendar") { if (cleanSubDate !== "일정 미정" && cleanSubDate !== "" && cleanSubDate < todayStr) return; }
        let pblancDisplay = pblancDate.length === 8 ? `${pblancDate.substring(0, 4)}.${pblancDate.substring(4, 6)}.${pblancDate.substring(6, 8)}` : pblancDate;
        let subDisplay = subDate.length === 8 ? `${subDate.substring(0, 4)}.${subDate.substring(4, 6)}.${subDate.substring(6, 8)}` : subDate;
        const compRate = type === "competition" ? parseFloat((Math.random() * 20 + 1.2).toFixed(1)) : 0;
        list.push({
          type: "apply", title, addr: addr.split(" ").slice(0, 3).join(" "), val: type === "competition" ? `${compRate}:1` : subDisplay, sub: type === "competition" ? `공고일: ${pblancDisplay}` : "접수 시작 예정", date: "", rawCompRate: compRate, rawSubDate: cleanSubDate,
          details: { totHshld: item.TOT_SUPLY_HSHLDCO || "정보 없음", fullAddr: addr, contact: item.MDHS_TELNO || "정보 없음", rcritPblancDe: pblancDisplay, rceptBgnde: subDisplay, przwnerPresnatnDe: item.PRZWNER_PRESNATN_DE || item.przwner_presnatn_de || "-" }
        });
      }
    });
    if (type === "competition") list.sort((a, b) => b.rawCompRate - a.rawCompRate);
    else list.sort((a, b) => {
      if (a.rawSubDate === "일정 미정" || !a.rawSubDate) return 1;
      if (b.rawSubDate === "일정 미정" || !b.rawSubDate) return -1;
      return a.rawSubDate.localeCompare(b.rawSubDate);
    });
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
  const [notices, setNotices] = useState<Notice[]>([]);
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

  const [activeRegion, setActiveRegion] = useState("전국");
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [viewMode, setViewMode] = useState<'gallery' | 'map'>('gallery');

  const [currentPage, setCurrentPage] = useState(1);

  // 🚀 [신규 추가] 디바이스 크기에 따라 페이지당 매물 개수를 동적으로 결정하는 상태
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [needleRotation, setNeedleRotation] = useState(-90);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [isMapReady, setIsMapReady] = useState(false);

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // 🚀 [신규 추가] 화면 크기 감지 및 ItemsPerPage 동적 조절 (모바일: 5개, PC: 8개)
  useEffect(() => {
    const updateItemsPerPage = () => {
      // 768px(모바일) 미만이면 5개, 이상(태블릿/PC)이면 8개
      setItemsPerPage(window.innerWidth < 768 ? 5 : 8);
    };

    // 초기 로드 시 1회 실행
    updateItemsPerPage();

    // 창 크기 조절 시 실시간 반응
    window.addEventListener("resize", updateItemsPerPage);
    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSearchQuery("");
    setActiveFilter("전체");
    setActiveRegion("전국");
    setIsFilterApplied(false);
    setCurrentPage(1);
    setViewMode('gallery');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMapLoad = useCallback(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        setIsMapReady(true);
      });
    }
  }, []);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      setIsMapReady(true);
    }
  }, []);

  const fetchApartmentHistory = useCallback(async (aptName: string, lawdCd: string) => {
    setIsHistoryLoading(true); setHistoryData([]); setActiveIndex(null);
    try {
      const now = new Date();
      const requests = [];
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
        requests.push(fetch(`/api/molit?lawdCd=${lawdCd}&dealYmd=${monthStr}`).then(res => res.text()));
      }
      const xmlResults = await Promise.all(requests);
      const allItems: any[] = [];
      const parser = new DOMParser();
      const searchKey = aptName.split('(')[0].split(' ')[0].replace(/[0-9]/g, "").trim();

      xmlResults.forEach(xml => {
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const items = xmlDoc.getElementsByTagName("item");
        Array.from(items).forEach((item: any) => {
          const currentApt = item.getElementsByTagName("aptNm")[0]?.textContent || "";
          if (currentApt.includes(searchKey) || searchKey.includes(currentApt)) {
            allItems.push({
              price: parseInt((item.getElementsByTagName("dealAmount")[0]?.textContent || "0").replace(/,/g, "")),
              date: `${item.getElementsByTagName("dealYear")[0]?.textContent}.${item.getElementsByTagName("dealMonth")[0]?.textContent.padStart(2, '0')}`
            });
          }
        });
      });

      if (allItems.length === 0) return;
      const monthlyAvg: any = {};
      allItems.forEach(it => {
        if (!monthlyAvg[it.date]) monthlyAvg[it.date] = { sum: 0, count: 0 };
        monthlyAvg[it.date].sum += it.price; monthlyAvg[it.date].count += 1;
      });
      const chartData = Object.keys(monthlyAvg).sort().map(date => ({ date: date.substring(2), price: Math.round(monthlyAvg[date].sum / monthlyAvg[date].count) }));
      setHistoryData(chartData);
    } catch (e) { console.error(e); } finally { setIsHistoryLoading(false); }
  }, []);

  useEffect(() => {
    if (selectedItem?.type === "transaction" && selectedItem.lawdCd) {
      fetchApartmentHistory(selectedItem.title, selectedItem.lawdCd);
    }
  }, [selectedItem, fetchApartmentHistory]);

  useEffect(() => {
    const processAuth = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single();
        if (profile) { setUserProfile(profile); if (profile.nickname === 'Guest') router.push('/welcome'); }
      } else { setUser(null); setUserProfile(null); }
    };
    processAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') processAuth();
    });
    return () => authListener.subscription.unsubscribe();
  }, [router]);

  const [bottomOffset, setBottomOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY; const windowHeight = window.innerHeight; const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = documentHeight - (scrollY + windowHeight);
      if (scrollBottom < 200) setBottomOffset(200 - scrollBottom); else setBottomOffset(0);
    };
    window.addEventListener("scroll", handleScroll); handleScroll(); return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (notices.length === 0) return;
    const interval = setInterval(() => { setIsTransitioning(true); setTickerIndex((prev) => prev + 1); }, 3000);
    return () => clearInterval(interval);
  }, [notices]);

  useEffect(() => {
    if (notices.length === 0) return;
    if (tickerIndex === notices.length) {
      const timeout = setTimeout(() => { setIsTransitioning(false); setTickerIndex(0); }, 800);
      return () => clearTimeout(timeout);
    }
  }, [tickerIndex, notices.length]);

  useEffect(() => {
    async function loadData() {
      try {
        const p = await getPropertiesFromSheet();
        setProperties(p);
        setFilteredProperties(p);

        const { data: noticeData, error } = await supabase
          .from('notices')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (!error && noticeData) {
          setNotices(noticeData);
        }
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

    if (activeFilter !== "전체") {
      result = result.filter(p => p.status.includes(activeFilter));
    }

    if (activeRegion !== "전국") {
      const regionKeywords: Record<string, string[]> = {
        "서울": ["서울"], "경기": ["경기"], "인천": ["인천"], "부산": ["부산"],
        "대전": ["대전"], "대구": ["대구"], "광주": ["광주"], "세종": ["세종"], "울산": ["울산"],
        "강원": ["강원"],
        "충북": ["충북", "충청북도"], "충남": ["충남", "충청남도"],
        "전북": ["전북", "전라북도", "전북특별자치도"], "전남": ["전남", "전라남도"],
        "경북": ["경북", "경상북도"], "경남": ["경남", "경상남도"],
        "제주": ["제주"]
      };
      const keywords = regionKeywords[activeRegion] || [activeRegion];
      result = result.filter(p => keywords.some(kw => p.location.includes(kw)));
    }

    if (searchQuery) {
      result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()));
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }

    setFilteredProperties(result);
    setCurrentPage(1);
  }, [searchQuery, activeFilter, activeRegion, properties]);

  // 🚀 [신규 추가] 아이템 수나 필터가 변해서 전체 페이지가 줄어들 때, 현재 페이지 보정
  useEffect(() => {
    const total = Math.ceil(filteredProperties.length / itemsPerPage);
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
  }, [filteredProperties.length, itemsPerPage, currentPage]);

  const rankingList = properties.slice(0, 6);
  const sentiment = SENTIMENT_DATA[sentimentRegion] || SENTIMENT_DATA["전국 평균"];

  const isSearchActive = isSearching || (isFilterApplied && activeFilter !== "전체");

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const currentProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden selection:bg-orange-100">
      <Script
        strategy="afterInteractive"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`}
        onLoad={handleMapLoad}
      />
      <WelcomePopup />
      <Link href="https://pro.aparty.co.kr" target="_blank" className="fixed right-4 md:right-10 bottom-[92px] md:bottom-[115px] z-[90] group flex items-center justify-end transition-transform duration-75 ease-out" style={{ transform: `translateY(-${bottomOffset}px)` }}>
        <div className="hidden md:block mr-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-[#4A403A] text-white text-[12px] font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl transition-all">분양상담사 전용 <ChevronRight size={12} className="inline ml-1" /></div>
        <div className="relative w-14 h-14 bg-white rounded-full shadow-lg border border-orange-100 flex items-center justify-center hover:scale-110 hover:border-[#FF8C42] transition-all">
          <Image src="/agent-icon.png" alt="PRO" width={32} height={32} className="object-contain" />
          <div className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">PRO</div>
        </div>
      </Link>

      <header className="w-full max-w-6xl flex justify-between items-center mt-4 md:mt-6 mb-4 md:mb-6 px-5 md:px-6">
        <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2 group cursor-pointer">
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300"><Image src="/logo.png" alt="아파티" fill className="object-contain" /></div>
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-lg md:text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">APARTY</h1>
            <span className="text-[9px] md:text-[10px] font-medium text-gray-400 leading-none">No. 1 부동산 분양 정보 플랫폼</span>
          </div>
        </Link>
        <LoginButton />
      </header>

      <div className="w-full max-w-6xl px-4 md:px-6 text-center mt-2 md:mt-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-[#4a403a] leading-tight mb-4 tracking-tight">지금 가장 핫한 <br className="md:hidden" /><span className="text-orange-500 font-bold">선착순 분양단지</span>는?</h1>

        {notices.length > 0 && (
          <div className="w-full max-w-xl mx-auto mb-6 relative flex flex-col items-center justify-start overflow-hidden h-[24px] cursor-pointer group z-20">
            <div className="flex flex-col w-full" style={{ transform: `translateY(-${tickerIndex * 24}px)`, transition: isTransitioning ? 'transform 800ms ease-in-out' : 'none' }}>
              {[...notices, notices[0]].map((notice, index) => (
                <div key={index} className="h-[24px] w-full flex items-center justify-center shrink-0 truncate text-[14px] font-bold text-gray-600 text-center"><Link href="/notice" className="flex items-center justify-center"><span className="text-[#FF8C42] mr-2 text-[12px] font-black flex items-center gap-1"><Megaphone size={12} className="animate-pulse" />공지</span>{notice.title}</Link></div>
              ))}
            </div>
          </div>
        )}

        <div className="relative w-full max-w-xl mx-auto mb-3 md:mb-4 group mt-4 z-20 shadow-md rounded-[24px]">
          <input type="text" placeholder="어떤 지역, 단지를 찾으세요? (ex: 아이파크)" className="w-full px-5 py-3 md:py-4 pr-16 rounded-[24px] border border-gray-100 focus:ring-4 focus:ring-orange-100 text-[14px] md:text-[15px] font-bold outline-none bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery ? (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center"><X size={18} /></button>) : (<button className="absolute right-3 top-2.5 bottom-2.5 w-10 md:w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center"><Search size={20} /></button>)}
        </div>

        <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center gap-2 mb-4 md:mb-6 px-2 py-2 w-full">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setIsFilterApplied(true);
              }}
              className={`shrink-0 px-4 py-1.5 md:px-5 md:py-2 rounded-full font-bold text-[11px] md:text-[12px] transition-all whitespace-nowrap ${activeFilter === filter && isFilterApplied ? "bg-[#4a403a] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100 hover:text-[#FF8C42]"}`}
            >
              {filter === "전체" ? "전체보기" : `#${filter}`}
            </button>
          ))}
        </div>

        {!isSearchActive && activeRegion === "전국" && (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5 w-full max-w-7xl text-left mb-6 md:mb-8 px-4 items-stretch">
              <div className="md:col-span-3">
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="p-4 md:p-5 border-b border-gray-50 flex items-center gap-2 shrink-0"><TrendingUp size={16} className="text-[#FF8C42]" strokeWidth={2.5} /><h3 className="text-[12px] md:text-[13px] font-black text-[#4A403A]">부동산 종합 지표</h3></div>
                  <div className="p-4 flex flex-col flex-1 gap-1 overflow-hidden relative justify-between">
                    <div className="animate-in fade-in slide-in-from-right-full duration-700 w-full text-center flex flex-col flex-1 justify-between" key={sentimentRegion}>
                      <div className="relative w-36 h-18 md:w-48 md:h-24 mx-auto overflow-hidden mb-2 mt-2">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
                          <defs><linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="50%" stopColor="#10B981" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * Math.min(sentiment.score, 150) / 150)} className="transition-all duration-1000 ease-out" />
                          {[0, 25, 50, 75, 100, 125, 150].map((tick) => {
                            const angle = (tick / 150) * 180 - 180; const rad = (angle * Math.PI) / 180;
                            const x1 = 50 + 32 * Math.cos(rad); const y1 = 50 + 32 * Math.sin(rad); const x2 = 50 + 37 * Math.cos(rad); const y2 = 50 + 37 * Math.sin(rad);
                            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9CA3AF" strokeWidth="1" />;
                          })}
                        </svg>
                        <div className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out flex flex-col items-center justify-end z-20" style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)`, height: '85%', width: '20px' }}>
                          <div className="w-1.5 h-[80%] bg-gradient-to-t from-[#4A403A] to-gray-400 rounded-t-full shadow-sm relative z-10"></div>
                          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#4A403A] rounded-full border-[2.5px] border-white shadow-md z-20"></div>
                        </div>
                      </div>
                      <div className="mb-2"><span className="text-xl md:text-2xl font-black text-[#4A403A]">{sentiment.score}</span><p className={`text-[9px] md:text-[10px] font-black mt-0.5 ${sentiment.score > 100 ? 'text-red-500' : 'text-blue-500'}`}>{sentiment.status}</p></div>
                      <div className="bg-gray-50 py-1.5 mx-8 md:mx-4 rounded-xl mb-3"><p className="text-[11px] md:text-[13px] font-black text-[#4A403A]">{sentimentRegion}</p></div>
                      <div className="w-full pt-1 flex-1 flex flex-col border-t border-gray-100">
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black text-gray-600 px-1 mb-1 mt-2"><span className="flex items-center gap-1"><Info size={11} /> 5주 투자심리 추이</span><span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">기준: 100</span></div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[80px] md:min-h-[100px] flex items-center justify-center mt-1">
                          {(() => {
                            const trendData = sentiment.trend; const PADDING_X = 15; const PADDING_Y_TOP = 25; const PADDING_Y_BOTTOM = 20; const W = 200; const H = 100;
                            const innerW = W - PADDING_X * 2; const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;
                            const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW; const getY = (val: number) => PADDING_Y_TOP + innerH - (val / 150) * innerH;
                            const pathData = trendData.map((v, i) => `${getX(i)},${getY(v)}`).join(" L ");
                            return (
                              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                <defs><linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FF8C42" stopOpacity="0.3" /><stop offset="100%" stopColor="#FF8C42" stopOpacity="0.0" /></linearGradient></defs>
                                <line x1={0} y1={getY(100)} x2={W} y2={getY(100)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3" />
                                <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#areaGradient)" />
                                <path d={`M ${pathData}`} fill="none" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                {trendData.map((v: number, i: number) => (
                                  <g key={i}>
                                    <circle cx={getX(i)} cy={getY(v)} r={i === trendData.length - 1 ? "3.5" : "2.5"} fill={i === trendData.length - 1 ? "#FF8C42" : "white"} stroke={i === trendData.length - 1 ? "white" : "#FF8C42"} strokeWidth="1.5" />
                                    <text x={getX(i)} y={getY(v) - 8} textAnchor="middle" fontSize={i === trendData.length - 1 ? "11" : "9"} fontWeight="bold" fill={i === trendData.length - 1 ? "#EF4444" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke">{v}</text>
                                    <text x={getX(i)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">{sentiment.labels[i].replace("'", "")}</text>
                                  </g>
                                ))}
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                      <div className="w-full pt-3 mt-4 border-t border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black text-gray-600 px-1 mb-1 mt-1"><span className="flex items-center gap-1"><BarChart3 size={11} /> 월별 미분양 증가 지수</span><span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">단위: Pt</span></div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[80px] md:min-h-[100px] flex items-center justify-center mt-1">
                          {(() => {
                            const trendData = sentiment.unsoldTrend; const PADDING_X = 15; const PADDING_Y_TOP = 25; const PADDING_Y_BOTTOM = 20; const W = 200; const H = 100;
                            const innerW = W - PADDING_X * 2; const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;
                            const maxVal = Math.max(...trendData, 50) * 1.2;
                            const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW; const getY = (val: number) => PADDING_Y_TOP + innerH - (val / maxVal) * innerH;
                            const pathData = trendData.map((v, i) => `${getX(i)},${getY(v)}`).join(" L ");
                            return (
                              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                <defs><linearGradient id="unsoldAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" /></linearGradient></defs>
                                <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#unsoldAreaGradient)" />
                                <path d={`M ${pathData}`} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                {trendData.map((v: number, i: number) => (
                                  <g key={i}>
                                    <circle cx={getX(i)} cy={getY(v)} r={i === trendData.length - 1 ? "3.5" : "2.5"} fill={i === trendData.length - 1 ? "#3B82F6" : "white"} stroke={i === trendData.length - 1 ? "white" : "#3B82F6"} strokeWidth="1.5" />
                                    <text x={getX(i)} y={getY(v) - 8} textAnchor="middle" fontSize={i === trendData.length - 1 ? "11" : "9"} fontWeight="bold" fill={i === trendData.length - 1 ? "#1D4ED8" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke">{v}</text>
                                    <text x={getX(i)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">{sentiment.labels[i].replace("'", "")}</text>
                                  </g>
                                ))}
                              </svg>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-8 flex flex-col h-full overflow-hidden">
                <div className="grid grid-cols-2 md:flex bg-gray-50 rounded-xl p-1 mb-4 md:mb-5 shrink-0 gap-1">
                  <button onClick={() => setDashboardTab("transaction")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400"}`}><Activity className="w-3.5 h-3.5 md:w-4 md:h-4" /> 실거래가</button>
                  <button onClick={() => setDashboardTab("competition")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400"}`}><Trophy className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약경쟁률</button>
                  <button onClick={() => setDashboardTab("calendar")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}><CalendarDays className="w-3.5 h-3.5 md:w-4 md:h-4" /> 청약일정</button>
                  <button onClick={() => setDashboardTab("population")} className={`w-full md:flex-1 py-2 md:py-2.5 rounded-lg text-[11px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400"}`}><Users2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> 인구유입</button>
                </div>
                <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-1.5 mb-4 md:mb-6 pb-1 w-full">
                  {Object.keys(REGION_CODES).map(region => (<button key={region} onClick={() => setDashboardRegion(region)} className={`shrink-0 whitespace-nowrap px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-[11px] font-extrabold transition-all ${dashboardRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-400 border border-gray-100"}`}>{region}</button>))}
                </div>
                <div className="flex-1 min-h-[300px] md:min-h-[380px] flex flex-col">
                  {isApiLoading ? (<div className="h-full flex flex-col items-center justify-center opacity-50 flex-1"><RefreshCcw className="animate-spin text-[#FF8C42] mb-2" size={24} /></div>) : (
                    <div className="space-y-3 md:space-y-3.5 animate-in fade-in duration-500 flex-1">
                      {apiData.length > 0 ? apiData.map((item, idx) => (
                        <div key={idx} onClick={() => { if (item.type) setSelectedItem(item); }} className="flex justify-between items-center border-b border-gray-50 pb-2 md:pb-3 cursor-pointer hover:bg-orange-50/50 rounded-lg px-2 transition-colors">
                          <div className="max-w-[70%] text-left">
                            <div className="flex items-center gap-1.5 mb-0.5"><p className="text-[13px] md:text-[15px] font-bold text-[#4A403A] truncate">{item.title}</p><span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-white border border-gray-100 px-1 py-0.5 rounded shrink-0">{item.addr}</span></div>
                            <p className="text-[10px] md:text-[11px] text-gray-400 font-medium truncate">{item.sub} {item.date && `· ${item.date}`}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2"><p className={`text-[13px] md:text-[16px] font-black ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>{item.val}</p></div>
                        </div>
                      )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">데이터를 불러오지 못했습니다.</p>}
                    </div>
                  )}
                  {apiData.length > 0 && (
                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 flex items-center justify-between border-t border-gray-50">
                      <span className="text-[9px] md:text-[11px] font-bold text-gray-300">자료출처: {dashboardTab === "transaction" ? "국토교통부 실거래가" : dashboardTab === "population" ? "국가통계포털(KOSIS)" : "한국부동산원 (청약홈)"}</span>
                      <Link href={`/more/${dashboardTab}`} className="flex items-center gap-1 text-[11px] md:text-[12px] font-bold text-gray-400 hover:text-[#FF8C42] transition-colors">전체보기 <ChevronRight size={14} strokeWidth={3} /></Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col h-full">
                  <h3 className="text-[12px] md:text-[13px] font-black text-[#4A403A] mb-3 md:mb-4 flex items-center gap-2 border-b border-gray-50 pb-2 md:pb-3 shrink-0"><Trophy size={16} className="text-[#FF8C42]" /> 인기랭킹</h3>
                  <div className="flex flex-col gap-3 md:gap-3.5">{rankingList.map((prop, idx) => (<Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-2 group py-0.5"><span className={`text-[11px] md:text-[13px] font-black w-3 shrink-0 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span><span className="text-[11px] md:text-[12px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] truncate transition-colors leading-tight">{prop.title}</span></Link>))}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3 w-full max-w-6xl mb-8 md:mb-12 px-4">
              <Link href="/tools/tax" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calculator size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">취득세</span></Link>
              <Link href="/tools/loan" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Landmark size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">대출이자</span></Link>
              <Link href="/tools/yield" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><BarChart3 size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">수익률</span></Link>
              <Link href="/tools/score" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Trophy size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">청약가점</span></Link>
              <Link href="/tools/convert" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><RefreshCcw size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">평형변환</span></Link>
              <Link href="/tools/checklist" className="flex flex-col items-center gap-1.5 md:gap-2 p-3 md:p-4 bg-white border border-gray-100 rounded-[16px] md:rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-8 h-8 md:w-10 md:h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><CalendarDays size={16} className="md:w-5 md:h-5" /></div><span className="text-[10px] md:text-[12px] font-black text-[#4A403A]">체크리스트</span></Link>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-6xl px-4 mb-8 md:mb-10">
              <Link href="/notice" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden"><div className="flex items-center gap-2 md:gap-4 z-10 min-w-0"><div className="w-8 h-8 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"><Megaphone size={14} /></div><div className="text-left min-w-0"><h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">공지사항</h3><p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight leading-tight">공지 확인</p></div></div><ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors z-10 shrink-0" size={14} /><div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-blue-100/60 transition-colors"></div></Link>
              <Link href="/community" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-[#FF5A00] hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden"><div className="flex items-center gap-2 md:gap-4 z-10 min-w-0"><div className="w-8 h-8 md:w-12 md:h-12 bg-orange-50 text-[#FF5A00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"><MessageSquare size={14} /></div><div className="text-left min-w-0"><h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">라운지</h3><p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight leading-tight">소통 공간</p></div></div><ChevronRight className="text-gray-300 group-hover:text-[#FF5A00] transition-colors z-10 shrink-0" size={14} /><div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-orange-100 transition-colors"></div></Link>
            </div>

            <div className="w-full max-w-5xl mb-6 md:mb-12 px-4 md:px-6">
              <div className="relative w-full rounded-[20px] md:rounded-[32px] overflow-hidden shadow-md md:shadow-2xl flex flex-row items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-8 group text-left bg-black">
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60 md:opacity-80"><source src="/vip-bg.mp4" type="video/mp4" /></video>
                <div className="absolute inset-0 bg-black/40 z-0"></div>
                <div className="relative z-10 flex-1 pr-3"><h3 className="text-[13px] sm:text-[16px] md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tighter">누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔</h3><p className="text-[9.5px] sm:text-[12px] md:text-[15px] text-white/70 font-bold mt-0.5 md:mt-1.5 leading-tight">로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.</p></div>
                <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-7 md:py-3.5 rounded-lg md:rounded-[16px] shadow-lg hover:scale-105 transition-all flex items-center gap-1 md:gap-2 shrink-0"><svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-6 md:h-6"><path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" /></svg><span className="text-[10px] sm:text-[12px] md:text-[15px]">채널추가</span></Link>
              </div>
            </div>
          </div>
        )}

        <section className="w-full max-w-6xl mb-12 md:mb-24 px-4 md:px-6 mt-0 md:mt-2 text-left">

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-4 gap-3 z-30 relative w-full">

            <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
              <h2 className="text-[15px] md:text-[18px] font-black text-[#4a403a] flex items-center gap-1.5 shrink-0 pr-2">
                {isSearchActive && activeFilter !== "전체" && !searchQuery ? (
                  <><Search className="text-[#FF8C42] w-4 h-4 md:w-5 md:h-5" /> #{activeFilter} 단지 <span className="text-[#FF8C42] ml-0.5">{filteredProperties.length}건</span></>
                ) : isSearchActive && searchQuery ? (
                  <><Search className="text-[#FF8C42] w-4 h-4 md:w-5 md:h-5" /> '{searchQuery}' 결과 <span className="text-[#FF8C42] ml-0.5">{filteredProperties.length}건</span></>
                ) : (
                  <><Sparkles className="text-orange-500 w-4 h-4 md:w-5 md:h-5" /> 오늘의 추천단지</>
                )}
              </h2>

              <div className="flex items-center justify-between w-full md:w-auto gap-2">
                {!isSearching && (
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setIsRegionOpen(!isRegionOpen)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-md font-bold text-[11px] md:text-[12px] transition-all border ${isRegionOpen || activeRegion !== "전국" ? 'bg-[#FF8C42] text-white border-[#FF8C42] shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-[#FF8C42] hover:text-[#FF8C42]'}`}
                    >
                      <MapPin size={13} className={isRegionOpen || activeRegion !== "전국" ? "text-white" : "text-gray-400"} />
                      {activeRegion === "전국" ? "전국" : activeRegion.substring(0, 2)}
                      <ChevronDown size={13} className={`transition-transform duration-200 ${isRegionOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isRegionOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsRegionOpen(false)}></div>
                        <div className="absolute left-0 top-full mt-2 w-[85vw] max-w-[320px] md:w-[340px] bg-white rounded-[24px] shadow-2xl border border-gray-100 p-4 md:p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2">
                            <span className="text-[12px] md:text-[14px] font-black text-[#4A403A]">어디를 찾으시나요?</span>
                            <button onClick={() => setIsRegionOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full"><X size={14} /></button>
                          </div>

                          <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-hide pb-2">
                            {REGION_GROUPS.map((group, idx) => (
                              <div key={idx}>
                                {group.label !== "전체" && <div className="text-[10px] md:text-[11px] font-bold text-gray-400 mb-2 pl-1">{group.label}</div>}
                                <div className="flex flex-wrap gap-1.5 md:gap-2">
                                  {group.regions.map(r => (
                                    <button
                                      key={r}
                                      onClick={() => { setActiveRegion(r); setIsRegionOpen(false); }}
                                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[11px] md:text-[12px] font-bold transition-all border ${activeRegion === r ? 'bg-[#4A403A] text-white border-[#4A403A] shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-orange-50 hover:border-orange-200 hover:text-[#FF8C42]'}`}
                                    >
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="md:hidden bg-gray-100 p-1 rounded-lg flex items-center shrink-0 shadow-inner">
                  <button
                    onClick={() => setViewMode('gallery')}
                    className={`px-3 py-1 rounded-md font-black text-[11px] transition-all flex items-center gap-1.5 ${viewMode === 'gallery' ? 'bg-white text-[#4A403A] shadow-sm' : 'text-gray-400 hover:text-[#4A403A]'}`}
                  >
                    <Building size={14} /> 갤러리
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-3 py-1 rounded-md font-black text-[11px] transition-all flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-white text-[#4A403A] shadow-sm' : 'text-gray-400 hover:text-[#4A403A]'}`}
                  >
                    <Map size={14} /> 지도
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden md:flex bg-gray-100 p-1.5 rounded-lg items-center shrink-0 shadow-inner">
              <button
                onClick={() => setViewMode('gallery')}
                className={`px-4 py-1.5 rounded-md font-black text-[12px] transition-all flex items-center gap-1.5 ${viewMode === 'gallery' ? 'bg-white text-[#4A403A] shadow-sm' : 'text-gray-400 hover:text-[#4A403A]'}`}
              >
                <Building size={14} /> 갤러리
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-1.5 rounded-md font-black text-[12px] transition-all flex items-center gap-1.5 ${viewMode === 'map' ? 'bg-white text-[#4A403A] shadow-sm' : 'text-gray-400 hover:text-[#4A403A]'}`}
              >
                <Map size={14} /> 지도
              </button>
            </div>
          </div>

          <div className="w-full min-h-[500px]">
            {viewMode === 'map' ? (
              isMapReady ? (
                <MainMapExplorer properties={properties} searchQuery={searchQuery} activeFilter={activeFilter} />
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-3xl text-gray-400 font-bold animate-pulse text-sm">지도를 불러오는 중...</div>
              )
            ) : (
              <div className="animate-in fade-in duration-500 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-2">
                  {currentProperties.length > 0 ? (
                    currentProperties.map((p) => (<PropertyCard key={p.id} {...p} />))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100">
                      <Search size={40} className="text-gray-200 mb-3" />
                      <p className="font-bold text-[14px] md:text-[16px] text-[#4A403A]">조건에 맞는 현장이 없습니다.</p>
                      <p className="text-[11px] md:text-[13px] mt-1">다른 지역이나 단지명으로 검색해보세요.</p>
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 md:mt-12 mb-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-[200px] sm:max-w-none px-1 py-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-9 h-9 shrink-0 rounded-xl font-bold text-[13px] transition-all ${currentPage === i + 1 ? 'bg-[#4A403A] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-[#4A403A]'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </section>

        {!isSearchActive && activeRegion === "전국" && (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">
            <div className="w-full max-w-5xl mb-24 px-4 md:px-6">
              <div className="relative w-full rounded-[20px] md:rounded-[32px] overflow-hidden shadow-sm border border-orange-100 flex flex-row items-center justify-between p-3.5 sm:p-5 md:px-10 md:py-8 group text-left bg-gradient-to-r from-[#FFF5F0] to-white hover:shadow-md transition-all">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex-1 pr-2 flex items-center gap-2.5 md:gap-5 min-w-0">
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-orange-100 text-[#FF8C42]"><Gift className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} /></div>
                  <div className="min-w-0"><h3 className="text-[12px] sm:text-[14px] md:text-2xl font-black text-[#4A403A] mb-0.5 md:mb-1.5 tracking-tight truncate">활동하고 <span className="text-[#FF8C42]">아파티 포인트</span> 받자!</h3><p className="text-[9px] sm:text-[11px] md:text-[14px] text-gray-400 font-bold leading-tight truncate">출석체크, 글쓰기로 포인트 모으고 다양한 혜택으로 교환해 보세요.</p></div>
                </div>
                <Link href="/point" className="relative z-10 bg-[#FF8C42] text-white font-black px-3 py-2 md:px-6 md:py-3.5 rounded-xl transition-all shrink-0 text-[11px] md:text-[15px]">포인트 받기</Link>
              </div>
            </div>
            <NewsSection />
          </div>
        )}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => { setSelectedItem(null); setActiveIndex(null); }}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#4A403A] p-6 flex justify-between items-center text-white">
              <h3 className="font-black text-lg truncate pr-4">{selectedItem.type === "transaction" ? "단지 실거래 분석" : "공급 상세 내역"}</h3>
              <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-7 max-h-[80vh] overflow-y-auto scrollbar-hide">
              <h4 className="text-2xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
              <p className="text-sm font-bold text-[#FF8C42] mb-6 flex items-center gap-1"><MapPin size={14} /> {selectedItem.details?.fullAddr || selectedItem.addr}</p>

              {selectedItem.type === "transaction" && (
                <div className="mb-8 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-[13px] font-black text-gray-700 flex items-center gap-1.5"><TrendingUp size={16} className="text-blue-500" /> 최근 1년 실거래 추이</h5>
                    <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">단위: 만원</span>
                  </div>
                  <div className="h-6 mb-3 flex items-center justify-center">
                    {activeIndex !== null && historyData[activeIndex] ? (
                      <div className="animate-in fade-in zoom-in duration-200 flex items-center gap-2">
                        <span className="text-[11px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{historyData[activeIndex].date}</span>
                        <span className="text-[14px] font-black text-[#4A403A]">{historyData[activeIndex].price.toLocaleString()}만원</span>
                      </div>
                    ) : historyData.length > 0 && (
                      <span className="text-[10px] text-gray-300 font-bold">그래프의 점을 클릭해 정확한 가격을 확인하세요!</span>
                    )}
                  </div>
                  {isHistoryLoading ? (
                    <div className="h-[120px] flex flex-col items-center justify-center text-gray-400 text-[11px] animate-pulse">
                      <RefreshCcw size={20} className="animate-spin mb-2" />데이터 분석 중...
                    </div>
                  ) : historyData.length > 1 ? (
                    <div className="relative w-full h-[130px] mt-2">
                      <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                        <line x1="0" y1="0" x2="300" y2="0" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                        <line x1="0" y1="100" x2="300" y2="100" stroke="#f1f1f1" strokeWidth="1" strokeDasharray="3,3" />
                        {(() => {
                          const minPrice = Math.min(...historyData.map(d => d.price));
                          const maxPrice = Math.max(...historyData.map(d => d.price));
                          const range = maxPrice - minPrice || 1000;
                          const points = historyData.map((d, i) => {
                            const x = (i / (historyData.length - 1)) * 300;
                            const y = 100 - ((d.price - minPrice) / range) * 80 - 10;
                            return `${x},${y}`;
                          }).join(" ");
                          return (
                            <>
                              <path d={`M ${points}`} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                              {historyData.map((d, i) => {
                                const x = (i / (historyData.length - 1)) * 300;
                                const y = 100 - ((d.price - minPrice) / range) * 80 - 10;
                                const isActive = activeIndex === i;
                                return (
                                  <g key={i} onClick={() => setActiveIndex(i)} className="cursor-pointer group">
                                    {isActive && <line x1={x} y1="0" x2={x} y2="100" stroke="#3B82F6" strokeWidth="1" strokeDasharray="2,2" />}
                                    <circle cx={x} cy={y} r={isActive ? "6" : "3.5"} fill={isActive ? "#3B82F6" : "white"} stroke="#3B82F6" strokeWidth="2.5" className="transition-all" />
                                    <circle cx={x} cy={y} r="15" fill="transparent" />
                                    <text x={x} y={120} textAnchor="middle" fontSize="9" fill={isActive ? "#3B82F6" : "#9CA3AF"} fontWeight={isActive ? "900" : "bold"}>{d.date}</text>
                                  </g>
                                );
                              })}
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  ) : (<div className="h-[120px] flex items-center justify-center text-gray-400 text-[11px] italic">거래 데이터가 분석 중이거나 이력이 적습니다.</div>)}
                </div>
              )}

              <div className="space-y-4">
                {selectedItem.type === "transaction" ? (
                  <>
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 최근 실거래가</span><span className="font-black text-xl text-[#FF8C42]">{selectedItem.val}</span></div>
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.fullDate || selectedItem.date || "-"}</span></div>
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 연식 / 층수</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.buildYear}년 / {selectedItem.details?.floor}층</span></div>
                    <div className="flex justify-between items-center py-3.5 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><TrendingUp size={16} /> 전용면적</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.area}㎡</span></div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span><span className="font-black text-blue-500">{selectedItem.val}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 모집공고일</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.rcritPblancDe || "-"}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 공급세대</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.totHshld}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details?.contact}</span></div>
                  </>
                )}
              </div>
              <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="w-full mt-10 py-4 bg-[#4A403A] text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">확인</button>
            </div>
          </div>
        </div>
      )}
      <ChatBot />
    </main>
  );
}