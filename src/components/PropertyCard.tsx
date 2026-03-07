"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Flame, Heart, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";

const PropertyCard = ({ id, title, location, status, price, image }: any) => {
    const [isLiked, setIsLiked] = useState(false);
    const [user, setUser] = useState<any>(null);

    const getStatusStyle = (index: number) => {
        const base = "relative overflow-hidden px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold text-white shadow-sm flex items-center justify-center";
        const shimmerClass = index < 3 ? "aparty-shimmer-effect" : "";
        const palette = ["bg-[#ef4444]", "bg-[#3b82f6]", "bg-[#f59e0b]", "bg-[#10b981]", "bg-[#8b5cf6]"];
        return `${base} ${palette[index % palette.length]} ${shimmerClass}`;
    };

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

        if (newLikedState) {
            await supabase.from('likes').insert({ user_id: user.id, property_id: String(id) });
        } else {
            await supabase.from('likes').delete().eq('user_id', user.id).eq('property_id', String(id));
        }
    };

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

                {/* 📱 모바일 뷰 */}
                <div className="md:hidden relative w-full h-[105px] rounded-xl overflow-hidden shadow-sm active:scale-[0.98] transition-transform">
                    <Image src={image || "/house1.jpg"} alt={title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none"></div>

                    <div className="absolute top-2 left-2 flex z-10">
                        {status && status[0] && (
                            <span className={getStatusStyle(0)}>
                                <Flame className="w-2.5 h-2.5 mr-0.5 fill-white" /> {status[0]}
                            </span>
                        )}
                    </div>

                    <button onClick={handleLikeClick} className="absolute top-2 right-2 z-20 p-1.5 hover:scale-110 active:scale-90 transition-all">
                        <Heart className={`w-[18px] h-[18px] drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`} strokeWidth={isLiked ? 0 : 2} />
                    </button>

                    <div className="absolute inset-0 p-2.5 flex flex-col z-10">
                        <div className="h-4 shrink-0"></div>
                        <div className="flex flex-col justify-center flex-1 min-w-0 pr-6">
                            {/* 🚀 모바일 단지명 최적화 (13px, 자간 극소) */}
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

                {/* 💻 PC 뷰 */}
                <div className="hidden md:flex bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 overflow-hidden flex-col border border-gray-100 h-full transform hover:-translate-y-1">
                    <div className="w-full h-48 lg:h-52 bg-gray-100 relative overflow-hidden shrink-0">
                        <Image src={image || "/house1.jpg"} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[85%]">
                            {status?.map((tag: string, i: number) => (
                                <span key={i} className={getStatusStyle(i)}>
                                    {i === 0 && <Flame className="w-2.5 h-2.5 mr-1 fill-white" />} {tag}
                                </span>
                            ))}
                        </div>
                        <button onClick={handleLikeClick} className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                            <Heart className={`w-[18px] h-[18px] transition-colors duration-300 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                        </button>
                    </div>

                    <div className="p-4 lg:p-5 flex flex-col flex-1 text-left justify-start min-w-0">
                        <div className="flex flex-col gap-1 mb-auto">
                            {/* 🚀 PC 단지명 최적화 (크기 축소 및 자간 타이트하게 조정) */}
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