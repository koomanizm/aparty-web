import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lawdCd = searchParams.get('lawdCd');
    const dealYmd = searchParams.get('dealYmd');

    if (!lawdCd || !dealYmd) {
        return NextResponse.json({ error: '법정동코드와 계약월이 필요합니다.' }, { status: 400 });
    }

    const apiKey = (process.env.MOLIT_API_KEY || '').trim();
    // 🛠️ 변경점 1: http -> https 로 변경
    const baseUrl = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';

    try {
        const url = `${baseUrl}?serviceKey=${apiKey}&pageNo=1&numOfRows=50&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}`;

        // 🛠️ 변경점 2: 일반 크롬 브라우저인 척하는 신분증(Headers) 장착
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/xml',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`국토부 서버가 거절했습니다: ${response.status}`);
        }

        const textData = await response.text();
        return new NextResponse(textData, { headers: { 'Content-Type': 'application/xml' } });

    } catch (error: any) {
        console.error('국토부 API 연동 에러 상세:', error);
        return NextResponse.json({
            error: '데이터를 불러오지 못했습니다.',
            detail: error.message
        }, { status: 500 });
    }
}