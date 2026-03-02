"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { Users, Maximize, Calendar, Car, ArrowLeft, Globe, MessageCircle, Sparkles, Tag, Flame, TrendingUp, Newspaper, Calculator, Landmark, BarChart3, MapPin, CheckCircle } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";
import ReviewSection from "../../../components/ReviewSection";
import PropertyLikeButton from "../../../components/PropertyLikeButton";
import LoginButton from "../../../components/LoginButton"; // 🚀 [신규 추가] 프로필 & 알림 버튼 불러오기

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

    useEffect(() => {
        async function loadProperty() {
            setLiveViewers(Math.floor(Math.random() * 15) + 8);
            setTodayCalls(Math.floor(Math.random() * 5) + 3);
            try {
                const allProperties = await getPropertiesFromSheet();
                const found = allProperties.find((p: Property) => String(p.id) === params.id);
                if (found) setProperty(found);
            } catch (error) {
                console.error("매물 로드 실패:", error);
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
                const lawdCd = p.lawdCd || "26440";
                const compareApt = p.compareApt || "";
                const searchKeyword = p.searchKeyword || `${property?.title} 호재`;
                const dealYmd = "202601";

                const [newsRes, tradeRes] = await Promise.all([
                    fetch(`/api/naver?query=${encodeURIComponent(searchKeyword)}`),
                    fetch(`/api/molit?lawdCd=${lawdCd}&dealYmd=${dealYmd}`)
                ]);

                const newsData = await newsRes.json();
                if (newsData.items) setNews(newsData.items);

                const tradeXml = await tradeRes.text();
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(tradeXml, "text/xml");
                const items = xmlDoc.getElementsByTagName("item");
                const tradeList = [];

                for (let i = 0; i < items.length; i++) {
                    const aptNm = items[i].getElementsByTagName("aptNm")[0]?.textContent;
                    const dealAmount = items[i].getElementsByTagName("dealAmount")[0]?.textContent;
                    const excluUseAr = items[i].getElementsByTagName("excluUseAr")[0]?.textContent;
                    const dealDay = items[i].getElementsByTagName("dealDay")[0]?.textContent;

                    if (aptNm && dealAmount) {
                        tradeList.push({
                            aptName: aptNm.trim(),
                            price: dealAmount.trim(),
                            area: excluUseAr ? Math.round(Number(excluUseAr)) : 0,
                            dealDay: dealDay?.trim() || "-"
                        });
                    }
                }

                let filteredTrades = tradeList;
                if (compareApt) {
                    filteredTrades = tradeList.filter(t => t.aptName.includes(compareApt));
                }
                setTrades(filteredTrades.slice(0, 5));

            } catch (error) {
                console.error("API 연동 에러:", error);
            } finally {
                setIsApiLoading(false);
            }
        }
        fetchExternalData();
    }, [property]);

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps || !property) return;
        window.kakao.maps.load(() => {
            const container = document.getElementById('kakao-map');
            if (!container) return;

            const prop = property as any;
            let coords;

            if (prop.coordinates && prop.coordinates.includes(',')) {
                const [lat, lng] = prop.coordinates.split(',').map((c: string) => parseFloat(c.trim()));
                coords = new window.kakao.maps.LatLng(lat, lng);
                renderMap(container, coords);
            } else {
                const geocoder = new window.kakao.maps.services.Geocoder();
                const targetAddress = prop.mapAddress ? prop.mapAddress : property.location;
                geocoder.addressSearch(targetAddress, function (result: any, status: any) {
                    if (status === window.kakao.maps.services.Status.OK) {
                        coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                    } else {
                        coords = new window.kakao.maps.LatLng(35.1795543, 129.0756416);
                    }
                    renderMap(container, coords);
                });
            }
        });
    };

    const renderMap = (container: HTMLElement, coords: any) => {
        const options = { center: coords, level: 4 };
        const map = new window.kakao.maps.Map(container, options);
        const marker = new window.kakao.maps.Marker({ map: map, position: coords });
        const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;font-weight:bold;color:#ff6f42;text-align:center;">${property?.title}</div>`
        });
        infowindow.open(map, marker);
    };

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-2.5 py-1 md:px-4 md:py-1.5 rounded-md md:rounded-lg text-[10px] md:text-[11px] font-bold shadow-sm transition-all duration-300 flex items-center gap-1 shrink-0 whitespace-nowrap";
        const palette = ["bg-[#fecaca] text-[#b91c1c] border border-[#fca5a5]", "bg-[#bfdbfe] text-[#1d4ed8] border border-[#93c5fd]", "bg-[#fef3c7] text-[#92400e] border border-[#fde68a]"];
        return `${base} ${palette[index % palette.length]} ${index < 3 ? "shimmer-effect" : ""}`;
    };

    const parsePriceList = (priceString: string) => {
        if (!priceString) return [];
        if (!priceString.includes('/')) return [{ type: '대표가', price: priceString }];
        return priceString.split('/').map(item => {
            const [type, price] = item.split(':');
            return { type: type ? type.trim() : '타입', price: price ? price.trim() : item.trim() };
        });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">정보를 불러오고 있습니다...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center">매물을 찾을 수 없습니다.</div>;

    const priceList = parsePriceList(property.price);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`} onLoad={initMap} />
            <style dangerouslySetInnerHTML={{ __html: `@keyframes sweep { 0% { left: -150%; } 100% { left: 150%; } } .shimmer-effect::after { content: ""; position: absolute; top: 0; width: 50px; height: 100%; background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent); transform: skewX(-20deg); animation: sweep 3s infinite; }` }} />

            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-800 opacity-80 truncate max-w-[200px]">{property.title}</span>


                {/* 🚀 우측 상단에 로그인/프로필 버튼 배치 */}
                <div className="flex items-center justify-end w-10">
                    <div className="-mr-2">
                        <LoginButton compact />  {/* 👈 여기에 compact 추가! */}
                    </div>
                </div>
            </nav>

            <div className="relative w-full h-[45vh] md:h-[50vh]">
                <Image src={property.image || "/house1.jpg"} alt={property.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
            </div>

            <div className="relative -mt-10 z-10 px-4 md:px-0 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-xl p-5 md:p-10 border border-gray-50">
                    {/* 🚀 라이브 보드 섹션 */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </div>
                            <p className="text-[12px] md:text-[13px] font-bold text-[#4A403A]">
                                현재 <span className="text-red-500 font-black">{liveViewers}명</span>이 이 단지를 함께 보고 있습니다.
                            </p>
                        </div>
                        <div className="hidden sm:block w-[1px] h-3 bg-orange-200"></div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <p className="text-[11px] md:text-[12px] font-bold text-gray-500">
                                오늘 <span className="text-[#4A403A] font-black">{todayCalls}명</span>이 상담 신청을 완료했습니다.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-5 w-full">
                        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto scrollbar-hide pr-2">
                            {property.status.map((tag, i) => (
                                <span key={i} className={getStatusStyle(i)}>
                                    {i === 0 && <Flame size={12} className="fill-current shrink-0" />} {tag}
                                </span>
                            ))}
                        </div>
                        <div className="shrink-0 pl-1">
                            <PropertyLikeButton propertyId={String(property.id)} />
                        </div>
                    </div>

                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-[#2d2d2d] leading-tight mb-2">{property.title}</h1>
                        <p className="text-gray-400 font-medium text-xs md:text-sm flex items-center gap-1"><MapPin size={14} className="md:w-4 md:h-4" /> {property.location}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                        {[
                            { icon: Users, label: "세대수", value: property.households, color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: Maximize, label: "평형정보", value: property.size, color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: Calendar, label: "입주예정", value: property.moveIn, color: "text-emerald-500", bg: "bg-emerald-50" },
                            { icon: Car, label: "주차대수", value: property.parking, color: "text-purple-500", bg: "bg-purple-50" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 md:gap-2">
                                <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-full flex items-center justify-center`}><item.icon size={14} className="md:w-4 md:h-4" /></div>
                                <span className="text-[10px] md:text-[11px] text-gray-400 font-semibold">{item.label}</span>
                                <span className="text-xs md:text-sm font-bold text-gray-800 text-center">{item.value || "-"}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mb-8">
                        <h3 className="text-[13px] md:text-sm font-bold text-gray-400 mb-3 flex items-center gap-1"><Tag size={14} /> 분양가 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
                            {priceList.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3.5 md:p-4 bg-[#fdfbf7] rounded-xl border border-orange-100">
                                    <span className="text-[11px] md:text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">{item.type}</span>
                                    <span className="text-base md:text-lg font-black text-[#ff6f42]">{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 md:gap-3 mb-8">
                        <Link href="/tools/tax" className="flex flex-col items-center justify-center gap-1 md:gap-1.5 py-3 md:py-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#ff6f42] hover:shadow-md transition-all group">
                            <div className="text-blue-500 group-hover:scale-110 transition-transform"><Calculator size={18} className="md:w-5 md:h-5" /></div>
                            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 whitespace-nowrap tracking-tighter">취득세 계산</span>
                        </Link>
                        <Link href="/tools/loan" className="flex flex-col items-center justify-center gap-1 md:gap-1.5 py-3 md:py-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#ff6f42] hover:shadow-md transition-all group">
                            <div className="text-emerald-500 group-hover:scale-110 transition-transform"><Landmark size={18} className="md:w-5 md:h-5" /></div>
                            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 whitespace-nowrap tracking-tighter">대출이자 계산</span>
                        </Link>
                        <Link href="/tools/yield" className="flex flex-col items-center justify-center gap-1 md:gap-1.5 py-3 md:py-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-[#ff6f42] hover:shadow-md transition-all group">
                            <div className="text-orange-500 group-hover:scale-110 transition-transform"><BarChart3 size={18} className="md:w-5 md:h-5" /></div>
                            <span className="text-[10px] md:text-[11px] font-bold text-gray-600 whitespace-nowrap tracking-tighter">수익률 계산</span>
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base md:text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 md:mb-4"><Sparkles className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" />Premium Point</h3>
                        <div className="text-gray-600 leading-[1.8] md:leading-8 whitespace-pre-wrap text-[13px] md:text-[15px] font-medium bg-[#f1f5f9] p-5 md:p-6 rounded-2xl border border-[#e2e8f0]">
                            {property.description}
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base md:text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 md:mb-4">
                            <MapPin className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" /> 현장 위치 안내
                        </h3>
                        <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 h-[250px] md:h-[400px] relative">
                            <div id="kakao-map" className="w-full h-full"></div>
                        </div>
                        <p className="text-[10px] md:text-xs text-gray-400 mt-2 font-medium ml-1">※ 현장 상황에 따라 실제 위치와 약간의 오차가 있을 수 있습니다.</p>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base md:text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 md:mb-4">
                            <TrendingUp className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" /> 주변 아파트 실거래가 <span className="text-[10px] md:text-xs text-gray-400 font-medium ml-1">최근 1개월</span>
                        </h3>
                        <div className="bg-[#fdfbf7] border border-[#efeadd] rounded-2xl p-4 md:p-6">
                            {isApiLoading ? (
                                <div className="text-center py-5 text-gray-400 text-[12px] md:text-sm animate-pulse">데이터를 수집 중입니다...</div>
                            ) : trades.length > 0 ? (
                                <div className="space-y-3 md:space-y-4">
                                    {trades.map((trade, idx) => (
                                        <div key={idx} className="flex justify-between items-center pb-2.5 md:pb-3 border-b border-gray-200/60 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-bold text-[#4A403A] text-[13px] md:text-[14px]">{trade.aptName}</div>
                                                <div className="text-[10px] md:text-[11px] text-gray-400 mt-0.5">전용 {trade.area}㎡ · {trade.dealDay}일 거래</div>
                                            </div>
                                            <div className="font-black text-[#ff6f42] text-[15px] md:text-[16px]">{trade.price}<span className="text-[11px] md:text-[12px] font-bold ml-0.5">만원</span></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-gray-400 text-[12px] md:text-sm">해당 지역의 실거래 데이터가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base md:text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-3 md:mb-4">
                            <Newspaper className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" /> 이 현장 관련 뉴스
                        </h3>
                        {isApiLoading ? (
                            <div className="text-center py-5 text-gray-400 text-[12px] md:text-sm animate-pulse">뉴스를 가져오는 중...</div>
                        ) : news.length > 0 ? (
                            <div className="grid gap-2.5 md:gap-3">
                                {news.map((item, idx) => (
                                    <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="block bg-white p-3.5 md:p-4 rounded-xl border border-gray-100 hover:border-[#ff6f42] transition-all group">
                                        <h4 className="font-bold text-[#2d2d2d] text-[13px] md:text-sm mb-1 group-hover:text-[#ff6f42] line-clamp-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                                        <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-gray-400 text-[12px] md:text-sm">관련 뉴스가 없습니다.</div>
                        )}
                    </div>

                    <div className="mt-8 md:mt-12">
                        <ReviewSection propertyId={String(property.id)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-5 md:mt-6">
                    <Link href={property.link || "#"} target="_blank" className="flex items-center justify-center gap-2 w-full py-3.5 md:py-4 bg-white border-2 border-[#2d2d2d] text-[#2d2d2d] rounded-2xl font-bold hover:bg-[#2d2d2d] hover:text-white transition-all text-[15px] md:text-lg shadow-sm">
                        <Globe size={18} className="md:w-5 md:h-5" />홈페이지 방문
                    </Link>
                    <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="flex items-center justify-center gap-2 w-full py-3.5 md:py-4 bg-[#FEE500] text-[#3c1e1e] rounded-2xl font-bold hover:bg-[#fdd835] transition-all text-[15px] md:text-lg shadow-md">
                        <MessageCircle size={18} fill="currentColor" className="md:w-5 md:h-5" />관심고객 등록 / 상담
                    </Link>
                </div>
            </div>
        </main>
    );
}