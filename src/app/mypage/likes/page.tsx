"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, Search } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // 🚀 경로 확인!
import { getPropertiesFromSheet, Property } from "../../../lib/sheet"; // 🚀 경로 확인!
import PropertyCard from "../../../components/property/PropertyCard"; // 🚀 경로 확인!

export default function LikedPropertiesPage() {
    const router = useRouter();
    const [likedProperties, setLikedProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLikedProperties = async () => {
            try {
                // 1. 로그인 확인
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    alert("로그인이 필요합니다.");
                    router.push("/");
                    return;
                }

                // 2. 수파베이스 DB에서 내가 찜한 매물 ID 가져오기
                const { data: likesData, error } = await supabase
                    .from("likes")
                    .select("property_id")
                    .eq("user_id", session.user.id);

                if (error) throw error;

                // 찜한 게 하나도 없다면 여기서 종료
                if (!likesData || likesData.length === 0) {
                    setLikedProperties([]);
                    setIsLoading(false);
                    return;
                }

                // [{ property_id: "1" }, { property_id: "3" }] 형태를 ["1", "3"] 으로 깔끔하게 정리
                const likedIds = likesData.map(like => like.property_id);

                // 3. 구글 시트에서 전체 매물 가져와서, 내가 찜한 ID와 일치하는 것만 걸러내기
                const allProperties = await getPropertiesFromSheet();
                const filteredProps = allProperties.filter((p: Property) =>
                    likedIds.includes(String(p.id))
                );

                setLikedProperties(filteredProps);
            } catch (error) {
                console.error("찜 목록 불러오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedProperties();
    }, [router]);

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-black text-[#4A403A]">관심 매물</span>
                <div className="w-10"></div>
            </nav>

            <div className="max-w-6xl mx-auto px-5 pt-8">
                {/* 타이틀 영역 */}
                <div className="flex items-center gap-2 mb-8">
                    <Heart className="text-red-500 fill-red-500" size={26} />
                    <h1 className="text-2xl font-black text-[#4A403A] tracking-tight">내가 찜한 단지</h1>
                    <span className="text-[#FF5A00] font-black ml-1 text-xl">{likedProperties.length}</span>
                </div>

                {/* 데이터 로딩, 혹은 비어있을 때, 혹은 리스트가 있을 때의 화면 분기 */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#FF5A00] mb-4"></div>
                        <p className="text-gray-400 font-bold">찜한 목록을 불러오고 있습니다...</p>
                    </div>
                ) : likedProperties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* 🚀 여기서 방금 합쳐서 만든 그 예쁜 PropertyCard를 재활용합니다! */}
                        {likedProperties.map(property => (
                            <PropertyCard key={property.id} {...property} />
                        ))}
                    </div>
                ) : (
                    // 텅 빈 상태 (Empty State) UI
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center py-24 mt-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 border-2 border-dashed border-gray-200">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-[18px] font-black text-[#4A403A] mb-2 tracking-tight">아직 찜한 매물이 없어요</h3>
                        <p className="text-[13px] text-gray-400 font-medium mb-8">관심 있는 단지에 하트를 눌러 나만의 리스트를 만들어보세요!</p>
                        <Link href="/" className="bg-[#FF5A00] text-white font-black px-6 py-3.5 rounded-xl shadow-md hover:bg-[#e04f00] hover:-translate-y-1 transition-all flex items-center gap-2 text-[14px]">
                            <Search size={16} /> 분양 단지 둘러보기
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}