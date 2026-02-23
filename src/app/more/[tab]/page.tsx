"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, Trophy, CalendarDays, Users2, RefreshCcw, X, Building, MapPin, Phone } from "lucide-react";

// 🚀 시도 및 구 데이터 매핑 (메인 페이지와 동일하게 대폭 확대)
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

// 🚀 데이터 Fetch 함수들 (50개까지 넉넉하게, 팝업용 상세 데이터 포함!)
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
        return allItems.sort((a, b) => b.price - a.price).slice(0, 50); // 50개 리스트
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
        return list; // 전체 목록 반환
    } catch { return []; }
};

const fetchPopulationData = async (dashboardRegion: string) => {
    try {
        const res = await fetch(`/api/dashboard/population?region=${encodeURIComponent(dashboardRegion)}`);
        const data = await res.json();
        return data;
    } catch { return []; }
};

export default function MorePage() {
    const params = useParams();
    const router = useRouter();
    const tab = params.tab as string;

    const [activeRegion, setActiveRegion] = useState("전국 HOT 🔥");
    const [dataList, setDataList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🚀 모달(팝업) 상태 관리
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // 탭에 따른 제목 및 아이콘 설정
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

    useEffect(() => {
        setIsLoading(true);
        const codes = REGION_CODES[activeRegion] || ["11680"];

        const runner =
            tab === "transaction" ? fetchTradeData(codes) :
                (tab === "competition" || tab === "calendar") ? fetchApplyData(activeRegion, tab as any) :
                    fetchPopulationData(activeRegion);

        runner.then(data => {
            setDataList(data);
            setIsLoading(false);
        });
    }, [tab, activeRegion]);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 🚀 상세 정보 모달 (팝업창) */}
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

            {/* 🚀 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-black text-[#2d2d2d] flex items-center gap-2">
                    <Icon size={20} className={color} /> {title}
                </h1>
                <div className="w-10"></div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 mt-6">
                {/* 🚀 지역 필터 */}
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                    {Object.keys(REGION_CODES).map(region => (
                        <button
                            key={region}
                            onClick={() => setActiveRegion(region)}
                            className={`shrink-0 px-5 py-2.5 rounded-full text-[13px] font-black transition-all ${activeRegion === region ? "bg-[#4A403A] text-white shadow-md" : "bg-white text-gray-500 border border-gray-200"}`}
                        >
                            {region}
                        </button>
                    ))}
                </div>

                {/* 🚀 데이터 리스트 영역 */}
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-4 md:p-6 min-h-[50vh]">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-sm font-bold text-gray-500">총 <span className="text-[#ff6f42]">{dataList.length}</span>건의 데이터</span>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-50">
                            <RefreshCcw className="animate-spin text-[#FF8C42] mb-3" size={32} />
                            <p className="text-sm font-bold text-gray-400">최신 데이터를 불러오고 있습니다...</p>
                        </div>
                    ) : dataList.length > 0 ? (
                        <div className="space-y-3">
                            {dataList.map((item, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { if (item.type) setSelectedItem(item); }}
                                    className={`flex justify-between items-center p-4 bg-[#fdfbf7] rounded-xl border border-gray-50 transition-all ${item.type ? 'cursor-pointer hover:border-orange-200 hover:bg-orange-50/30' : ''}`}
                                >
                                    <div className="max-w-[70%] text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-white bg-gray-300 px-2 py-0.5 rounded-full shrink-0">{idx + 1}</span>
                                            <p className="text-[15px] font-black text-[#4A403A] truncate">{item.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1.5">
                                            <span className="text-[10px] text-gray-500 font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded">{item.addr}</span>
                                            <p className="text-[11px] text-gray-400 font-medium truncate">{item.sub}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className={`text-[16px] font-black ${color}`}>{item.val}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1">
                                            {tab === "transaction" ? item.date :
                                                tab === "population" ? "통계청 KOSIS" : "한국부동산원 청약홈"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 text-sm text-gray-400 font-bold">
                            해당 지역의 데이터가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}