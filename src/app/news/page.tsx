"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Newspaper,
    ArrowRight,
    TrendingUp,
    Image as ImageIcon,
    Megaphone,
    Building2,
    Landmark,
    Layout,
    Menu,
    CalendarDays,
    LineChart
} from "lucide-react";
import LoginButton from "../../components/auth/LoginButton";

interface NewsItem {
    title: string;
    link: string;
    pubDate: string;
    imageUrl?: string;
}

function formatKoreanDate(dateString: string) {
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        return `${year}. ${month}. ${day}.`;
    } catch {
        return dateString;
    }
}

const CATEGORIES = [
    { label: "주요뉴스", query: "부동산+이슈", icon: Megaphone },
    { label: "청약/분양", query: "아파트+분양+청약", icon: Building2 },
    { label: "시장전망", query: "부동산+전망+시세", icon: TrendingUp },
    { label: "정책/규제", query: "부동산+정책+대출", icon: Landmark },
];

const MAIN_CONTENT_WIDTH = "max-w-[1200px]";

export default function NewsPage() {
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

    const activeLabel = CATEGORIES.find(c => c.query === activeTab)?.label || "뉴스";

    return (
        <main className="min-h-screen bg-gray-50/50 flex flex-col items-center relative overflow-x-hidden selection:bg-orange-100">
            {/* 🚀 공통 헤더 영역 (메인 페이지와 동일한 네비게이션) */}
            <header className="w-full bg-white flex justify-center z-20 pt-1 pb-1 relative shadow-sm border-b border-gray-100">
                <div className={`w-full ${MAIN_CONTENT_WIDTH} flex justify-between items-center py-2 px-5 md:px-6 relative`}>
                    <Link href="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
                        <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
                            <Image src="/logo.png" alt="아파티" width={40} height={40} className="object-contain" />
                        </div>
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="text-lg md:text-xl font-extrabold text-[#4a403a] tracking-tighter leading-none mb-0.5">
                                APARTY
                            </h1>
                            <span className="text-[9px] md:text-[10px] font-medium text-gray-400 leading-none">
                                No. 1 부동산 분양 정보 플랫폼
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-[#F5F5F5] shadow-[inset_0_2px_5px_rgba(0,0,0,0.03)] rounded-2xl px-1 py-1 border-none">
                        <Link href="/market" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-[#666666] hover:text-[#FF7A2F] hover:bg-white hover:shadow-sm transition-all duration-300 z-10 relative">
                            <TrendingUp size={15} strokeWidth={2.5} />
                            시장동향
                        </Link>
                        <Link href="/subscription" className="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-[#666666] hover:text-[#FF7A2F] hover:bg-white hover:shadow-sm transition-all duration-300 z-10">
                            <CalendarDays size={15} strokeWidth={2.5} />
                            청약정보
                            <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#FF7A2F] to-[#8A2BE2] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse z-20">HOT</span>
                        </Link>
                        <Link href="/price" className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold text-[#666666] hover:text-[#FF7A2F] hover:bg-white hover:shadow-sm transition-all duration-300 z-10 relative">
                            <LineChart size={15} strokeWidth={2.5} />
                            실거래가
                        </Link>
                        {/* 🚀 현재 뉴스 페이지임을 표시 (활성화 스타일 적용) */}
                        <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-white text-[#FF7A2F] shadow-sm z-10 relative">
                            <Newspaper size={15} strokeWidth={2.5} />
                            부동산 뉴스
                        </div>
                    </nav>

                    <div className="flex items-center gap-3 md:gap-4 shrink-0">
                        <LoginButton />
                        <button className="md:hidden p-1.5 text-[#2E2925] hover:text-[#FF7A2F] transition-colors focus:outline-none">
                            <Menu size={24} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </header>

            {/* 🚀 뉴스 콘텐츠 영역 */}
            <div className="w-full flex-1 py-10 md:py-16">
                <section className="w-full max-w-6xl px-4 mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-5 md:gap-6">
                        <div className="text-left">
                            <h2 className="text-[20px] md:text-3xl font-black text-[#4a403a] flex items-center gap-2 md:gap-3 mb-2 tracking-tight">
                                <Newspaper className="text-orange-500 w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                                부동산 인사이트 매거진
                            </h2>
                            <p className="text-gray-500 text-xs md:text-[15px] font-medium ml-1 flex items-center gap-1.5 tracking-tight">
                                <Layout size={14} className="text-orange-500 shrink-0" />
                                실시간으로 업데이트되는 부동산 시장의 흐름을 확인하세요.
                            </p>
                        </div>

                        <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeTab === cat.query;
                                return (
                                    <button
                                        key={cat.label}
                                        onClick={() => setActiveTab(cat.query)}
                                        className={`px-3.5 md:px-5 py-2 md:py-2.5 rounded-full text-[12px] md:text-[14px] font-bold transition-all duration-300 flex items-center gap-1.5 shrink-0 ${isActive
                                            ? "bg-[#4A403A] text-white shadow-md scale-105"
                                            : "bg-white text-gray-500 border border-gray-200 hover:text-[#FF8C42] hover:border-orange-200 hover:bg-orange-50"
                                            }`}
                                    >
                                        <Icon size={14} className={isActive ? "text-orange-400" : "text-gray-400"} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {loading ? (
                            <>
                                <div className="md:col-span-2 bg-gray-100 h-[220px] md:h-[280px] rounded-[24px] animate-pulse"></div>
                                <div className="bg-gray-100 h-[220px] md:h-[280px] rounded-[24px] animate-pulse"></div>
                                <div className="bg-gray-100 h-[220px] md:h-[280px] rounded-[24px] animate-pulse"></div>
                                <div className="bg-gray-100 h-[220px] md:h-[280px] rounded-[24px] animate-pulse"></div>
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
                                            ? "md:col-span-2 bg-[#4A403A] text-white p-6 md:p-8 rounded-[24px] shadow-lg hover:shadow-[0_20px_40px_-10px_rgba(74,64,58,0.4)] min-h-[220px] md:min-h-[280px]"
                                            : "col-span-1 bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-[0_15px_30px_-10px_rgba(255,140,66,0.15)] hover:border-orange-100 min-h-[220px] md:min-h-[280px]"
                                            }`}
                                    >
                                        {hasImage && (
                                            <>
                                                <div className="absolute inset-0 z-0 overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.imageUrl} alt="뉴스 썸네일" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700 ease-out" />
                                                </div>
                                                <div className="absolute inset-0 z-0 bg-gradient-to-t md:bg-gradient-to-r from-[#4A403A] via-[#4A403A]/90 to-transparent"></div>
                                            </>
                                        )}

                                        {isHeadline && !hasImage && (
                                            <div className="absolute -right-20 -bottom-20 w-56 h-56 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                                        )}

                                        {!isHeadline && (
                                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        )}

                                        <div className={`relative z-10 text-left ${hasImage ? 'md:max-w-[75%]' : 'w-full'}`}>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] md:text-[12px] font-extrabold tracking-tight mb-3 md:mb-4 ${isHeadline ? "bg-[#FF8C42] text-white shadow-sm" : "bg-orange-50 text-[#FF8C42]"
                                                }`}>
                                                {hasImage && <ImageIcon size={12} />}
                                                {activeLabel}
                                            </span>

                                            <h3 className={`font-black leading-[1.3] tracking-tight line-clamp-3 transition-colors ${isHeadline
                                                ? "text-[20px] md:text-[26px] group-hover:text-orange-200"
                                                : "text-[16px] md:text-[18px] text-[#4A403A] group-hover:text-[#FF8C42]"
                                                }`}>
                                                {item.title}
                                            </h3>
                                        </div>

                                        <div className={`relative z-10 flex justify-between items-end mt-6 pt-4 border-t transition-colors ${isHeadline ? "border-white/20 group-hover:border-white/40" : "border-gray-50 group-hover:border-orange-50"
                                            }`}>
                                            <span className={`text-[11px] md:text-[12px] font-bold tracking-wide ${isHeadline ? "text-white/70" : "text-gray-400"
                                                }`}>
                                                {formatKoreanDate(item.pubDate)}
                                            </span>

                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isHeadline
                                                ? "bg-white/20 group-hover:bg-white text-white group-hover:text-[#4A403A] backdrop-blur-sm"
                                                : "bg-gray-50 group-hover:bg-[#FF8C42] text-gray-400 group-hover:text-white"
                                                }`}>
                                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-24 bg-white rounded-[24px] border border-dashed border-gray-200">
                                <p className="text-gray-400 font-bold text-sm md:text-base">뉴스를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}