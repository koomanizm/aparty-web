import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export async function GET() {
    const parser = new Parser();

    // 🚨 수정된 부분: encodeURI()로 전체 주소를 감싸주었습니다!
    // 이제 한글이 안전하게 변환되어 전송됩니다.
    const NEWS_RSS_URL = encodeURI("https://news.google.com/rss/search?q=부동산+분양+청약&hl=ko&gl=KR&ceid=KR:ko");

    try {
        // console.log("뉴스 데이터 요청 시작..."); 
        const feed = await parser.parseURL(NEWS_RSS_URL);
        // console.log(`뉴스 데이터 수신 성공: ${feed.items.length}개`);

        const newsItems = feed.items.slice(0, 6).map((item) => ({
            title: item.title || "제목 없음",
            link: item.link || "#",
            // 날짜 형식이 제각각일 수 있어서 예외 처리
            pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "",
            source: item.source || "Google News"
        }));

        return NextResponse.json(newsItems);
    } catch (error) {
        console.error("❌ 뉴스 API 에러 상세:", error);
        return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }
}