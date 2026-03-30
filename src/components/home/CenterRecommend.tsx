"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";

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

    // ==========================================
    // 💡 Hooks(useRef, useEffect)를 위로 끌어올린 안전한 구조
    // ==========================================
    let realIndex = currentIndex;
    if (len > 0) {
        if (currentIndex === 0) realIndex = len - 1;
        else if (currentIndex === len + 1) realIndex = 0;
        else realIndex = currentIndex - 1;
    }
    const activeItem = len > 0 ? allItems[realIndex] : null;

    const aiTextRef = useRef<HTMLParagraphElement>(null);

    const aiTexts = [
        "주변 시세 대비 합리적인 평당가와 뛰어난 교통 인프라를 갖춘 추천 매물입니다.",
        "우수한 학군과 풍부한 생활 상권을 자랑하여 실거주 만족도가 매우 높습니다.",
        "향후 다양한 개발 호재가 예정되어 있어 투자 가치까지 훌륭한 프리미엄 단지입니다."
    ];

    useEffect(() => {
        if (!aiTextRef.current || !activeItem) return;

        const textToType = aiTexts[realIndex % aiTexts.length];
        aiTextRef.current.textContent = "";

        const delayTimer = setTimeout(() => {
            let i = 0;
            const typeTimer = setInterval(() => {
                if (i < textToType.length) {
                    if (aiTextRef.current) aiTextRef.current.textContent += textToType.charAt(i);
                    i++;
                } else {
                    clearInterval(typeTimer);
                }
            }, 40);

            return () => clearInterval(typeTimer);
        }, 150);

        return () => clearTimeout(delayTimer);
    }, [realIndex, activeItem]);

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

    let displayIndex = currentIndex;
    if (len > 0) {
        if (currentIndex === 0) displayIndex = len;
        else if (currentIndex === len + 1) displayIndex = 1;
    }

    // 🚨 렌더링 중단(Early Return)은 반드시 모든 Hook이 선언된 이후인 이 위치에 있어야 합니다!
    if (len === 0) return null;

    // ==========================================
    // UI 렌더링
    // ==========================================
    return (
        <div className="w-full px-5 pt-0 pb-8 bg-white">

            {/* 상단 헤더 */}
            <div className="flex justify-between items-center mb-3 px-1">
                <div className="bg-gradient-to-r from-[#3b82f6] via-[#a855f7] to-[#ec4899] text-white text-[11px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-sm flex items-center">
                    <span>APARTY'S PICK</span>
                </div>

                {len > 1 && (
                    <div className="text-[13px] font-extrabold text-gray-400">
                        <span className="text-[#111]">{displayIndex}</span> / {len}
                    </div>
                )}
            </div>

            <div
                className="relative w-full flex flex-col gap-2.5"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onMouseDown={handleDragStart}
                onMouseUp={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchEnd={handleDragEnd}
            >
                {/* 1번 위젯: 메인 이미지 박스 (높이 270px 버전) */}
                <div className="relative w-full overflow-hidden rounded-[24px]">
                    <div
                        className={`flex w-full ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="w-full flex-shrink-0">
                                <Link href={`/property/${item.id || idx}`} className="block w-full">
                                    <div className="relative w-full h-[270px] rounded-[24px] overflow-hidden bg-gray-100 group">
                                        <Image
                                            src={getSafeImageUrl(item.image)}
                                            alt={item.title || "추천 단지"}
                                            fill
                                            draggable={false}
                                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                        />

                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/60 to-transparent opacity-80 pointer-events-none" />

                                        {/* 좌측 상단 단지명 & 주소 */}
                                        <div className="absolute top-5 left-5 z-10 flex flex-col gap-1.5">
                                            <h3 className="text-[20px] font-black text-white leading-tight drop-shadow-md">
                                                {item.title}
                                            </h3>
                                            <p className="text-[13px] font-bold text-white/90 flex items-center gap-1 drop-shadow-sm">
                                                <MapPin size={13} className="text-red-500" /> {item.location}
                                            </p>
                                        </div>

                                        {/* 우측 하단 가격 정보 */}
                                        <div className="absolute bottom-5 right-5 z-10 text-right">
                                            {item.pyeongPrice ? (
                                                <p className="text-[24px] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] leading-none tracking-tighter">
                                                    {item.pyeongPrice}<span className="text-[13px] font-bold text-white/90 ml-0.5">만원/평</span>
                                                </p>
                                            ) : (
                                                <p className="text-[15px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">가격 문의</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* 화살표 오버레이 */}
                    {len > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePrevMain(); }}
                                className="absolute left-2 top-[135px] -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] hover:text-gray-200 transition-colors z-20 active:scale-90"
                                aria-label="이전"
                            >
                                <ChevronLeft size={36} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextMain(); }}
                                className="absolute right-2 top-[135px] -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] hover:text-gray-200 transition-colors z-20 active:scale-90"
                                aria-label="다음"
                            >
                                <ChevronRight size={36} strokeWidth={2.5} />
                            </button>
                        </>
                    )}
                </div>

                {/* 2번, 3번 위젯: 하단 고정창 */}
                {activeItem && (
                    <Link href={`/property/${activeItem.id || realIndex}`} className="flex gap-2.5 w-full h-[100px] group">

                        {/* 2번 위젯: AI 설명 박스 */}
                        <div className="flex-1 bg-[#F8F9FA] rounded-[24px] p-4 flex flex-col justify-center gap-1.5 transition-colors group-hover:bg-gray-100">
                            <div>
                                <p className="text-[13px] font-black text-blue-600 mb-1 flex items-center gap-1.5">
                                    <Image
                                        src="/roboticon.png"
                                        alt="AI Robot"
                                        width={16}
                                        height={16}
                                        className="shrink-0 object-contain"
                                    />
                                    APARTY AI 요약
                                </p>
                                <p
                                    ref={aiTextRef}
                                    className="text-[13px] font-bold text-[#444] leading-snug line-clamp-2 break-keep tracking-tight min-h-[36px]"
                                >
                                </p>
                            </div>
                        </div>

                        {/* 3번 위젯: 강력한 액션 유도 박스 */}
                        <div className="w-[100px] shrink-0 bg-[#172554] rounded-[24px] flex flex-col items-center justify-center text-white shadow-[0_8px_16px_rgba(23,37,84,0.3)] transition-all duration-300 group-hover:bg-[#20347a] group-hover:-translate-y-1 group-hover:shadow-[0_12px_24px_rgba(23,37,84,0.4)] active:scale-95 active:translate-y-0">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1.5 backdrop-blur-sm border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <ArrowUpRight size={19} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </div>
                            <span className="text-[13px] font-extrabold tracking-wide text-white/90 transition-colors duration-300 group-hover:text-white">둘러보기</span>
                        </div>

                    </Link>
                )}
            </div>
        </div>
    );
}