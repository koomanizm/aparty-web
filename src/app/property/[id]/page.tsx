"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Maximize, Calendar, Car, ArrowLeft, Globe, Zap } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProperty() {
            try {
                const allProperties = await getPropertiesFromSheet();
                const found = allProperties.find((p: Property) => String(p.id) === params.id);
                if (found) setProperty(found);
            } catch (error) {
                console.error("로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProperty();
    }, [params.id]);

    // ✅ [추가된 부분] 상태별 색상 규칙 함수
    const getStatusColor = (tag: string) => {
        switch (tag) {
            case "분양중": return "bg-blue-500";
            case "줍줍": return "bg-rose-500";
            case "분양예정": return "bg-emerald-500";
            case "마감임박": return "bg-red-600"; // 강렬한 빨간색
            default: return "bg-orange-500";
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-400">정보를 불러오는 중... ⏳</div>;
    if (!property) return <div className="p-10 text-center">매물을 찾을 수 없습니다. 😢</div>;

    return (
        <main className="min-h-screen bg-[#fdfbf7] pb-20">
            {/* 슬림 네비게이션 */}
            <nav className="py-3 px-6 flex items-center gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100/50">
                <button onClick={() => router.back()} className="text-gray-600 hover:scale-110 transition-transform">
                    <ArrowLeft size={22} />
                </button>
                <h1 className="text-lg font-bold text-[#4a403a] truncate">{property.title}</h1>
            </nav>

            {/* 박스형 이미지 섹션 */}
            <div className="relative w-full max-w-4xl mx-auto h-[230px] md:h-[330px] bg-gray-200 rounded-[2.5rem] overflow-hidden mt-6 shadow-sm px-4 md:px-0">
                <Image
                    src={property.image || "/house1.jpg"} // 주소 뒤에 버전 추가 (캐시 방지)
                    alt={property.title}
                    fill
                    className="object-cover" // 'cover'를 'contain'으로 변경 (확대 없이 전체 보임)
                    priority
                />
            </div>

            <div className="max-w-4xl mx-auto p-6 mt-2">
                {/* ✅ [수정된 부분] 상태별 색상이 적용된 뱃지 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {property.status.map((tag: string, i: number) => (
                        <span
                            key={i}
                            className={`${getStatusColor(tag)} text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* 제목 & 가격 */}
                <h2 className="text-3xl font-black text-[#4a403a] mb-1">{property.title}</h2>
                <p className="text-2xl font-black text-[#ff5a28] mb-4">{property.price}</p>
                <p className="text-gray-500 mb-8 flex items-center gap-1 font-medium text-sm">📍 {property.location}</p>

                {/* 핵심 정보 그리드 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                            <Users size={20} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mb-1">세대수</p>
                        <p className="font-bold text-gray-800 text-base">{property.households || "-"}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3">
                            <Maximize size={20} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mb-1">공급면적</p>
                        <p className="font-bold text-gray-800 text-base">{property.size || "-"}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
                            <Calendar size={20} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mb-1">입주예정</p>
                        <p className="font-bold text-gray-800 text-base">{property.moveIn || "-"}</p>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-3">
                            <Car size={20} />
                        </div>
                        <p className="text-[11px] text-gray-400 font-bold mb-1">주차대수</p>
                        <p className="font-bold text-gray-800 text-base">{property.parking || "-"}</p>
                    </div>
                </div>

                {/* 아파티 채널 추가 버튼 */}
                {/* 아파티 채널 추가 버튼 섹션 */}
                <div className="mb-14 text-center">
                    <Link
                        href="http://pf.kakao.com/_EbnAX"
                        target="_blank"
                        className="inline-flex flex-col items-center group w-full max-w-md"
                    >
                        <div className="bg-[#FEE500] hover:bg-yellow-400 text-slate-900 w-full py-2.5 rounded-2xl font-bold text-lg shadow-md transition-all group-hover:-translate-y-1 flex items-center justify-center gap-3">

                            {/* ✅ 카카오 공식 말풍선 로고 SVG */}
                            <svg
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-6 h-6"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M12 3c-5.523 0-10 3.582-10 8 0 2.91 1.887 5.478 4.678 6.91l-1.176 4.312c-.104.381.353.693.682.474l5.122-3.414c.231.012.463.018.694.018 5.523 0 10-3.582 10-8s-4.477-8-10-8z" />
                            </svg>

                            아파티 채널 추가
                        </div>
                        <p className="mt-4 text-sm text-gray-500 font-bold flex items-center gap-1 justify-center">
                            <Zap size={16} className="text-orange-500 fill-orange-500" />
                            청약/줍줍 정보를 가장 먼저 받아보세요!
                        </p>
                    </Link>
                </div>

                {/* 상세 분석 및 홈페이지 링크 */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
                        <h3 className="text-xl font-black mb-8 text-[#4a403a] flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                            현장 핵심 분석
                        </h3>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg font-medium mb-10">
                            {property.description}
                        </p>

                        <Link
                            href={property.link || "#"}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-[#4a403a] text-white rounded-2xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-[#4a403a]/20"
                        >
                            <Globe size={18} />
                            홈페이지 바로가기
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}