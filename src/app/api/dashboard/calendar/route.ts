import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get("codes")?.split(",") || [];
    const apiKey = (process.env.MOLIT_API_KEY || "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d").trim();

    try {
        const requests = codes.map(async (code) => {
            // 🚀 청약홈 분양정보 API
            const url = `https://apis.data.go.kr/1613000/ApplyHomeInfoSvc/getLttotPblancList?serviceKey=${apiKey}&pageNo=1&numOfRows=10&SUBSCRPT_AREA_CODE=${code.substring(0, 3)}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
            });
            return response.text();
        });
        const xmlResults = await Promise.all(requests);
        return new NextResponse(JSON.stringify(xmlResults), { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}