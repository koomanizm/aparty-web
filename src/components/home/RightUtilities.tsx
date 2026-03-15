"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import ToolShortcutGrid from "./ToolShortcutGrid";

export default function RightUtilities() {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null);

    return (
        <div className="flex flex-col min-w-0 z-10 relative">
            {/* 🚀 FIX: 하단을 잘라먹던 주범인 h-[420px]를 제거하고 자연스럽게 늘어나도록 수정! */}
            {/* 🚀 FIX: 간격을 절반(gap-2, 8px)으로 통일하여 위로 바짝 올렸습니다! */}
            <div className="flex flex-col gap-2 z-10 relative">

                <Link
                    href="/notice"
                    className="w-full bg-white border border-gray-200 hover:border-2 hover:border-orange-400 hover:shadow-md rounded-xl h-[72px] px-3 flex justify-between items-center transition-all group z-10 relative"
                    style={{
                        backgroundImage: `url(${hoveredButton === 'notice' ? '/notice_button_hover.png' : '/notice_button.png'})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }}
                    onMouseEnter={() => setHoveredButton('notice')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <div className="flex items-center gap-2 z-10 relative">
                        <span className="font-bold text-[14px] text-white z-10 relative">공지사항</span>
                    </div>
                    <ChevronRight size={14} className="text-white/80 group-hover:text-white transition-colors z-10 relative" />
                </Link>

                <Link
                    href="/lounge"
                    className="w-full bg-white border border-gray-200 hover:border-2 hover:border-blue-400 hover:shadow-md rounded-xl h-[72px] px-3 flex justify-between items-center transition-all group z-10 relative"
                    style={{
                        backgroundImage: `url(${hoveredButton === 'lounge' ? '/lounge_button_hover.png' : '/lounge_button.png'})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }}
                    onMouseEnter={() => setHoveredButton('lounge')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <div className="flex items-center gap-2 z-10 relative">
                        <span className="font-bold text-[14px] text-white z-10 relative">라운지</span>
                    </div>
                    <ChevronRight size={14} className="text-white/80 group-hover:text-white transition-colors z-10 relative" />
                </Link>

                <Link
                    href="/column"
                    className="w-full bg-white border border-gray-200 hover:border-2 hover:border-emerald-400 hover:shadow-md rounded-xl h-[72px] px-3 flex justify-between items-center transition-all group z-10 relative"
                    style={{
                        backgroundImage: `url(${hoveredButton === 'column' ? '/column_button_hover.png' : '/column_button.png'})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }}
                    onMouseEnter={() => setHoveredButton('column')}
                    onMouseLeave={() => setHoveredButton(null)}
                >
                    <div className="flex items-center gap-2 z-10 relative">
                        <span className="font-bold text-[14px] text-white z-10 relative">아파티 칼럼</span>
                    </div>
                    <ChevronRight size={14} className="text-white/80 group-hover:text-white transition-colors z-10 relative" />
                </Link>

                {/* 하단 툴 카드도 gap-2 간격에 맞춰 예쁘게 따라붙습니다! */}
                <div className="z-10 relative">
                    <ToolShortcutGrid />
                </div>

            </div>
        </div>
    );
}