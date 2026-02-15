import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";

const PropertyCard = ({
    id,
    title,
    location,
    status,
    price,
    image,
    imageColor = "bg-gray-100"
}: any) => {

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center justify-center transition-all duration-300";
        // 상위 3개 뱃지에만 shimmer 효과 적용
        const shimmerClass = index < 3 ? "aparty-shimmer-effect" : "";

        const palette = [
            "bg-[#ef4444] border border-[#dc2626]", // 레드
            "bg-[#3b82f6] border border-[#2563eb]", // 블루
            "bg-[#f59e0b] border border-[#d97706]", // 앰버
            "bg-[#10b981] border border-[#059669]", // 에메랄드
            "bg-[#8b5cf6] border border-[#7c3aed]", // 바이올렛
            "bg-[#ec4899] border border-[#db2777]", // 핑크
            "bg-[#6366f1] border border-[#4f46e5]", // 인디고
            "bg-[#06b6d4] border border-[#0891b2]"  // 시안
        ];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    return (
        <div className="h-full">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes aparty-sweep {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(150%); }
                }
                .aparty-shimmer-effect::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 45px;
                    height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.45), transparent);
                    transform: skewX(-20deg);
                    animation: aparty-sweep 2.8s infinite linear;
                    pointer-events: none;
                }
            `}} />

            <Link href={`/property/${id}`} className="block group h-full">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">

                    {/* 이미지 영역 */}
                    <div className={`h-48 w-full ${imageColor} relative flex items-center justify-center overflow-hidden`}>
                        {image ? (
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                        ) : (
                            <span className="text-4xl opacity-20">🏠</span>
                        )}

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            {Array.isArray(status) ? (
                                status.map((tag: string, index: number) => (
                                    <span key={index} className={getStatusStyle(index)}>
                                        {index === 0 && <Flame size={10} className="mr-1 fill-white border-none" />}
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                status && (
                                    <span className={getStatusStyle(0)}>
                                        <Flame size={10} className="mr-1 fill-white border-none" />
                                        {status}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {/* 정보 영역 */}
                    <div className="p-5 flex flex-col space-y-2.5 flex-grow">
                        <h3 className="font-bold text-[17px] text-[#2d2621] leading-snug group-hover:text-orange-600 transition-colors line-clamp-1 tracking-tight">
                            {title}
                        </h3>

                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <span className="text-base">📍</span>
                            {location}
                        </p>

                        {price && (
                            <p className="text-[15px] font-bold text-[#ff5a28] mt-1 tracking-tight">
                                {price}
                            </p>
                        )}

                        <div className="mt-4 pt-1">
                            <div className="w-full bg-orange-50 group-hover:bg-orange-100 rounded-xl py-3 flex justify-center items-center transition-colors border border-orange-100">
                                <span className="text-sm font-bold text-orange-700">자세히보기</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;