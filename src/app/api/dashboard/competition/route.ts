export const dynamic = 'force-dynamic'; // 🚨 캐시 완벽 파괴! 무조건 실시간 최신 데이터만 가져옵니다.

import { NextResponse } from "next/server";

// 🚀 대표님의 찐 API 키
const API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET(request: Request) {
    try {
        console.log("==================================================");
        console.log("🔥 [최종 무결점] 6개월치 리얼 데이터 + NaN 완벽 방어 엔진 가동!");

        // 🚀 1. 6개월 전 날짜 계산
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

        // 🚀 2. 분양공고 API 호출
        const listUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=500&serviceKey=${API_KEY}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        let aptList = listData.data || [];
        if (aptList.length === 0) return NextResponse.json({ success: true, data: [] });

        // 🚀 3. '6개월 이내'에 올라온 공고만 필터링!
        const recentApts = aptList.filter((apt: any) => {
            const dateNum = Number(String(apt.RCRIT_PBLANC_DE || "0").replace(/-/g, ''));
            return dateNum >= minDateLimit;
        });

        recentApts.sort((a: any, b: any) => Number(b.RCRIT_PBLANC_DE?.replace(/-/g, '')) - Number(a.RCRIT_PBLANC_DE?.replace(/-/g, '')));

        const validResults: any[] = [];

        // 🚀 4. API 서버 순차 호출 (누락 방지)
        for (const apt of recentApts) {
            const houseNo = apt.HOUSE_MANAGE_NO;
            const compUrl = `https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseNo}&serviceKey=${API_KEY}`;

            try {
                const compRes = await fetch(compUrl);
                const compData = await compRes.json();

                if (compData && compData.data && compData.data.length > 0) {
                    const modelsRaw = compData.data;

                    // 🎯 찌꺼기 문자열("-", "△", 미달, 빈칸) 완벽 소독 로직!
                    const models = modelsRaw.map((m: any) => {
                        let r = String(m.CMPET_RATE || "0").trim();

                        if (r === "-" || r === "" || r.includes('△') || r.includes('미달')) {
                            r = "0";
                        }

                        return {
                            type: m.HOUSE_TY || "-",
                            rank: m.SUBSCRPT_RANK_CODE ? `${m.SUBSCRPT_RANK_CODE}순위` : "-",
                            region: m.RESIDE_SENM || "해당지역",
                            units: Number(m.SUPLY_HSHLDCO || 0),
                            applied: Number(m.REQ_CNT || 0),
                            rate: r
                        };
                    });

                    // 1순위 데이터 위주로 필터링
                    const rank1Models = models.filter((m: any) => String(m.rank).includes('1순위') || String(m.rank).includes('1'));
                    const displayModels = rank1Models.length > 0 ? rank1Models : models;

                    // 전체 평균 및 최고 경쟁률 계산
                    const totalUnits = displayModels.reduce((acc: number, cur: any) => acc + cur.units, 0);
                    const totalApplied = displayModels.reduce((acc: number, cur: any) => acc + cur.applied, 0);
                    const avgRate = totalUnits > 0 ? (totalApplied / totalUnits).toFixed(2) : "0.00";

                    let maxRate = "0.00";
                    if (displayModels.length > 0) {
                        // 🚨 NaN 완벽 차단 방어막 적용
                        maxRate = Math.max(...displayModels.map((m: any) => {
                            const parsedRate = parseFloat(m.rate);
                            return isNaN(parsedRate) ? 0 : parsedRate;
                        })).toFixed(2);
                    }

                    // 주소 및 날짜 포맷팅
                    let addr = apt.HSSPLY_ADRES || "상세 주소 확인 필요";
                    addr = addr.split(" ").slice(0, 3).join(" ");

                    let date = String(apt.RCRIT_PBLANC_DE || "-").replace(/-/g, '');
                    if (date.length === 8) {
                        date = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;
                    }

                    validResults.push({
                        id: houseNo,
                        name: apt.HOUSE_NM || "단지명 없음",
                        addr: addr,
                        date: date,
                        sortDate: Number(String(apt.RCRIT_PBLANC_DE || "0").replace(/-/g, '')),
                        avgRate: avgRate,
                        maxRate: maxRate,
                        models: displayModels
                    });
                }
            } catch (e) {
                // 에러 무시 (서버 터짐 방지)
            }
        }

        console.log(`🎉 최종 화면 출력 단지 수: ${validResults.length}개`);
        console.log("==================================================");

        return NextResponse.json({ success: true, data: validResults });

    } catch (error: any) {
        console.error("🔥 서버 에러:", error);
        return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
    }
}