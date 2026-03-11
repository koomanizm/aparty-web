"use client";
import Link from "next/link";
import { Megaphone, MessageSquare, ChevronRight } from "lucide-react";

export default function HomeQuickLinks() {
    return (
        <div className="grid grid-cols-2 gap-2 md:gap-5 w-full max-w-6xl px-4 mb-8 md:mb-10">
            {/* 1. 공지사항 */}
            <Link href="/notice" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                <div className="flex items-center gap-2 md:gap-4 z-10 min-w-0">
                    {/* 🚀 수정 포인트: w-10 h-10 고정 및 aspect-square 추가 */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0 aspect-square group-hover:scale-110 transition-transform">
                        <Megaphone size={16} className="md:w-5 md:h-5" />
                    </div>
                    <div className="text-left min-w-0">
                        <h3 className="text-[10px] md:text-[13px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">공지사항</h3>
                        <p className="text-[8px] md:text-[10px] text-gray-400 font-bold tracking-tight leading-tight">새소식 확인</p>
                    </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors z-10 shrink-0" size={14} />
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none"></div>
            </Link>

            {/* 2. 라운지 */}
            <Link href="/community" className="bg-white p-3 md:p-6 rounded-[16px] md:rounded-[24px] shadow-sm border border-gray-100 hover:border-[#FF5A00] hover:shadow-md transition-all flex items-center justify-between group relative overflow-hidden">
                <div className="flex items-center gap-2 md:gap-4 z-10 min-w-0">
                    {/* 🚀 수정 포인트: w-10 h-10 고정 및 aspect-square 추가 */}
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 text-[#FF5A00] rounded-full flex items-center justify-center shrink-0 aspect-square group-hover:scale-110 transition-transform">
                        <MessageSquare size={16} className="md:w-5 md:h-5" />
                    </div>
                    <div className="text-left min-w-0">
                        <h3 className="text-[10px] md:text-[13px] font-black text-[#4A403A] mb-0.5 tracking-tight truncate">라운지</h3>
                        <p className="text-[8px] md:text-[10px] text-gray-400 font-bold tracking-tight leading-tight">소통 공간</p>
                    </div>
                </div>
                <ChevronRight className="text-gray-300 group-hover:text-[#FF5A00] transition-colors z-10 shrink-0" size={14} />
                <div className="absolute right-0 bottom-0 w-24 h-24 bg-orange-50 rounded-full blur-2xl -mr-10 -mb-10 pointer-events-none"></div>
            </Link>
        </div>
    );
}