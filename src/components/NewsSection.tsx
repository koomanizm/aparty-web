"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
// 🚀 세련된 아이콘들로 교체
import {
    Newspaper,
    ArrowRight,
    TrendingUp,
    Image as ImageIcon,
    Megaphone,
    Building2,
    Landmark,
    Layout
} from "lucide-react";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl?: string;
}

// 🚀 [추가됨] 외국 서버의 횡포를 막아내는 철벽 K-날짜 변환 함수
function formatKoreanDate(dateString: string) {
    try {
        const d = new Date(dateString);
        // 날짜 데이터가 이상하면 원래 문자열을 그대로 반환
        if (isNaN(d.getTime())) return dateString;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}. ${month}. ${day}.`; // 무조건 YYYY. MM. DD. 형식으로 고정!
    } catch {
        return dateString;
    }
}

// 🚀 아이콘 매핑 데이터 (이모지 삭제)
const CATEGORIES = [
    { label: "주요뉴스", query: "부동산+이슈", icon: Megaphone },
    { label: "청약/분양", query: "아파트+분양+청약", icon: Building2 },
    { label: "시장전망", query: "부동산+전망+시세", icon: TrendingUp },
    { label: "정책/규제", query: "부동산+정책+대출", icon: Landmark },
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

    // 현재 선택된 카테고리의 라벨 가져오기
    const activeLabel = CATEGORIES.find(c => c.query === activeTab)?.label || "뉴스";

    return (
        <section className="w-full max-w-6xl mb-24 px-4 mx-auto">
            {/* 상단 타이틀 & 탭 영역 */}
            {/* 상단 타이틀 & 탭 영역 */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-3 md:gap-6">
                <div className="text-left">
                    {/* 🚀 1. 타이틀: 모바일 아이콘(w-4.5) & 글자(text-[16px]) 축소 */}
                    <h2 className="text-[16px] md:text-xl font-black text-[#4a403a] flex items-center gap-1.5 md:gap-2.5 mb-1 md:mb-2 tracking-tight">
                        <Newspaper className="text-orange-500 w-4.5 h-4.5 md:w-6 md:h-6" strokeWidth={2.5} />
                        부동산 인사이트 매거진
                    </h2>

                    {/* 🚀 2. 설명: 자간(tracking-tighter)과 한 줄 고정(whitespace-nowrap) 마법 적용! */}
                    <p className="text-gray-400 text-[10px] md:text-sm font-bold ml-0.5 flex items-center gap-1 tracking-tighter whitespace-nowrap overflow-hidden">
                        <Layout size={12} className="text-orange-500 shrink-0 md:w-[14px] md:h-[14px]" />
                        실시간으로 업데이트되는 시장의 흐름을 확인하세요.
                    </p>
                </div>

                {/* 🚀 카테고리 버튼 영역: 기존 코드 유지하되 여백만 미세 조정 */}
                <div className="flex overflow-x-auto scrollbar-hide gap-1.5 md:gap-2 pb-1">
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeTab === cat.query;
                        return (
                            <button
                                key={cat.label}
                                onClick={() => setActiveTab(cat.query)}
                                className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-full md:rounded-xl text-[10px] md:text-[13px] font-bold transition-all duration-300 flex items-center gap-1 shrink-0 ${isActive
                                    ? "bg-[#4A403A] text-white shadow-md scale-105"
                                    : "bg-white text-gray-400 border border-gray-100 hover:text-[#FF8C42] hover:border-orange-200 hover:bg-orange-50"
                                    }`}
                            >
                                <Icon size={12} className={isActive ? "text-orange-400" : "text-gray-300"} />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 뉴스 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {loading ? (
                    <>
                        <div className="md:col-span-2 bg-gray-50 h-[160px] md:h-[200px] rounded-[20px] md:rounded-[24px] animate-pulse"></div>
                        <div className="bg-gray-50 h-[160px] md:h-[200px] rounded-[20px] md:rounded-[24px] animate-pulse"></div>
                        <div className="bg-gray-50 h-[160px] md:h-[200px] rounded-[20px] md:rounded-[24px] animate-pulse"></div>
                    </>
                ) : news.length > 0 ? (
                    news.map((item, idx) => {
                        const isHeadline = idx === 0;
                        const hasImage = isHeadline && item.imageUrl;

                        return (
                            <Link
                                href={item.link}
                                key={idx}
                                target="_blank"
                                className={`group flex flex-col justify-between relative overflow-hidden transition-all duration-500 hover:-translate-y-1 ${isHeadline
                                    ? "md:col-span-2 bg-[#4A403A] text-white p-5 md:p-8 rounded-[20px] md:rounded-[24px] shadow-md hover:shadow-[0_15px_30px_-10px_rgba(74,64,58,0.4)] min-h-[160px] md:min-h-[200px]"
                                    : "col-span-1 bg-white p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(255,140,66,0.15)] hover:border-orange-100 min-h-[160px] md:min-h-[200px]"
                                    }`}
                            >
                                {hasImage && (
                                    <>
                                        <div className="absolute inset-0 z-0 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={item.imageUrl} alt="뉴스 썸네일" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out" />
                                        </div>
                                        <div className="absolute inset-0 z-0 bg-gradient-to-t md:bg-gradient-to-r from-[#4A403A] via-[#4A403A]/80 to-transparent"></div>
                                    </>
                                )}

                                {isHeadline && !hasImage && (
                                    <div className="absolute -right-16 -bottom-16 w-40 h-40 md:w-56 md:h-56 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                                )}

                                {!isHeadline && (
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                )}

                                <div className={`relative z-10 text-left ${hasImage ? 'md:max-w-[70%]' : 'w-full'}`}>
                                    <span className={`inline-flex items-center gap-1 px-2 md:px-2.5 py-1 rounded-md text-[10px] md:text-[11px] font-bold tracking-tight mb-2 md:mb-3 ${isHeadline ? "bg-[#FF8C42] text-white shadow-sm" : "bg-orange-50 text-[#FF8C42]"
                                        }`}>
                                        {hasImage && <ImageIcon size={10} />}
                                        {activeLabel}
                                    </span>

                                    <h3 className={`font-bold leading-snug tracking-tight line-clamp-2 md:line-clamp-3 transition-colors ${isHeadline
                                        ? "text-[16px] md:text-[20px] group-hover:text-orange-200"
                                        : "text-[14px] md:text-[16px] text-[#4A403A] group-hover:text-[#FF8C42]"
                                        }`}>
                                        {item.title}
                                    </h3>
                                </div>

                                <div className={`relative z-10 flex justify-between items-end mt-4 md:mt-6 pt-3 md:pt-4 border-t transition-colors ${isHeadline ? "border-white/20 group-hover:border-white/40" : "border-gray-50 group-hover:border-orange-50"
                                    }`}>
                                    <span className={`text-[10px] md:text-[11px] font-medium ${isHeadline ? "text-white/70" : "text-gray-400"
                                        }`}>
                                        {/* 🚀 [수정됨] 철벽 함수 적용! 이제 절대 안 깨집니다 */}
                                        {formatKoreanDate(item.pubDate)}
                                    </span>

                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isHeadline
                                        ? "bg-white/20 group-hover:bg-white text-white group-hover:text-[#4A403A] backdrop-blur-sm"
                                        : "bg-gray-50 group-hover:bg-[#FF8C42] text-gray-400 group-hover:text-white"
                                        }`}>
                                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 md:py-20 bg-white rounded-[20px] md:rounded-[24px] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium text-xs md:text-sm">뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
                    </div>
                )}
            </div>
        </section>
    );
}