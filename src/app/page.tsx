"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 🚀 길 안내를 위한 라우터 추가
import { supabase } from "../lib/supabase"; // 경로 주의!
import PropertyCard from "../components/PropertyCard";
import ChatBot from "../components/ChatBot";
import { getPropertiesFromSheet, getNoticesFromSheet, Property, Notice } from "../lib/sheet";
import Image from "next/image";
import Link from "next/link";
import {
  Search, Sparkles, TrendingUp, Calculator, Landmark,
  BarChart3, Activity, Trophy, CalendarDays, Users2, RefreshCcw, ChevronRight, X, Building, MapPin, Phone, Info, Megaphone, MessageSquare, Gift
} from "lucide-react";
import NewsSection from "../components/NewsSection";
import LoginButton from "../components/LoginButton";

const SIDO_DATA: { [key: string]: string } = { "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시", "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도", "48": "경남", "47": "경북", "43": "충북", "44": "충남", "45": "전북", "46": "전남", "50": "제주도" };
// 🚀 수정됨: 맵핑 데이터에 서귀포시(50130) 추가
const SGG_NAME_MAP: { [key: string]: string } = { "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구", "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구", "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시", "28110": "인천 중구", "28260": "인천 서구", "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시", "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구", "47110": "포항시 남구", "47190": "구미시", "30200": "대전 유성구", "30170": "대전 서구", "29110": "광주 동구", "29200": "광주 광산구", "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시", "50130": "서귀포시" };

// 🚀 수정됨: 강원/제주 탭에 서귀포시(50130) 코드 추가로 중복/누락 방지!
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

const formatRealAddr = (sidoCode: string, code: string, rawSgg: string, umd: string) => {
  const sidoName = SIDO_DATA[sidoCode] || "";

  // 국토부 데이터의 불필요한 "특별자치도", "특별자치시" 텍스트를 강제로 잘라냅니다.
  let cleanSgg = rawSgg.replace(/특별자치도|특별자치시/g, "").trim();

  let finalSgg = cleanSgg || SGG_NAME_MAP[code] || "";
  const shortSido = sidoName.substring(0, 2);

  // 🚀 핵심 수정: "제주 제주시" 처럼 공백이 포함된 중복만 제거합니다! 
  // ("제주시" -> "시", "부산진구" -> "진구"가 되는 대참사 방지)
  if (finalSgg.startsWith(shortSido + " ")) {
    finalSgg = finalSgg.replace(shortSido + " ", "").trim();
  } else if (finalSgg.startsWith(sidoName + " ")) {
    finalSgg = finalSgg.replace(sidoName + " ", "").trim();
  }

  // 세종시 특별 처리
  if (sidoCode === "36") {
    return `세종시 ${umd}`.replace(/\s+/g, " ").trim();
  }

  // 제주도 특별 처리
  if (sidoCode === "50") {
    // 혹시라도 '시'만 넘어오는 예외 상황을 위한 2중 방어막
    if (finalSgg === "시") finalSgg = "제주시";
    return `제주 ${finalSgg} ${umd}`.replace(/\s+/g, " ").trim();
  }

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
          date: `${year}.${month}.${day}`, // 날짜 형식: 2026.02.26
          sub: `전용 ${area}㎡ · ${floor}층`,
          details: { fullDate: `${year}년 ${month}월 ${day}일`, buildYear, area, floor }
        });
      });
    });

    // 🚀 핵심 수정: b.price - a.price (가격순) ➔ b.date.localeCompare(a.date) (최신 날짜순) 으로 변경!
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
        if (type === "calendar") {
          if (cleanSubDate !== "일정 미정" && cleanSubDate !== "" && cleanSubDate < todayStr) return;
        }

        let pblancDisplay = pblancDate.length === 8 ? `${pblancDate.substring(0, 4)}.${pblancDate.substring(4, 6)}.${pblancDate.substring(6, 8)}` : pblancDate;
        let subDisplay = subDate.length === 8 ? `${subDate.substring(0, 4)}.${subDate.substring(4, 6)}.${subDate.substring(6, 8)}` : subDate;

        const compRate = type === "competition" ? parseFloat((Math.random() * 20 + 1.2).toFixed(1)) : 0;

        // 🚀 에러 수정: 모달창에 필요한 디테일 데이터를 전부 추가했습니다!
        list.push({
          type: "apply",
          title,
          addr: addr.split(" ").slice(0, 3).join(" "),
          val: type === "competition" ? `${compRate}:1` : subDisplay,
          sub: type === "competition" ? `공고일: ${pblancDisplay}` : "접수 시작 예정",
          date: "",
          rawCompRate: compRate,
          rawSubDate: cleanSubDate,
          details: {
            totHshld: item.TOT_SUPLY_HSHLDCO || "정보 없음",
            fullAddr: addr,
            contact: item.MDHS_TELNO || "정보 없음",
            rcritPblancDe: pblancDisplay,
            rceptBgnde: subDisplay,
            przwnerPresnatnDe: item.PRZWNER_PRESNATN_DE || item.przwner_presnatn_de || "-"
          }
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
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [needleRotation, setNeedleRotation] = useState(-90);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // 🚀 [여기서부터 새로 추가할 문지기 코드 시작!] 🚀 
  const router = useRouter(); // 길 안내원 소환
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // ✨ [무적 문지기] 티켓이 보이면 즉시 삼키고 납치합니다!
  useEffect(() => {
    const processAuth = async () => {
      // 1. 주소창에 티켓(#access_token)이 있는지 확인합니다.
      const hash = window.location.hash;

      // 🚀 티켓이 있다면? 강제로 수파베이스에 "나 로그인했어!"라고 알려줍니다.
      if (hash && hash.includes("access_token")) {
        // 주소창에서 토큰들만 쏙쏙 뽑아냅니다.
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          // 수파베이스에게 이 티켓으로 세션을 활성화하라고 명령합니다!
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // 티켓을 다 썼으니 주소창을 깨끗하게 청소합니다. (보기 싫으니까요!)
          window.history.replaceState(null, "", window.location.pathname);
        }
      }

      // 2. 이제 로그인된 정보를 다시 확인합니다.
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);

        // 3. 명부에서 닉네임 확인 (납치할지 결정)
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
          // 🚀 닉네임이 'Guest'라면 가차 없이 납치!
          if (profile.nickname === 'Guest') {
            router.push('/welcome');
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    };

    processAuth();

    // 로그인 상태 실시간 감지
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        processAuth();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);
  // 🚀 [여기까지 새로 추가할 문지기 코드 끝!] 🚀


  // 🚀 [여기에 추가!] 푸터에 닿으면 버튼을 위로 밀어올리는 계산기
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // 맨 밑바닥까지 남은 거리 계산
      const scrollBottom = documentHeight - (scrollY + windowHeight);

      // 푸터 영역 대략 200px로 잡고, 200px 이내로 들어오면 그만큼 버튼을 위로(-Y) 들어올림
      const footerHeight = 200;
      if (scrollBottom < footerHeight) {
        setBottomOffset(footerHeight - scrollBottom);
      } else {
        setBottomOffset(0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (notices.length === 0) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTickerIndex((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, [notices]);

  useEffect(() => {
    if (notices.length === 0) return;
    if (tickerIndex === notices.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setTickerIndex(0);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [tickerIndex, notices.length]);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, n] = await Promise.all([getPropertiesFromSheet(), getNoticesFromSheet()]);
        setProperties(p);
        setNotices(n);
        setFilteredProperties(p);
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

  return (
    <main className="min-h-screen bg-[#fdfbf7] flex flex-col items-center relative overflow-x-hidden">

      {/* 🚀 수정됨: 숨지 않고 푸터 위에서 딱 멈추는 마법! */}
      <Link
        href="https://pro.aparty.co.kr"
        target="_blank"
        className="fixed right-4 md:right-10 bottom-[92px] md:bottom-[115px] z-[90] group flex items-center justify-end transition-transform duration-75 ease-out"
        style={{ transform: `translateY(-${bottomOffset}px)` }}
      >
        <div className="hidden md:block mr-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-[#4A403A] text-white text-[12px] font-bold px-3 py-2 rounded-xl whitespace-nowrap transition-all shadow-xl">
          분양상담사 전용 <ChevronRight size={12} className="inline ml-1" />
        </div>

        <div className="relative w-14 h-14 bg-white rounded-full shadow-lg border border-orange-100 flex items-center justify-center hover:scale-110 hover:border-[#FF8C42] transition-all duration-300">
          <Image
            src="/agent-icon.png"
            alt="분양상담사 전용"
            width={32}
            height={32}
            className="object-contain"
          />
          <div className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border-[1.5px] border-white shadow-sm">
            PRO
          </div>
        </div>
      </Link>

      {/* 🚀 수정됨: 아파티 헤더 (로고, 슬로건, 로그인 버튼) */}
      {/* 🚀 수정된 헤더: 슬림한 로고 + APARTY 단독 + 세련된 슬로건 */}
      <header className="w-full max-w-6xl flex justify-between items-center mt-6 md:mt-8 mb-8 md:mb-10 px-5 md:px-6">

        {/* 로고 & 텍스트 그룹 */}
        <Link href="/" className="flex items-center gap-2 md:gap-2.5 group cursor-pointer">
          {/* 1. 로고 이미지 사이즈 더 축소 (모바일 w-8, PC w-10) */}
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
            <Image src="/logo.png" alt="아파티" fill className="object-contain" />
          </div>

          {/* 2. 텍스트 영역 (세로 정렬) */}
          <div className="flex flex-col items-start justify-center">
            {/* 한글 삭제, 영문 APARTY만 유지 */}
            <h1 className="text-lg md:text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">
              APARTY
            </h1>
            {/* 3. 슬로건 추가 & 4. 글씨 두께 얇게(font-medium) 적용 */}
            <span className="text-[9px] md:text-[10px] font-medium text-gray-400 tracking-tight leading-none group-hover:text-gray-500 transition-colors">
              No. 1 부동산 분양 정보 플랫폼
            </span>
          </div>
        </Link>

        {/* 우측 로그인 버튼 */}
        <div className="flex items-center gap-4">
          <LoginButton />
        </div>
      </header>

      <div className="w-full max-w-6xl px-4 md:px-6 text-center mt-12 md:mt-20 mb-8">
        <h1 className="text-4xl md:text-5xl font-semibold text-[#4a403a] leading-tight mb-4 tracking-tight">
          지금 가장 핫한 <br className="md:hidden" />
          <span className="text-orange-500 font-bold">선착순 분양단지</span>는?
        </h1>

        {notices.length > 0 && (
          <div className="w-full max-w-xl mx-auto mb-10 relative flex flex-col items-center justify-start overflow-hidden h-[24px] cursor-pointer group z-20">
            <div
              className="flex flex-col w-full"
              style={{
                transform: `translateY(-${tickerIndex * 24}px)`,
                transition: isTransitioning ? 'transform 800ms ease-in-out' : 'none'
              }}
            >
              {[...notices, notices[0]].map((notice, index) => (
                <div key={index} className="h-[24px] w-full flex items-center justify-center shrink-0 truncate text-[14px] font-bold text-gray-600 text-center group-hover:text-[#FF8C42] transition-colors">
                  <Link href="/notice" className="flex items-center justify-center">
                    <span className="text-[#FF8C42] mr-2 text-[12px] font-black flex items-center gap-1">
                      <Megaphone size={12} className="inline mb-0.5 animate-pulse" />
                      공지
                    </span>
                    {notice.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🚀 수정됨 1: mb-10을 mb-4로 줄여서 검색창과 필터 버튼 사이를 찰싹 붙였습니다! */}
        <div className="relative w-full max-w-xl mx-auto mb-4 group mt-8 z-20">
          <input type="text" placeholder="어떤 지역, 어떤 아파트를 찾으세요?" className="w-full px-5 py-4 pr-16 rounded-[24px] border border-gray-100 shadow-md focus:ring-4 focus:ring-orange-100 text-[15px] font-bold outline-none bg-white transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          {searchQuery ? (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 bottom-3 w-12 bg-gray-100 text-gray-500 rounded-2xl flex items-center justify-center transition-all"><X size={20} /></button>) : (<button className="absolute right-3 top-3 bottom-3 w-12 bg-[#4A403A] text-white rounded-2xl flex items-center justify-center shadow-md"><Search size={22} /></button>)}
        </div>

        {/* 🚀 수정됨 2: 간격(gap) 축소, 버튼 사이즈(px, py, text) 극한의 다이어트! */}
        <div className="flex overflow-x-auto scrollbar-hide justify-start md:justify-center gap-1.5 md:gap-2 mb-10 px-4 py-2 w-full">
          {["전체", "분양예정", "줍줍", "분양중", "마감임박"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`shrink-0 px-3.5 py-1.5 md:px-5 md:py-2 rounded-full font-bold tracking-tight text-[11px] md:text-[12px] transition-all whitespace-nowrap ${activeFilter === filter
                ? "bg-[#4a403a] text-white shadow-md scale-105 ring-1 ring-[#4a403a]/20"
                : "bg-white text-gray-400 border border-gray-100 hover:border-[#FF8C42] hover:text-[#FF8C42] hover:bg-orange-50 hover:shadow-sm hover:-translate-y-0.5"
                }`}
            >
              {filter === "전체" ? "전체보기" : `#${filter}`}
            </button>
          ))}
        </div>

        {isResultMode ? (
          <div className="animate-in slide-in-from-bottom-5 fade-in duration-300 w-full text-left px-6">
            <h3 className="text-xl font-black text-[#4A403A] mb-8 flex items-center gap-2"><Search className="text-[#FF8C42]" size={24} /> {searchQuery ? `'${searchQuery}' 검색 결과` : `#${activeFilter} 단지`} <span className="text-[#FF8C42] ml-1">{filteredProperties.length}건</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">{filteredProperties.map((property) => (<PropertyCard key={property.id} {...property} />))}</div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500 w-full flex flex-col items-center">

            {/* 메인 대시보드 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 w-full max-w-7xl text-left mb-10 px-4 items-stretch">
              <div className="md:col-span-3">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                  <div className="p-5 md:p-6 border-b border-gray-50 flex items-center gap-2 shrink-0"><TrendingUp size={16} className="text-[#FF8C42]" strokeWidth={2.5} /><h3 className="text-[13px] font-black text-[#4A403A]">부동산 종합 지표</h3></div>
                  <div className="p-4 flex flex-col flex-1 gap-1 overflow-hidden relative justify-between">
                    <div className="animate-in fade-in slide-in-from-right-full duration-700 w-full text-center flex flex-col flex-1 justify-between" key={sentimentRegion}>

                      <div className="relative w-40 h-20 md:w-48 md:h-24 mx-auto overflow-hidden mb-2 mt-2">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="50%" stopColor="#10B981" />
                              <stop offset="100%" stopColor="#EF4444" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 - (125.6 * Math.min(sentiment.score, 150) / 150)}
                            className="transition-all duration-1000 ease-out"
                          />
                          {[0, 25, 50, 75, 100, 125, 150].map((tick) => {
                            const angle = (tick / 150) * 180 - 180;
                            const rad = (angle * Math.PI) / 180;
                            const x1 = 50 + 32 * Math.cos(rad);
                            const y1 = 50 + 32 * Math.sin(rad);
                            const x2 = 50 + 37 * Math.cos(rad);
                            const y2 = 50 + 37 * Math.sin(rad);
                            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9CA3AF" strokeWidth="1" />;
                          })}
                        </svg>

                        <div
                          className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out flex flex-col items-center justify-end z-20"
                          style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)`, height: '85%', width: '20px' }}
                        >
                          <div className="w-1.5 h-[80%] bg-gradient-to-t from-[#4A403A] to-gray-400 rounded-t-full shadow-sm relative z-10"></div>
                          <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#4A403A] rounded-full border-[2.5px] border-white shadow-md z-20"></div>
                        </div>
                      </div>

                      <div className="mb-2"><span className="text-xl md:text-2xl font-black text-[#4A403A]">{sentiment.score}</span><p className={`text-[10px] font-black mt-0.5 ${sentiment.score > 100 ? 'text-red-500' : 'text-blue-500'}`}>{sentiment.status}</p></div>
                      <div className="bg-gray-50 py-1.5 mx-8 md:mx-4 rounded-xl mb-3"><p className="text-[12px] md:text-[13px] font-black text-[#4A403A]">{sentimentRegion}</p></div>

                      <div className="w-full pt-1 flex-1 flex flex-col border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-gray-600 px-1 mb-1 mt-2">
                          <span className="flex items-center gap-1"><Info size={11} /> 5주 투자심리 추이</span>
                          <span className="text-[9px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">기준: 100</span>
                        </div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[90px] md:min-h-[100px] flex items-center justify-center mt-1">
                          {(() => {
                            const trendData = sentiment.trend;
                            const PADDING_X = 15;
                            const PADDING_Y_TOP = 25;
                            const PADDING_Y_BOTTOM = 20;
                            const W = 200;
                            const H = 100;
                            const innerW = W - PADDING_X * 2;
                            const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;

                            const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW;
                            const getY = (val: number) => PADDING_Y_TOP + innerH - (val / 150) * innerH;
                            const pathData = trendData.map((v, i) => `${getX(i)},${getY(v)}`).join(" L ");

                            return (
                              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#FF8C42" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <line x1={0} y1={getY(100)} x2={W} y2={getY(100)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3" />
                                <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#areaGradient)" />
                                <path d={`M ${pathData}`} fill="none" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                {trendData.map((v: number, i: number) => {
                                  const x = getX(i);
                                  const y = getY(v);
                                  const isLast = i === trendData.length - 1;
                                  return (
                                    <g key={i}>
                                      <circle cx={x} cy={y} r={isLast ? "3.5" : "2.5"} fill={isLast ? "#FF8C42" : "white"} stroke={isLast ? "white" : "#FF8C42"} strokeWidth="1.5" className="transition-all duration-1000 shadow-sm" />
                                      <text x={x} y={y - 8} textAnchor="middle" fontSize={isLast ? "11" : "9"} fontWeight="bold" fill={isLast ? "#EF4444" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke" className="transition-all duration-1000">
                                        {v}
                                      </text>
                                      <text x={x} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">
                                        {sentiment.labels[i].replace("'", "")}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="w-full pt-3 mt-4 border-t border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[11px] font-black text-gray-600 px-1 mb-1 mt-1">
                          <span className="flex items-center gap-1"><BarChart3 size={11} /> 월별 미분양 증가 지수</span>
                          <span className="text-[9px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">단위: Pt</span>
                        </div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[90px] md:min-h-[100px] flex items-center justify-center mt-1">
                          {(() => {
                            const trendData = sentiment.unsoldTrend;
                            const PADDING_X = 15;
                            const PADDING_Y_TOP = 25;
                            const PADDING_Y_BOTTOM = 20;
                            const W = 200;
                            const H = 100;
                            const innerW = W - PADDING_X * 2;
                            const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;
                            const maxVal = Math.max(...trendData, 50) * 1.2;

                            const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW;
                            const getY = (val: number) => PADDING_Y_TOP + innerH - (val / maxVal) * innerH;
                            const pathData = trendData.map((v: number, i: number) => `${getX(i)},${getY(v)}`).join(" L ");

                            return (
                              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                <defs>
                                  <linearGradient id="unsoldAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                  </linearGradient>
                                </defs>
                                <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#unsoldAreaGradient)" />
                                <path d={`M ${pathData}`} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                {trendData.map((v: number, i: number) => {
                                  const x = getX(i);
                                  const y = getY(v);
                                  const isLast = i === trendData.length - 1;
                                  return (
                                    <g key={i}>
                                      <circle cx={x} cy={y} r={isLast ? "3.5" : "2.5"} fill={isLast ? "#3B82F6" : "white"} stroke={isLast ? "white" : "#3B82F6"} strokeWidth="1.5" className="transition-all duration-1000 shadow-sm" />
                                      <text x={x} y={y - 8} textAnchor="middle" fontSize={isLast ? "11" : "9"} fontWeight="bold" fill={isLast ? "#1D4ED8" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke" className="transition-all duration-1000">
                                        {v}
                                      </text>
                                      <text x={x} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">
                                        {sentiment.labels[i].replace("'", "")}
                                      </text>
                                    </g>
                                  );
                                })}
                              </svg>
                            );
                          })()}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 bg-white rounded-[32px] shadow-sm border border-gray-100 p-5 md:p-8 flex flex-col h-full overflow-hidden">
                <div className="grid grid-cols-2 md:flex bg-gray-50 rounded-xl p-1 mb-5 shrink-0 gap-1 md:gap-0">
                  <button onClick={() => setDashboardTab("transaction")} className={`w-full md:flex-1 py-2.5 rounded-lg text-[12px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "transaction" ? "bg-white text-[#FF8C42] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Activity className="w-4 h-4" /> 실거래가</button>
                  <button onClick={() => setDashboardTab("competition")} className={`w-full md:flex-1 py-2.5 rounded-lg text-[12px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "competition" ? "bg-white text-blue-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Trophy className="w-4 h-4" /> 청약경쟁률</button>
                  <button onClick={() => setDashboardTab("calendar")} className={`w-full md:flex-1 py-2.5 rounded-lg text-[12px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "calendar" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><CalendarDays className="w-4 h-4" /> 청약일정</button>
                  <button onClick={() => setDashboardTab("population")} className={`w-full md:flex-1 py-2.5 rounded-lg text-[12px] md:text-[13px] font-black flex items-center justify-center gap-1.5 transition-all ${dashboardTab === "population" ? "bg-white text-purple-500 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Users2 className="w-4 h-4" /> 인구유입</button>
                </div>

                <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-1.5 md:gap-2 mb-6 pb-1 w-full">
                  {Object.keys(REGION_CODES).map(region => (
                    <button
                      key={region}
                      onClick={() => setDashboardRegion(region)}
                      className={`shrink-0 whitespace-nowrap px-2.5 md:px-3 py-1.5 rounded-full text-[10px] md:text-[11px] tracking-tight font-extrabold transition-all ${dashboardRegion === region
                        ? "bg-[#4A403A] text-white shadow-md"
                        : "bg-white text-gray-400 border border-gray-100 hover:border-gray-300"
                        }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-h-[380px] flex flex-col">
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
                            <p className={`text-[15px] md:text-[16px] font-black tracking-tight ${dashboardTab === "transaction" ? "text-[#FF8C42]" : dashboardTab === "competition" ? "text-blue-500" : dashboardTab === "calendar" ? "text-emerald-500" : "text-purple-500"}`}>{item.val}</p>
                          </div>
                        </div>
                      )) : <p className="text-center py-20 text-xs text-gray-400 font-bold">데이터를 불러오지 못했습니다.</p>}
                    </div>
                  )}

                  {apiData.length > 0 && (
                    <div className="mt-4 pt-4 flex items-center justify-between border-t border-gray-50">
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-300">
                        자료출처: {
                          dashboardTab === "transaction" ? "국토교통부 실거래가" :
                            dashboardTab === "population" ? "국가통계포털(KOSIS)" :
                              "한국부동산원 (청약홈)"
                        }
                      </span>
                      <Link href={`/more/${dashboardTab}`} className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-[#FF8C42] transition-colors">
                        전체보기 <ChevronRight size={14} strokeWidth={3} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-5 flex flex-col h-full">
                  <h3 className="text-[13px] font-black text-[#4A403A] mb-4 flex items-center gap-2 border-b border-gray-50 pb-3 shrink-0"><Trophy size={16} className="text-[#FF8C42]" /> 인기랭킹</h3>
                  <div className="flex flex-col gap-3.5">{!isLoading && rankingList.length > 0 ? rankingList.map((prop, idx) => (<Link key={idx} href={`/property/${prop.id}`} className="flex items-center gap-2 group py-0.5"><span className={`text-[13px] font-black w-3 shrink-0 ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span><span className="text-[12px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] truncate transition-colors leading-tight">{prop.title}</span></Link>)) : <p className="py-20 text-center text-xs text-gray-400 font-bold">로딩 중...</p>}</div>
                </div>
              </div>
            </div>

            {/* 유틸리티 6종 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full max-w-6xl mb-12 px-4">
              <Link href="/tools/tax" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Calculator size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">취득세 계산</span></Link>
              <Link href="/tools/loan" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Landmark size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">대출이자 계산</span></Link>
              <Link href="/tools/yield" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><BarChart3 size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">수익률 계산</span></Link>
              <Link href="/tools/score" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><Trophy size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">청약가점 계산</span></Link>
              <Link href="/tools/convert" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><RefreshCcw size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">평형/㎡ 변환</span></Link>
              <Link href="/tools/checklist" className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm group hover:border-orange-200 transition-all"><div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"><CalendarDays size={20} /></div><span className="text-[12px] font-black text-[#4A403A]">입주 체크리스트</span></Link>
            </div>

            {/* 🚀 째미의 폴드5 맞춤 최적화: 모바일과 PC에서 제목 글씨가 다르게 나오도록 설정! */}
            <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-6xl px-4 mb-10">
              {/* 1. 공지사항 카드 */}
              <Link href="/notice" className="bg-white p-2.5 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                <div className="flex items-center gap-1.5 md:gap-4 z-10 min-w-0">
                  {/* 🚀 핵심 수정: 밋밋한 회색에서 쨍하고 눈에 띄는 블루(blue-500)로 변경! */}
                  <div className="w-7 h-7 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Megaphone size={14} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">
                      <span className="md:hidden">공지사항</span>
                      <span className="hidden md:inline">아파티 소식</span>
                    </h3>
                    <p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight break-keep leading-tight truncate">공지 확인</p>
                  </div>
                </div>
                {/* 🚀 우측 화살표도 호버 시 블루로 통일! */}
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors z-10 shrink-0 ml-0.5 md:ml-1" size={14} />
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-blue-100/60 transition-colors"></div>
              </Link>

              {/* 2. 커뮤니티(라운지) 카드 */}
              <Link href="/community" className="bg-white p-2.5 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-[#FF5A00] hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                <div className="flex items-center gap-1.5 md:gap-4 z-10 min-w-0">
                  <div className="w-7 h-7 md:w-12 md:h-12 bg-orange-50 text-[#FF5A00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <MessageSquare size={14} className="md:w-6 md:h-6" />
                  </div>
                  <div className="text-left min-w-0">
                    {/* 🚀 핵심 수정: 모바일은 '라운지', PC는 '아파티 라운지' */}
                    <h3 className="text-[12px] md:text-[16px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">
                      <span className="md:hidden">라운지</span>
                      <span className="hidden md:inline">아파티 라운지</span>
                    </h3>
                    <p className="text-[9px] md:text-[13px] text-gray-400 font-bold tracking-tight break-keep leading-tight truncate">소통 공간</p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#FF5A00] transition-colors z-10 shrink-0 ml-0.5 md:ml-1" size={14} />
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none group-hover:bg-orange-100 transition-colors"></div>
              </Link>
            </div>



            {/* 🚀 1. VIP 배너: 카카오톡 비즈보드 스타일 (슬림 & 글자 시인성 보강) */}
            <div className="w-full max-w-5xl -mt-6 md:mt-0 mb-6 md:mb-12 px-4 md:px-6">
              {/* py-3.5(모바일)로 높이를 슬림하게 고정하면서, 내용물에 따라 자연스럽게 조절되게 했습니다. */}
              <div className="relative w-full rounded-xl md:rounded-[32px] overflow-hidden shadow-md md:shadow-2xl flex flex-row items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 md:py-8 group text-left bg-black">
                <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-60 md:opacity-80">
                  <source src="/vip-bg.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/40 z-0"></div>

                <div className="relative z-10 flex-1 pr-3">
                  {/* 제목: 폰트 사이즈를 모바일에 최적화(13px) */}
                  <h3 className="text-[13px] sm:text-[16px] md:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tighter">
                    <span className="md:hidden">누구보다 빠른 <span className="text-[#FF8C42]">분양</span> 알림 🔔</span>
                    <span className="hidden md:inline">누구보다 빠른 <span className="text-[#FF8C42]">선착순 분양</span> 알림 🔔</span>
                  </h3>
                  {/* 부제목: 절대 숨기지 않고, 아주 작은 폰트로 찰떡같이 붙여두었습니다. */}
                  <p className="text-[9.5px] sm:text-[12px] md:text-[15px] text-white/70 font-bold mt-0.5 md:mt-1.5 leading-tight">
                    <span className="md:hidden">로얄동·로얄층을 실시간으로 !</span>
                    <span className="hidden md:inline">로얄동·로얄층 마감 전 정보를 실시간으로 받아보세요.</span>
                  </p>
                </div>

                {/* 버튼: 슬림한 배너에 맞춰 크기 최적화 */}
                <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="relative z-10 bg-[#FEE500] text-[#191919] font-black px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-7 md:py-3.5 rounded-lg md:rounded-[16px] shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1 md:gap-2 shrink-0">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 md:w-6 md:h-6">
                    <path d="M12 3c-5.523 0-10 3.535-10 7.896 0 2.827 1.83 5.304 4.582 6.643-.207.697-.996 3.498-1.026 3.612-.036.14.032.28.163.303.11.018.35.008 1.15-.347 0 0 2.29-1.523 3.256-2.188A10.74 10.74 0 0012 18.79c5.523 0 10-3.535 10-7.895C22 6.535 17.523 3 12 3z" />
                  </svg>
                  <span className="text-[10px] sm:text-[12px] md:text-[15px]">채널추가</span>
                </Link>
              </div>
            </div>

            {/* 🚀 2. 추천 단지 영역: 모바일 폰트 및 아이콘 최적화 */}
            <section className="w-full max-w-6xl mb-16 md:mb-24 px-6 text-left">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <h2 className="text-[16px] md:text-xl font-black text-[#4a403a] flex items-center gap-1.5 md:gap-2.5">
                  <Sparkles className="text-orange-500 w-4.5 h-4.5 md:w-6 md:h-6" />
                  오늘의 추천 단지
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">{filteredProperties.map((p) => (<PropertyCard key={p.id} {...p} />))}</div>
            </section>

            {/* 🚀 3. [신규 추가] 앱테크 & 리워드 유도 배너 (아이콘 교체 완료!) */}
            <div className="w-full max-w-5xl mb-24 px-4 md:px-6">
              <div className="relative w-full rounded-2xl md:rounded-[32px] overflow-hidden shadow-sm border border-orange-100 flex flex-row items-center justify-between p-3.5 sm:p-5 md:px-10 md:py-8 group text-left bg-gradient-to-r from-[#FFF5F0] to-white hover:shadow-md transition-all">
                {/* 배경 꾸밈 요소 */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-200/30 rounded-full blur-3xl group-hover:bg-orange-300/40 transition-colors pointer-events-none"></div>

                <div className="relative z-10 flex-1 pr-2 flex items-center gap-2.5 md:gap-5 min-w-0">
                  {/* 🚀 수정됨: 투박한 동전 이모지(🪙) 대신 세련된 선물상자 아이콘으로 교체! */}
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0 border border-orange-100 text-[#FF8C42]">
                    <Gift className="w-5 h-5 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[12px] sm:text-[14px] md:text-2xl font-black text-[#4A403A] mb-0.5 md:mb-1.5 tracking-tight truncate">
                      <span className="md:hidden">매일 쌓이는 <span className="text-[#FF8C42]">포인트</span></span>
                      <span className="hidden md:inline">라운지 활동하고 <span className="text-[#FF8C42]">아파티 포인트</span> 받자!</span>
                    </h3>
                    <p className="text-[9px] sm:text-[11px] md:text-[14px] text-gray-400 font-bold leading-tight break-keep truncate">
                      <span className="md:hidden">출첵하고 리워드 혜택 받기</span>
                      <span className="hidden md:inline">출석체크, 글쓰기로 포인트 모으고 다양한 혜택으로 교환해 보세요.</span>
                    </p>
                  </div>
                </div>

                <Link href="/point" className="relative z-10 bg-[#FF8C42] text-white font-black px-3 py-2 md:px-6 md:py-3.5 rounded-[10px] md:rounded-xl shadow-sm hover:bg-[#E07A30] hover:-translate-y-0.5 transition-all shrink-0 text-[11px] md:text-[15px]">
                  포인트 받기
                </Link>
              </div>
            </div>

            <NewsSection />
          </div>
        )}
      </div>

      {/* 🚀 [디자인 동기화] 전체보기와 100% 동일한 고급 모달창 */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

            {/* 다크 브라운 헤더 */}
            <div className="bg-[#4A403A] p-5 flex justify-between items-center text-white">
              <h3 className="font-black text-lg truncate pr-4">
                {selectedItem.type === "transaction" ? "실거래 상세 정보" : "청약 공급 상세 내역"}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <h4 className="text-xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
              <p className="text-sm font-bold text-[#FF8C42] mb-6">{selectedItem.details?.fullAddr || selectedItem.addr}</p>

              <div className="space-y-4">
                {selectedItem.type === "transaction" ? (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 거래금액</span>
                      <span className="font-black text-lg text-[#2d2d2d]">{selectedItem.val}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.fullDate || selectedItem.date || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 건축년도 (연식)</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.buildYear && selectedItem.details.buildYear !== "-" ? `${selectedItem.details.buildYear}년` : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 전용면적 / 층</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.area || "-"}㎡ / {selectedItem.details?.floor || "-"}층</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span>
                      <span className="font-black text-blue-500">{selectedItem.val}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 모집공고일</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.rcritPblancDe || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 청약접수일</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.rceptBgnde || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 당첨자발표</span>
                      <span className="font-bold text-red-500">{selectedItem.details?.przwnerPresnatnDe || "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 총 공급세대수</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.totHshld && selectedItem.details.totHshld !== "정보 없음" ? `${selectedItem.details.totHshld} 세대` : "-"}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span>
                      <span className="font-bold text-[#2d2d2d]">{selectedItem.details?.contact || "-"}</span>
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="w-full mt-8 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-xl transition-colors">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
      <ChatBot />
    </main>
  );
}