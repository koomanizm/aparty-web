// src/lib/news.ts
import Parser from 'rss-parser';

export interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    source: string;
}

// ✅ 한글 쿼리로 검색된 구글 뉴스 RSS 주소
// "부동산+분양+청약" 키워드로 검색
const NEWS_RSS_URL = "https://news.google.com/rss/search?q=부동산+분양+청약&hl=ko&gl=KR&ceid=KR:ko";

export async function getRealEstateNews(): Promise<NewsItem[]> {
    const parser = new Parser();

    try {
        const feed = await parser.parseURL(NEWS_RSS_URL);

        // 최신 뉴스 6개만 추려서 반환
        return feed.items.slice(0, 6).map((item) => ({
            title: item.title || "제목 없음",
            link: item.link || "#",
            pubDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "",
            source: item.source || "Google News"
        }));
    } catch (error) {
        console.error("뉴스 불러오기 실패:", error);
        return [];
    }
}