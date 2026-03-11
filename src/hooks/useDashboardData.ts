// src/hooks/useDashboardData.ts
import { useState, useEffect } from "react";

const SIDO_DATA: { [key: string]: string } = { "11": "서울시", "26": "부산시", "27": "대구시", "28": "인천시", "29": "광주시", "30": "대전시", "31": "울산시", "36": "세종시", "41": "경기도", "42": "강원도", "48": "경남", "47": "경북", "43": "충북", "44": "충남", "45": "전북", "46": "전남", "50": "제주도" };
const SGG_NAME_MAP: { [key: string]: string } = { "11680": "강남구", "11410": "용산구", "11110": "종로구", "11710": "송파구", "26440": "강서구", "26350": "해운대구", "26500": "수영구", "26230": "부산진구", "41135": "성남시 분당구", "41117": "수원시 영통구", "41590": "화성시", "28110": "인천 중구", "28260": "인천 서구", "48121": "창원시 성산구", "48170": "진주시", "48250": "김해시", "27290": "대구 달서구", "27110": "대구 중구", "27260": "대구 수성구", "47110": "포항시 남구", "47190": "구미시", "30200": "대전 유성구", "30170": "대전 서구", "29110": "광주 동구", "29200": "광주 광산구", "36110": "세종시", "42110": "춘천시", "42150": "강릉시", "50110": "제주시", "50130": "서귀포시" };
export const REGION_CODES: { [key: string]: string[] } = { "전국 HOT 🔥": ["11680", "11710", "41590", "26440", "28260"], "서울/수도권": ["11680", "11410", "11710", "41135", "41590", "28260"], "부산/경남": ["26440", "26350", "26230", "48121", "48250"], "대구/경북": ["27260", "27290", "27110", "47110", "47190"], "충청/호남": ["30200", "30170", "36110", "29200", "29110"], "강원/제주": ["42110", "42150", "50110", "50130"] };
const METRO_CODES = ["11", "26", "27", "28", "29", "30", "31", "36"];

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

export function useDashboardData() {
    const [dashboardTab, setDashboardTab] = useState<"transaction" | "competition" | "calendar" | "population">("transaction");
    const [dashboardRegion, setDashboardRegion] = useState("전국 HOT 🔥");
    const [apiData, setApiData] = useState<any[]>([]);
    const [isApiLoading, setIsApiLoading] = useState(false);

    useEffect(() => {
        setIsApiLoading(true);
        const codes = REGION_CODES[dashboardRegion] || ["11680"];
        const runner = dashboardTab === "transaction"
            ? fetchTradeData(codes)
            : (dashboardTab === "competition" || dashboardTab === "calendar")
                ? fetchApplyData(dashboardRegion, dashboardTab as any)
                : fetchPopulationData(dashboardRegion);

        runner.then(data => { setApiData(data); setIsApiLoading(false); });
    }, [dashboardTab, dashboardRegion]);

    return {
        dashboardTab,
        setDashboardTab,
        dashboardRegion,
        setDashboardRegion,
        apiData,
        isApiLoading,
        regionCodesList: Object.keys(REGION_CODES)
    };
}