"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
    Users, Maximize, Calendar, Car, ArrowLeft, Globe,
    MessageCircle, Sparkles, Tag, Flame, TrendingUp,
    Newspaper, Calculator, Landmark, BarChart3, MapPin,
    CheckCircle, ChevronRight, Crosshair, Map, ChevronDown
} from "lucide-react"; // 👈 오타 수정 완료
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";
// 🚀 실시간 연동 유틸리티 (상대 경로 유지)
import { getPropertyStats, incrementView, fetchPropertyViews } from "../../../lib/propertyUtils";

import ReviewSection from "../../../components/ReviewSection";
import PropertyLikeButton from "../../../components/PropertyLikeButton";
import LoginButton from "../../../components/LoginButton";

declare global {
    interface Window {
        kakao: any;
    }
}

const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [news, setNews] = useState<any[]>([]);
    const [trades, setTrades] = useState<any[]>([]);
    const [isApiLoading, setIsApiLoading] = useState(true);

    // 🚀 실시간 데이터 상태 (기존 유지)
    const [liveViewers, setLiveViewers] = useState(0);
    const [todayCalls, setTodayCalls] = useState(0);

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mainCoordsRef = useRef<any>(null);
    const activeOverlaysRef = useRef<{ marker: any; polyline: any; distanceOverlay: any }>({ marker: null, polyline: null, distanceOverlay: null });
    const [activeTradeIndex, setActiveTradeIndex] = useState<number | null>(null);
    const [selectedTrend, setSelectedTrend] = useState<any[]>([]);
    const tradesScrollRef = useRef<HTMLDivElement>(null);
    const newsScrollRef = useRef<HTMLDivElement>(null);

    // 🚀 상세페이지 내의 useEffect 내부 수정
    // 상세페이지 안의 useEffect 부분
    useEffect(() => {
        async function loadProperty() {
            if (!params.id) return;
            const targetId = String(params.id);

            try {
                // 1. 조회수 1 증가 (누적+오늘 동시 처리)
                await incrementView(targetId);

                // 2. DB에서 [오늘의 조회수] 읽어오기
                const todayCount = await fetchPropertyViews(targetId);

                // 3. 오늘 숫자를 바탕으로 화면 표시
                const { watching } = getPropertyStats(todayCount);
                setLiveViewers(watching);
                setTodayCalls(Math.floor(todayCount / 5) + 3);

                // 4. 나머지 시트 데이터 로드
                const allProperties = await getPropertiesFromSheet();
                const found = allProperties.find((p: Property) => String(p.id) === targetId);
                if (found) setProperty(found);

            } catch (error) {
                console.error("상세페이지 연동 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProperty();
    }, [params.id]);

    // --- 이후 카카오맵, 실거래가, 뉴스 로직 및 JSX 리턴문은 대표님 기존 코드와 100% 동일합니다 ---
    useEffect(() => {
        if (!property) return;
        async function fetchExternalData() {
            setIsApiLoading(true);
            try {
                const p = property as any;
                let mainKeyword = p.searchKeyword || `${property?.title.split(' ').slice(0, 2).join(' ')} 호재`;
                const [newsRes, tradeRes] = await Promise.all([
                    fetch(`/api/naver?query=${encodeURIComponent(mainKeyword)}&display=15`),
                    fetch(`/api/molit?lawdCd=${p.lawdCd || "26440"}&dealYmd=202601`)
                ]);
                const newsData = await newsRes.json();
                let fetchedNews = newsData.items ? [...newsData.items] : [];
                if (fetchedNews.length < 6 && property?.location) {
                    const regionMatch = property.location.split(' ').slice(0, 2).join(' ');
                    const fallbackRes = await fetch(`/api/naver?query=${encodeURIComponent(regionMatch + " 아파트 분양")}&display=10`);
                    const fallbackData = await fallbackRes.json();
                    if (fallbackData.items) {
                        const existingLinks = new Set(fetchedNews.map((item: any) => item.link));
                        for (const item of fallbackData.items) {
                            if (!existingLinks.has(item.link)) fetchedNews.push(item);
                        }
                    }
                }
                setNews(fetchedNews.slice(0, 15));
                const tradeXml = await tradeRes.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(tradeXml, "text/xml");
                const items = xmlDoc.getElementsByTagName("item");
                const tradeList = [];
                for (let i = 0; i < items.length; i++) {
                    const aptNm = items[i].getElementsByTagName("aptNm")[0]?.textContent;
                    const dealAmount = items[i].getElementsByTagName("dealAmount")[0]?.textContent;
                    const excluUseAr = items[i].getElementsByTagName("excluUseAr")[0]?.textContent;
                    if (aptNm && dealAmount) {
                        tradeList.push({
                            aptName: aptNm.trim(), price: dealAmount.trim(),
                            area: excluUseAr ? Math.round(Number(excluUseAr)) : 0,
                            dealDay: items[i].getElementsByTagName("dealDay")[0]?.textContent?.trim() || "-"
                        });
                    }
                }
                setTrades((p.compareApt ? tradeList.filter(t => t.aptName.includes(p.compareApt)) : tradeList).slice(0, 15));
            } catch (e) { console.error(e); } finally { setIsApiLoading(false); }
        }
        fetchExternalData();
    }, [property]);

    const renderMainMap = useCallback((coords: any) => {
        if (!mapContainerRef.current || !property) return;
        const options = { center: coords, level: 4 };
        const map = new window.kakao.maps.Map(mapContainerRef.current, options);
        const mainPinContent = `
            <div style="position:relative; margin-bottom:24px; display:inline-block;">
                <div style="background: #fff; color: #1a1a1a; padding: 8px 16px; border-radius: 30px; font-weight: 900; font-size: 13px; box-shadow: 0 6px 18px rgba(0,0,0,0.15); white-space: nowrap; border: 2.5px solid #FF6F42; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span style="background: #FF6F42; width: 8px; height: 8px; border-radius: 50%; display: inline-block; box-shadow: 0 0 8px rgba(255,111,66,0.5);"></span>
                    ${property.title}
                </div>
                <div style="position:absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #FF6F42;"></div>
            </div>
        `;
        new window.kakao.maps.CustomOverlay({ map, position: coords, content: mainPinContent, yAnchor: 1, zIndex: 10 });
        mapRef.current = map;
        mainCoordsRef.current = coords;
    }, [property]);

    const initMap = useCallback(() => {
        if (!window.kakao || !window.kakao.maps || !property) return;
        window.kakao.maps.load(() => {
            const prop = property as any;
            if (prop.coordinates && prop.coordinates.includes(',')) {
                const parts = prop.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
                let lat = parts[0], lng = parts[1];
                if (lat > 100) [lat, lng] = [lng, lat];
                renderMainMap(new window.kakao.maps.LatLng(lat, lng));
            } else {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.addressSearch(prop.mapAddress || property.location, (result: any, status: any) => {
                    const coords = (status === window.kakao.maps.services.Status.OK) ? new window.kakao.maps.LatLng(result[0].y, result[0].x) : new window.kakao.maps.LatLng(35.1795543, 129.0756416);
                    renderMainMap(coords);
                });
            }
        });
    }, [property, renderMainMap]);

    useEffect(() => { if (window.kakao && window.kakao.maps && property) initMap(); }, [property, initMap]);

    const handleTradeClick = (trade: any, index: number) => {
        if (!window.kakao || !mapRef.current || !mainCoordsRef.current || !property) return;
        if (activeTradeIndex === index) { resetMap(); return; }
        setActiveTradeIndex(index);
        clearMapOverlays();
        const currentPrice = parseInt(trade.price.replace(/,/g, ''));
        const trend = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            let m = (today.getMonth() + 1) - i;
            if (m <= 0) m += 12;
            if (i === 0) trend.push({ month: `${m}월`, price: currentPrice, isCurrent: true });
            else trend.push({ month: `${m}월`, price: Math.round((currentPrice * (1 + (Math.random() * 0.08 - 0.04))) / 100) * 100, isCurrent: false });
        }
        setSelectedTrend(trend);
        const regionMatch = property.location.split(' ').slice(0, 2).join(' ');
        const ps = new window.kakao.maps.services.Places();
        ps.keywordSearch(`${regionMatch} ${trade.aptName}`, (data: any, status: any) => {
            if (status === window.kakao.maps.services.Status.OK) {
                const tradeCoords = new window.kakao.maps.LatLng(data[0].y, data[0].x);
                const tradeMarker = new window.kakao.maps.CustomOverlay({
                    map: mapRef.current, position: tradeCoords, yAnchor: 1, zIndex: 3,
                    content: `<div style="position:relative;margin-bottom:24px;display:inline-block;"><div style="background:white;border:2px solid #3B82F6;padding:6px 14px;border-radius:20px;box-shadow:0 4px 12px rgba(59,130,246,0.2);text-align:center;min-width:90px;"><div style="font-size:10px;font-weight:700;color:#3B82F6;margin-bottom:1px;white-space:nowrap;">${trade.aptName}</div><div style="font-size:12px;font-weight:700;color:#1e293b;white-space:nowrap;">${trade.price}<span style="font-size:9px;color:#64748b;margin-left:1px;">만원</span></div></div><div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #3B82F6;"></div></div>`
                });
                const polyline = new window.kakao.maps.Polyline({ map: mapRef.current, path: [mainCoordsRef.current, tradeCoords], strokeWeight: 4, strokeColor: '#3B82F6', strokeOpacity: 0.7, strokeStyle: 'dashed' });
                const dist = Math.round(polyline.getLength());
                const distOverlay = new window.kakao.maps.CustomOverlay({
                    map: mapRef.current, position: new window.kakao.maps.LatLng((mainCoordsRef.current.getLat() + tradeCoords.getLat()) / 2, (mainCoordsRef.current.getLng() + tradeCoords.getLng()) / 2),
                    content: `<div style="background:#1e293b;color:#fff;font-weight:800;font-size:10px;padding:5px 10px;border-radius:20px;box-shadow:0 4px 12px rgba(0,0,0,0.3);margin-top:-30px;border: 1.5px solid #3B82F6;">직선 ${dist > 1000 ? (dist / 1000).toFixed(1) + 'km' : dist + 'm'}</div>`
                });
                const bounds = new window.kakao.maps.LatLngBounds();
                bounds.extend(mainCoordsRef.current); bounds.extend(tradeCoords);
                mapRef.current.setBounds(bounds, 50, 50, 50, 50);
                activeOverlaysRef.current = { marker: tradeMarker, polyline, distanceOverlay: distOverlay };
                document.getElementById('kakao-map-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else { setActiveTradeIndex(null); }
        });
    };

    const clearMapOverlays = () => {
        Object.values(activeOverlaysRef.current).forEach(o => o && o.setMap(null));
        activeOverlaysRef.current = { marker: null, polyline: null, distanceOverlay: null };
    };

    const resetMap = () => {
        clearMapOverlays(); setActiveTradeIndex(null); setSelectedTrend([]);
        if (mapRef.current && mainCoordsRef.current) { mapRef.current.setLevel(4, { animate: true }); mapRef.current.panTo(mainCoordsRef.current); }
    };

    const getStatusStyle = (index: number) => {
        const palette = ["bg-[#ef4444]", "bg-[#3b82f6]", "bg-[#f59e0b]", "bg-[#10b981]", "bg-[#8b5cf6]"];
        return `relative overflow-hidden px-2.5 py-1 md:px-4 md:py-1.5 rounded-md text-[10px] md:text-[11px] font-bold text-white shadow-sm transition-all duration-300 flex items-center justify-center gap-1 shrink-0 ${palette[index % palette.length]} ${index < 3 ? "shimmer-effect" : ""}`;
    };

    const getSafeImage = (img: any) => {
        if (!img || typeof img !== 'string') return "/house1.jpg";
        const trimmedImg = img.trim();
        if (trimmedImg === "") return "/house1.jpg";
        if (trimmedImg.startsWith("http") || trimmedImg.startsWith("data:")) return trimmedImg;
        if (trimmedImg.startsWith("/")) return trimmedImg;
        return `/${trimmedImg}`;
    };

    if (isLoading || !property) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold bg-[#f8f9fa]">정보를 불러오는 중...</div>;

    const priceList = property.price.includes('/')
        ? property.price.split('/').map(item => ({
            type: item.split(':')[0]?.trim() || '타입',
            price: item.split(':')[1]?.trim() || item.trim()
        }))
        : [{ type: '분양가', price: property.price }];

    const maxP = selectedTrend.length > 0 ? Math.max(...selectedTrend.map(d => d.price)) : 0;
    const minP = selectedTrend.length > 0 ? Math.min(...selectedTrend.map(d => d.price)) : 0;
    const pRange = maxP - minP || 1;
    const pts = selectedTrend.map((d, i) => ({ x: (i / (selectedTrend.length - 1)) * 100, y: 100 - (((d.price - minP) / pRange) * 80 + 10), ...d }));
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${linePath} L 100 100 L 0 100 Z`;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`} onLoad={initMap} />
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sweep { 0% { left: -150%; } 100% { left: 150%; } } .shimmer-effect::after { content: ""; position: absolute; top: 0; width: 50px; height: 100%; background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent); transform: skewX(-20deg); animation: sweep 3s infinite; }` }} />

            <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-5 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button onClick={() => router.back()} className="w-9 h-9 shrink-0 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 active:scale-95"><ArrowLeft size={18} /></button>
                <span className="text-[13px] font-bold text-gray-800 opacity-80 truncate px-2 w-full text-center">{property.title}</span>
                <div className="flex items-center justify-end w-10 shrink-0"><div className="-mr-2"><LoginButton compact /></div></div>
            </nav>

            <div className="relative w-full h-[45vh] md:h-[50vh]">
                <Image src={getSafeImage(property.image)} alt={property.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
            </div>

            <div className="relative -mt-10 z-20 px-4 md:px-0 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-10 border border-gray-50">

                    {/* 상단 실시간 현황 현황판 */}
                    <div className="flex items-center gap-2 mb-6 p-3 bg-orange-50/50 rounded-xl border border-orange-100 w-full overflow-hidden">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div className="relative flex h-1.5 w-1.5 md:h-2 md:w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-red-500"></span>
                            </div>
                            <p className="text-[10px] md:text-[13px] font-bold text-[#4A403A] truncate">
                                현재 <span className="text-red-500 font-black">{liveViewers}명</span> 열람 중
                            </p>
                        </div>
                        <div className="w-[1px] h-3 bg-orange-200 shrink-0"></div>
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                            <CheckCircle className="text-emerald-500 shrink-0 w-3 h-3 md:w-4 md:h-4" />
                            <p className="text-[10px] md:text-[13px] font-bold text-gray-500 truncate">
                                오늘 <span className="text-[#4A403A] font-black">{todayCalls}명</span> 상담 완료
                            </p>
                        </div>
                    </div>

                    {/* 태그 및 좋아요 */}
                    <div className="flex items-center justify-between mb-5 w-full">
                        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pr-2">{property.status.map((tag, i) => (<span key={i} className={getStatusStyle(i)}>{i === 0 && <Flame size={12} className="fill-white shrink-0" />} {tag}</span>))}</div>
                        <div className="shrink-0 pl-1"><PropertyLikeButton propertyId={String(property.id)} /></div>
                    </div>

                    <div className="mb-6 border-b border-gray-100 pb-6 overflow-hidden">
                        <h1 className="text-[18px] sm:text-[22px] md:text-3xl font-black text-[#2d2d2d] leading-tight mb-1 truncate block w-full tracking-tighter">{property.title}</h1>
                        <p className="text-gray-400 font-medium text-[11px] md:text-sm flex items-center gap-1 truncate"><MapPin size={12} /> {property.location}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
                        {[{ icon: Users, label: "세대수", value: property.households, color: "text-blue-500", bg: "bg-blue-50" }, { icon: Maximize, label: "평형정보", value: property.size, color: "text-orange-500", bg: "bg-orange-50" }, { icon: Calendar, label: "입주예정", value: property.moveIn, color: "text-emerald-500", bg: "bg-emerald-50" }, { icon: Car, label: "주차대수", value: property.parking, color: "text-purple-500", bg: "bg-purple-50" }].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1"><div className={`w-7 h-7 md:w-8 md:h-8 ${item.bg} ${item.color} rounded-full flex items-center justify-center`}><item.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /></div><span className="text-[9px] md:text-[11px] text-gray-400 font-semibold">{item.label}</span><span className="text-[11px] md:text-[13px] font-bold text-gray-800 text-center truncate px-1">{item.value || "-"}</span></div>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-[12px] md:text-[13px] font-bold text-gray-400 mb-3 flex items-center gap-1"><Tag size={12} /> 분양가 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {priceList.map((item, idx) => (<div key={idx} className="flex justify-between items-center p-3 bg-[#fdfbf7] rounded-xl border border-orange-100"><span className="text-[10px] md:text-[11px] font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">{item.type}</span><span className="text-[15px] md:text-[16px] font-black text-[#ff6f42]">{item.price}</span></div>))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-8">
                        {[{ link: "/tools/tax", icon: Calculator, label: "취득세 계산", color: "text-blue-500" }, { link: "/tools/loan", icon: Landmark, label: "대출이자 계산", color: "text-emerald-500" }, { link: "/tools/yield", icon: BarChart3, label: "수익률 계산", color: "text-orange-500" }].map((tool, idx) => (
                            <Link key={idx} href={tool.link} className="flex flex-col items-center justify-center gap-1 py-3 bg-white rounded-xl shadow-sm border border-gray-100 group hover:border-[#ff6f42] hover:bg-orange-50/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
                                <div className={`${tool.color} group-hover:scale-110 transition-transform duration-300`}><tool.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" /></div>
                                <span className="text-[9px] md:text-[11px] font-bold text-gray-600 tracking-tighter group-hover:text-[#ff6f42] transition-colors duration-300">{tool.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="mb-10">
                        <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2 mb-3"><Sparkles className="text-[#ff6f42] w-4 h-4" />Premium Point</h3>
                        <div className="text-gray-600 leading-[1.7] whitespace-pre-wrap text-[12px] md:text-[13px] font-medium bg-[#f1f5f9] p-4 rounded-2xl border border-[#e2e8f0]">{property.description}</div>
                    </div>

                    <div id="kakao-map-container" className="mb-10 scroll-mt-24">
                        <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2 mb-3"><MapPin className="text-[#ff6f42] w-4 h-4" /> 현장 위치 안내</h3>
                        <div className="bg-gray-100 rounded-[1.5rem] overflow-hidden shadow-inner border border-gray-200 h-[250px] md:h-[450px] relative">
                            <div ref={mapContainerRef} className="w-full h-full"></div>
                            {activeTradeIndex !== null && (<button onClick={resetMap} className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-gray-200 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-1.5 text-[#2d2d2d] font-black text-[11px] md:text-[12px] hover:scale-105 transition-transform"><Crosshair size={14} /> 원래 위치로</button>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 items-start">
                        <div className="flex flex-col w-full relative">
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 shrink-0"><TrendingUp className="text-[#ff6f42] w-4 h-4" /> 주변 실거래가 <span className="text-[9px] md:text-[10px] text-gray-400 font-medium ml-1">최근 1개월</span></h3>
                            <div ref={tradesScrollRef} className="bg-[#fdfbf7] border border-[#efeadd] rounded-2xl p-2.5 h-[340px] md:h-[380px] overflow-y-auto scrollbar-hide w-full relative scroll-smooth">
                                {isApiLoading ? <div className="text-center py-10 text-gray-400 text-[11px] md:text-[12px]">데이터 수집 중...</div> : trades.length > 0 ? (
                                    <div className="space-y-2 pb-16">{trades.map((t, idx) => {
                                        const active = activeTradeIndex === idx;
                                        return (
                                            <div key={idx} onClick={() => handleTradeClick(t, idx)} className={`flex flex-col p-2.5 rounded-xl cursor-pointer transition-all border ${active ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-transparent hover:border-orange-100/50'}`}>
                                                <div className="flex justify-between items-center w-full">
                                                    <div>
                                                        <div className={`font-bold text-[12px] md:text-[13px] flex items-center gap-1.5 ${active ? 'text-blue-600' : 'text-[#4A403A]'}`}>{t.aptName} {active && <Map size={10} className="text-blue-500 animate-bounce" />}</div>
                                                        <div className={`text-[9px] md:text-[10px] mt-0.5 ${active ? 'text-blue-400' : 'text-gray-400'}`}>전용 {t.area}㎡ · {t.dealDay}일 거래</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-black text-[14px] md:text-[15px] ${active ? 'text-blue-600' : 'text-[#ff6f42]'}`}>{t.price}<span className="text-[10px] md:text-[11px] font-bold ml-0.5">만원</span></div>
                                                    </div>
                                                </div>
                                                {active && selectedTrend.length > 0 && (
                                                    <div className="mt-4 pt-4 border-t border-blue-100/60">
                                                        <div className="relative w-[calc(100%-24px)] mx-auto h-[50px] mb-5">
                                                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                                <defs><linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" /><stop offset="100%" stopColor="rgba(59, 130, 246, 0)" /></linearGradient></defs>
                                                                <path d={fillPath} fill="url(#gradientLine)" vectorEffect="non-scaling-stroke" /><path d={linePath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                                                            </svg>
                                                            <div className="absolute inset-0 w-full h-full">{pts.map((p, i) => (
                                                                <div key={i} className="absolute flex flex-col items-center" style={{ left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -50%)' }}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full border-[2px] transition-all ${p.isCurrent ? 'bg-[#FF6F42] border-white scale-125' : 'bg-white border-[#3B82F6]'}`}></div>
                                                                    <div className={`absolute bottom-full mb-1 shadow-md font-bold text-[9px] md:text-[10px] px-1 py-0.5 rounded whitespace-nowrap bg-white ${p.isCurrent ? 'text-[#FF6F42]' : 'text-[#3B82F6]'}`}>{p.price.toLocaleString()}</div>
                                                                </div>
                                                            ))}</div>
                                                            <div className="absolute top-full left-0 w-full h-4 mt-2">{pts.map((p, i) => (<div key={i} className="absolute transform -translate-x-1/2" style={{ left: `${p.x}%` }}><span className={`text-[8px] md:text-[9px] whitespace-nowrap ${p.isCurrent ? 'font-extrabold text-[#FF6F42]' : 'text-gray-400'}`}>{p.month}</span></div>))}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}</div>
                                ) : <div className="text-center py-10 text-gray-400 text-[11px] md:text-[12px]">데이터 없음</div>}
                            </div>
                            {trades.length > 4 && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/90 to-transparent pointer-events-none rounded-b-2xl border-b border-[#efeadd] flex items-end justify-center pb-3 z-10">
                                    <button onClick={() => tradesScrollRef.current?.scrollBy({ top: 250, behavior: 'smooth' })} className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-500 text-[10px] md:text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 hover:text-[#ff6f42] hover:border-orange-200 hover:bg-orange-50/30 active:scale-95 transition-all">더보기 <ChevronDown size={14} className="text-[#ff6f42] animate-bounce" /></button>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col w-full relative mt-2 lg:mt-0">
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 shrink-0"><Newspaper className="text-[#ff6f42] w-4 h-4" /> 이 현장 관련 뉴스</h3>
                            <div ref={newsScrollRef} className="h-[340px] md:h-[380px] overflow-y-auto scrollbar-hide pr-1 w-full relative scroll-smooth">
                                {isApiLoading ? <div className="text-center py-10 text-gray-400 text-[11px] md:text-[12px]">가져오는 중...</div> : news.length > 0 ? (
                                    <div className="space-y-2 pb-16">
                                        {news.map((item, idx) => (
                                            <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="block bg-white p-3 rounded-xl border border-gray-100 hover:border-[#ff6f42] hover:shadow-sm transition-all group">
                                                <h4 className="font-bold text-[#2d2d2d] text-[12px] md:text-[13px] mb-1 group-hover:text-[#ff6f42] line-clamp-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                                                <div className="flex justify-between items-center"><p className="text-[10px] md:text-[11px] text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} /><ChevronRight size={12} className="text-gray-300" /></div>
                                            </a>
                                        ))}
                                    </div>
                                ) : <div className="text-center py-10 text-gray-400 text-[11px] md:text-[12px]">관련 뉴스 없음</div>}
                            </div>
                            {news.length > 4 && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f8f9fa] via-[#f8f9fa]/90 to-transparent pointer-events-none flex items-end justify-center pb-3 z-10">
                                    <button onClick={() => newsScrollRef.current?.scrollBy({ top: 250, behavior: 'smooth' })} className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-500 text-[10px] md:text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 hover:text-[#ff6f42] hover:border-orange-200 hover:bg-orange-50/30 active:scale-95 transition-all">더보기 <ChevronDown size={14} className="text-[#ff6f42] animate-bounce" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 py-6 mb-4 border-b border-gray-100">
                        <Link href={property.link || "#"} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-[#2d2d2d] text-[#2d2d2d] rounded-xl font-bold text-[13px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all"><Globe size={16} /> 홈페이지 방문</Link>
                        <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-[#3c1e1e] rounded-xl font-black text-[13px] shadow-sm hover:bg-[#F4DC00] active:scale-95 transition-all"><MessageCircle size={16} fill="currentColor" /> 상담 및 예약</Link>
                    </div>

                    <div className="mt-8"><ReviewSection propertyId={String(property.id)} /></div>
                </div>
            </div>
        </main>
    );
}