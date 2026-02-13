// src/components/NewsSection.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, Loader2 } from "lucide-react";

// 뉴스 데이터 타입 정의
interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
}

// ✅ 우리가 보여줄 뉴스 카테고리들 (버튼 이름 : 실제 검색어)
const CATEGORIES = [
    { label: "🔥 주요뉴스", query: "부동산+이슈" },
    { label: "🏗️ 청약/분양", query: "아파트+분양+청약" },
    { label: "📈 시장전망", query: "부동산+전망+시세" },
    { label: "🏛️ 정책/규제", query: "부동산+정책+대출" },
];

export default function NewsSection() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].query); // 기본 선택: 첫 번째 탭

    // 탭이 바뀔 때마다 뉴스 다시 불러오기
    useEffect(() => {
        async function fetchNews() {
            setLoading(true); // 로딩 시작
            try {
                // API에 검색어(q)를 같이 보냅니다!
                const res = await fetch(`/api/news?q=${activeTab}`);
                const data = await res.json();
                setNews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false); // 로딩 끝
            }
        }
        fetchNews();
    }, [activeTab]); // activeTab이 바뀔 때마다 실행됨

    return (
        <section className="w-full max-w-6xl mb-24 px-4">
            {/* 섹션 헤더 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-[#4a403a] flex items-center gap-2">
                    <Newspaper className="text-orange-500" />
                    부동산 인사이트
                </h2>

                {/* ✅ 카테고리 탭 버튼들 */}
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveTab(cat.query)}
                            className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all ${activeTab === cat.query
                                    ? "bg-[#4a403a] text-white shadow-md scale-105" // 선택된 버튼
                                    : "bg-white text-gray-400 border border-gray-100 hover:text-orange-500 hover:border-orange-200" // 안 선택된 버튼
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 뉴스 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    // 로딩 중일 때 보여줄 스켈레톤 (깜빡임 효과)
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white h-40 rounded-2xl shadow-sm border border-gray-50 p-6 flex flex-col justify-between animate-pulse">
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-8 w-8 bg-gray-100 rounded-full self-end mt-4"></div>
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((item, idx) => (
                        <Link
                            href={item.link}
                            key={idx}
                            target="_blank"
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 hover:-translate-y-1 transition-all group flex flex-col justify-between h-48"
                        >
                            <div>
                                <h3 className="font-bold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors leading-relaxed text-lg">
                                    {item.title}
                                </h3>
                            </div>

                            <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-50">
                                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                                    {item.pubDate}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                                    <ArrowRight size={14} className="text-orange-400 group-hover:text-white" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-3 text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400">관련된 뉴스를 찾을 수 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    );
}