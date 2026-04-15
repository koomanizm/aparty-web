import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const KAPT_API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sigungu = searchParams.get('sigungu') || '11680';

    try {
        // 1. K-APT 목록 가져오기 (JSON 방식)
        const listUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${KAPT_API_KEY}&sigunguCode=${sigungu}&numOfRows=300&pageNo=1&_type=json`;

        console.log("🚀 K-APT 리스트 가져오는 중...");
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        let items = listData.response?.body?.items?.item || listData.response?.body?.items || [];
        if (!Array.isArray(items)) items = [items];

        if (items.length === 0) {
            return NextResponse.json({ message: "K-APT 데이터가 비어있습니다. 응답 원본 확인 필요." });
        }

        const kaptList: { code: string, name: string }[] = [];
        for (const item of items) {
            if (item.kaptCode && item.kaptName) {
                kaptList.push({ code: item.kaptCode, name: item.kaptName.replace(/\s/g, '') });
            }
        }

        // 2. 수파베이스에서 업데이트 대상(주차대수 0) 조회하기
        const { data: myApts, error: selectError } = await supabase
            .from('aparty_apt_info')
            .select('id, apt_name')
            .eq('parking_count', 0);

        if (selectError) {
            console.error("❌ 수파베이스 조회 에러:", selectError.message);
            return NextResponse.json({ message: "DB 조회 실패", error: selectError.message });
        }

        if (!myApts || myApts.length === 0) return NextResponse.json({ message: "업데이트할(주차대수가 0인) 아파트가 없습니다." });

        let updatedCount = 0;

        // 3. 매칭 및 상세정보 업데이트
        for (const apt of myApts) {
            const myAptName = apt.apt_name.replace(/\s/g, '');
            const matchedKapt = kaptList.find(k => myAptName.includes(k.name) || k.name.includes(myAptName));

            if (matchedKapt) {
                const kCode = matchedKapt.code;

                try {
                    // 주차대수 흡수
                    const dtlUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusDtlInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${kCode}&_type=json`;
                    const dtlRes = await fetch(dtlUrl);
                    const dtlData = await dtlRes.json();
                    const dtlItem = dtlData.response?.body?.item || {};
                    const parkingCount = dtlItem.cntParkTotal ? parseInt(dtlItem.cntParkTotal) : 0;

                    // 준공년월 흡수
                    const bassUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?serviceKey=${KAPT_API_KEY}&kaptCode=${kCode}&_type=json`;
                    const bassRes = await fetch(bassUrl);
                    const bassData = await bassRes.json();
                    const bassItem = bassData.response?.body?.item || {};
                    const dateStr = bassItem.kaptUseDate;
                    const completionDate = dateStr ? `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}` : '정보없음';

                    // 🚨 [가장 중요한 부분] 수파베이스 업데이트 및 에러 검출
                    const { error: updateError } = await supabase
                        .from('aparty_apt_info')
                        .update({
                            kapt_code: kCode,
                            parking_count: parkingCount,
                            completion_date: completionDate
                        })
                        .eq('id', apt.id);

                    if (updateError) {
                        // DB에서 거절당하면 터미널에 빨간불 켭니다!
                        console.error(`❌ [${apt.apt_name}] DB 저장 실패 진짜 원인:`, updateError.message);
                    } else {
                        updatedCount++;
                        console.log(`✅ [${apt.apt_name}] 주차:${parkingCount}대 / 준공:${completionDate} DB 저장 진짜 성공!`);
                    }

                } catch (e) {
                    console.error(`❌ ${apt.apt_name} API 파싱 에러:`, e);
                }

                await new Promise(r => setTimeout(r, 200));
            }
        }

        return NextResponse.json({
            message: `작업 완료! 성공: ${updatedCount}개. 만약 0개라면 터미널의 [DB 저장 실패 진짜 원인]을 확인해주세요.`
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}