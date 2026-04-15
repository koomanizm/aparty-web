import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const KAPT_API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function extractItem(data: any) {
    try {
        const body = data?.response?.body;
        if (!body) return {};
        let itemNode = body.item || body.items?.item || body.items;
        return Array.isArray(itemNode) ? itemNode[0] || {} : itemNode || {};
    } catch (e) { return {}; }
}

export async function GET() {
    let syncCount = 0;

    // 🚨 대한민국 전역 226개 법정동 시군구 코드 (완전체)
    const allSigungu = [
        // 서울(25)
        "11110", "11140", "11170", "11200", "11215", "11230", "11260", "11290", "11305", "11320",
        "11350", "11380", "11410", "11440", "11470", "11500", "11530", "11545", "11560", "11590",
        "11620", "11650", "11680", "11710", "11740",
        // 부산(16)
        "26110", "26140", "26170", "26200", "26230", "26260", "26290", "26320", "26350", "26380",
        "26410", "26440", "26470", "26500", "26530", "26710",
        // 대구(9)
        "27110", "27140", "27170", "27200", "27230", "27260", "27290", "27710", "27720",
        // 인천(10)
        "28110", "28140", "28170", "28185", "28200", "28237", "28245", "28260", "28710", "28720",
        // 광주(5)
        "29110", "29140", "29155", "29170", "29200",
        // 대전(5)
        "30110", "30140", "30170", "30180", "30200",
        // 울산(5)
        "31110", "31140", "31170", "31200", "31710",
        // 세종(1)
        "36110",
        // 경기(42)
        "41111", "41113", "41115", "41117", "41131", "41133", "41135", "41150", "41171", "41173",
        "41190", "41210", "41220", "41250", "41271", "41273", "41281", "41285", "41287", "41290",
        "41310", "41360", "41370", "41390", "41410", "41430", "41450", "41461", "41463", "41465",
        "41480", "41500", "41550", "41570", "41590", "41610", "41630", "41650", "41670", "41800",
        "41820", "41830",
        // 강원(18)
        "42110", "42130", "42150", "42170", "42190", "42210", "42230", "42720", "42730", "42750",
        "42760", "42770", "42780", "42790", "42800", "42810", "42820", "42830",
        // 충북(11)
        "43111", "43112", "43113", "43114", "43130", "43150", "43720", "43730", "43740", "43745",
        "43750", "43760", "43770", "43800",
        // 충남(15)
        "44131", "44133", "44150", "44180", "44200", "44210", "44230", "44250", "44270", "44710",
        "44760", "44770", "44790", "44800", "44810",
        // 전북(14)
        "45111", "45113", "45130", "45140", "45180", "45190", "45210", "45710", "45720", "45730",
        "45740", "45750", "45770", "45790", "45800",
        // 전남(22)
        "46110", "46130", "46150", "46170", "46180", "46190", "46230", "46710", "46720", "46730",
        "46770", "46780", "46790", "46800", "46810", "46820", "46830", "46840", "46860", "46870",
        "46880", "46890", "46910",
        // 경북(23)
        "47111", "47113", "47130", "47150", "47170", "47190", "47210", "47230", "47250", "47280",
        "47290", "47720", "47730", "47750", "47760", "47770", "47820", "47830", "47840", "47850",
        "47900", "47920", "47930", "47940",
        // 경남(18)
        "48121", "48123", "48125", "48127", "48129", "48170", "48220", "48240", "48250", "48310",
        "48330", "48720", "48730", "48740", "48750", "48780", "48790", "48820", "48840", "48850",
        "48860", "48870", "48880", "48890",
        // 제주(2)
        "50110", "50130"
    ];

    try {
        console.log("🚀 [전국 아우토반 모드] 가동! 트래픽 100만건 확보 완료.");

        for (const sigungu of allSigungu) {
            console.log(`\n🏢 [지역: ${sigungu}] 탐색 시작...`);

            // 🛡️ 스마트 이어하기: DB에 이미 채워진 단지(주차대수 > 0) 목록 추출
            const { data: existingApts } = await supabase
                .from('aparty_apt_info')
                .select('kapt_code')
                .eq('district', sigungu)
                .gt('parking_count', 0);

            const completedCodes = new Set(existingApts?.map(a => a.kapt_code) || []);

            if (completedCodes.size > 0) {
                console.log(`🛡️ 통과: 이미 완벽하게 저장된 아파트 ${completedCodes.size}개는 1초만에 패스합니다!`);
            }

            let pageNo = 1;
            let hasMore = true;

            while (hasMore) {
                const listUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${KAPT_API_KEY}&sigunguCode=${sigungu}&numOfRows=500&pageNo=${pageNo}&_type=json`;
                const listRes = await fetch(listUrl);
                const listData = await listRes.json();

                let items = listData.response?.body?.items?.item || listData.response?.body?.items || [];
                if (!Array.isArray(items)) items = [items];

                if (items.length === 0) {
                    hasMore = false;
                } else {
                    for (const item of items) {
                        const kCode = item.kaptCode;
                        const kName = item.kaptName;
                        if (!kCode || !kName) continue;

                        // 🚨 이미 완성된 데이터면 상세 정보 요청 자체를 생략
                        if (completedCodes.has(kCode)) {
                            continue;
                        }

                        const customId = `${sigungu}-${kName.replace(/\s/g, '')}`;

                        try {
                            const [dtlRes, bassRes] = await Promise.all([
                                fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${kCode}&_type=json`),
                                fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${kCode}&_type=json`)
                            ]);

                            const dtlText = await dtlRes.text();
                            const bassText = await bassRes.text();

                            // 만약 정부 서버가 뻗었을 경우 방어
                            if (dtlText.includes("<OpenAPI_ServiceResponse>")) {
                                console.log(`\n🛑 [서버 에러] 정부 API 응답 지연. 5초 대기 후 다음 단지로 넘어갑니다.`);
                                await sleep(5000);
                                continue;
                            }

                            const dtlData = JSON.parse(dtlText);
                            const bassData = JSON.parse(bassText);

                            const dtlItem = extractItem(dtlData);
                            const bassItem = extractItem(bassData);

                            const pTotal = dtlItem.kaptdPcnt || dtlItem.cntParkTotal;
                            const pGround = parseInt(dtlItem.kaptdPcntc || 0);
                            const pUnder = parseInt(dtlItem.kaptdPcntu || 0);
                            const parkingCount = (pTotal && parseInt(pTotal) > 0) ? parseInt(pTotal) : (pGround + pUnder);

                            const dStr = String(bassItem.kaptUsedate || bassItem.kaptUseDate || "");
                            const completionDate = dStr.length >= 6 ? `${dStr.substring(0, 4)}.${dStr.substring(4, 6)}` : '정보없음';

                            const { error: upsertError } = await supabase
                                .from('aparty_apt_info')
                                .upsert({
                                    id: customId,
                                    apt_name: kName,
                                    kapt_code: kCode,
                                    parking_count: parkingCount,
                                    completion_date: completionDate,
                                    district: sigungu
                                }, { onConflict: 'id' });

                            if (!upsertError) {
                                syncCount++;
                                console.log(`✨ [${customId}] 수집 완료 (주차:${parkingCount}대 / 준공:${completionDate})`);
                            }
                        } catch (e: any) {
                            console.error(`⚠️ [${kName}] 파싱 실패 스킵`);
                        }

                        // 🏎️ [터보 모드] 트래픽 100만건 확보로 인한 0.3초 초고속 스캔
                        await sleep(300);
                    }
                    pageNo++;
                }
                if (pageNo > 10) hasMore = false;
            }
        }

        console.log(`\n🎉 [전국 싹쓸이 완료] 총 ${syncCount}개 신규/업데이트 성공!`);
        return NextResponse.json({ message: `터보 모드 스캔 완료. 총 ${syncCount}개 갱신됨.` });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}