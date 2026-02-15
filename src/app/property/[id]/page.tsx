"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Users, Maximize, Calendar, Car, ArrowLeft, Globe, MessageCircle, Phone, Sparkles, Tag } from "lucide-react";
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

    // 상태별 뱃지 색상
    const getStatusColor = (tag: string) => {
        switch (tag) {
            case "분양중": return "bg-blue-100 text-blue-600 border-blue-200";
            case "줍줍": return "bg-rose-100 text-rose-600 border-rose-200";
            case "분양예정": return "bg-emerald-100 text-emerald-600 border-emerald-200";
            case "마감임박": return "bg-red-100 text-red-600 border-red-200 animate-pulse";
            default: return "bg-orange-100 text-orange-600 border-orange-200";
        }
    };

    // ✅ [NEW] 가격 문자열 파싱 함수 (핵심!)
    // 예: "59A: 3억 / 84A: 5억" -> [{type:'59A', price:'3억'}, {type:'84A', price:'5억'}]
    const parsePriceList = (priceString: string) => {
        if (!priceString) return [];
        if (!priceString.includes('/')) return [{ type: '대표가', price: priceString }];

        return priceString.split('/').map(item => {
            const [type, price] = item.split(':');
            return {
                type: type ? type.trim() : '타입',
                price: price ? price.trim() : item.trim()
            };
        });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
    if (!property) return <div className="min-h-screen flex items-center justify-center">매물을 찾을 수 없습니다.</div>;

    // 가격 리스트 생성
    const priceList = parsePriceList(property.price);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 1. 상단 네비게이션 */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/70 backdrop-blur-md border-b border-white/20 transition-all">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 hover:shadow-md transition-all"
                >
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold text-gray-800 opacity-80 truncate max-w-[200px]">{property.title}</span>
                <div className="w-10"></div>
            </nav>

            {/* 2. Parallax Hero Image */}
            <div className="relative w-full h-[45vh] md:h-[50vh]">
                <Image
                    src={property.image || "/house1.jpg"}
                    alt={property.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30"></div>
            </div>

            {/* 3. Floating Content Card */}
            <div className="relative -mt-10 z-10 px-4 md:px-0 max-w-4xl mx-auto">
                <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] p-6 md:p-10 border border-gray-50">

                    {/* 뱃지 영역 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {property.status.map((tag: string, i: number) => (
                            <span key={i} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(tag)}`}>
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* 타이틀 */}
                    <div className="mb-6 border-b border-gray-100 pb-6">
                        <h1 className="text-2xl md:text-3xl font-black text-[#2d2d2d] tracking-tight mb-2 leading-tight">
                            {property.title}
                        </h1>
                        <p className="text-gray-400 font-medium text-sm flex items-center gap-1">
                            📍 {property.location}
                        </p>
                    </div>

                    {/* ✅ [NEW] 스마트 가격표 그리드 */}
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-1">
                            <Tag size={14} /> 분양가 / 공급금액
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {priceList.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-orange-50/50 rounded-xl border border-orange-100 hover:bg-orange-50 transition-colors group">
                                    <span className="text-sm font-bold text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100 group-hover:border-orange-200 transition-colors">
                                        {item.type}
                                    </span>
                                    <span className="text-lg font-black text-[#ff6f42] tracking-tight">
                                        {item.price}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Bento Grid (정보 요약) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
                        {[
                            { icon: Users, label: "세대수", value: property.households, color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: Maximize, label: "평형정보", value: property.size, color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: Calendar, label: "입주예정", value: property.moveIn, color: "text-emerald-500", bg: "bg-emerald-50" },
                            { icon: Car, label: "주차대수", value: property.parking, color: "text-purple-500", bg: "bg-purple-50" },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                                <div className={`w-8 h-8 ${item.bg} ${item.color} rounded-full flex items-center justify-center`}>
                                    <item.icon size={16} />
                                </div>
                                <span className="text-xs text-gray-400 font-semibold">{item.label}</span>
                                <span className="text-sm font-bold text-gray-800 text-center leading-tight">
                                    {item.value || "-"}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* 설명글 섹션 */}
                    <div className="prose prose-lg max-w-none">
                        <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4">
                            <Sparkles className="text-[#ff6f42] w-5 h-5" />
                            Premium Point
                        </h3>
                        <div className="text-gray-600 leading-8 whitespace-pre-wrap text-base font-medium bg-[#fdfbf7] p-6 rounded-2xl border border-[#efeadd]">
                            {property.description}
                        </div>
                    </div>
                </div>

                {/* 5. 하단 CTA 버튼들 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-10">
                    <Link
                        href={property.link || "#"}
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-[#2d2d2d] text-[#2d2d2d] rounded-2xl font-bold hover:bg-[#2d2d2d] hover:text-white transition-all active:scale-95 text-lg"
                    >
                        <Globe size={20} />
                        공식 홈페이지 방문
                    </Link>

                    <Link
                        href="http://pf.kakao.com/_EbnAX"
                        target="_blank"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#FEE500] text-[#3c1e1e] rounded-2xl font-bold hover:bg-[#fdd835] transition-all active:scale-95 shadow-md text-lg"
                    >
                        <MessageCircle size={20} fill="currentColor" className="opacity-80" />
                        관심고객 등록 / 상담
                    </Link>
                </div>
            </div>

            {/* 6. Mobile Sticky Bottom Bar */}
            <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                <div className="bg-[#2d2d2d] text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-1.5 flex items-center justify-between pl-6 pr-2 backdrop-blur-md bg-opacity-95">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-medium">궁금한 점이 있으신가요?</span>
                        <span className="text-sm font-bold">전문 상담사와 연결</span>
                    </div>
                    <a href="tel:010-0000-0000" className="bg-[#ff6f42] hover:bg-[#ff5a28] text-white rounded-full p-3 transition-colors animate-pulse">
                        <Phone size={20} fill="currentColor" />
                    </a>
                </div>
            </div>
        </main>
    );
}