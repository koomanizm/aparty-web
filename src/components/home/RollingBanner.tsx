"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

export default function RollingBanner() {
    const banners = [
        { id: 1, src: "/banner-kakao.png", link: "#" },
        { id: 2, src: "/banner-point.png", link: "#" },
        { id: 3, src: "/banner-insight.png", link: "#" },
        { id: 4, src: "/banner-community.png", link: "#" },
    ];

    const len = banners.length;

    // 🚀 [핵심] 시작 인덱스를 1로 변경 (0은 가짜 4번 배너가 차지함)
    const [currentIndex, setCurrentIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // 🚀 [핵심] 양 끝에 가짜(Clone) 배너를 이어 붙여서 끝없는 궤도를 만듭니다.
    // [4번복제, 1번, 2번, 3번, 4번, 1번복제] 형태가 됩니다.
    const extendedBanners = useMemo(() => {
        if (len === 0) return [];
        return [banners[len - 1], ...banners, banners[0]];
    }, [banners, len]);

    useEffect(() => {
        if (isHovered || len <= 1) return;

        const timer = setInterval(() => {
            setIsTransitioning(true); // 이동할 땐 부드럽게!
            setCurrentIndex((prev) => prev + 1);
        }, 4000);

        return () => clearInterval(timer);
    }, [isHovered, len]);

    // 🚀 [핵심] 애니메이션이 끝난 직후, 가짜 배너 위치에 있다면 진짜 배너로 몰래 순간이동!
    const handleTransitionEnd = () => {
        setIsTransitioning(false); // 순간이동할 땐 애니메이션을 끕니다.
        if (currentIndex === 0) {
            setCurrentIndex(len); // 가짜 4번 -> 진짜 4번
        } else if (currentIndex === len + 1) {
            setCurrentIndex(1); // 가짜 1번 -> 진짜 1번
        }
    };

    // 하단 인디케이터(점)에 불을 켜기 위한 진짜 위치 계산
    let displayIndex = currentIndex - 1;
    if (currentIndex === 0) displayIndex = len - 1;
    else if (currentIndex === len + 1) displayIndex = 0;

    if (len === 0) return null;

    return (
        <div
            className="w-full md:w-[60%] mx-auto relative overflow-hidden rounded-[20px] md:rounded-[24px] bg-white group shadow-sm hover:shadow-md transition-all duration-300 aspect-[3780/1173]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                // isTransitioning 상태에 따라 CSS 트랜지션을 켰다 껐다 합니다.
                className={`flex w-full h-full ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                onTransitionEnd={handleTransitionEnd}
            >
                {extendedBanners.map((banner, idx) => (
                    <Link
                        key={`${banner.id}-${idx}`}
                        href={banner.link}
                        className="w-full flex-shrink-0 relative h-full block"
                    >
                        <img
                            src={banner.src}
                            alt={`배너 ${banner.id}`}
                            className="w-full h-full object-cover"
                        />
                    </Link>
                ))}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 md:gap-1.5 z-10">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.preventDefault();
                            setIsTransitioning(true); // 점을 누를 땐 부드럽게 이동
                            setCurrentIndex(idx + 1); // 배열에서 1번 인덱스부터 진짜 배너이므로 +1
                        }}
                        className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${displayIndex === idx ? "bg-white w-3 md:w-4 shadow-sm" : "bg-white/50 w-1 md:w-1.5 hover:bg-white/80"
                            }`}
                        aria-label={`${idx + 1}번 배너 보기`}
                    />
                ))}
            </div>
        </div>
    );
}