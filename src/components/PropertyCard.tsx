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
    type,
    imageColor = "bg-gray-100"
}: any) => {

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center justify-center transition-all duration-300";
        // globals.css 대신 내부 스타일 태그에 정의된 클래스를 사용합니다.
        const shimmerClass = index < 3 ? "shimmer-effect-inner" : "";

        const palette = [
            "bg-[#ef4444] border border-[#dc2626]",
            "bg-[#3b82f6] border border-[#2563eb]",
            "bg-[#f59e0b] border border-[#d97706]",
            "bg-[#10b981] border border-[#059669]",
            "bg-[#8b5cf6] border border-[#7c3aed]",
            "bg-[#ec4899] border border-[#db2777]",
            "bg-[#6366f1] border border-[#4f46e5]",
            "bg-[#06b6d4] border border-[#0891b2]",
            "bg-[#6b7280] border border-[#4b5563]",
            "bg-[#84cc16] border border-[#65a30d]",
            "bg-[#14b8a6] border border-[#0d9488]",
            "bg-[#475569] border border-[#334155]"
        ];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    return (
        <div className="h-full">
            {/* 🛠️ 스타일 정의를 가장 안전한 곳으로 옮겼습니다. */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes sweep-animation {
                    0% { transform: translateX(-150%); }
                    100% { transform: translateX(150%); }
                }
                .shimmer-effect-inner::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 60px;
                    height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: skewX(-25deg);
                    animation: sweep-animation 2.5s infinite linear;
                    pointer-events: none;
                }
            `}} />

            <Link href={`/property/${id}`} className="block group h-full">
                <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col border border-gray-100">

                    {/* 이미지 영역: 반드시 relative가 있어야 폭주하지 않습니다. */}
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

                    <div className="p-5 flex flex-col space-y-2 flex-grow">
                        <h3 className="font-bold text-lg text-[#4a403a] leading-tight group-hover:text-orange-500 transition-colors line-clamp-1 tracking-tight">
                            {title}
                        </h3>

                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <span className="text-base">📍</span>
                            {location}
                        </p>

                        {price && (
                            <p className="text-sm font-bold text-[#ff5a28] mt-1 tracking-tight line-clamp-1">
                                {price}
                            </p>
                        )}

                        <div className="mt-5">
                            <div className="w-full bg-orange-100 group-hover:bg-orange-200 rounded-2xl py-3.5 px-4 flex justify-center items-center transition-all shadow-sm group-hover:shadow-md">
                                <span className="text-sm font-bold text-black tracking-tight">자세히보기</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;