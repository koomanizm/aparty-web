"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function PropertyLikeButton({ propertyId }: { propertyId: string }) {
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const checkLikeStatus = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('property_id', propertyId)
                    .single();

                if (data) setIsLiked(true);
            }
        };
        checkLikeStatus();
    }, [propertyId]);

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.preventDefault(); // 링크 이동 방지
        e.stopPropagation();

        if (!user) {
            alert("로그인 후 관심 매물로 등록할 수 있습니다! 🔒");
            return;
        }

        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        if (isLiked) {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', propertyId);
            setIsLiked(false);
        } else {
            await supabase.from('likes').insert({ user_id: user.id, property_id: propertyId });
            setIsLiked(true);
        }
    };

    return (
        <button
            onClick={handleLikeToggle}
            className="group p-1.5 transition-transform active:scale-90"
            aria-label="관심매물 등록"
        >
            {/* 🚀 배경 원을 없애고, 하트 자체에 그림자(drop-shadow)를 주어 어떤 사진에서도 잘 보이게 처리! */}
            <Heart
                size={24}
                className={`transition-all duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${isLiked
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-white hover:text-red-400"
                    } ${isAnimating ? "scale-125" : ""}`}
            />
        </button>
    );
}