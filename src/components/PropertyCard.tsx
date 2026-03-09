"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

const PropertyCard = ({ id, title, location, status, price, image }: any) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [user, setUser] = useState<any>(null);

    const getSafeImage = (img: any) => {
        if (!img || typeof img !== 'string') return "/house1.jpg";
        const trimmedImg = img.trim();
        if (trimmedImg === "") return "/house1.jpg";

        if (trimmedImg.startsWith("http") || trimmedImg.startsWith("data:")) {
            return trimmedImg;
        }

        if (trimmedImg.startsWith("/")) {
            return trimmedImg;
        }

        return `/${trimmedImg}`;
    };

    const safeImage = getSafeImage(image);

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-white shadow-sm flex items-center justify-center";
        const shimmerClass = index < 3 ? "aparty-shimmer-effect" : "";
        const palette = ["bg-[#ef4444]", "bg-[#3b82f6]", "bg-[#f59e0b]", "bg-[#10b981]", "bg-[#8b5cf6]"];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

    useEffect(() => {
        const checkLikeStatus = async () => {
            const { count } = await supabase
                .from('likes')
                .select('*', { count: 'exact', head: true })
                .eq('property_id', String(id));

            setLikeCount(count || 0);

            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                const { data } = await supabase
                    .from('likes')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('property_id', String(id))
                    .maybeSingle();

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

        if (newLikedState) {
            await supabase.from('likes').insert({ user_id: user.id, property_id: String(id) });
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', String(id));
        }
    };

    if (!id || !title) return null;

    return (
        <div className="h-full">
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

                {/* ======================================================= */}
                {/* 📱 모바일 뷰: 초슬림 파노라마 뷰 */}
                {/* ======================================================= */}
                <div className="md:hidden relative w-full h-[105px] rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
                    <Image src={safeImage} alt={title} fill className="object-cover" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none"></div>

                    <div className="absolute top-2.5 left-2.5 flex z-10">
                        {status && status[0] && (
                            <span className={getStatusStyle(0)}>
                                <Flame className="w-2.5 h-2.5 mr-0.5 fill-white" /> {status[0]}
                            </span>
                        )}
                    </div>

                    {/* 🚀 모바일 하트 아이콘: w-[18px]로 축소 & 정열의 빨간색(#FF1E1E) 적용 */}
                    <button
                        onClick={handleLikeClick}
                        className="absolute top-2 right-2 z-20 flex flex-col items-center justify-center gap-0.5 group transition-transform active:scale-95"
                    >
                        <Heart
                            className={`w-[18px] h-[18px] transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked ? "fill-[#FF1E1E] text-[#FF1E1E] scale-110" : "text-white fill-black/30 group-hover:scale-110"
                                }`}
                            strokeWidth={isLiked ? 0 : 2}
                        />
                        {likeCount > 0 && (
                            <span className={`text-[9px] font-black tracking-tighter filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none ${isLiked ? "text-[#FF1E1E]" : "text-white"
                                }`}>
                                {likeCount.toLocaleString()}
                            </span>
                        )}
                    </button>

                    <div className="absolute inset-0 p-3 flex flex-col z-10 pointer-events-none">
                        <div className="h-4 shrink-0"></div>

                        <div className="flex flex-col justify-center flex-1 min-w-0 pr-6 pt-1">
                            <h3 className="font-black text-[13px] text-white truncate drop-shadow-md leading-tight mb-0.5 tracking-tighter">
                                {title}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-200">
                                <MapPin className="w-2 h-2 shrink-0" />
                                <span className="text-[8.5px] font-medium truncate drop-shadow-md">{location}</span>
                            </div>
                        </div>

                        <div className="mt-auto shrink-0 flex items-end">
                            <span className="text-[12px] font-black text-[#FFB84D] drop-shadow-md tracking-tighter">
                                {price ? price.split('/')[0] : "가격 문의"}
                            </span>
                        </div>
                    </div>
                </div>


                {/* ======================================================= */}
                {/* 💻 PC 뷰: 아파티 오리지널 스타일 */}
                {/* ======================================================= */}
                <div className="hidden md:flex bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden flex-col border border-gray-100 h-full transform hover:-translate-y-1">

                    <div className="w-full h-48 lg:h-52 bg-gray-100 relative overflow-hidden shrink-0">
                        <Image src={safeImage} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[85%] pointer-events-none">
                            {status?.map((tag: string, i: number) => (
                                <span key={i} className={getStatusStyle(i)}>
                                    {i === 0 && <Flame className="w-2.5 h-2.5 mr-1 fill-white" />} {tag}
                                </span>
                            ))}
                        </div>

                        {/* 🚀 PC 하트 아이콘: w-5(20px)로 축소 & 정열의 빨간색(#FF1E1E) 적용 */}
                        <button
                            onClick={handleLikeClick}
                            className="absolute top-3 right-3 z-20 flex flex-col items-center justify-center gap-0.5 group transition-transform active:scale-95"
                        >
                            <Heart
                                className={`w-5 h-5 transition-all duration-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] ${isLiked ? "fill-[#FF1E1E] text-[#FF1E1E] scale-110" : "text-white fill-black/30 group-hover:scale-110"
                                    }`}
                                strokeWidth={isLiked ? 0 : 2}
                            />
                            {likeCount > 0 && (
                                <span className={`text-[10px] font-black tracking-tighter filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] leading-none ${isLiked ? "text-[#FF1E1E]" : "text-white"
                                    }`}>
                                    {likeCount.toLocaleString()}
                                </span>
                            )}
                        </button>
                    </div>

                    <div className="p-4 lg:p-5 flex flex-col flex-1 text-left justify-start min-w-0">
                        <div className="flex flex-col gap-1 mb-auto">
                            <h3 className="font-extrabold text-[13px] lg:text-[14px] text-[#4A403A] group-hover:text-[#ff5a28] tracking-tighter truncate">
                                {title}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span className="text-[10px] lg:text-[11px] font-semibold truncate tracking-tight">{location}</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between shrink-0">
                            <div className="flex flex-col min-w-0 pr-1">
                                <span className="text-[9px] font-semibold text-gray-400 mb-0.5">분양가</span>
                                <span className="text-[14px] lg:text-[15px] font-extrabold text-[#ff5a28] truncate tracking-tighter">
                                    {price ? price.split('/')[0] : "가격 문의"}
                                </span>
                            </div>
                            <div className="bg-[#4a403a] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg group-hover:bg-[#ff5a28] transition-colors shrink-0">
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