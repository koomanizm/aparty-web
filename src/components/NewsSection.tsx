// src/components/NewsSection.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ExternalLink, ArrowRight } from "lucide-react";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
}
export default function NewsSection() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchNews() {
            // ✅ 서버 사이드에서 실행되도록 API 호출 방식으로 변경하거나, 
            // 지금은 간단하게 클라이언트에서 호출 (CORS 이슈가 생기면 Next.js API Route로 변경 필요)
            // *참고: RSS Parser는 브라우저에서 직접 막힐 수 있으므로, 
            // 실제로는 Server Action이나 API Route를 쓰는 게 정석입니다.
            // 일단 간단한 테스트를 위해 useEffect 내부 로직을 사용합니다.

            try {
                // 임시: 브라우저 CORS 문제 회피를 위해 fetch 대신 Server Action을 권장하지만,
                // 지금은 UI 확인을 위해 더미 데이터를 넣거나, Next.js API를 만들어야 합니다.
                // 정규인 님을 위해 [API Route] 방식은 4단계에서 설명할게요.
                // 여기서는 fetch('/api/news')를 호출한다고 가정합니다.
                const res = await fetch('/api/news');
                const data = await res.json();
                setNews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    return (
        <section className="w-full max-w-6xl mb-20 px-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-[#4a403a] flex items-center gap-2">
                    <Newspaper className="text-orange-500" />
                    부동산 핫 이슈
                </h2>
                <span className="text-xs text-gray-400">실시간 업데이트</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // 로딩 스켈레톤
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white h-32 rounded-2xl shadow-sm animate-pulse"></div>
                    ))
                ) : news.length > 0 ? (
                    news.map((item, idx) => (
                        <Link
                            href={item.link}
                            key={idx}
                            target="_blank"
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all group flex flex-col justify-between h-40"
                        >
                            <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed">
                                {item.title}
                            </h3>
                            <div className="flex justify-between items-end mt-4">
                                <span className="text-xs text-gray-400 font-medium">{item.pubDate}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                    <ArrowRight size={14} className="text-gray-400 group-hover:text-orange-500" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-10 text-gray-400">
                        뉴스를 불러오는 중입니다...
                    </div>
                )}
            </div>
        </section>
    );
}