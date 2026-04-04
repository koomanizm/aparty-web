"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
    Users, Maximize, Calendar, Car, ArrowLeft,
    Sparkles, Tag, Flame, TrendingUp,
    Newspaper, Calculator, Landmark, BarChart3, MapPin,
    CheckCircle, ChevronRight, Crosshair, Map, ChevronDown, Phone,
    Building2
} from "lucide-react";
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";
import { getPropertyStats, incrementView, fetchPropertyViews } from "../../../lib/propertyUtils";

import ReviewSection from "../../../components/community/ReviewSection";
import PropertyLikeButton from "../../../components/property/PropertyLikeButton";
import LoginButton from "../../../components/auth/LoginButton";

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

    const [liveViewers, setLiveViewers] = useState(0);
    const [todayCalls, setTodayCalls] = useState(0);

    const [bottomOffset, setBottomOffset] = useState(0);

    // 🚀 추천 단지 관련 상태 & 임시 로그인 상태
    const [recommendedProperties, setRecommendedProperties] = useState<Property[]>([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 추후 Supabase 연동 시 실제 Auth 상태로 교체

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mainCoordsRef = useRef<any>(null);
    const activeOverlaysRef = useRef<{ marker: any; polyline: any; distanceOverlay: any }>({ marker: null, polyline: null, distanceOverlay: null });
    const [activeTradeIndex, setActiveTradeIndex] = useState<number | null>(null);

    const tradesScrollRef = useRef<HTMLDivElement>(null);
    const newsScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollBottom = documentHeight - (scrollY + windowHeight);

            if (scrollBottom < 200) setBottomOffset(200 - scrollBottom);
            else setBottomOffset(0);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        async function loadProperty() {
            if (!params.id) return;
            const targetId = String(params.id);

            try {
                await incrementView(targetId);
                const todayCount = await fetchPropertyViews(targetId);
                const { watching } = getPropertyStats(todayCount);
                setLiveViewers(watching);
                setTodayCalls(Math.floor(todayCount / 5) + 3);

                const allProperties = await getPropertiesFromSheet();
                const found = allProperties.find((p: Property) => String(p.id) === targetId);

                if (found) {
                    setProperty(found);

                    // 🚀 추천 단지 필터링 로직 (현재 지역 기반)
                    const currentRegion = found.location ? found.location.split(' ').slice(0, 2).join(' ') : "";

                    let filteredRecs = allProperties.filter((p: Property) =>
                        p.id !== found.id && p.location?.includes(currentRegion)
                    );

                    if (filteredRecs.length < 3) {
                        const extraRecs = allProperties.filter((p: Property) => p.id !== found.id);
                        filteredRecs = extraRecs;
                    }

                    setRecommendedProperties(filteredRecs.slice(0, 6));
                }

            } catch (error) {
                console.error("상세페이지 연동 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProperty();
    }, [params.id]);

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
                setTrades((p.compareApt ? tradeList.filter((t: any) => t.aptName.includes(p.compareApt)) : tradeList).slice(0, 15));
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
        clearMapOverlays(); setActiveTradeIndex(null);
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

    const p = property as any;
    const depositPct = p.deposit_pct || "10";
    const initialDeposit = p.initial_deposit;
    const loanCondition = p.loan_condition || "조건 확인 필요";
    const financialNote = p.financial_note || "";

    const getDepositAmount = () => {
        if (initialDeposit) {
            const val = parseInt(String(initialDeposit).replace(/,/g, ''), 10);
            return Math.floor(val / 10000).toLocaleString();
        }
        const displayPrice = property.price || "";
        const cleanStr = displayPrice.replace(/,/g, '');
        const numMatches = cleanStr.match(/\d{7,}/g);
        if (numMatches && numMatches.length > 0) {
            const minVal = Math.min(...numMatches.map(n => parseInt(n, 10)));
            const depositInManwon = Math.floor((minVal * (parseInt(depositPct) / 100)) / 10000);
            return depositInManwon.toLocaleString();
        }
        return "- ";
    };

    const dummyTypes = [
        { type: "084.9754A", area: 115.90, count: 34, minPrice: "5억 5,800", maxPrice: "5억 7,500" },
        { type: "084.9765B", area: 115.68, count: 35, minPrice: "5억 5,300", maxPrice: "5억 7,500" },
        { type: "103.9511", area: 139.57, count: 70, minPrice: "6억 7,000", maxPrice: "6억 9,800" }
    ];

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-24 md:pb-32">
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
                <div className="bg-white rounded-[2rem] shadow-xl p-4 md:p-10 border border-gray-50 mb-10">

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

                    <div className="flex items-center justify-between mb-5 w-full">
                        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pr-2">{property.status.map((tag, i) => (<span key={i} className={getStatusStyle(i)}>{i === 0 && <Flame size={12} className="fill-white shrink-0" />} {tag}</span>))}</div>
                        <div className="shrink-0 pl-1"><PropertyLikeButton propertyId={String(property.id)} /></div>
                    </div>

                    <div className="mb-6 border-b border-gray-100 pb-6 overflow-hidden">
                        {/* 🚀 단지명 텍스트 크기 구간별 2px 축소 적용 */}
                        <h1 className="text-[16px] sm:text-[20px] md:text-[28px] font-black text-[#2d2d2d] leading-tight mb-1 truncate block w-full tracking-tighter">{property.title}</h1>
                        {/* 🚀 주소 아이콘 색상 진한 주황(#ff6f42) 적용 */}
                        <p className="text-gray-400 font-medium text-[11px] md:text-sm flex items-center gap-1 mt-1 mb-4 truncate"><MapPin size={12} className="text-[#ff6f42]" /> {property.location}</p>

                        <div className="bg-[#FF8C42]/5 border border-[#FF8C42]/20 rounded-xl p-4 md:p-5">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[11px] sm:text-[13px] font-extrabold text-[#FF8C42] flex items-center gap-1.5 shrink-0">
                                    <CheckCircle size={14} strokeWidth={2.5} /> 최소 진입 자금
                                </span>
                                <span className="text-[clamp(16px,4.5vw,22px)] font-black text-[#FF8C42] tracking-tight whitespace-nowrap">
                                    약 {getDepositAmount()}<span className="text-[clamp(12px,3vw,14px)] font-bold ml-0.5 text-orange-600">만원 {initialDeposit ? "정액제" : "부터"}</span>
                                </span>
                            </div>
                            <p className="text-[clamp(9px,2.5vw,11px)] font-bold text-gray-600 text-right mt-1 mb-1">
                                {initialDeposit ? "동호수 지정 계약 가능 금액" : `계약금 ${depositPct}% 기준 추정가`}
                            </p>
                            <p className="text-[clamp(8px,2vw,10px)] text-gray-400 text-right">* 타입·층수·공급 조건에 따라 상이할 수 있습니다.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                        {[{ icon: Users, label: "세대수", value: property.households, color: "text-blue-500", bg: "bg-blue-50" }, { icon: Maximize, label: "평형정보", value: property.size, color: "text-orange-500", bg: "bg-orange-50" }, { icon: Calendar, label: "입주예정", value: property.moveIn, color: "text-emerald-500", bg: "bg-emerald-50" }, { icon: Car, label: "주차대수", value: property.parking, color: "text-purple-500", bg: "bg-purple-50" }].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center justify-center gap-1"><div className={`w-7 h-7 md:w-8 md:h-8 ${item.bg} ${item.color} rounded-full flex items-center justify-center`}><item.icon className="w-3 h-3 md:w-3.5 md:h-3.5" /></div><span className="text-[9px] md:text-[11px] text-gray-400 font-semibold">{item.label}</span><span className="text-[11px] md:text-[13px] font-bold text-gray-800 text-center truncate px-1">{item.value || "-"}</span></div>
                        ))}
                    </div>

                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-[14px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2">
                                <Tag className="text-[#ff6f42] w-4 h-4" /> 공급 대상 및 분양가
                            </h3>
                        </div>

                        <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white scrollbar-hide">
                            <table className="w-full min-w-[600px] text-[12px] md:text-[13px] text-center whitespace-nowrap">
                                <thead className="bg-[#F8F9FA] border-b border-gray-200 text-gray-600">
                                    <tr>
                                        <th className="py-3 px-4 font-bold border-r border-gray-100">주택형</th>
                                        <th className="py-3 px-4 font-bold border-r border-gray-100">공급면적 (㎡/평)</th>
                                        <th className="py-3 px-4 font-bold border-r border-gray-100">세대수</th>
                                        <th className="py-3 px-4 font-bold border-r border-gray-100">최저가</th>
                                        <th className="py-3 px-4 font-bold">최고가</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {dummyTypes.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 border-r border-gray-100 font-bold text-[#2d2d2d]">
                                                {item.type.replace(/^0+/, '').replace(/\.\d+/, '')}
                                            </td>
                                            <td className="py-3 px-4 border-r border-gray-100">
                                                {item.area} <span className="text-gray-400">({Math.round(item.area / 3.3058)}평)</span>
                                            </td>
                                            <td className="py-3 px-4 border-r border-gray-100">{item.count}</td>
                                            <td className="py-3 px-4 border-r border-gray-100 text-right pr-4 md:pr-6 font-medium">
                                                {item.minPrice}<span className="text-[11px] text-gray-500 ml-0.5">만원</span>
                                            </td>
                                            <td className="py-3 px-4 text-right pr-4 md:pr-6 font-medium">
                                                {item.maxPrice}<span className="text-[11px] text-gray-500 ml-0.5">만원</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 text-right flex items-center justify-end gap-1">
                            * 세부 층별, 동별 정확한 분양가는 모집공고 및 상담을 통해 확인 바랍니다.
                        </p>
                    </div>

                    {/* 🚀 자금 조달 흐름 섹션 */}
                    <div className="mb-10">
                        <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2 mb-3">
                            <Landmark className="text-[#ff6f42] w-4 h-4" /> 자금 조달 흐름 한눈에 보기
                        </h3>
                        <div className="bg-gray-50 p-5 md:p-6 rounded-2xl border border-gray-100">
                            <div className="relative pl-3 md:pl-4">
                                <div className="absolute left-[17px] md:left-[21px] top-2 bottom-2 w-0.5 bg-gray-200"></div>

                                <div className="space-y-6">
                                    <div className="relative flex items-start gap-4 md:gap-5">
                                        <div className="relative z-10 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-[#FF8C42] border-[3px] border-gray-50 mt-1 shrink-0"></div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-orange-100 text-orange-600 border border-orange-200">계약시</span>
                                                <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800">
                                                    {initialDeposit ? "1차 계약금" : "계약금"}
                                                </h3>
                                            </div>
                                            <p className="text-[14px] md:text-[15px] font-black text-[#FF8C42] mb-1">
                                                {initialDeposit ? `${getDepositAmount()}만원 (정액제)` : `분양가의 ${depositPct}%`}
                                            </p>
                                            <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                                {initialDeposit ? "부담 없는 금액으로 동호수 우선 지정 계약이 진행됩니다." : "정계약 체결을 위한 초기 자금입니다."}
                                                {financialNote && <span className="block text-blue-600 font-bold mt-0.5">✓ {financialNote}</span>}
                                            </p>
                                        </div>
                                    </div>

                                    {initialDeposit && (
                                        <div className="relative flex items-start gap-4 md:gap-5">
                                            <div className="relative z-10 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-orange-300 border-[3px] border-gray-50 mt-1 shrink-0"></div>
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gray-200 text-gray-600 border border-gray-300">계약 후 지정일</span>
                                                    <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800">2차 계약금</h3>
                                                </div>
                                                <p className="text-[14px] md:text-[15px] font-black text-gray-700 mb-1">
                                                    나머지 잔여 계약금
                                                </p>
                                                <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                                    1차 계약금을 제외한 나머지 계약금을 납부합니다. (대출 알선 등 조건 확인 필요)
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative flex items-start gap-4 md:gap-5">
                                        <div className="relative z-10 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-emerald-500 border-[3px] border-gray-50 mt-1 shrink-0"></div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-600 border border-emerald-200">공사 진행중</span>
                                                <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800">중도금</h3>
                                            </div>
                                            <p className="text-[14px] md:text-[15px] font-black text-emerald-600 mb-1">
                                                {loanCondition}
                                            </p>
                                            <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                                {loanCondition.includes("무이자")
                                                    ? "입주 전까지 중도금 이자 부담이 전혀 발생하지 않습니다."
                                                    : "중도금 대출 이자 조건 등은 상세 상담을 통해 안내해 드립니다."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative flex items-start gap-4 md:gap-5">
                                        <div className="relative z-10 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full bg-gray-400 border-[3px] border-gray-50 mt-1 shrink-0"></div>
                                        <div className="flex flex-col w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-gray-200 text-gray-600 border border-gray-300">입주 지정일</span>
                                                <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800">잔금 납부</h3>
                                            </div>
                                            <p className="text-[14px] md:text-[15px] font-black text-gray-700 mb-1">
                                                분양대금 잔액
                                            </p>
                                            <p className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                                잔금 납부 후 소유권 이전이 진행됩니다. (주택담보대출 전환 가능)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

                    <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                            <BarChart3 size={16} className="text-blue-500" />
                            <h3 className="text-[13px] md:text-[14px] font-bold text-gray-800">주변 시세와 비교해 볼 포인트</h3>
                        </div>
                        <div className="text-[11px] md:text-[12px] text-gray-600 bg-gray-50 p-3 rounded-xl leading-relaxed space-y-2">
                            <p className="font-bold text-gray-700">✓ 주변 실거래가 대비 가격 차이를 아래 목록에서 확인해 볼 수 있는 현장입니다.</p>
                            <p>✓ 가격 경쟁력 여부는 타입별 분양가와 실거래 시점을 함께 비교해 보셔야 합니다.</p>
                        </div>
                        <p className="mt-3 text-[9px] md:text-[10px] text-gray-400 text-right">
                            * 비교 수치는 동일 생활권·유사 연식 기준으로 달라질 수 있습니다.
                        </p>
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
                                                        <div className={`font-bold text-[12px] md:text-[13px] flex items-center gap-1.5 ${active ? 'text-blue-600' : 'text-[#4A403A]'}`}>{t.aptName} {active && <Map size={10} className="text-blue-500" />}</div>
                                                        <div className={`text-[9px] md:text-[10px] mt-0.5 ${active ? 'text-blue-400' : 'text-gray-400'}`}>전용 {t.area}㎡ · {t.dealDay}일 거래</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-black text-[14px] md:text-[15px] ${active ? 'text-blue-600' : 'text-[#ff6f42]'}`}>{t.price}<span className="text-[10px] md:text-[11px] font-bold ml-0.5">만원</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}</div>
                                ) : <div className="text-center py-10 text-gray-400 text-[11px] md:text-[12px]">데이터 없음</div>}
                            </div>
                            {trades.length > 4 && (
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#fdfbf7] via-[#fdfbf7]/90 to-transparent pointer-events-none rounded-b-2xl border-b border-[#efeadd] flex items-end justify-center pb-3 z-10">
                                    <button onClick={() => tradesScrollRef.current?.scrollBy({ top: 250, behavior: 'smooth' })} className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-500 text-[10px] md:text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 hover:text-[#ff6f42] hover:border-orange-200 hover:bg-orange-50/30 active:scale-95 transition-all">더보기 <ChevronDown size={14} className="text-[#ff6f42]" /></button>
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
                                    <button onClick={() => newsScrollRef.current?.scrollBy({ top: 250, behavior: 'smooth' })} className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-gray-200 text-gray-500 text-[10px] md:text-[11px] font-bold px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 hover:text-[#ff6f42] hover:border-orange-200 hover:bg-orange-50/30 active:scale-95 transition-all">더보기 <ChevronDown size={14} className="text-[#ff6f42]" /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 mb-2 border-t border-gray-100 pt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[#2d2d2d] flex items-center gap-2">
                                <Building2 className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" />
                                {isLoggedIn ? "나의 관심지역 추천 단지" : "이 지역 다른 추천 단지"}
                            </h3>
                            <Link href="/properties" className="text-[11px] md:text-[12px] text-gray-400 font-bold hover:text-[#ff6f42] flex items-center transition-colors">
                                더보기 <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0">
                            {recommendedProperties.length > 0 ? recommendedProperties.map((rec) => (
                                <Link href={`/property/${rec.id}`} key={rec.id} className="w-[140px] md:w-[180px] shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#ff6f42] hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                    <div className="relative w-full h-[100px] md:h-[120px] bg-gray-100 overflow-hidden">
                                        <Image src={getSafeImage(rec.image)} alt={rec.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-md border border-white/20">
                                            {rec.status?.[0] || "분양중"}
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 justify-between bg-white">
                                        <div>
                                            <h4 className="text-[12px] md:text-[13px] font-black text-[#2d2d2d] line-clamp-1 group-hover:text-[#ff6f42] transition-colors">{rec.title}</h4>
                                            <p className="text-[10px] md:text-[11px] text-gray-500 mt-1 line-clamp-1 flex items-center gap-0.5">
                                                <MapPin size={10} className="text-gray-400" /> {rec.location.split(' ').slice(0, 2).join(' ')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="w-full text-center py-8 text-[12px] text-gray-400 bg-gray-50 rounded-xl border border-gray-100">
                                    현재 지역에 추천해 드릴 다른 단지가 없습니다.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8"><ReviewSection propertyId={String(property.id)} /></div>
                </div>
            </div>

            {/* 🚀 하단 고정 CTA 바 */}
            <div
                className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 px-4 py-2.5 md:py-3 pb-[calc(env(safe-area-inset-bottom,12px)+10px)] md:pb-3 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] transition-transform duration-75 ease-out"
                style={{ transform: `translateY(-${bottomOffset}px)` }}
            >
                <div className="max-w-[480px] mx-auto flex items-center justify-center gap-2.5">
                    <Link
                        href={property.link || "#"}
                        target="_blank"
                        className="flex-1 h-[46px] md:h-[48px] flex items-center justify-center bg-[#1E293B] text-white font-bold rounded-xl text-[14px] md:text-[15px] shadow-sm hover:bg-[#0F172A] transition-all active:scale-[0.98]"
                    >
                        홈페이지
                    </Link>

                    <a
                        href="tel:1566-0000"
                        className="flex-1 h-[46px] md:h-[48px] flex items-center justify-center bg-[#FF6F42] text-white font-bold rounded-xl text-[14px] md:text-[15px] shadow-sm hover:bg-[#e55a2f] transition-all active:scale-[0.98]"
                    >
                        <Phone size={16} className="mr-1.5 fill-white" /> 전화 상담하기
                    </a>
                </div>
            </div>
        </main>
    );
}