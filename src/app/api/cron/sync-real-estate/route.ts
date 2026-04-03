import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LAWD_CODE_MAP } from "../../../../lib/lawdCdMap";

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const extractTag = (xml: string, tag: string) => {
    const regex = new RegExp(`<${tag}>[\\s]*([^<]+?)[\\s]*<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? match[1].trim() : "";
};

const getRegionInfo = (code: string) => {
    const entry = Object.entries(LAWD_CODE_MAP).find(([key, val]) => val === code);
    if (!entry) return { province: "", district: "" };
    const parts = entry[0].split(" ");
    return { province: parts[0], district: parts.slice(1).join(" ") };
};

export async function GET(request: NextRequest) {
    const MOLIT_KEY = process.env.MOLIT_API_KEY || "";
    const lawdCd = request.nextUrl.searchParams.get('lawdCd') || "11680";
    const ymd = request.nextUrl.searchParams.get('ymd') || "";

    if (!MOLIT_KEY) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const targetYmd = ymd || `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const { province, district } = getRegionInfo(lawdCd);

    try {
        const molitUrl = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey=${MOLIT_KEY}&pageNo=1&numOfRows=1000&LAWD_CD=${lawdCd}&DEAL_YMD=${targetYmd}`;
        const res = await fetch(molitUrl, { cache: 'no-store' } as any);
        const xml = await res.text();

        if (!xml.includes("<resultCode>00</resultCode>") && !xml.includes("<resultCode>000</resultCode>")) {
            return NextResponse.json({ error: "MOLIT Error", xml });
        }

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        const upsertData = [];

        for (const itemMatch of items) {
            const itemXml = itemMatch[1];

            const aptName = extractTag(itemXml, "아파트") || extractTag(itemXml, "aptNm");
            const dongName = extractTag(itemXml, "법정동") || extractTag(itemXml, "umdNm");
            const jibun = extractTag(itemXml, "지번") || extractTag(itemXml, "jibun");
            const rawSize = extractTag(itemXml, "전용면적") || extractTag(itemXml, "excluUseAr");
            const rawPrice = (extractTag(itemXml, "거래금액") || extractTag(itemXml, "dealAmount")).replace(/,/g, '');
            const floor = extractTag(itemXml, "층") || extractTag(itemXml, "floor");
            const year = extractTag(itemXml, "년") || extractTag(itemXml, "dealYear");
            const month = extractTag(itemXml, "월") || extractTag(itemXml, "dealMonth");
            const day = extractTag(itemXml, "일") || extractTag(itemXml, "dealDay");

            if (!aptName || !rawPrice) continue;

            const sizeNum = Math.round(parseFloat(rawSize));
            const priceEok = parseFloat((parseInt(rawPrice, 10) / 10000).toFixed(1));
            const tradeDate = `${year.slice(-2)}.${month.padStart(2, '0')}.${day.padStart(2, '0')}`;

            const uniqueId = `${lawdCd}-${aptName.replace(/\s/g, '')}-${sizeNum}-${year}${month.padStart(2, '0')}${day.padStart(2, '0')}-${floor}`;

            upsertData.push({
                id: uniqueId,
                apt_name: aptName,
                province: province,
                district: district,
                dong: dongName,
                jibun: jibun,
                size: `${sizeNum}㎡`,
                price: `${priceEok.toFixed(1)}억`,
                price_eok: priceEok,
                trade_date: tradeDate,
                floor: `${floor}층`,
                trade_type: "매매",
                change_amt: "보합",
                trend: "flat"
            });
        }

        if (upsertData.length > 0) {
            const { error } = await supabase.from('aparty_real_trades').upsert(upsertData, { onConflict: 'id' });
            if (error) throw error;
        }

        return NextResponse.json({ success: true, count: upsertData.length, lawdCd, targetYmd });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}