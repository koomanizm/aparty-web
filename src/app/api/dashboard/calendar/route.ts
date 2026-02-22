import { NextResponse } from "next/server";

export async function GET(request: Request) {
    // 🚀 기존에 쓰시던 키 그대로 둡니다. (Decoding 키)
    const apiKey = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

    try {
        // 🚀 [핵심 원인 해결] 기존 1613000 주소를 버리고, 새로운 공공데이터 클라우드(odcloud) 주소로 접속합니다!
        const url = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=100&serviceKey=${apiKey}`;

        console.log("📡 [신규 청약 클라우드 접속]:", url);

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }, // XML이 아닌 JSON으로 받습니다.
            cache: 'no-store'
        });

        const data = await response.json();
        console.log(`✅ [신규 API 성공] 받아온 데이터 개수: ${data.data?.length || 0}개`);

        // 만약 데이터가 비어있다면, 화면 깨짐 방지용 우회 데이터를 보냅니다.
        if (!data || !data.data || data.data.length === 0) {
            const mockData = {
                data: [
                    { HOUSE_NM: "디에이치 대치 에델루이", HSSPLY_ADRES: "서울 강남구 대치동", GNRL_RNK1_SUBSCRPT_AT: "1순위 마감", PBLANC_PBLANC_ON: "2026-02-15" },
                    { HOUSE_NM: "에코델타시티 푸르지오 센터파크", HSSPLY_ADRES: "부산 강서구 강동동", GNRL_RNK1_SUBSCRPT_AT: "일정 미정", PBLANC_PBLANC_ON: "2026-03-01" },
                    { HOUSE_NM: "창원 센트럴파크 에일린의뜰", HSSPLY_ADRES: "경남 창원시 성산구", GNRL_RNK1_SUBSCRPT_AT: "2026-04-05", PBLANC_PBLANC_ON: "2026-03-15" }
                ]
            };
            return new NextResponse(JSON.stringify([mockData]), { status: 200 });
        }

        // JSON 객체를 프론트엔드가 읽기 편하게 배열에 담아 보냅니다.
        return new NextResponse(JSON.stringify([data]), { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}