"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase"; // 경로 확인 (상황에 따라 ../../lib/supabase 일 수 있음)

export default function PropertyLikeButton({ propertyId }: { propertyId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkLikeStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // 이 매물(propertyId)을 내가 찜했는지 검사
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('property_id', String(propertyId))
                    .single();

                if (data) setIsLiked(true);
            }
        };
        checkLikeStatus();
    }, [propertyId]);

    const handleLikeClick = async () => {
        if (!user) {
            alert("로그인이 필요한 기능입니다. 로그인 후 이용해주세요!");
            return;
        }

        // 1. 화면부터 즉시 변경 (Optimistic UI)
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);

        // 2. 백그라운드에서 DB 업데이트
        if (newLikedState) {
            await supabase.from('likes').insert({ user_id: user.id, property_id: String(propertyId) });
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', String(propertyId));
        }
    };

    return (
        <button
            onClick={handleLikeClick}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl border-2 transition-all duration-300 font-bold text-[14px] shadow-sm active:scale-95 w-full md:w-auto ${isLiked
                    ? "border-red-500 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-500 hover:border-red-200 hover:text-red-400"
                }`}
        >
            <Heart size={20} className={`transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            {isLiked ? "찜 완료" : "관심 매물 등록"}
        </button>
    );
}