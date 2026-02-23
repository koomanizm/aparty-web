"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight } from "lucide-react";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
}

const CATEGORIES = [
    { label: "🔥 주요뉴스", query: "부동산+이슈" },
    { label: "🏗️ 청약/분양", query: "아파트+분양+청약" },
    { label: "📈 시장전망", query: "부동산+전망+시세" },
    { label: "🏛️ 정책/규제", query: "부동산+정책+대출" },
];

export default function NewsSection() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(CATEGORIES[0].query);

    useEffect(() => {
        async function fetchNews() {
            setLoading(true);
            try {
                const res = await fetch(`/api/news?q=${activeTab}`);
                const data = await res.json();
                setNews(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, [activeTab]);

    return (
        <section className="w-full max-w-6xl mb-24 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div className="text-left">
                    <h2 className="text-xl md:text-2xl font-bold text-[#4a403a] flex items-center gap-2 mb-1 tracking-tight">
                        <Newspaper className="text-orange-500 w-6 h-6" strokeWidth={2.5} />
                        부동산 인사이트
                    </h2>
                    <p className="text-gray-400 text-xs md:text-sm font-semibold ml-1">
                        실시간으로 업데이트되는 시장의 흐름을 확인하세요.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.label}
                            onClick={() => setActiveTab(cat.query)}
                            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 ${activeTab === cat.query
                                ? "bg-[#4a403a] text-white shadow-md scale-105"
                                : "bg-white text-gray-400 border border-gray-100 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50"
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white h-48 rounded-2xl shadow-sm border border-gray-50 p-6 flex flex-col justify-between animate-pulse">
                            <div className="space-y-3">
                                <div className="h-5 bg-gray-100 rounded w-3/4"></div>
                                <div className="h-5 bg-gray-100 rounded w-1/2"></div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                                <div className="h-6 w-20 bg-gray-100 rounded-md"></div>
                                <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                            </div>
                        </div>
                    ))
                ) : news.length > 0 ? (
                    news.map((item, idx) => (
                        <Link
                            href={item.link}
                            key={idx}
                            target="_blank"
                            className="bg-white p-7 rounded-[28px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-gray-100 
                                 hover:shadow-[0_16px_32px_rgba(255,111,66,0.12)] hover:border-orange-100 
                                 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-56 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="text-left">
                                <h3 className="font-bold text-gray-800 text-[16px] md:text-[18px] leading-[1.45] tracking-tight line-clamp-3 group-hover:text-orange-600 transition-colors">
                                    {item.title}
                                </h3>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50 group-hover:border-orange-50 transition-colors">
                                <span className="text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg group-hover:bg-orange-50 group-hover:text-orange-500 transition-colors">
                                    {item.pubDate}
                                </span>

                                <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-500 transition-all duration-300 shadow-sm">
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-semibold">뉴스를 불러올 수 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    );
}