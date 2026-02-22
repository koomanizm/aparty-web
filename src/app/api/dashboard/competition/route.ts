import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get("codes")?.split(",") || [];

    // 대표님 인증키 사용
    const apiKey = (process.env.MOLIT_API_KEY || "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d").trim();

    try {
        const requests = codes.map(async (code) => {
            // 🚀 청약홈의 '아파트 분양정보' API 주소
            const url = `https://apis.data.go.kr/1613000/ApplyHomeInfoSvc/getLttotPblancList?serviceKey=${apiKey}&pageNo=1&numOfRows=10&SUBSCRPT_AREA_CODE=${code.substring(0, 3)}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            return response.text();
        });

        const xmlResults = await Promise.all(requests);
        return new NextResponse(JSON.stringify(xmlResults), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}