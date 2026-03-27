"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function BannerGridSection() {
    const banners = [
        {
            id: 1,
            alt: "카카오 채널 가입",
            img: "/banner-kakao2.gif",
            link: "https://pf.kakao.com/_xxxxxx",
        },
        {
            id: 2,
            alt: "커뮤니티 이용",
            img: "/banner-community2.gif",
            link: "/lounge",
        },
        {
            id: 3,
            alt: "청약 일정 확인",
            img: "/banner-insight2.gif",
            link: "/subscription",
        },
        {
            id: 4,
            alt: "포인트 리워드",
            img: "/banner-point2.gif",
            link: "/reward",
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (isHovered) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [isHovered, banners.length]);

    return (
        <section className="w-full pb-10">
            <div
                className="relative w-full overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
            >
                <div
                    className="flex w-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {banners.map((banner) => (
                        <Link
                            href={banner.link}
                            key={banner.id}
                            className="w-full flex-shrink-0 relative block group pb-10"
                        >
                            <div className="w-full max-w-[1200px] mx-auto relative">
                                <Image
                                    src={banner.img}
                                    alt={banner.alt}
                                    width={1200}
                                    height={400}
                                    priority={banner.id === 1}
                                    unoptimized
                                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            aria-label={`${idx + 1}번 배너 보기`}
                            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${currentIndex === idx ? "bg-gray-800 w-6 opacity-100" : "bg-gray-300 w-2 opacity-70 hover:opacity-100"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}