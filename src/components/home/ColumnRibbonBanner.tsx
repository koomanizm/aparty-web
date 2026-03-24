"use client";

import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

// 🚀 이 'export default function' 부분이 반드시 있어야 합니다!
export default function ColumnRibbonBanner() {
    return (
        <div className="w-full bg-gradient-to-r from-[#FFF7F2] to-[#FFF1E8] py-4 px-5 rounded-2xl border border-orange-100 cursor-pointer hover:shadow-md transition-all group">
            <Link href="/column" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <FileText size={16} className="text-[#FF7A2F]" />
                    </div>
                    <p className="text-[13px] md:text-[15px] font-extrabold text-[#3B312B] tracking-tight">
                        청약 전 꼭 알아야 할 필수 체크리스트
                    </p>
                </div>
                <div className="flex items-center text-[12px] md:text-[13px] font-bold text-[#FF7A2F] group-hover:translate-x-1 transition-transform">
                    칼럼 보기 <ChevronRight size={16} strokeWidth={2.5} className="ml-0.5" />
                </div>
            </Link>
        </div>
    );
}