"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";

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
    // ==========================================
    // 기존 로직 완벽 보존
    // ==========================================
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

    // ==========================================
    // 추가된 로직: 현재 화면에 보이는 데이터 추적 & 타이핑 효과
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
    }, [realIndex]);


    // ==========================================
    // UI 렌더링
    // ==========================================
    return (
        <div className="w-full px-5 pt-4 pb-8 bg-white">

            {/* 상단 헤더: 여기서도 시그니처 색상을 사용해야 한다면 bg-[#172554] 로 바꿀 수 있습니다. 현재는 요청하신 그라데이션 유지했습니다. */}
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
                {/* 1번 위젯: 메인 이미지 박스 (슬라이딩 영역) */}
                <div className="relative w-full overflow-hidden rounded-[24px]">
                    <div
                        className={`flex w-full ${isTransitioning ? "transition-transform duration-500 ease-out" : ""}`}
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedItems.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className="w-full flex-shrink-0">
                                <Link href={`/property/${item.id || idx}`} className="block w-full">
                                    <div className="relative w-full h-[220px] rounded-[24px] overflow-hidden bg-gray-100 group">
                                        <Image
                                            src={getSafeImageUrl(item.image)}
                                            alt={item.title || "추천 단지"}
                                            fill
                                            draggable={false}
                                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                            <MapPin size={12} className="text-[#172554]" />
                                            <span className="text-[12px] font-bold text-[#111]">{item.location}</span>
                                        </div>

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12 flex flex-col justify-end">
                                            <div className="flex gap-1 mb-1.5">
                                                {getReasonChips(item).slice(0, 2).map((chip, cIdx) => (
                                                    <span key={cIdx} className="text-[10px] bg-white/20 backdrop-blur-sm border border-white/20 text-white px-2 py-0.5 rounded-md font-bold shadow-sm">
                                                        {chip}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-[16px] font-black text-white leading-snug line-clamp-1 drop-shadow-md">
                                                {item.title}
                                            </h3>
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
                                className="absolute left-2 top-[110px] -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] hover:text-gray-200 transition-colors z-20 active:scale-90"
                                aria-label="이전"
                            >
                                <ChevronLeft size={36} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNextMain(); }}
                                className="absolute right-2 top-[110px] -translate-y-1/2 p-2 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] hover:text-gray-200 transition-colors z-20 active:scale-90"
                                aria-label="다음"
                            >
                                <ChevronRight size={36} strokeWidth={2.5} />
                            </button>
                        </>
                    )}
                </div>

                {/* 2번, 3번 위젯: 하단 고정창 */}
                {activeItem && (
                    <Link href={`/property/${activeItem.id || realIndex}`} className="flex gap-2.5 w-full h-[100px]">

                        {/* 2번 위젯: AI 설명 박스 */}
                        <div className="flex-1 bg-[#F8F9FA] rounded-[24px] p-4 flex flex-col justify-between transition-colors hover:bg-gray-100">
                            <div>
                                <p className="text-[11px] font-black text-[#172554] mb-1 flex items-center gap-1">
                                    <Sparkles size={12} /> Aparty AI 요약
                                </p>
                                <p
                                    ref={aiTextRef}
                                    className="text-[12px] font-bold text-[#444] leading-snug line-clamp-2 break-keep tracking-tight min-h-[34px]"
                                >
                                </p>
                            </div>

                            <div className="flex items-baseline gap-1 mt-auto">
                                {activeItem.pyeongPrice ? (
                                    <>
                                        <span className="text-[18px] font-black text-[#172554] tracking-tight">{activeItem.pyeongPrice}</span>
                                        <span className="text-[12px] font-bold text-gray-500">만원 / 평</span>
                                    </>
                                ) : (
                                    <span className="text-[14px] font-bold text-gray-400">가격 문의</span>
                                )}
                            </div>
                        </div>

                        {/* ✅ 3번 위젯: 진짜 시그니처 색상(#172554)이 적용된 강력한 액션 유도 박스 */}
                        <div className="w-[100px] shrink-0 bg-[#172554] rounded-[24px] flex flex-col items-center justify-center text-white shadow-[0_8px_16px_rgba(23,37,84,0.3)] transition-transform hover:scale-[0.98] active:scale-95">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center mb-1.5 backdrop-blur-sm border border-white/20">
                                <ArrowUpRight size={18} strokeWidth={2.5} />
                            </div>
                            <span className="text-[12px] font-extrabold tracking-wide text-white/90">둘러보기</span>
                        </div>

                    </Link>
                )}
            </div>
        </div>
    );
}