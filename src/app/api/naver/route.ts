import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });

    try {
        const response = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=3&sort=sim`, {
            headers: {
                'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
                'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || '',
            },
        });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: '뉴스를 불러오지 못했습니다.' }, { status: 500 });
    }
}