import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const KAPT_API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

function extractItem(data: any) {
    try {
        const body = data?.response?.body;
        if (!body) return {};
        let itemNode = body.item || body.items?.item || body.items;
        if (!itemNode) return {};
        if (Array.isArray(itemNode)) return itemNode[0] || {};
        return itemNode;
    } catch (e) {
        return {};
    }
}

export async function GET() {
    const TARGET_ID = "11110-경희궁롯데캐슬아파트";
    const TARGET_SIGUNGU = "11110";
    const TARGET_NAME = "경희궁롯데캐슬";

    try {
        console.log(`\n🚀 [단건 테스트] ${TARGET_ID} 주차대수 멱살잡기 시작!`);

        const listUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${KAPT_API_KEY}&sigunguCode=${TARGET_SIGUNGU}&numOfRows=500&pageNo=1&_type=json`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        let items = listData.response?.body?.items?.item || listData.response?.body?.items || [];
        if (!Array.isArray(items)) items = [items];

        const matchedKapt = items.find((i: any) =>
            i.kaptName && String(i.kaptName).replace(/\s/g, '').includes(TARGET_NAME)
        );

        if (!matchedKapt) return NextResponse.json({ message: "K-APT에 해당 아파트 없음" });

        const [dtlRes, bassRes] = await Promise.all([
            fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${matchedKapt.kaptCode}&_type=json`),
            fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${matchedKapt.kaptCode}&_type=json`)
        ]);

        const dtlData = await dtlRes.json();
        const bassData = await bassRes.json();

        const dtlItem = extractItem(dtlData);
        const bassItem = extractItem(bassData);

        // 🚨 [핵심 디버깅] 상세정보(dtlItem)가 가진 모든 키를 터미널에 폭로합니다.
        console.log(`\n🧐 [정부 데이터가 가진 모든 이름표(Keys)]`);
        console.log(Object.keys(dtlItem).join(', '));

        // 🚨 [합산 로직 적용] 총주차(kaptdPcnt)가 없으면, 지상(c) + 지하(u)를 더합니다!
        const pTotal = dtlItem.kaptdPcnt || dtlItem.cntParkTotal;
        const pGround = dtlItem.kaptdPcntc || 0; // 지상
        const pUnder = dtlItem.kaptdPcntu || 0;  // 지하

        console.log(`▶ 추출된 원본 주차값 - 총주차:${pTotal}, 지상:${pGround}, 지하:${pUnder}`);

        let parkingCount = 0;
        if (pTotal && parseInt(pTotal) > 0) {
            parkingCount = parseInt(pTotal);
        } else {
            // 총주차가 없거나 0이면 강제로 지상과 지하를 더해버림
            parkingCount = parseInt(pGround) + parseInt(pUnder);
        }

        const dStr = String(bassItem.kaptUsedate || bassItem.kaptUseDate || "");
        const completionDate = dStr.length >= 6 ? `${dStr.substring(0, 4)}.${dStr.substring(4, 6)}` : '정보없음';

        console.log(`\n[최종 파싱 결과] 주차: ${parkingCount}대 / 준공: ${completionDate}`);

        if (parkingCount === 0) {
            console.log(`❌ 여전히 주차가 0대입니다. 위 터미널의 [모든 이름표]를 확인해봐야 합니다.`);
        }

        const { error: upError } = await supabase
            .from('aparty_apt_info')
            .update({
                kapt_code: matchedKapt.kaptCode,
                parking_count: parkingCount,
                completion_date: completionDate
            })
            .eq('id', TARGET_ID);

        if (upError) throw upError;

        console.log(`🎉 수파베이스 저장 완료!`);
        return NextResponse.json({ message: `확인완료! 주차:${parkingCount}대, 준공:${completionDate}` });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}