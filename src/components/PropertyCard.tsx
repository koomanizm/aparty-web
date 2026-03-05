"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase"; // 🚀 경로가 ../../lib/supabase 일 수 있으니 확인해 주세요!

const PropertyCard = ({ id, title, location, status, price, image }: any) => {
    // 🚀 [추가됨] 찜 상태와 유저 정보
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState<any>(null);

    // 1. 기존 대표님의 화려한 뱃지 스타일 로직 (유지)
    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center justify-center";
        const shimmerClass = index < 3 ? "aparty-shimmer-effect" : "";
        const palette = ["bg-[#ef4444]", "bg-[#3b82f6]", "bg-[#f59e0b]", "bg-[#10b981]", "bg-[#8b5cf6]"];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    // 2. 화면 로드 시 DB에서 내 찜(하트) 기록 확인
    useEffect(() => {
        const checkLikeStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('property_id', String(id))
                    .maybeSingle(); // 🚀 해결! (single을 maybeSingle로 변경)

                if (data) setIsLiked(true);
            }
        };
        checkLikeStatus();
    }, [id]);

    // 3. 하트 버튼 클릭 시 실시간 DB 연동
    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // 카드 클릭(상세페이지 이동) 방지
        e.stopPropagation();

        if (!user) {
            alert("로그인이 필요한 기능입니다. 우측 상단에서 로그인해 주세요!");
            return;
        }

        const newLikedState = !isLiked;
        setIsLiked(newLikedState); // 즉시 색상 변경 (초고속 반응)

        if (newLikedState) {
            await supabase.from('likes').insert({ user_id: user.id, property_id: String(id) });
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', String(id));
        }
    };

    return (
        <div className="h-full">
            {/* ✨ 대표님의 시그니처: 애니메이션 CSS 유지 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes aparty-sweep { 0% { transform: translateX(-150%); } 100% { transform: translateX(150%); } }
                .aparty-shimmer-effect::after {
                    content: ""; position: absolute; top: 0; left: 0; width: 45px; height: 100%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: skewX(-20deg); animation: aparty-sweep 2.8s infinite linear;
                }
            `}} />

            <Link href={`/property/${id}`} className="block group h-full">
                <div className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 transform hover:-translate-y-1">

                    {/* 상단 이미지 및 뱃지/하트 영역 */}
                    <div className="h-52 w-full bg-gray-100 relative overflow-hidden shrink-0">
                        <Image src={image || "/house1.jpg"} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

                        {/* 🏷️ 좌측 상단: 기존 뱃지 완벽 이식 */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            {status?.map((tag: string, i: number) => (
                                <span key={i} className={getStatusStyle(i)}>
                                    {i === 0 && <Flame size={10} className="mr-1 fill-white" />} {tag}
                                </span>
                            ))}
                        </div>

                        {/* ❤️ 우측 상단: DB 연동 하트 버튼 */}
                        <button
                            onClick={handleLikeClick}
                            className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all"
                        >
                            <Heart size={18} className={`transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        </button>
                    </div>

                    {/* 하단 텍스트 정보 (미니멀 라이즈) */}
                    <div className="p-5 flex flex-col flex-grow text-left">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-2">
                            <MapPin size={14} />
                            <span className="text-[12px] font-bold truncate">{location}</span>
                        </div>
                        <h3 className="font-black text-[17px] text-[#4A403A] mb-auto group-hover:text-[#ff5a28] tracking-tight leading-snug">
                            {title}
                        </h3>

                        {/* 하단 푸터: 가격 & 상세보기 */}
                        <div className="pt-4 mt-4 border-t border-gray-100 flex items-end justify-between shrink-0">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 mb-0.5">분양가</span>
                                <span className="text-[16px] font-black text-[#ff5a28]">
                                    {price ? price.split('/')[0] : "가격 문의"}
                                </span>
                            </div>
                            <div className="bg-[#4a403a] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg group-hover:bg-[#ff5a28] transition-colors">
                                상세보기 ▶
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;