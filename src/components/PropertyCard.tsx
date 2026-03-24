"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ChevronRight, Flame } from "lucide-react";
import { supabase } from "../lib/supabase";

const PropertyCard = ({ id, title, location, status, signals, price, pyeongPrice, image, judgmentBadge, adGrade }: any) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [user, setUser] = useState<any>(null);

    const getSafeImage = (img: any) => {
        if (!img || typeof img !== 'string') return "/house1.jpg";
        const trimmedImg = img.trim();
        if (trimmedImg === "") return "/house1.jpg";
        if (trimmedImg.startsWith("http") || trimmedImg.startsWith("data:")) return trimmedImg;
        if (trimmedImg.startsWith("/")) return trimmedImg;
        return `/${trimmedImg}`;
    };

    const safeImage = getSafeImage(image);

    const statusArray = Array.isArray(status) ? status : [];
    const signalsArray = Array.isArray(signals) ? signals : [];

    const isNew = statusArray.includes("신규") || signalsArray.includes("신규") || judgmentBadge === "신규등록";
    const isVip = statusArray.includes("VIP") || signalsArray.includes("VIP") || judgmentBadge === "VIP";

    // 🚀 완벽한 분리: 상태 키워드 따지지 않고 오직 'adGrade'만 봅니다.
    const isPremium = adGrade === "프리미엄" || adGrade === "Premium" || adGrade === "premium";

    const displayStatuses = statusArray.filter(tag => tag !== "신규" && tag !== "VIP");
    const displaySignals = signalsArray.filter(tag => tag !== "신규" && tag !== "VIP");

    let rawBodyBadges = [...displayStatuses, ...displaySignals];
    if (judgmentBadge && judgmentBadge !== "신규등록" && judgmentBadge !== "VIP") {
        rawBodyBadges.push(judgmentBadge);
    }
    const bodyBadges = Array.from(new Set(rawBodyBadges));

    const getDynamicCtaText = () => {
        if (bodyBadges.includes("선착순")) return "선착순 잔여세대 확인하기";
        if (bodyBadges.includes("마감임박")) return "마감임박 특별조건 확인하기";
        if (bodyBadges.includes("분양중")) return "상세 분양가 및 조건 확인하기";
        return "분양가 및 상세정보 확인하기";
    };

    useEffect(() => {
        const checkLikeStatus = async () => {
            const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('property_id', String(id));
            setLikeCount(count || 0);

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase.from('likes').select('id').eq('user_id', session.user.id).eq('property_id', String(id)).maybeSingle();
                if (data) setIsLiked(true);
            }
        };
        checkLikeStatus();
    }, [id]);

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert("로그인이 필요한 기능입니다. 우측 상단에서 로그인해 주세요!");
            return;
        }

        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));

        if (newLikedState) await supabase.from('likes').insert({ user_id: user.id, property_id: String(id) });
        else await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', String(id));
    };

    const handleLikeKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleLikeClick(e as any);
        }
    };

    if (!id || !title) return null;

    return (
        <div className="h-full">
            <Link href={`/property/${id}`} className="block group h-full">

                {/* 📱 모바일 뷰 */}
                <div className={`md:hidden relative w-full h-[110px] rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform flex flex-col justify-end bg-gray-900 ${isPremium ? 'border border-[#FF7A2F] shadow-[0_0_12px_rgba(255,122,47,0.3)]' : ''}`}>
                    <Image src={safeImage} alt={title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/10 pointer-events-none"></div>

                    <div className="absolute top-2 left-2 z-20 flex flex-row gap-1 items-start pointer-events-none">
                        {isNew && (
                            <span className="bg-[#FF3B30] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-[4px] leading-tight shadow-sm tracking-wide">
                                신규
                            </span>
                        )}
                        {isVip && (
                            <span className="bg-[#222222] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-[4px] leading-tight shadow-sm tracking-wide">
                                VIP
                            </span>
                        )}
                    </div>

                    <div
                        role="button"
                        tabIndex={0}
                        onClick={handleLikeClick}
                        onKeyDown={handleLikeKeyDown}
                        className="absolute top-2 right-2 z-20 flex flex-col items-center justify-center gap-0.5 group/heart transition-transform active:scale-95 cursor-pointer"
                    >
                        <Heart className={`w-[18px] h-[18px] transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked ? "fill-[#FF1E1E] text-[#FF1E1E] scale-110" : "text-white fill-black/30 group-hover/heart:scale-110"}`} strokeWidth={isLiked ? 0 : 2} />
                        {likeCount > 0 && <span className={`text-[8px] font-black tracking-tighter filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none ${isLiked ? "text-[#FF1E1E]" : "text-white"}`}>{likeCount.toLocaleString()}</span>}
                    </div>

                    <div className="relative p-3 flex flex-col z-10 pointer-events-none w-full pr-7">
                        {bodyBadges.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1 pr-6">
                                {bodyBadges.map((badge, i) => {
                                    // 🚀 프리미엄 카드라면 첫 번째 뱃지에 무조건 불꽃을 달아줍니다.
                                    const isPremiumBadge = isPremium && i === 0;
                                    return (
                                        <span key={i} className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold shadow-sm items-center gap-0.5 ${isPremiumBadge ? "text-white bg-[#FF7A2F]" : "text-[#FF7A2F] bg-white/90 backdrop-blur-sm"}`}>
                                            {isPremiumBadge && <Flame size={8} />}
                                            {badge}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <h3 className="font-black text-[13px] text-white line-clamp-2 drop-shadow-md leading-snug mb-0.5 tracking-tighter pr-4">{title}</h3>
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1 text-gray-300 min-w-0 pr-2">
                                <MapPin className="w-2.5 h-2.5 shrink-0" />
                                <span className="text-[9px] font-medium truncate drop-shadow-md">{location}</span>
                            </div>
                            <span className={`text-[10px] font-bold shrink-0 flex items-center drop-shadow-md ${isPremium ? "text-[#FF7A2F]" : "text-white/90"}`}>
                                확인하기 <ChevronRight size={10} className="ml-0.5" />
                            </span>
                        </div>
                    </div>
                </div>

                {/* 💻 PC 뷰 */}
                <div className={`hidden md:flex rounded-2xl transition-all duration-300 overflow-hidden flex-col h-full transform hover:-translate-y-1 relative bg-white
                    ${isPremium
                        ? 'border-2 border-[#FF7A2F] shadow-[0_4px_20px_rgba(255,122,47,0.12)] hover:shadow-[0_8px_28px_rgba(255,122,47,0.2)]'
                        : 'border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]'
                    }`}
                >
                    <div className="w-full h-44 lg:h-48 bg-gray-100 relative overflow-hidden shrink-0">
                        <Image src={safeImage} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

                        <div className="absolute top-3 left-3 z-20 flex flex-row gap-1.5 items-start pointer-events-none">
                            {isNew && (
                                <span className="bg-[#FF3B30] text-white text-[10px] font-extrabold px-2 py-1 rounded-[4px] leading-tight shadow-sm tracking-wide">
                                    신규
                                </span>
                            )}
                            {isVip && (
                                <span className="bg-[#222222] text-white text-[10px] font-extrabold px-2 py-1 rounded-[4px] leading-tight shadow-sm tracking-wide">
                                    VIP
                                </span>
                            )}
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleLikeClick}
                            onKeyDown={handleLikeKeyDown}
                            className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center gap-0.5 group/heart transition-transform active:scale-95 cursor-pointer"
                        >
                            <Heart className={`w-5 h-5 transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked ? "fill-[#FF1E1E] text-[#FF1E1E] scale-110" : "text-white fill-black/30 group-hover/heart:scale-110"}`} strokeWidth={isLiked ? 0 : 2} />
                            {likeCount > 0 && <span className={`text-[10px] font-black tracking-tighter filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none ${isLiked ? "text-[#FF1E1E]" : "text-white"}`}>{likeCount.toLocaleString()}</span>}
                        </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1 text-left justify-start min-w-0 bg-white">
                        <div className="flex flex-col gap-1.5 mb-auto">
                            {bodyBadges.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-0.5">
                                    {bodyBadges.map((badge, i) => {
                                        // 🚀 프리미엄 카드라면 첫 번째 뱃지에 무조건 불꽃을 달아줍니다.
                                        const isPremiumBadge = isPremium && i === 0;
                                        return (
                                            <span key={i} className={`inline-flex h-5 px-2 rounded-[4px] text-[10px] font-extrabold items-center tracking-tight border ${isPremiumBadge
                                                    ? "bg-[#FFF5EE] text-[#E85C0D] border-[#FFE4D6]"
                                                    : "bg-gray-50 text-gray-500 border-gray-100"
                                                }`}>
                                                {isPremiumBadge && <Flame size={10} className="mr-0.5 text-[#FF7A2F]" />}
                                                {badge}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            <h3 className={`font-extrabold text-[14px] lg:text-[15px] tracking-tighter line-clamp-2 leading-snug break-keep transition-colors ${isPremium ? 'text-[#FF7A2F]' : 'text-[#2E2925] group-hover:text-[#FF7A2F]'}`}>
                                {title}
                            </h3>

                            <div className="flex items-center gap-1 text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="text-[11px] lg:text-[12px] font-medium truncate tracking-tight">{location}</span>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between shrink-0">
                            <span className="text-[11px] font-semibold text-gray-500 truncate pr-2 tracking-tight">
                                {getDynamicCtaText()}
                            </span>
                            <div className={`text-[12px] font-bold transition-colors shrink-0 flex items-center gap-0.5 ${isPremium ? 'text-[#FF7A2F]' : 'text-gray-400 group-hover:text-[#FF7A2F]'}`}>
                                바로 확인 <ChevronRight size={14} strokeWidth={2.5} className="mt-[1px]" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default PropertyCard;