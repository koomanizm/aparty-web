export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚀 대표님 API 키
const API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET(request: Request) {
    try {
        console.log("🔥 [데이터 수집 봇] 1순위 + 2순위 + 특별공급 통합 수집 시작...");

        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const formatDate = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return Number(`${y}${m}${d}`);
        };

        const minDateLimit = formatDate(sixMonthsAgo);

        // 1. 전체 공고 리스트 가져오기
        const listUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=${API_KEY}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();
        const aptList = listData.data || [];

        const recentApts = aptList.filter((apt: any) => {
            const dateNum = Number(String(apt.RCRIT_PBLANC_DE || "0").replace(/-/g, ''));
            return dateNum >= minDateLimit;
        });

        const upsertDataArray: any[] = [];

        // 2. 각 단지마다 일반공급과 특별공급 데이터를 모조리 긁어옵니다.
        for (const apt of recentApts) {
            const houseNo = apt.HOUSE_MANAGE_NO;
            const mergedModels: any[] = [];

            // 🚀 [API 호출 1] 일반공급 (1, 2순위) 데이터
            const compUrl = `https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseNo}&serviceKey=${API_KEY}`;
            try {
                const compRes = await fetch(compUrl);
                const compData = await compRes.json();

                if (compData && compData.data) {
                    compData.data.forEach((m: any) => {
                        let r = String(m.CMPET_RATE || "0").trim();
                        if (r === "-" || r === "" || r.includes('△') || r.includes('미달')) r = "0";

                        mergedModels.push({
                            type: m.HOUSE_TY || "-",
                            rank: m.SUBSCRPT_RANK_CODE ? `${m.SUBSCRPT_RANK_CODE}순위` : "-",
                            region: m.RESIDE_SENM || "해당지역",
                            units: Number(m.SUPLY_HSHLDCO || 0),
                            applied: Number(m.REQ_CNT || 0),
                            rate: r
                        });
                    });
                }
            } catch (e) { }

            // 🚨 [핵심 패치] 특별공급 신청현황 (파편화된 '_CNT' 항목 싹쓸이 합산 로직!)
            const spcUrl = `https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTSpsplyReqstStus?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseNo}&serviceKey=${API_KEY}`;
            try {
                const spcRes = await fetch(spcUrl);
                const spcData = await spcRes.json();

                if (spcData && spcData.data) {
                    spcData.data.forEach((m: any) => {
                        const units = Number(m.SPSPLY_HSHLDCO || 0); // 배정세대수

                        // ✨ 마법의 로직: '_CNT'로 끝나는 모든 키값(접수건수)을 찾아서 싹 다 더합니다!
                        let totalApplied = 0;
                        Object.keys(m).forEach(key => {
                            if (key.endsWith('_CNT')) {
                                totalApplied += Number(m[key] || 0);
                            }
                        });

                        let calcRate = units > 0 ? (totalApplied / units).toFixed(2) : "0";
                        if (calcRate === "0.00") calcRate = "0";

                        mergedModels.push({
                            type: m.HOUSE_TY || "-",
                            rank: "특별공급", // 👈 초록색 뱃지 매핑
                            region: "해당/기타지역", // 특별공급은 지역 정보 컬럼이 없어서 공통 텍스트로 대체
                            units: units,
                            applied: totalApplied,
                            rate: calcRate
                        });
                    });
                }
            } catch (e) { }

            // 🚀 3. 데이터가 있으면 1순위 기준으로 대표 경쟁률을 계산하고 배열에 담습니다.
            if (mergedModels.length > 0) {
                const rank1Models = mergedModels.filter((m: any) => String(m.rank).includes('1'));
                const mathModels = rank1Models.length > 0 ? rank1Models : mergedModels;

                const totalUnits = mathModels.reduce((acc: number, cur: any) => acc + cur.units, 0);
                const totalApplied = mathModels.reduce((acc: number, cur: any) => acc + cur.applied, 0);
                const avgRate = totalUnits > 0 ? (totalApplied / totalUnits).toFixed(2) : "0.00";

                let maxRate = "0.00";
                if (mathModels.length > 0) {
                    maxRate = Math.max(...mathModels.map((m: any) => {
                        const parsedRate = parseFloat(m.rate);
                        return isNaN(parsedRate) ? 0 : parsedRate;
                    })).toFixed(2);
                }

                let addr = apt.HSSPLY_ADRES || "상세 주소 확인 필요";
                addr = addr.split(" ").slice(0, 3).join(" ");

                let date = String(apt.RCRIT_PBLANC_DE || "-").replace(/-/g, '');
                let formatStrDate = date.length === 8 ? `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}` : date;

                upsertDataArray.push({
                    id: houseNo,
                    name: apt.HOUSE_NM || "단지명 없음",
                    addr: addr,
                    announce_date: formatStrDate,
                    sort_date: Number(date),
                    avg_rate: avgRate,
                    max_rate: maxRate,
                    models: mergedModels
                });
            }
        }

        if (upsertDataArray.length > 0) {
            const { error } = await supabase
                .from('aparty_competitions')
                .upsert(upsertDataArray, { onConflict: 'id' });

            if (error) throw error;
        }

        console.log(`🎉 6개월치 데이터(${upsertDataArray.length}개 단지) 특공 싹쓸이 포함 DB 저장 완료!`);
        return NextResponse.json({ success: true, count: upsertDataArray.length, message: "DB 동기화 완벽 성공 (특공 싹쓸이 포함!)" });

    } catch (error: any) {
        console.error("🔥 서버 에러:", error);
        return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
    }
}