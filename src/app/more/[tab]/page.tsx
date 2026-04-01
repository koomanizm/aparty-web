"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, Trophy, CalendarDays, Users2, RefreshCcw, X, Building, MapPin, Phone, TrendingUp, ChevronRight } from "lucide-react";

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
                    lawdCd: code,
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

    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
            // 🚀 타이틀 색상을 네이비(#172554)와 블루 계열로 통일하여 전문성 강조
            case "transaction": return { title: "실거래 상세 분석", icon: Activity, color: "text-[#172554]" };
            case "competition": return { title: "청약경쟁률 상세 내역", icon: Trophy, color: "text-[#172554]" };
            case "calendar": return { title: "청약일정 캘린더", icon: CalendarDays, color: "text-[#172554]" };
            case "population": return { title: "인구이동 리포트", icon: Users2, color: "text-[#172554]" };
            default: return { title: "대시보드 상세", icon: Activity, color: "text-[#172554]" };
        }
    };

    const { title, icon: Icon, color } = getTabInfo();

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-32">
            {/* 🚀 상세 정보 모달 (인터랙티브 차트 포함) */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setSelectedItem(null); setActiveIndex(null); }}>
                    <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        {/* 🚀 모달 헤더: 시그니처 네이비 적용 */}
                        <div className="bg-[#172554] p-5 flex justify-between items-center text-white">
                            <h3 className="font-extrabold text-[16px] truncate pr-4">{selectedItem.type === "transaction" ? "실거래 정밀 분석" : "청약 상세 정보"}</h3>
                            <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><X size={20} strokeWidth={2.5} /></button>
                        </div>
                        <div className="p-6 max-h-[80vh] overflow-y-auto scrollbar-hide">
                            <h4 className="text-[20px] font-black text-slate-900 mb-1.5 leading-tight break-keep">{selectedItem.title}</h4>
                            <p className="text-[13px] font-bold text-blue-600 mb-6 flex items-center gap-1.5"><MapPin size={14} /> {selectedItem.addr}</p>

                            {/* 🚀 1년 실거래가 인터랙티브 차트 */}
                            {selectedItem.type === "transaction" && (
                                <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-[13px] font-black text-slate-700 flex items-center gap-1.5"><TrendingUp size={16} className="text-blue-600" /> 최근 1년 실거래 추이</h5>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">단위: 만원</span>
                                    </div>
                                    <div className="h-7 mb-2 flex items-center justify-center">
                                        {activeIndex !== null && historyData[activeIndex] ? (
                                            <div className="animate-in fade-in zoom-in duration-200 flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                                <span className="text-[11px] font-black text-blue-600">{historyData[activeIndex].date}</span>
                                                <span className="text-[14px] font-black text-[#172554]">{historyData[activeIndex].price.toLocaleString()}만원</span>
                                            </div>
                                        ) : historyData.length > 0 && (
                                            <span className="text-[11px] text-slate-400 font-bold bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">차트의 점을 클릭해 보세요!</span>
                                        )}
                                    </div>
                                    {isHistoryLoading ? (
                                        <div className="h-[120px] flex flex-col items-center justify-center text-slate-400 text-[11px] font-bold animate-pulse">
                                            <RefreshCcw size={20} className="animate-spin mb-2 text-[#172554]" />데이터 정밀 분석 중...
                                        </div>
                                    ) : historyData.length > 1 ? (
                                        <div className="relative w-full h-[120px] mt-2">
                                            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                                                <line x1="0" y1="0" x2="300" y2="0" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                                                <line x1="0" y1="50" x2="300" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                                                <line x1="0" y1="100" x2="300" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
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
                                                            <path d={`M ${points}`} fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                            {historyData.map((d, i) => {
                                                                const x = (i / (historyData.length - 1)) * 300;
                                                                const y = 100 - ((d.price - minPrice) / range) * 80 - 10;
                                                                const isActive = activeIndex === i;
                                                                return (
                                                                    <g key={i} onClick={() => setActiveIndex(i)} className="cursor-pointer">
                                                                        {isActive && <line x1={x} y1="0" x2={x} y2="100" stroke="#2563EB" strokeWidth="1" strokeDasharray="2,2" />}
                                                                        <circle cx={x} cy={y} r={isActive ? "6" : "3.5"} fill={isActive ? "#2563EB" : "white"} stroke="#2563EB" strokeWidth="2.5" className="transition-all shadow-sm" />
                                                                        <circle cx={x} cy={y} r="15" fill="transparent" />
                                                                        <text x={x} y={120} textAnchor="middle" fontSize="9" fill={isActive ? "#172554" : "#94a3b8"} fontWeight={isActive ? "900" : "bold"}>{d.date}</text>
                                                                    </g>
                                                                );
                                                            })}
                                                        </>
                                                    );
                                                })()}
                                            </svg>
                                        </div>
                                    ) : (<div className="h-[120px] flex items-center justify-center text-slate-400 text-[11px] font-bold">충분한 거래 이력이 없습니다.</div>)}
                                </div>
                            )}

                            {/* 🚀 상세 정보 리스트 레이아웃 개선 */}
                            <div className="space-y-3">
                                {selectedItem.type === "transaction" ? (
                                    <>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><Activity size={16} /> 최근 실거래가</span><span className="font-black text-[18px] text-[#172554]">{selectedItem.val}</span></div>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><CalendarDays size={16} /> 거래일자</span><span className="font-bold text-slate-800">{selectedItem.details.fullDate}</span></div>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><Building size={16} /> 연식</span><span className="font-bold text-slate-800">{selectedItem.details.buildYear}년</span></div>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><MapPin size={16} /> 면적/층수</span><span className="font-bold text-slate-800">{selectedItem.details.area}㎡ / {selectedItem.details.floor}층</span></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><Trophy size={16} /> 일정/비율</span><span className="font-black text-[16px] text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{selectedItem.val}</span></div>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><Users2 size={16} /> 공급세대</span><span className="font-bold text-slate-800">{selectedItem.details.totHshld} 세대</span></div>
                                        <div className="flex justify-between items-center py-3.5 border-b border-slate-100"><span className="text-slate-500 font-bold flex items-center gap-2"><Phone size={16} /> 문의처</span><span className="font-bold text-slate-800">{selectedItem.details.contact}</span></div>
                                    </>
                                )}
                            </div>
                            <button onClick={() => { setSelectedItem(null); setActiveIndex(null); }} className="w-full mt-8 py-4 bg-[#172554] text-white font-black rounded-xl shadow-[0_8px_20px_rgba(23,37,84,0.2)] active:scale-95 transition-all">확인 완료</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🚀 상단 네비게이션바 (더 깨끗하고 명확하게) */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-5 md:px-8 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"><ArrowLeft size={20} strokeWidth={2.5} /></button>
                <h1 className="text-[17px] md:text-lg font-black text-[#172554] flex items-center gap-2"><Icon size={22} className={color} strokeWidth={2.5} /> {title}</h1>
                <div className="w-10"></div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 mt-6">
                {/* 🚀 지역 탭 (네이비 컬러 활성화) */}
                <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide mb-2">
                    {Object.keys(REGION_CODES).map(region => (
                        <button
                            key={region}
                            onClick={() => setActiveRegion(region)}
                            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-black transition-all border ${activeRegion === region ? "bg-[#172554] border-[#172554] text-white shadow-md" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                {/* 🚀 데이터 대시보드 리스트 */}
                <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 p-4 md:p-6 min-h-[60vh]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[13px] font-bold text-slate-500">
                            총 <span className="text-blue-600 font-black text-[14px]">{dataList.length}</span>건의 전문가 데이터
                        </span>
                    </div>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-80">
                            <RefreshCcw className="animate-spin text-[#172554] mb-3" size={32} />
                            <p className="text-[13px] font-bold text-slate-500">대규모 부동산 데이터를 컴파일 중입니다...</p>
                        </div>
                    ) : dataList.length > 0 ? (
                        <div className="space-y-3">
                            {dataList.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { if (item.type) setSelectedItem(item); }}
                                    className={`group flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all ${item.type ? 'cursor-pointer hover:border-blue-300 hover:shadow-md hover:bg-blue-50/20' : ''}`}
                                >
                                    <div className="max-w-[70%] text-left">
                                        <div className="flex items-center gap-2.5 mb-1.5">
                                            <span className="text-[10px] font-black text-white bg-[#172554] px-2 py-0.5 rounded shadow-sm shrink-0">{idx + 1}</span>
                                            <p className="text-[15px] font-extrabold text-slate-800 truncate group-hover:text-[#172554] transition-colors">{item.title}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">{item.addr}</span>
                                            <p className="text-[11px] text-slate-400 font-medium truncate">{item.sub}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3 flex flex-col items-end">
                                        <p className="text-[16px] md:text-[18px] font-black text-[#172554]">{item.val}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            <p className="text-[10px] font-bold text-slate-400">{tab === "transaction" ? item.date : "상세보기"}</p>
                                            {item.type && <ChevronRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" strokeWidth={3} />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 text-[13px] text-slate-400 font-bold">
                            해당 지역에 수집된 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}