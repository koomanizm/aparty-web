"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PropertyLikeButton({ propertyId }: { propertyId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchLikeData = async () => {
            // 1. 이 매물의 총 좋아요 갯수 가져오기
            const { count } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('property_id', propertyId);

            setLikeCount(count || 0);

            // 2. 현재 로그인한 유저가 이 매물에 좋아요를 눌렀는지 확인
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('property_id', propertyId)
                    .maybeSingle();

                if (data) setIsLiked(true);
            }
        };
        fetchLikeData();
    }, [propertyId]);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert("로그인이 필요한 기능입니다. 우측 상단에서 로그인해 주세요!");
            return;
        }

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);

        // 🚀 클릭 즉시 화면의 숫자 반영 (낙관적 업데이트)
        setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

        if (newLikedState) {
            await supabase.from('likes').insert({ user_id: user.id, property_id: propertyId });
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', propertyId);
        }
    };

    return (
        <button
            onClick={handleLikeClick}
            className="flex flex-col items-center justify-center gap-0.5 group transition-transform active:scale-95"
        >
            <Heart
                className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked
                    ? "fill-[#FF1E1E] text-[#FF1E1E] scale-110"
                    : "text-white fill-black/30 group-hover:scale-110"
                    }`}
                strokeWidth={isLiked ? 0 : 2}
            />
            {/* 🚀 '찜하기' 텍스트 삭제. 좋아요가 1개 이상일 때만 숫자가 나타나도록 처리! */}
            {likeCount > 0 && (
                <span className={`text-[9px] md:text-[10px] font-black tracking-tighter filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none ${isLiked ? "text-[#FF5A00]" : "text-white"
                    }`}>
                    {likeCount.toLocaleString()}
                </span>
            )}
        </button>
    );
}