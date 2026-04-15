import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const KAPT_API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 🚨 만능 파서 (배열/객체/중첩구조 완벽 대응)
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
    let totalUpdated = 0;

    try {
        console.log("🚀 [전국 스캔 시작] 빈칸 아파트 무한 수집 모드 가동...");

        // 1. 주차대수 정보가 없는 아파트 전체 조회
        const { data: targetApts, error: selectError } = await supabase
            .from('aparty_apt_info')
            .select('id, apt_name, parking_count')
            .or('parking_count.eq.0,parking_count.is.null');

        if (selectError) throw selectError;
        if (!targetApts || targetApts.length === 0) return NextResponse.json({ message: "🎉 모든 빈칸이 이미 채워져 있습니다!" });

        // 2. ID에서 지역코드(5자리) 추출 및 지역별 그룹화
        const sigunguCodes = [...new Set(
            targetApts
                .map((apt: any) => apt.id && apt.id.includes('-') ? apt.id.split('-')[0] : null)
                .filter(Boolean)
        )] as string[];

        console.log(`🗺️ 총 ${targetApts.length}개의 빈칸 발견! ${sigunguCodes.length}개 지역을 순차적으로 텁니다.`);

        for (const sigungu of sigunguCodes) {
            if (isNaN(Number(sigungu))) continue;

            console.log(`\n🏢 [지역코드: ${sigungu}] 목록 로딩 중...`);
            let allKaptList: { code: string, name: string }[] = [];

            try {
                // 해당 지역 전체 목록 수집 (최대 1000개까지 한 번에)
                const listUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${KAPT_API_KEY}&sigunguCode=${sigungu}&numOfRows=1000&pageNo=1&_type=json`;
                const listRes = await fetch(listUrl);
                const listData = await listRes.json();

                let items = listData.response?.body?.items?.item || listData.response?.body?.items || [];
                if (!Array.isArray(items)) items = [items];

                allKaptList = items.map((i: any) => ({
                    code: i.kaptCode,
                    name: i.kaptName ? String(i.kaptName).replace(/\s/g, '') : ''
                })).filter((i: any) => i.code && i.name);
            } catch (e) {
                console.error(`❌ [${sigungu}] 목록 조회 실패. 패스합니다.`);
                continue;
            }

            // 해당 지역의 우리 DB 아파트들만 필터링
            const localApts = targetApts.filter((apt: any) => String(apt.id).startsWith(`${sigungu}-`));

            for (const apt of localApts) {
                const myAptName = apt.apt_name.replace(/\s/g, '');
                const matchedKapt = allKaptList.find((k: { code: string, name: string }) =>
                    myAptName.includes(k.name) || k.name.includes(myAptName)
                );

                if (matchedKapt) {
                    try {
                        // 주차/준공 정보 동시 호출
                        const [dtlRes, bassRes] = await Promise.all([
                            fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${matchedKapt.code}&_type=json`),
                            fetch(`https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${matchedKapt.code}&_type=json`)
                        ]);

                        const dtlData = await dtlRes.json();
                        const bassData = await bassRes.json();

                        const dtlItem = extractItem(dtlData);
                        const bassItem = extractItem(bassData);

                        // 🚨 [검증된 주차 로직] 총주차장 vs (지상 + 지하)
                        const pTotal = dtlItem.kaptdPcnt || dtlItem.cntParkTotal;
                        const pGround = parseInt(dtlItem.kaptdPcntc || 0);
                        const pUnder = parseInt(dtlItem.kaptdPcntu || 0);

                        let parkingCount = (pTotal && parseInt(pTotal) > 0) ? parseInt(pTotal) : (pGround + pUnder);

                        // 🚨 [검증된 준공 로직] kaptUsedate
                        const dStr = String(bassItem.kaptUsedate || bassItem.kaptUseDate || "");
                        const completionDate = dStr.length >= 6 ? `${dStr.substring(0, 4)}.${dStr.substring(4, 6)}` : '정보없음';

                        if (parkingCount > 0 || completionDate !== '정보없음') {
                            const { error: upError } = await supabase
                                .from('aparty_apt_info')
                                .update({
                                    kapt_code: matchedKapt.code,
                                    parking_count: parkingCount,
                                    completion_date: completionDate
                                })
                                .eq('id', apt.id);

                            if (!upError) {
                                totalUpdated++;
                                console.log(`✅ [${apt.id}] 업데이트 성공 (주차:${parkingCount} / 준공:${completionDate})`);
                            }
                        }
                    } catch (e) {
                        console.error(`❌ [${apt.id}] 처리 중 오류 발생`);
                    }

                    // 🛑 IP 차단 방지 (1.2초 휴식)
                    await sleep(1200);
                }
            }
        }

        return NextResponse.json({ message: `전국 대청소 완료! 총 ${totalUpdated}개 단지 업데이트!` });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}