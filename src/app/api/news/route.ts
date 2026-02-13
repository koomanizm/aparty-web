// src/app/api/news/route.ts
import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET(request: Request) {
    const parser = new Parser();

    // 1. URL에서 검색어(query)를 가져옵니다. (없으면 기본값: 부동산)
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '부동산+분양';

    // 2. 검색어를 안전하게 인코딩해서 구글 뉴스 주소에 넣습니다.
    const NEWS_RSS_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;

    try {
        const feed = await parser.parseURL(NEWS_RSS_URL);

        // 최신 뉴스 6개만 가져오기
        const newsItems = feed.items.slice(0, 6).map((item) => ({
            title: item.title || "제목 없음",
            link: item.link || "#",
            pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "",
            source: item.source || "Google News"
        }));

        return NextResponse.json(newsItems);
    } catch (error) {
        console.error("❌ 뉴스 API 에러:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}