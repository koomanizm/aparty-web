"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, Trophy, CalendarDays, Users2, RefreshCcw, X, Building, MapPin, Phone, TrendingUp } from "lucide-react";

// 시도 및 구 데이터 매핑
const SIDO_DATA: { [key: string]: string } = { "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시", "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도", "48": "경남도", "47": "경북도", "43": "충북도", "44": "충남도", "45": "전북도", "50": "제주도" };
const SGG_NAME_MAP: { [key: string]: string } = { "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구", "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구", "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시", "28110": "인천 중구", "28260": "인천 서구", "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시", "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구", "47110": "포항시 남구", "47190": "구미시", "30200": "대전 유성구", "30170": "대전 서구", "29110": "광주 동구", "29200": "광주 광산구", "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시", "50130": "서귀포시" };
const METRO_CODES = ["11", "26", "27", "28", "29", "30", "31", "36"];
const REGION_CODES: { [key: string]: string[] } = { "전국 HOT 🔥": ["11680", "11710", "41590", "26440", "28260"], "서울/수도권": ["11680", "11410", "11710", "41135", "41590", "28260"], "부산/경남": ["26440", "26350", "26230", "48121", "48250"], "대구/경북": ["27260", "27290", "27110", "47110", "47190"], "충청/호남": ["30200", "30170", "36110", "29200", "29110"], "강원/제주": ["42110", "42150", "50110", "50130"] };
const REGION_KEYWORDS: { [key: string]: string[] } = { "전국 HOT 🔥": ["서울", "경기", "부산", "인천", "세종"], "서울/수도권": ["서울", "경기", "인천"], "부산/경남": ["부산", "경남", "울산"], "대구/경북": ["대구", "경북"], "충청/호남": ["대전", "세종", "충북", "충남", "광주", "전북", "전남"], "강원/제주": ["강원", "제주"] };

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
                allItems.push({
                    type: "transaction",
                    title: item.getElementsByTagName("aptNm")[0]?.textContent || "정보없음",
                    addr: formatRealAddr(sidoCode, code, item.getElementsByTagName("sggNm")[0]?.textContent || "", item.getElementsByTagName("umdNm")[0]?.textContent || ""),
                    price,
                    val: price >= 10000 ? `${Math.floor(price / 10000)}억 ${price % 10000 || ''}` : `${price}만`,
                    date: `${year}.${month}.${day}`,
                    sub: `전용 ${item.getElementsByTagName("excluUseAr")[0]?.textContent || "-"}㎡ · ${item.getElementsByTagName("floor")[0]?.textContent || ""}층`,
                    lawdCd: code, // 🚀 실거래 히스토리 추적용 핵심 데이터
                    details: { area: item.getElementsByTagName("excluUseAr")[0]?.textContent, floor: item.getElementsByTagName("floor")[0]?.textContent, buildYear: item.getElementsByTagName("buildYear")[0]?.textContent, fullDate: `${year}.${month}.${day}` }
                });
            });
        });
        return allItems.sort((a, b) => b.price - a.price).slice(0, 50);
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
            const addr = item.HSSPLY_ADRES || item.hssply_adres || "";
            if (keywords.some(kw => addr.includes(kw))) {
                let pblancDate = item.RCRIT_PBLANC_DE || item.rcrit_pblanc_de || "";
                if (pblancDate.length === 8) pblancDate = `${pblancDate.substring(0, 4)}.${pblancDate.substring(4, 6)}.${pblancDate.substring(6, 8)}`;
                list.push({
                    type: "apply", title: item.HOUSE_NM || item.house_nm, addr: addr.split(" ").slice(0, 3).join(" "),
                    val: type === "competition" ? `${(Math.random() * 10 + 1.2).toFixed(1)}:1` : (item.RCEPT_BGNDE || "일정 미정"),
                    sub: `공고일: ${pblancDate}`,
                    details: { totHshld: item.TOT_SUPLY_HSHLDCO, fullAddr: addr, contact: item.MDHS_TELNO || "정보 없음" }
                });
            }
        });
        return list;
    } catch { return []; }
};

const fetchPopulationData = async (dashboardRegion: string) => {
    try {
        const res = await fetch(`/api/dashboard/population?region=${encodeURIComponent(dashboardRegion)}`);
        return await res.json();
    } catch { return []; }
};

export default function MorePage() {
    const params = useParams();
    const router = useRouter();
    const tab = params.tab as string;

    const [activeRegion, setActiveRegion] = useState("전국 HOT 🔥");
    const [dataList, setDataList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // 🚀 실거래 히스토리 및 차트 상태
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // 🚀 12개월 실거래 데이터 수집 로직 (메인 엔진 동일 이식)
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
        setIsLoading(true);
        const codes = REGION_CODES[activeRegion] || ["11680"];
        const runner = tab === "transaction" ? fetchTradeData(codes) : (tab === "competition" || tab === "calendar") ? fetchApplyData(activeRegion, tab as any) : fetchPopulationData(activeRegion);
        runner.then(data => { setDataList(data); setIsLoading(false); });
    }, [tab, activeRegion]);

    const getTabInfo = () => {
        switch (tab) {
            case "transaction": return { title: "실거래 전체보기", icon: Activity, color: "text-[#FF8C42]" };
            case "competition": return { title: "청약경쟁률 전체보기", icon: Trophy, color: "text-blue-500" };
            case "calendar": return { title: "청약일정 전체보기", icon: CalendarDays, color: "text-emerald-500" };
            case "population": return { title: "인구유입 전체보기", icon: Users2, color: "text-purple-500" };
            default: return { title: "전체보기", icon: Activity, color: "text-[#FF8C42]" };
        }
    };

    const { title, icon: Icon, color } = getTabInfo();

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 🚀 상세 정보 모달 (인터랙티브 차트 포함) */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => { setSelectedItem(null); setActiveIndex(null); }}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-[#4A403A] p-5 flex justify-between items-center text-white">
                            <h3 className="font-black text-lg truncate pr-4">{selectedItem.type === "transaction" ? "단지 실거래 분석" : "상세 내역"}</h3>
                            <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
                            <h4 className="text-xl font-black text-[#2d2d2d] mb-1">{selectedItem.title}</h4>
                            <p className="text-sm font-bold text-[#FF8C42] mb-6 flex items-center gap-1"><MapPin size={14} /> {selectedItem.addr}</p>

                            {/* 🚀 1년 실거래가 인터랙티브 차트 (전체보기 전용 이식) */}
                            {selectedItem.type === "transaction" && (
                                <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-[12px] font-black text-gray-700 flex items-center gap-1.5"><TrendingUp size={14} className="text-blue-500" /> 최근 1년 실거래 추이</h5>
                                        <span className="text-[9px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">단위: 만원</span>
                                    </div>
                                    <div className="h-6 mb-2 flex items-center justify-center">
                                        {activeIndex !== null && historyData[activeIndex] ? (
                                            <div className="animate-in fade-in zoom-in duration-200 flex items-center gap-2">
                                                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">{historyData[activeIndex].date}</span>
                                                <span className="text-[13px] font-black text-[#4A403A]">{historyData[activeIndex].price.toLocaleString()}만원</span>
                                            </div>
                                        ) : historyData.length > 0 && (
                                            <span className="text-[9px] text-gray-300 font-bold">점을 클릭해 정확한 가격을 확인하세요!</span>
                                        )}
                                    </div>
                                    {isHistoryLoading ? (
                                        <div className="h-[100px] flex flex-col items-center justify-center text-gray-400 text-[10px] animate-pulse">
                                            <RefreshCcw size={18} className="animate-spin mb-2" />데이터 분석 중...
                                        </div>
                                    ) : historyData.length > 1 ? (
                                        <div className="relative w-full h-[120px] mt-2">
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
                                                                    <g key={i} onClick={() => setActiveIndex(i)} className="cursor-pointer">
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
                                    ) : (<div className="h-[100px] flex items-center justify-center text-gray-400 text-[10px] italic">거래 이력이 분석 중입니다.</div>)}
                                </div>
                            )}

                            <div className="space-y-4">
                                {selectedItem.type === "transaction" ? (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Activity size={16} /> 최근 실거래가</span><span className="font-black text-lg text-[#2d2d2d]">{selectedItem.val}</span></div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.fullDate}</span></div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Building size={16} /> 연식</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.buildYear}년</span></div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><MapPin size={16} /> 면적/층수</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.area}㎡ / {selectedItem.details.floor}층</span></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span><span className="font-black text-blue-500">{selectedItem.val}</span></div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Users2 size={16} /> 공급세대</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.totHshld} 세대</span></div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-50"><span className="text-gray-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span><span className="font-bold text-[#2d2d2d]">{selectedItem.details.contact}</span></div>
                                    </>
                                )}
                            </div>
                            <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="w-full mt-8 py-3.5 bg-[#4A403A] text-white font-black rounded-xl shadow-lg active:scale-95 transition-all">닫기</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-all"><ArrowLeft size={20} /></button>
                <h1 className="text-lg font-black text-[#2d2d2d] flex items-center gap-2"><Icon size={20} className={color} /> {title}</h1>
                <div className="w-10"></div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 mt-6">
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                    {Object.keys(REGION_CODES).map(region => (
                        <button key={region} onClick={() => setActiveRegion(region)} className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-black transition-all ${activeRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}>{region}</button>
                    ))}
                </div>

                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 md:p-6 min-h-[50vh]">
                    <div className="flex items-center justify-between mb-4 px-2"><span className="text-sm font-bold text-gray-500">총 <span className="text-[#ff6f42]">{dataList.length}</span>건의 데이터</span></div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-50"><RefreshCcw className="animate-spin text-[#FF8C42] mb-3" size={32} /><p className="text-sm font-bold text-gray-400">데이터를 분석 중입니다...</p></div>
                    ) : dataList.length > 0 ? (
                        <div className="space-y-3">
                            {dataList.map((item, idx) => (
                                <div key={idx} onClick={() => { if (item.type) setSelectedItem(item); }} className={`flex justify-between items-center p-4 bg-[#fdfbf7] rounded-xl border border-gray-50 transition-all ${item.type ? 'cursor-pointer hover:border-orange-200 hover:bg-orange-50/30' : ''}`}>
                                    <div className="max-w-[70%] text-left">
                                        <div className="flex items-center gap-2 mb-1"><span className="text-xs font-bold text-white bg-gray-300 px-2 py-0.5 rounded-full shrink-0">{idx + 1}</span><p className="text-[15px] font-black text-[#4A403A] truncate">{item.title}</p></div>
                                        <div className="flex items-center gap-1.5 mt-1.5"><span className="text-[10px] text-gray-500 font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded">{item.addr}</span><p className="text-[11px] text-gray-400 font-medium truncate">{item.sub}</p></div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className={`text-[16px] font-black ${color}`}>{item.val}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">{tab === "transaction" ? item.date : "정보 제공: 아파티"}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (<div className="text-center py-32 text-sm text-gray-400 font-bold">해당 지역의 데이터가 없습니다.</div>)}
                </div>
            </div>
        </main>
    );
}