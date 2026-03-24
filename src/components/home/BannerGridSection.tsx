"use client";

import Image from "next/image";
import Link from "next/link";

export default function BannerGridSection() {
    const banners = [
        { id: 1, alt: "카카오 채널 가입", img: "/banner-kakao.png", link: "https://pf.kakao.com/_xxxxxx" },
        { id: 2, alt: "커뮤니티 이용", img: "/banner-community.png", link: "/lounge" },
        { id: 3, alt: "청약 일정 확인", img: "/banner-insight.png", link: "/subscription" },
        { id: 4, alt: "포인트 리워드", img: "/banner-point.png", link: "/reward" },
    ];

    return (
        <section className="w-full">
            <div className="flex items-center justify-between mb-4 px-1">
                {/* 🚀 레퍼런스(15/18px Bold)에 맞춘 컴팩트 제목 */}
                <h2 className="text-[15px] md:text-[18px] font-bold tracking-tight text-gray-900">
                    APARTY <span className="text-[#FF7A2F]">스페셜 기획전</span>
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
                {banners.map((banner) => (
                    <Link href={banner.link} key={banner.id} className="group relative block rounded-[16px] md:rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-100">
                        <Image src={banner.img} alt={banner.alt} width={1200} height={600} className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
                    </Link>
                ))}
            </div>
        </section>
    );
}