import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LAWD_CODE_MAP } from "../../../../lib/lawdCdMap";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel 무료 요금제 최대 타임아웃 60초

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    if (key !== "aparty-super-secret-2026") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const SERVICE_KEY = (process.env.MOLIT_API_KEY || "").trim();
    const targetCodes = Object.values(LAWD_CODE_MAP);
    const startIndex = parseInt(request.nextUrl.searchParams.get('startIndex') || "0", 10);

    // 혹시라도 전체 강제 업데이트가 필요할 때를 대비한 히든 옵션
    const forceUpdate = request.nextUrl.searchParams.get('forceUpdate') === 'true';

    let totalSynced = 0;
    const startTime = Date.now();
    let currentIndex = startIndex;
    let failedListCount = 0;

    try {
        for (let i = startIndex; i < targetCodes.length; i++) {
            const lawdCd = targetCodes[i];
            currentIndex = i;

            if (Date.now() - startTime > 45000) break; // 45초 바통 터치

            // 1. 신규 V3 시군구 목록 API 찌르기
            let listUrl = `https://apis.data.go.kr/1613000/AptListService3/getSigunguAptList3?serviceKey=${SERVICE_KEY}&sigunguCode=${lawdCd}&pageNo=1&numOfRows=5000&_type=json`;
            let listRes = await fetch(listUrl);
            let listText = await listRes.text();

            if (listText.includes("API not found") || listText.includes("Unexpected") || !listText.includes("kaptCode")) {
                listUrl = `https://apis.data.go.kr/1613000/AptListService3/getLegaldongAptList3?serviceKey=${SERVICE_KEY}&bjdCode=${lawdCd}00000&pageNo=1&numOfRows=5000&_type=json`;
                listRes = await fetch(listUrl);
                listText = await listRes.text();
            }

            // JSON 파싱으로 리스트 추출 (이름과 코드를 정확히 매칭하기 위함)
            let items: any[] = [];
            try {
                const listJson = JSON.parse(listText);
                let rawItems = listJson?.response?.body?.items;
                if (rawItems && !Array.isArray(rawItems) && rawItems.item) rawItems = rawItems.item;
                items = Array.isArray(rawItems) ? rawItems : (rawItems ? [rawItems] : []);
            } catch (e) { }

            // JSON 파싱 실패 시 정규식 예비 파싱
            if (items.length === 0) {
                const codeMatches = [...listText.matchAll(/"kaptCode"\s*:\s*"([^"]+)"|<kaptCode>([^<]+)<\/kaptCode>/g)];
                const nameMatches = [...listText.matchAll(/"kaptName"\s*:\s*"([^"]+)"|<kaptName>([^<]+)<\/kaptName>/g)];
                for (let k = 0; k < codeMatches.length; k++) {
                    items.push({
                        kaptCode: codeMatches[k][1] || codeMatches[k][2],
                        kaptName: nameMatches[k] ? (nameMatches[k][1] || nameMatches[k][2]) : ""
                    });
                }
            }

            if (items.length === 0) {
                if (listText.includes('"totalCount":0') || listText.includes('<totalCount>0</totalCount>')) {
                    failedListCount = 0; continue;
                }
                failedListCount++;
                if (failedListCount >= 3) {
                    return NextResponse.json({ success: false, message: `🚨 ${lawdCd} 단지 목록 호출 실패` });
                }
                continue;
            } else {
                failedListCount = 0;
            }

            // 🌟 핵심 마법: 우리 DB(수파베이스)에서 이 동네 아파트 목록을 가져와 '출석부' 생성
            const { data: existingData } = await supabase
                .from('aparty_apt_info')
                .select('id')
                .like('id', `${lawdCd}-%`); // 해당 지역코드(lawdCd)로 시작하는 ID만 싹 가져옴

            const existingIds = new Set(existingData?.map(row => row.id) || []);

            // 2. 단지별 상세 정보 조회 (출석부에 없는 놈만)
            for (const item of items) {
                if (Date.now() - startTime > 45000) break;

                const aptName = item.kaptName || item.aptNm || "";
                if (!aptName || !item.kaptCode) continue;

                // 예측 ID 생성 (지역코드-아파트명 공백제거)
                const predictedId = `${lawdCd}-${aptName.replace(/\s/g, '')}`;

                // 🌟 최적화 방어막: 이미 DB에 있고, 강제 업데이트(forceUpdate)가 아니면 국토부에 안 찌르고 패스!
                if (!forceUpdate && existingIds.has(predictedId)) {
                    continue; // 🚀 트래픽 절약 구간 (API 호출 생략)
                }

                // --- 여기부터는 진짜 '신규 아파트'일 때만 실행됩니다 ---
                const detailUrl = `https://apis.data.go.kr/1613000/AptBasisInfoServiceV4/getAphusBassInfoV4?serviceKey=${SERVICE_KEY}&kaptCode=${item.kaptCode}&_type=json`;
                const detailRes = await fetch(detailUrl);
                const detailText = await detailRes.text();

                const extract = (tag: string) => {
                    const jsonMatch = detailText.match(new RegExp(`"${tag}"\\s*:\\s*"?([^",}\\]]+)"?`));
                    if (jsonMatch && jsonMatch[1] && jsonMatch[1] !== "null") return jsonMatch[1].trim();
                    const xmlMatch = detailText.match(new RegExp(`<${tag}>([^<]+)<\/${tag}>`));
                    if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
                    return "";
                };

                const households = parseInt(extract("kaptUsedCcnt") || extract("hoCnt") || extract("totHshldCo") || "0");
                const parkingStr = extract("kaptTpa") || extract("parkngCo") || "0";
                const parking = households > 0 ? parseFloat(parkingStr) / households : 0;

                const upsertData = {
                    id: predictedId,
                    apt_name: extract("kaptName") || extract("kaptNm") || aptName,
                    province: item.as1 || extract("as1") || "정보없음",
                    district: item.as2 || extract("as2") || "정보없음",
                    total_households: households,
                    completion_date: extract("kaptCnstntDay") || extract("cnstntDay") || extract("prmisnDe") || "정보없음",
                    parking_count: parseFloat(parking.toFixed(2)) || 0,
                    address: extract("doroJuso") || extract("rnJuso") || ""
                };

                const { error } = await supabase.from('aparty_apt_info').upsert(upsertData);
                if (!error) totalSynced++;

                await new Promise(r => setTimeout(r, 100));
            }
        }

        const isFinished = currentIndex >= targetCodes.length - 1;

        return NextResponse.json({
            success: true,
            message: isFinished ? "🎉 (스마트 동기화) 전국 단지 정보 업데이트 완료!" : `⏳ ${currentIndex}번째 지역까지 검사 완료.`,
            newAptFoundAndSynced: totalSynced, // 새로 추가된 아파트 개수만 표시
            nextUrl: isFinished ? null : `${request.nextUrl.origin}/api/sync/apt-info?key=aparty-super-secret-2026&startIndex=${currentIndex + 1}`
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}