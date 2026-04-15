import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const SERVICE_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET() {
    const targetMonth = "202604";
    const regionCodes = ["26350", "11680", "11650", "41135"];

    try {
        let totalUpserted = 0;

        for (const code of regionCodes) {
            const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey=${SERVICE_KEY}&LAWD_CD=${code}&DEAL_YMD=${targetMonth}&pageNo=1&numOfRows=1000&dataType=JSON`;

            const response = await axios.get(url);
            const data = response.data;

            if (data.OpenAPI_ServiceResponse) {
                return NextResponse.json({ success: false, error: `🚨 공공데이터포털 에러: ${data.OpenAPI_ServiceResponse.cmmMsgHeader.returnAuthMsg}` });
            }

            if (!data.response || !data.response.body || !data.response.body.items) continue;

            let items = data.response.body.items.item;
            if (!items) continue;
            if (!Array.isArray(items)) items = [items];

            // 데이터 정제
            const trades = items.map((item: any) => {
                const year = item.dealYear;
                const month = String(item.dealMonth).padStart(2, '0');
                const day = String(item.dealDay).padStart(2, '0');
                const dong = (item.umdNm || "").trim();
                const aptName = (item.aptNm || "").trim();
                const area = item.excluUseAr;
                const amountStr = String(item.dealAmount).replace(/,/g, "").trim();
                const floor = item.floor;
                // const buildYear = item.buildYear; // (아까 빼기로 한 건축년도는 주석 처리!)

                const rawAmount = parseInt(amountStr);
                const eokValue = rawAmount / 10000;

                return {
                    // 🛡️ [방패 1] 아이디에 층수(floor)와 가격(rawAmount) 추가! 절대 안 겹칩니다.
                    trade_id: `${year}${month}${day}_${dong}_${aptName}_${area}_${floor}_${rawAmount}`,
                    apt_name: aptName,
                    dong: dong,
                    price: `${eokValue}억`,
                    price_eok: eokValue,
                    size: parseFloat(area),       // (대표님이 맞추신 면적 이름)
                    floor: parseInt(floor),       // (대표님이 맞추신 층수 이름)
                    trade_date: `${year}-${month}-${day}`, // (대표님이 맞추신 계약일 이름)
                    is_checked: false
                };
            });

            // 🛡️ [방패 2] 수파베이스로 쏘기 전, 배열 안에서 완벽하게 똑같은 쌍둥이(중복) 제거!
            const uniqueTradesMap = new Map();
            trades.forEach((trade: any) => uniqueTradesMap.set(trade.trade_id, trade));
            const uniqueTrades = Array.from(uniqueTradesMap.values());

            // 수파베이스에 꽂아넣기 (걸러진 uniqueTrades를 넣습니다)
            const { error } = await supabase
                .from('aparty_real_trades')
                .upsert(uniqueTrades, { onConflict: 'trade_id' });

            if (error) throw error;
            totalUpserted += uniqueTrades.length;
        }

        return NextResponse.json({ success: true, count: totalUpserted, message: "2026-04 최신 데이터 수집 완료!" });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}