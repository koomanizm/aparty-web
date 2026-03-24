"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface Props {
    tickerNews?: any[];
    [key: string]: any;
}

export default function HomeHeroSection({ tickerNews = [] }: Props) {
    const [tickerIndex, setTickerIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const extendedNews = tickerNews.length > 0 ? [...tickerNews, tickerNews[0]] : [];

    useEffect(() => {
        if (extendedNews.length <= 1) return;
        const timer = setInterval(() => {
            setIsTransitioning(true);
            setTickerIndex((prev) => prev + 1);
        }, 3500);
        return () => clearInterval(timer);
    }, [extendedNews.length]);

    const handleTransitionEnd = () => {
        if (tickerIndex === extendedNews.length - 1) {
            setIsTransitioning(false);
            setTickerIndex(0);
        }
    };

    return (
        // 🚀 여백을 싹 빼고 헤더 우측 공간에 딱 맞게 정렬
        <div className="flex items-center justify-end w-full">
            <div className="flex items-center gap-2.5 group cursor-pointer w-full">
                <div className="shrink-0 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-[11px] font-extrabold text-red-600 tracking-tight">NEWS</span>
                </div>

                <div className="flex-1 h-[20px] overflow-hidden relative">
                    {extendedNews.length > 0 ? (
                        <div
                            className={`flex flex-col absolute top-0 left-0 w-full ${isTransitioning ? "transition-transform duration-500 ease-in-out" : ""}`}
                            style={{ transform: `translateY(-${tickerIndex * 20}px)` }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {extendedNews.map((item: any, idx: number) => (
                                <Link
                                    key={idx}
                                    href={item.link}
                                    target="_blank"
                                    // 🚀 폰트 색상을 메뉴바와 어울리도록 살짝 눌러줌
                                    className="h-[20px] flex items-center text-[12px] md:text-[13px] font-medium text-gray-500 hover:text-[#FF7A2F] truncate transition-colors w-full text-left"
                                >
                                    <span className="truncate" dangerouslySetInnerHTML={{ __html: item.title }} />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[20px] flex items-center text-[12px] md:text-[13px] font-medium text-gray-400">
                            실시간 뉴스를 불러오는 중...
                        </div>
                    )}
                </div>
                <ChevronRight size={14} className="text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
        </div>
    );
}