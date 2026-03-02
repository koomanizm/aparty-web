"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
    ChevronLeft, Coins, ShoppingBag, Coffee,
    Smartphone, Gift, Utensils, Loader2, CheckCircle2
} from "lucide-react";
import Link from "next/link";

// 가상의 상품 데이터 (나중에 DB나 관리자 페이지로 연동 가능)
const PRODUCTS = [
    { id: 1, category: "커피", brand: "스타벅스", name: "아이스 아메리카노 T", price: 4500, image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=200&auto=format&fit=crop" },
    { id: 2, category: "커피", brand: "메가커피", name: "아이스 아메리카노", price: 2000, image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=200&auto=format&fit=crop" },
    { id: 3, category: "편의점", brand: "CU", name: "모바일 금액권 5,000원", price: 5000, image: "https://images.unsplash.com/photo-1604719312563-8912e9223c6a?q=80&w=200&auto=format&fit=crop" },
    { id: 4, category: "편의점", brand: "GS25", name: "모바일 금액권 3,000원", price: 3000, image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=200&auto=format&fit=crop" },
    { id: 5, category: "디저트", brand: "베스킨라빈스", name: "싱글레귤러", price: 3900, image: "https://images.unsplash.com/photo-1501443762994-82bd5dabb89a?q=80&w=200&auto=format&fit=crop" },
    { id: 6, category: "디저트", brand: "설빙", name: "인절미설빙", price: 9500, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=200&auto=format&fit=crop" },
];

export default function RewardShopPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState("전체");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }
            setIsLoading(false);
        };
        fetchUserData();
    }, []);

    const filteredProducts = activeCategory === "전체"
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category === activeCategory);

    const handlePurchase = (product: any) => {
        if (!profile) return alert("로그인이 필요합니다!");
        if (profile.points < product.price) {
            alert(`포인트가 부족합니다! 😅\n필요한 포인트: ${product.price.toLocaleString()} P`);
            return;
        }

        if (confirm(`'${product.name}'을(를) 구매하시겠습니까?\n${product.price.toLocaleString()} 포인트가 차감됩니다.`)) {
            alert("구매가 완료되었습니다! 🎉\n마이페이지 > 내 쿠폰함에서 확인해 주세요. (준비 중)");
            // 실제 차감 로직은 나중에 API로 연결!
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-[#FF8C42]" /></div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-20 text-left selection:bg-orange-100">
            {/* 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-900 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                <h1 className="text-[15px] font-black text-[#4A403A]">리워드 샵</h1>
                <Link href="/mypage/activity" className="text-gray-400 hover:text-[#FF8C42] transition-colors"><ShoppingBag size={20} /></Link>
            </nav>

            {/* 내 포인트 정보 */}
            <div className="bg-white p-6 border-b border-gray-100 mb-2">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-[12px] font-bold text-gray-400">쇼핑 가능한 포인트</p>
                    <Link href="/point" className="text-[11px] font-black text-[#FF8C42] bg-orange-50 px-2.5 py-1 rounded-full">충전하기</Link>
                </div>
                <div className="flex items-center gap-2">
                    <Coins className="text-[#FF8C42]" size={22} />
                    <span className="text-2xl font-black text-[#4A403A]">
                        {profile?.points?.toLocaleString() || 0} <span className="text-lg text-gray-400">P</span>
                    </span>
                </div>
            </div>

            {/* 카테고리 탭 */}
            <div className="bg-white flex gap-6 px-6 py-4 overflow-x-auto scrollbar-hide border-b border-gray-50 sticky top-14 z-40">
                {["전체", "커피", "편의점", "디저트", "상품권"].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`shrink-0 text-[14px] font-black transition-all ${activeCategory === cat ? 'text-[#FF8C42] border-b-2 border-[#FF8C42] pb-1' : 'text-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 상품 리스트 (2열 그리드) */}
            <div className="p-4 grid grid-cols-2 gap-3 md:gap-5 max-w-3xl mx-auto">
                {filteredProducts.map(product => (
                    <div
                        key={product.id}
                        onClick={() => handlePurchase(product)}
                        className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer group"
                    >
                        <div className="relative aspect-square bg-gray-50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-black text-gray-500 border border-gray-100">
                                {product.brand}
                            </div>
                        </div>
                        <div className="p-3.5">
                            <h3 className="text-[13px] font-bold text-[#4A403A] line-clamp-1 mb-1">{product.name}</h3>
                            <div className="flex items-center gap-1">
                                <span className="text-[15px] font-black text-[#FF8C42]">{product.price.toLocaleString()}</span>
                                <span className="text-[11px] font-bold text-gray-300">P</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 하단 안내 문구 */}
            <div className="px-6 py-10 text-center">
                <p className="text-[11px] text-gray-300 font-bold leading-relaxed">
                    리워드 상품은 구매 즉시 '내 쿠폰함'으로 발송됩니다.<br />
                    구매 후 환불이 불가하니 신중히 선택해 주세요!
                </p>
            </div>
        </main>
    );
}