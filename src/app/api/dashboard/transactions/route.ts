import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const codes = searchParams.get("codes")?.split(",") || [];

    // 🚀 상세페이지와 동일한 키 사용 (환경변수가 없다면 직접 넣으신 키를 사용하도록 설정)
    const apiKey = (process.env.MOLIT_API_KEY || "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d").trim();
    const dealYmd = "202601"; // 우선 데이터가 확실한 달로 세팅

    try {
        const requests = codes.map(async (code) => {
            // 🚀 상세페이지에서 성공했던 그 최신 주소 그대로!
            const url = `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev?serviceKey=${apiKey}&pageNo=1&numOfRows=10&LAWD_CD=${code}&DEAL_YMD=${dealYmd}`;

            console.log(`📡 [${code}] 상세페이지 공식으로 데이터 호출 중...`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/xml',
                    // 🚀 국토부 서버를 통과하는 결정적 '신분증'
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`서버 거절: ${response.status}`);
            }

            return response.text();
        });

        const xmlResults = await Promise.all(requests);
        console.log("✅ [성공] 메인 대시보드 실거래 데이터 수신 완료!");

        return new NextResponse(JSON.stringify(xmlResults), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("❌ 메인 대시보드 연동 에러:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}