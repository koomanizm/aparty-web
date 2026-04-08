import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { LAWD_CODE_MAP } from "../../../../lib/lawdCdMap";

export const dynamic = 'force-dynamic';
// 🚀 수정 1: Vercel 무료 요금제 최대 타임아웃 60초로 변경
export const maxDuration = 60;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    if (key !== "aparty-super-secret-2026") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const SERVICE_KEY = (process.env.MOLIT_API_KEY || "").trim();
    const targetCodes = Object.values(LAWD_CODE_MAP);

    // 자동 날짜 계산 (서버 실행 시점의 '이번 달'을 스스로 찾습니다)
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;

    // 파라미터로 특정 달을 지정하지 않으면 무조건 '이번 달'을 수집합니다.
    const dealMonth = request.nextUrl.searchParams.get('dealMonth') || currentYearMonth;
    const startIndex = parseInt(request.nextUrl.searchParams.get('startIndex') || "0", 10);

    let totalSynced = 0;
    const startTime = Date.now();
    let currentIndex = startIndex;

    try {
        // 전국 시군구 순회 시작
        for (let i = startIndex; i < targetCodes.length; i++) {
            const lawdCd = targetCodes[i];
            currentIndex = i;

            // 🚀 수정 2: 서버가 강제 종료되기 전, 45초(45000ms) 경과 시 안전하게 바통 터치
            if (Date.now() - startTime > 45000) break;

            // 국토부 실거래가 API 호출
            const url = `http://openapi.molit.go.kr/OpenAPI_ToolInstallPackage/service/rest/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey=${SERVICE_KEY}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealMonth}`;

            const res = await fetch(url);
            const text = await res.text();

            // XML 데이터 파싱
            const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
            if (items.length === 0) continue; // 거래가 없는 동네는 패스

            // 데이터 가공 및 중복 방지 고유 ID 생성
            const upsertRows = items.map(item => {
                const extract = (tag: string) => {
                    const match = item.match(new RegExp(`<${tag}>([^<]+)<\/${tag}>`));
                    return match ? match[1].trim() : "";
                };

                const aptName = extract("아파트");
                const priceStr = extract("거래금액").replace(/,/g, "");
                const priceEok = parseFloat((parseInt(priceStr) / 10000).toFixed(2));
                const tradeDate = `${extract("년")}.${extract("월").padStart(2, '0')}.${extract("일").padStart(2, '0')}`;
                const size = extract("전용면적");
                const floor = extract("층");

                // 🛡️ 절대 중복될 수 없는 철통 ID
                const uniqueId = `${lawdCd}-${aptName}-${tradeDate}-${priceStr}-${size}-${floor}`.replace(/\s/g, '');

                return {
                    id: uniqueId,
                    apt_name: aptName,
                    trade_date: tradeDate,
                    price_eok: priceEok,
                    exclu_use_ar: parseFloat(size),
                    floor: parseInt(floor) || 0,
                    cancel_date: extract("해제사유발생일") || null,
                    req_gbn: extract("거래유형") || "중개거래",
                    lawd_cd: lawdCd,
                    address: `${extract("법정동")} ${extract("지번")}`
                };
            });

            // 수파베이스 Upsert (데이터가 겹치면 업데이트, 없으면 추가)
            const { error } = await supabase.from('aparty_real_trades').upsert(upsertRows, { onConflict: 'id' });
            if (!error) {
                totalSynced += upsertRows.length;
            } else {
                console.error(`Supabase Upsert Error (${lawdCd}):`, error);
            }

            // 국토부 서버 과부하 방지 매너 타임
            await new Promise(r => setTimeout(r, 100));
        }

        const isFinished = currentIndex >= targetCodes.length - 1;

        // 다음 이어달리기 URL 제공
        return NextResponse.json({
            success: true,
            message: isFinished ? `🎉 ${dealMonth}월 전국 실거래가 동기화가 모두 완료되었습니다!` : `⏳ ${currentIndex}번째 지역까지 완료했습니다. 아래 링크로 이어달리세요.`,
            totalSyncedThisRun: totalSynced,
            nextUrl: isFinished ? null : `http://localhost:3000/api/sync/real-trades?key=aparty-super-secret-2026&dealMonth=${dealMonth}&startIndex=${currentIndex + 1}`
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}