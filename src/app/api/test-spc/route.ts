export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET() {
    // 🚀 대표님 API 키
    const API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

    try {
        // 1. 공고 리스트 하나만 찔러서 가장 최신 아파트 단지 번호 알아내기
        const listUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=1&serviceKey=${API_KEY}`;
        const listRes = await fetch(listUrl);
        const listData = await listRes.json();

        if (!listData.data || listData.data.length === 0) {
            return NextResponse.json({ error: "아파트 공고를 찾을 수 없습니다." });
        }

        const houseNo = listData.data[0].HOUSE_MANAGE_NO;
        const houseName = listData.data[0].HOUSE_NM;

        // 2. 해당 단지의 '특별공급' API만 정밀 타격해보기!
        const spcUrl = `https://api.odcloud.kr/api/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancSpcply?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseNo}&serviceKey=${API_KEY}`;

        const spcRes = await fetch(spcUrl);
        const spcData = await spcRes.json();

        return NextResponse.json({
            message: "🔥 특공 API 엑스레이 검사 완료!",
            targetApt: houseName,
            houseNo: houseNo,
            spcRawData: spcData // 👈 여기가 핵심입니다!
        });

    } catch (e: any) {
        return NextResponse.json({ error: "API 호출 중 에러 발생", details: e.message });
    }
}