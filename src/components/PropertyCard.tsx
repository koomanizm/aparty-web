import React from 'react';
import Image from "next/image";
import Link from "next/link";

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

    // ✅ 상태별 색상 규칙 (기존 코드를 해치지 않게 함수로 추가)
    const getStatusColor = (tag: string) => {
        switch (tag) {
            case "분양중": return "bg-blue-500 text-white";
            case "줍줍": return "bg-rose-500 text-white";
            case "분양예정": return "bg-emerald-500 text-white";
            case "마감임박": return "bg-red-600 text-white";
            default: return "bg-orange-500 text-white";
        }
    };

    return (
        <Link href={`/property/${id}`} className="block group h-full">
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
                {/* 이미지 영역 */}
                <div className={`h-48 w-full ${imageColor} relative flex items-center justify-center overflow-hidden`}>
                    {image ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <span className="text-4xl opacity-20">🏠</span>
                    )}

                    {/* ✅ 상태 배지 영역 (색상 로직 적용) */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                        {Array.isArray(status) ? (
                            status.map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${getStatusColor(tag)}`}
                                >
                                    {tag}
                                </span>
                            ))
                        ) : (
                            status && (
                                <span className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold shadow-sm ${getStatusColor(status)}`}>
                                    {status}
                                </span>
                            )
                        )}
                    </div>
                </div>

                {/* 정보 영역 */}
                <div className="p-5 flex flex-col space-y-2 flex-grow">
                    <h3 className="font-bold text-lg text-[#4a403a] leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        📍 {location}
                    </p>

                    {price && (
                        <p className="text-sm font-semibold text-gray-700 mt-1">
                            {price}
                        </p>
                    )}

                    {/* 하단 버튼 (대표님이 좋아하시는 원래 디자인 그대로!) */}
                    {/* 기존 버튼 영역 코드를 지우고 이 코드를 복사해서 넣으세요 */}

                    <div className="mt-5">
                        <div className="w-full bg-orange-100 hover:bg-orange-200 rounded-2xl py-3.5 px-4 flex justify-center items-center transition-all shadow-sm group-hover:shadow-md">
                            <span className="text-sm font-bold text-black tracking-tight">
                                자세히보기
                            </span>
                            {/* 화살표 아이콘(→) 제거됨 */}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyCard;