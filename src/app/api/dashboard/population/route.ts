import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get("codes")?.split(",") || [];
    const apiKey = (process.env.MOLIT_API_KEY || "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d").trim();

    try {
        // 🚀 행안부 인구통계 API (보통 5자리 구 코드를 사용)
        const requests = codes.map(async (code) => {
            const url = `https://apis.data.go.kr/1741000/RegistrationPopulationService/getJobByDong?serviceKey=${apiKey}&pageNo=1&numOfRows=1&laudCd=${code}`;
            const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            return response.text();
        });
        const xmlResults = await Promise.all(requests);
        return new NextResponse(JSON.stringify(xmlResults), { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}