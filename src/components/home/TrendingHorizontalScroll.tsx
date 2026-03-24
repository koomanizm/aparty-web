"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, MapPin, ChevronLeft, ChevronRight } from "lucide-react"; // Bell(알림) 및 화살표 아이콘 추가
import { Property } from "../../lib/sheet";

interface TrendingProps {
    properties: Property[];
}

export default function TrendingHorizontalScroll({ properties }: TrendingProps) {
    // 🚀 노출 개수를 10개로 유지
    const trendingItems = properties.slice(0, 10);

    const scrollRef = useRef<HTMLDivElement>(null);

    // 드래그 관련 상태
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [dragged, setDragged] = useState(false);

    // 🚀 플로팅 버튼 관련 상태
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    if (trendingItems.length === 0) return null;

    const getSafeImage = (img: any) => {
        if (!img || typeof img !== 'string') return "/house1.jpg";
        const trimmedImg = img.trim();
        if (trimmedImg === "") return "/house1.jpg";
        if (trimmedImg.startsWith("http") || trimmedImg.startsWith("data:")) return trimmedImg;
        if (trimmedImg.startsWith("/")) return trimmedImg;
        return `/${trimmedImg}`;
    };

    const getBadgeText = (idx: number, status: string[]) => {
        if (idx === 0) return "청약 D-1";
        if (idx === 1) return "선착순";
        if (idx === 2) return "마감임박";
        return status[0] || "신규오픈";
    };

    // 🚀 스크롤 위치 감지 함수 (플로팅 버튼 유무 결정)
    const checkScrollPosition = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        const currentRef = scrollRef.current;
        if (currentRef) {
            checkScrollPosition(); // 초기 렌더링 시 체크
            currentRef.addEventListener("scroll", checkScrollPosition);
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener("scroll", checkScrollPosition);
            }
        };
    }, [trendingItems]);

    // 🚀 플로팅 버튼 클릭 시 스크롤 함수
    const scrollLeftBtn = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    };

    const scrollRightBtn = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    };

    // Grab & Drag 스크롤 핸들러
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setDragged(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeftState(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeftState - walk;

        if (Math.abs(walk) > 5) {
            setDragged(true);
        }
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        if (dragged) {
            e.preventDefault();
        }
    };

    return (
        // 🚀 버튼 및 제목 크기 조정을 위해 w-full py-5 select-none 유지
        <div className="w-full py-5 select-none group/main relative">
            <div className="flex items-center gap-1.5 px-2 mb-3 md:mb-4">
                {/* Bell 아이콘으로 교체, 제목 크기(16px) 및 굵기(bold) 축소 */}
                <Bell size={17} className="text-[#FF7A2F] fill-[#FF7A2F]/10 shrink-0" />
                <h3 className="text-[15px] md:text-[16px] font-bold text-[#1E293B] tracking-tight">신규등록 단지</h3>
            </div>

            {/* 🚀 플로팅 버튼 (박스 없이 아이콘만) - PC화면 호버시에만 나타남 */}
            {showLeftArrow && (
                <button
                    onClick={scrollLeftBtn}
                    className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 items-center justify-center text-white/70 hover:text-white drop-shadow-md opacity-0 group-hover/main:opacity-100 transition-opacity duration-300"
                    aria-label="이전"
                >
                    <ChevronLeft size={28} strokeWidth={2.5} />
                </button>
            )}
            {showRightArrow && (
                <button
                    onClick={scrollRightBtn}
                    className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 w-8 h-8 items-center justify-center text-white/70 hover:text-white drop-shadow-md opacity-0 group-hover/main:opacity-100 transition-opacity duration-300"
                    aria-label="다음"
                >
                    <ChevronRight size={28} strokeWidth={2.5} />
                </button>
            )}

            <div
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                className={`flex overflow-x-auto gap-3 md:gap-4 pb-4 no-scrollbar pl-2 pr-4 z-10 relative ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                {trendingItems.map((item, idx) => (
                    <Link
                        href={`/property/${item.id}`}
                        key={item.id}
                        onClick={handleLinkClick}
                        // 🚀 호버 효과 강화: border border-black/5 를 border-2 border-transparent 로 미리 잡아두어 호버 시 튕김 방지
                        // group-hover:border-[#FF7A2F] group-hover:border-2 추가
                        className="relative flex-none w-[190px] md:w-[220px] h-[116px] md:h-[130px] rounded-[16px] overflow-hidden group shadow-sm hover:shadow-[0_8px_20px_rgba(255,122,47,0.15)] transition-all duration-300 border-2 border-transparent group-hover:border-[#FF7A2F]"
                    >
                        <Image
                            src={getSafeImage(item.image)}
                            alt={item.title}
                            fill
                            draggable={false}
                            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A100B]/90 via-[#1A100B]/30 to-black/5 z-10" />

                        {/* 🚀 뱃지 및 뱃지 텍스트 크기 10% 축소 (기존 7.5px/8px -> 6.75px/7.2px 로 조정, 시각적 밸런스 고려) */}
                        <div className="absolute top-2.5 left-2.5 z-20 flex gap-1.5">
                            <span className="text-[6.75px] md:text-[7.2px] font-black text-white bg-[#FF7A2F] px-1 py-0.5 rounded shadow-sm tracking-tighter leading-none flex items-center h-[12px]">
                                {getBadgeText(idx, item.status)}
                            </span>
                            {idx < 2 && (
                                <span className={`text-[6.75px] md:text-[7.2px] font-black text-white px-1 py-0.5 rounded shadow-sm tracking-tighter leading-none flex items-center h-[12px] ${idx === 0 ? 'bg-[#E11D48]' : 'bg-blue-500'}`}>
                                    {idx === 0 ? 'HOT' : 'NEW'}
                                </span>
                            )}
                        </div>

                        <div className="absolute bottom-0 left-0 w-full p-2.5 md:p-3 z-20 flex flex-col pointer-events-none">
                            <h4 className="text-[11px] md:text-[12px] font-extrabold text-white truncate drop-shadow-md mb-0.5 tracking-tight">
                                {item.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-90">
                                <MapPin size={9} className="text-[#FFD4B8] shrink-0" />
                                <span className="text-[8px] md:text-[9px] text-white/90 font-medium truncate tracking-tight">
                                    {item.location}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}