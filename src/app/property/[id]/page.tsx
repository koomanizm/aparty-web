"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Maximize, Calendar, Car, ArrowLeft, Globe, MessageCircle, Phone, Sparkles, Tag, Flame, TrendingUp, Newspaper } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // API 데이터를 담을 상태
    const [news, setNews] = useState<any[]>([]);
    const [trades, setTrades] = useState<any[]>([]);
    const [isApiLoading, setIsApiLoading] = useState(true);

    // 1. 매물 기본 정보 불러오기
    useEffect(() => {
        async function loadProperty() {
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

    // 2. 외부 데이터(시세, 뉴스) 호출
    useEffect(() => {
        if (!property) return;

        async function fetchExternalData() {
            setIsApiLoading(true);
            try {
                const p = property as any;
                const lawdCd = p.lawdCd || "26440";
                const compareApt = p.compareApt || "";
                const searchKeyword = p.searchKeyword || `${property?.location} 아파트 호재`;
                const dealYmd = "202601";

                // 네이버 뉴스 및 국토부 실거래가 동시 호출
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

    // --- 헬퍼 함수 ---
    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-4 py-1.5 rounded-lg text-[11px] font-bold shadow-sm border-b-2 transition-all duration-300 flex items-center gap-1.5";
        const palette = ["bg-[#fecaca] text-[#b91c1c] border-[#fca5a5]", "bg-[#bfdbfe] text-[#1d4ed8] border-[#93c5fd]", "bg-[#fef3c7] text-[#92400e] border-[#fde68a]", "bg-[#bbf7d0] text-[#15803d] border-[#86efac]", "bg-[#ddd6fe] text-[#6d28d9] border-[#c4b5fd]", "bg-[#fed7aa] text-[#c2410c] border-[#fdba74]"];
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

    // 🛡️ 중요: 데이터 로딩 중이거나 매물이 없을 때 렌더링 방지 (Null Check)
    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">정보를 불러오고 있습니다...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center">매물을 찾을 수 없습니다.</div>;

    const priceList = parsePriceList(property.price);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes sweep { 0% { left: -150%; } 100% { left: 150%; } }
        .shimmer-effect::after {
          content: ""; position: absolute; top: 0; width: 50px; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
          transform: skewX(-20deg); animation: sweep 3s infinite;
        }
      `}} />

            {/* 네비게이션 */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-800 opacity-80 truncate max-w-[200px]">{property.title}</span>
                <div className="w-10"></div>
            </nav>

            {/* 이미지 섹션 */}
            <div className="relative w-full h-[45vh] md:h-[50vh]">
                <Image src={property.image || "/house1.jpg"} alt={property.title} fill className="object-cover" priority />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
            </div>

            <div className="relative -mt-10 z-10 px-4 md:px-0 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-10 border border-gray-50">

                    {/* 뱃지 영역 */}
                    <div className="flex flex-wrap gap-2.5 mb-5">
                        {property.status.map((tag, i) => (
                            <span key={i} className={getStatusStyle(i)}>
                                {i === 0 && <Flame size={13} className="fill-current" />} {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-[#2d2d2d] leading-tight mb-2">{property.title}</h1>
                        <p className="text-gray-400 font-medium text-sm">📍 {property.location}</p>
                    </div>

                    {/* 4대 지표 그리드 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                        {[
                            { icon: Users, label: "세대수", value: property.households, color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: Maximize, label: "평형정보", value: property.size, color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: Calendar, label: "입주예정", value: property.moveIn, color: "text-emerald-500", bg: "bg-emerald-50" },
                            { icon: Car, label: "주차대수", value: property.parking, color: "text-purple-500", bg: "bg-purple-50" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2">
                                <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-full flex items-center justify-center`}><item.icon size={16} /></div>
                                <span className="text-[11px] text-gray-400 font-semibold">{item.label}</span>
                                <span className="text-sm font-bold text-gray-800 text-center">{item.value || "-"}</span>
                            </div>
                        ))}
                    </div>

                    {/* 분양가 정보 */}
                    <div className="mb-10">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-1"><Tag size={14} /> 분양가 정보</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {priceList.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-[#fdfbf7] rounded-xl border border-orange-100">
                                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">{item.type}</span>
                                    <span className="text-lg font-black text-[#ff6f42]">{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 🚀 실거래가 비교 리포트 */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4">
                            <TrendingUp className="text-[#ff6f42] w-5 h-5" /> 주변 아파트 실거래가 <span className="text-xs text-gray-400 font-medium ml-1">최근 1개월</span>
                        </h3>
                        <div className="bg-[#fdfbf7] border border-[#efeadd] rounded-2xl p-4 md:p-6">
                            {isApiLoading ? (
                                <div className="text-center py-5 text-gray-400 text-sm animate-pulse">데이터를 수집 중입니다...</div>
                            ) : trades.length > 0 ? (
                                <div className="space-y-4">
                                    {trades.map((trade, idx) => (
                                        <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-200/60 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-bold text-[#4A403A]">{trade.aptName}</div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">전용 {trade.area}㎡ · {trade.dealDay}일 거래</div>
                                            </div>
                                            <div className="font-black text-[#ff6f42]">{trade.price}<span className="text-sm font-bold">만원</span></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-gray-400 text-sm">해당 지역의 실거래 데이터가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 🚀 관련 호재 뉴스 */}
                    <div className="mb-10">
                        <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4">
                            <Newspaper className="text-[#ff6f42] w-5 h-5" /> 관련 호재 뉴스
                        </h3>
                        {isApiLoading ? (
                            <div className="text-center py-5 text-gray-400 text-sm animate-pulse">뉴스를 가져오는 중...</div>
                        ) : news.length > 0 ? (
                            <div className="grid gap-3">
                                {news.map((item, idx) => (
                                    <a key={idx} href={item.link} target="_blank" rel="noreferrer" className="block bg-white p-4 rounded-xl border border-gray-100 hover:border-[#ff6f42] transition-all group">
                                        <h4 className="font-bold text-[#2d2d2d] text-sm mb-1 group-hover:text-[#ff6f42] line-clamp-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                                        <p className="text-xs text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.description }} />
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-gray-400 text-sm">관련 뉴스가 없습니다.</div>
                        )}
                    </div>

                    {/* 프리미엄 포인트 */}
                    <div className="prose prose-lg max-w-none">
                        <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4"><Sparkles className="text-[#ff6f42] w-5 h-5" />Premium Point</h3>
                        <div className="text-gray-600 leading-8 whitespace-pre-wrap text-base font-medium bg-[#f1f5f9] p-6 rounded-2xl border border-[#e2e8f0]">
                            {property.description}
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Link href={property.link || "#"} target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-[#2d2d2d] text-[#2d2d2d] rounded-2xl font-bold hover:bg-[#2d2d2d] hover:text-white transition-all text-lg shadow-sm">
                        <Globe size={20} />홈페이지 방문
                    </Link>
                    <Link href="http://pf.kakao.com/_EbnAX" target="_blank" className="flex items-center justify-center gap-2 w-full py-4 bg-[#FEE500] text-[#3c1e1e] rounded-2xl font-bold hover:bg-[#fdd835] transition-all text-lg shadow-md">
                        <MessageCircle size={20} fill="currentColor" />관심고객 등록 / 상담
                    </Link>
                </div>
            </div>

            {/* 모바일 하단 플로팅 바 */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                <div className="bg-[#2d2d2d] text-white rounded-full shadow-2xl p-1.5 flex items-center justify-between pl-6 pr-2 backdrop-blur-md bg-opacity-95">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">상담 문의하기</span>
                        <span className="text-sm font-bold">전문 상담사와 연결</span>
                    </div>
                    <a href="tel:010-0000-0000" className="bg-[#ff6f42] rounded-full p-3 transition-colors">
                        <Phone size={20} fill="currentColor" />
                    </a>
                </div>
            </div>
        </main>
    );
}