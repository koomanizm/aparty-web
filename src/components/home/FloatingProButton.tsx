// src/components/home/FloatingProButton.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

interface Props {
    bottomOffset: number;
}

export default function FloatingProButton({ bottomOffset }: Props) {
    return (
        <Link
            href="https://pro.aparty.co.kr"
            target="_blank"
            className="fixed right-4 md:right-10 bottom-[92px] md:bottom-[115px] z-[90] group flex items-center justify-end transition-transform duration-75 ease-out"
            style={{ transform: `translateY(-${bottomOffset}px)` }}
        >
            <div className="hidden md:block mr-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 bg-[#4A403A] text-white text-[12px] font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl transition-all">분양상담사 전용 <ChevronRight size={12} className="inline ml-1" /></div>
            <div className="relative w-14 h-14 bg-white rounded-full shadow-lg border border-orange-100 flex items-center justify-center hover:scale-110 hover:border-[#FF8C42] transition-all">
                <Image src="/agent-icon.png" alt="PRO" width={32} height={32} className="object-contain" />
                <div className="absolute -top-1 -right-1 bg-[#FF8C42] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full border border-white">PRO</div>
            </div>
        </Link>
    );
}