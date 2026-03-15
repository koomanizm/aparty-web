"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function CenterRecommend({ properties }: { properties: any[] }) {
    const recommendScrollRef = useRef<HTMLDivElement>(null);
    const [isDraggingRec, setIsDraggingRec] = useState(false);
    const [startXRec, setStartXRec] = useState(0);
    const [scrollLeftRec, setScrollLeftRec] = useState(0);

    const onDragStartRec = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDraggingRec(true);
        const x = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        setStartXRec(x - (recommendScrollRef.current?.offsetLeft || 0));
        setScrollLeftRec(recommendScrollRef.current?.scrollLeft || 0);
    };
    const onDragMoveRec = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDraggingRec) return;
        e.preventDefault();
        const x = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
        const xWalk = x - (recommendScrollRef.current?.offsetLeft || 0);
        const walk = (xWalk - startXRec) * 1.5;
        if (recommendScrollRef.current) {
            recommendScrollRef.current.scrollLeft = scrollLeftRec - walk;
        }
    };
    const onDragEndRec = () => setIsDraggingRec(false);

    const scrollRecommend = (direction: 'left' | 'right') => {
        if (recommendScrollRef.current) {
            const scrollAmount = 240;
            recommendScrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const getSafeImageUrl = (imgStr: string) => {
        if (!imgStr) return "/house1.jpg";
        const trimmed = imgStr.trim();
        if (trimmed.startsWith("http") || trimmed.startsWith("data:")) return trimmed;
        if (trimmed.startsWith("/")) return trimmed;
        return `/${trimmed}`;
    };

    return (
        <div className="relative h-[420px] min-w-0 z-10 group/box">

            <div
                className="w-full h-full rounded-[24px] shadow-[0_8px_30px_rgba(30,58,138,0.03)] flex flex-col relative overflow-hidden z-10 
                           bg-gradient-to-br from-[#F0F6FF] via-[#F8FAFC] to-[#FFFFFF] border border-blue-100/50"
            >
                <div className="flex justify-between items-center shrink-0 px-6 pt-7 pb-3 z-10 relative">
                    {/* 🚀 FIX: 타이틀을 감싸던 불필요한 bg-white/60 등 제거하여 배경과 완벽히 동화시킴 */}
                    <div className="flex items-center">
                        <h2 className="text-[18px] md:text-[20px] font-extrabold text-slate-800 tracking-tight leading-none drop-shadow-sm">
                            오늘의 맞춤 <span className="text-[#FF8C42]">추천 단지</span>
                        </h2>
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 bg-white/95 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-50 transition-colors z-10 shadow-sm border border-slate-100/80">
                        관심지역: 설정 필요
                    </span>
                </div>

                <div
                    ref={recommendScrollRef}
                    className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide flex-1 min-h-0 items-start px-6 cursor-grab active:cursor-grabbing scroll-smooth relative z-10 pointer-events-auto pt-2"
                    onMouseDown={onDragStartRec}
                    onMouseMove={onDragMoveRec}
                    onMouseUp={onDragEndRec}
                    onMouseLeave={onDragEndRec}
                >
                    {properties.slice(0, 5).map((p: any) => (
                        <Link
                            href={`/property/${p.id}`}
                            key={p.id}
                            onClick={(e) => { if (isDraggingRec) e.preventDefault(); }}
                            className="min-w-[220px] snap-center bg-white rounded-[16px] shadow-[0_4px_20px_rgba(15,23,42,0.05)] border border-white overflow-hidden block z-10 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group/card"
                        >
                            <div className="w-full h-[150px] relative bg-slate-100 overflow-hidden pointer-events-none z-10">
                                {p.image && <Image src={getSafeImageUrl(p.image)} alt={p.title} fill className="object-cover transition-transform duration-500 group-hover/card:scale-105 z-10" />}
                                {p.status[0] && <div className="absolute top-2 left-2 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">{p.status[0]}</div>}
                            </div>
                            <div className="p-4 pointer-events-none z-10 relative bg-white">
                                <h3 className="font-bold text-[14px] text-gray-800 truncate mb-1 group-hover/card:text-[#FF8C42] transition-colors z-10 relative">{p.title}</h3>
                                <p className="text-[11px] text-gray-400 flex items-center gap-0.5 truncate mb-4 z-10 relative"><MapPin size={12} /> {p.location}</p>
                                <div className="border-t border-gray-100/50 pt-3 flex justify-between items-end z-10 relative">
                                    <p className="text-[10px] text-gray-400 z-10 relative">최소 진입 자금</p>
                                    <p className="text-[16px] font-black text-[#FF8C42] z-10 relative">{p.price.split('~')[0].split('/')[0].replace(/[^0-9,]/g, '').slice(0, 5) || '별도문의'}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <button
                onClick={() => scrollRecommend('left')}
                className="absolute top-1/2 -translate-y-1/2 -left-4 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#FF8C42] hover:bg-orange-50 hover:border-orange-100 hover:scale-105 transition-all z-30 opacity-0 group-hover/box:opacity-100"
            >
                <ChevronLeft size={18} strokeWidth={2.5} className="ml-[-1px]" />
            </button>
            <button
                onClick={() => scrollRecommend('right')}
                className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-8 bg-white border border-gray-100 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#FF8C42] hover:bg-orange-50 hover:border-orange-100 hover:scale-105 transition-all z-30 opacity-0 group-hover/box:opacity-100"
            >
                <ChevronRight size={18} strokeWidth={2.5} className="mr-[-1px]" />
            </button>
        </div>
    );
}