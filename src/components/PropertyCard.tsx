import React from 'react';
import Image from "next/image";
import Link from "next/link";
import { Flame, Users, Maximize, Car, Calendar } from "lucide-react"; // 아이콘 대거 추가!

const PropertyCard = ({
    id,
    title,
    location,
    status,
    price,
    image,
    households, // 새로 추가된 데이터
    size,       // 새로 추가된 데이터
    parking,    // 새로 추가된 데이터
    moveIn,     // 새로 추가된 데이터
    imageColor = "bg-gray-100"
}: any) => {

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center justify-center transition-all duration-300";
        const shimmerClass = index < 3 ? "aparty-shimmer-effect" : "";
        const palette = [
            "bg-[#ef4444] border border-[#dc2626]",
            "bg-[#3b82f6] border border-[#2563eb]",
            "bg-[#f59e0b] border border-[#d97706]",
            "bg-[#10b981] border border-[#059669]",
            "bg-[#8b5cf6] border border-[#7c3aed]",
            "bg-[#ec4899] border border-[#db2777]",
            "bg-[#6366f1] border border-[#4f46e5]",
            "bg-[#06b6d4] border border-[#0891b2]"
        ];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    // 가격이 길 경우 (예: "84타입: 5억 / 59타입: 4억") 첫 번째 대표가만 잘라서 보여주기 위한 함수
    const displayPrice = price ? price.split('/')[0].trim() : "가격 문의";

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
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100">

                    {/* 1. 썸네일 & 뱃지 영역 (기존 유지) */}
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

                    {/* 2. 상세 정보 영역 (🚀 리얼랭커스 스타일 도입부) */}
                    <div className="p-4 flex flex-col flex-grow">
                        <h3 className="font-bold text-[18px] text-[#2d2621] leading-snug group-hover:text-[#ff6f42] transition-colors line-clamp-1 tracking-tight mb-1">
                            {title}
                        </h3>
                        <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-4">
                            <span className="text-sm">📍</span> {location}
                        </p>

                        {/* 📊 미니 데이터 그리드 (4구획) */}
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-2 bg-[#f8f9fa] p-3 rounded-xl border border-gray-100 mb-4 mt-auto">
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                                <Users size={12} className="text-blue-500" />
                                <span className="truncate">{households || "- 세대"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                                <Maximize size={12} className="text-orange-500" />
                                <span className="truncate">{size || "- ㎡"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                                <Car size={12} className="text-purple-500" />
                                <span className="truncate">{parking ? `주차 ${parking}` : "주차 -"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-600 font-medium">
                                <Calendar size={12} className="text-emerald-500" />
                                <span className="truncate">{moveIn || "입주 -"}</span>
                            </div>
                        </div>

                        {/* 💰 하단 가격 & 액션 버튼 */}
                        <div className="pt-3 border-t border-gray-100 flex items-end justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 mb-0.5">분양가 / 대표가</span>
                                <span className="text-[16px] font-black text-[#ff5a28] tracking-tight">
                                    {displayPrice}
                                </span>
                            </div>
                            <div className="bg-[#4a403a] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg group-hover:bg-[#ff5a28] transition-colors shadow-sm flex items-center gap-1">
                                상세보기 <span className="text-[10px]">▶</span>
                            </div>
                        </div>
                    </div>

                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;