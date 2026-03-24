"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, Pause, Play, Crown } from "lucide-react";

type Property = {
    id?: string | number;
    title?: string;
    location?: string;
    status?: string[];
    pyeongPrice?: string | number;
    image?: string;
};

export default function CenterRecommend({
    properties = [],
    userName = "ddd",
}: {
    properties: Property[];
    userName?: string | null;
}) {
    const allItems = properties || [];
    const len = allItems.length;

    const [currentIndex, setCurrentIndex] = useState(len > 1 ? 1 : 0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    const [touchStartX, setTouchStartX] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const extendedItems = useMemo(() => {
        if (len <= 1) return allItems;
        return [allItems[len - 1], ...allItems, allItems[0]];
    }, [allItems, len]);

    const handlePrevMain = () => {
        if (len <= 1 || isAnimating) return;
        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev - 1);
    };

    const handleNextMain = () => {
        if (len <= 1 || isAnimating) return;
        setIsAnimating(true);
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
    };

    const handleTransitionEnd = () => {
        setIsAnimating(false);
        if (currentIndex === 0) {
            setIsTransitioning(false);
            setCurrentIndex(len);
        } else if (currentIndex === len + 1) {
            setIsTransitioning(false);
            setCurrentIndex(1);
        }
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        if (isAnimating) return;
        setIsHovered(true);
        setTouchStartX("touches" in e ? e.touches[0].clientX : e.clientX);
    };

    const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
        setIsHovered(false);
        if (len <= 1 || isAnimating) return;

        const touchEndX =
            "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
        const distance = touchStartX - touchEndX;

        if (distance > 50) handlePrevMain();
        else if (distance < -50) handleNextMain();
    };

    useEffect(() => {
        if (len <= 1 || isHovered || isPaused) return;
        const timer = setInterval(() => {
            handleNextMain();
        }, 5000);
        return () => clearInterval(timer);
    }, [isHovered, isPaused, len, isAnimating]);

    const getSafeImageUrl = (imgStr?: string) => {
        if (!imgStr || typeof imgStr !== "string") return "/house1.jpg";
        const trimmed = imgStr.trim();
        if (!trimmed) return "/house1.jpg";
        if (trimmed.startsWith("http") || trimmed.startsWith("data:")) return trimmed;
        if (trimmed.startsWith("/")) return trimmed;
        return `/${trimmed}`;
    };

    const getRegionLabel = (location?: string) => {
        if (!location) return "관심지역";
        const first = location.split(" ")[0]?.trim();
        return first || "관심지역";
    };

    const getReasonChips = (item?: Property) => {
        if (!item) return [];
        const chips = [
            getRegionLabel(item.location),
            ...(Array.isArray(item.status) ? item.status.slice(0, 2) : []),
        ];
        return [...new Set(chips)].slice(0, 3);
    };

    let displayIndex = currentIndex;
    if (len > 0) {
        if (currentIndex === 0) displayIndex = len;
        else if (currentIndex === len + 1) displayIndex = 1;
    }

    if (len === 0) return null;

    return (
        <div className="relative h-auto w-full flex flex-col min-w-0 px-0 pt-3 pb-8">
            <div className="relative flex flex-col gap-1 min-w-0 w-full mx-auto">
                <div
                    className="group block h-[440px] md:h-[460px] xl:h-[480px] w-full rounded-[24px] overflow-hidden border border-white/80 bg-white shadow-[0_12px_40px_rgba(74,64,58,0.1)] transition-shadow duration-300 hover:shadow-[0_24px_56px_rgba(74,64,58,0.15)] relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onMouseDown={handleDragStart}
                    onMouseUp={handleDragEnd}
                    onTouchStart={handleDragStart}
                    onTouchEnd={handleDragEnd}
                >
                    <div className="absolute top-5 right-5 md:top-6 md:right-6 z-10">
                        <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7E22CE] via-[#EC4899] to-[#F97316] px-4 py-2 text-white shadow-xl shadow-orange-950/20">
                            <Crown size={16} className="text-white drop-shadow-sm" />
                            <span className="text-[12px] md:text-[13px] font-extrabold tracking-tight drop-shadow-sm">
                                오늘의 추천
                            </span>
                        </div>
                    </div>

                    <div
                        className={`flex h-full w-full ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedItems.map((item, idx) => (
                            <Link
                                key={`${item.id}-${idx}`}
                                href={`/property/${item.id || idx}`}
                                className="relative w-full h-full flex-shrink-0 block overflow-hidden"
                            >
                                <Image
                                    src={getSafeImageUrl(item.image)}
                                    alt={item.title || "추천 단지"}
                                    fill
                                    draggable={false}
                                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-[#1A100B]/98 z-5" />

                                <div className="absolute top-5 left-5 md:top-6 md:left-6 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
                                    {getReasonChips(item).map((chip, chipIdx) => (
                                        <span
                                            key={`${chip}-${chipIdx}`}
                                            className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] md:text-[12px] font-extrabold shadow-sm ${chipIdx === 0
                                                ? "bg-white text-[#4A403A]"
                                                : "bg-white/15 text-white border border-white/20 backdrop-blur-sm hover:bg-white/25 transition-colors"
                                                }`}
                                        >
                                            {chip}
                                        </span>
                                    ))}
                                </div>

                                <div className="absolute inset-x-0 bottom-0 z-10 p-6 xl:p-10">
                                    <div className="max-w-[85%]">
                                        <h3 className="text-[24px] xl:text-[34px] font-black text-white tracking-tighter leading-[1.2] drop-shadow-lg line-clamp-2 break-keep">
                                            {item.title}
                                        </h3>

                                        <p className="mt-3 flex items-center gap-1.5 text-[14px] xl:text-[15px] text-white/95 font-semibold truncate">
                                            <MapPin size={16} className="text-[#FF9A57] shrink-0" />
                                            {item.location}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-5 border-t border-white/20 flex items-end justify-between gap-4">
                                        <div className="min-w-0 flex-1 hidden md:block">
                                            <p className="text-[13px] xl:text-[14px] text-white/80 font-medium line-clamp-1 tracking-tight">
                                                상세 분양가와 조건을 먼저 확인해보세요
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right ml-auto">
                                            {item.pyeongPrice && (
                                                <div className="mb-2">
                                                    <p className="text-[11px] xl:text-[12px] text-white/70 font-bold mb-0.5">
                                                        예상 평당가
                                                    </p>
                                                    <p className="text-[22px] xl:text-[26px] font-black text-[#FF9A57] tracking-tight leading-none drop-shadow-md">
                                                        {item.pyeongPrice}
                                                        <span className="ml-1 text-[13px] xl:text-[14px] font-bold text-white">
                                                            만원
                                                        </span>
                                                    </p>
                                                </div>
                                            )}

                                            <span className="inline-flex items-center text-[12px] xl:text-[13px] font-extrabold text-white group-hover:text-[#FFD4B8] transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                                                상세 보기 <ChevronRight size={14} className="ml-1" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {len > 1 && (
                    <div className="flex justify-center items-center mt-1">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrevMain(); }}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#FF7A2F] transition-colors active:scale-90"
                                aria-label="이전"
                            >
                                <ChevronLeft size={20} strokeWidth={2.5} />
                            </button>

                            <div className="text-[13px] font-medium tracking-wide w-12 text-center text-gray-500 cursor-default">
                                <span className="font-extrabold text-gray-800">{displayIndex}</span>
                                <span className="text-gray-400"> / {len}</span>
                            </div>

                            <button
                                type="button"
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextMain(); }}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#FF7A2F] transition-colors active:scale-90"
                                aria-label="다음"
                            >
                                <ChevronRight size={20} strokeWidth={2.5} />
                            </button>

                            <div className="w-px h-3.5 bg-gray-300 mx-1"></div>

                            <button
                                type="button"
                                onClick={() => setIsPaused(!isPaused)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-[#FF7A2F] transition-colors active:scale-90"
                                aria-label={isPaused ? "재생" : "일시정지"}
                            >
                                {isPaused ? (
                                    <Play size={14} strokeWidth={3} className="ml-0.5" />
                                ) : (
                                    <Pause size={14} strokeWidth={3} />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}