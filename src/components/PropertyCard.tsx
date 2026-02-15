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

    // ✅ 뱃지 스타일 함수: 짙은 채색 + 하얀 글자 + 스르륵 효과
    const getStatusStyle = (index: number) => {
        // text-white를 추가하고 font-bold로 통일했습니다.
        const base = "relative overflow-hidden px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center justify-center transition-all duration-300";
        const shimmerClass = index < 3 ? "shimmer-effect" : "";

        // 🎨 색상을 더 짙고 선명하게 변경 (하얀 글자가 잘 보이도록)
        const palette = [
            "bg-[#ef4444] border border-[#dc2626]", // 1. 레드
            "bg-[#3b82f6] border border-[#2563eb]", // 2. 블루
            "bg-[#f59e0b] border border-[#d97706]", // 3. 앰버(오렌지황토)
            "bg-[#10b981] border border-[#059669]", // 4. 에메랄드 그린
            "bg-[#8b5cf6] border border-[#7c3aed]", // 5. 바이올렛
            "bg-[#ec4899] border border-[#db2777]", // 6. 핑크
            "bg-[#6366f1] border border-[#4f46e5]", // 7. 인디고
            "bg-[#06b6d4] border border-[#0891b2]", // 8. 시안
            "bg-[#6b7280] border border-[#4b5563]", // 9. 그레이
            "bg-[#84cc16] border border-[#65a30d]", // 10. 라임
            "bg-[#14b8a6] border border-[#0d9488]", // 11. 틸
            "bg-[#475569] border border-[#334155]"  // 12. 슬레이트
        ];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    return (
        <Link href={`/property/${id}`} className="block group h-full">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes sweep {
                    0% { left: -150%; }
                    100% { left: 150%; }
                }
                .shimmer-effect::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    width: 50px; /* 빛줄기를 조금 더 선명하게 넓혔습니다 */
                    height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: skewX(-20deg);
                    animation: sweep 2.5s infinite;
                }
            `}} />

            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
                <div className={`h-48 w-full ${imageColor} relative flex items-center justify-center overflow-hidden`}>
                    {image ? (
                        <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                        // ✅ font-black에서 font-bold로 변경하여 너무 두껍지 않게 조정했습니다.
                        <p className="text-sm font-bold text-[#ff5a28] mt-1 tracking-tight line-clamp-1">
                            {price}
                        </p>
                    )}

                    <div className="mt-5">
                        <div className="w-full bg-orange-100 group-hover:bg-orange-200 rounded-2xl py-3.5 px-4 flex justify-center items-center transition-all shadow-sm group-hover:shadow-md">
                            <span className="text-sm font-bold text-black tracking-tight">
                                자세히보기
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;