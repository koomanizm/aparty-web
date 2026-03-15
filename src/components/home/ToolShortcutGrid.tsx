// src/components/home/ToolShortcutGrid.tsx

"use client";

import Link from "next/link";
import { Calculator, Landmark, Percent, Award, Ruler, CheckSquare } from "lucide-react";

const TOOLS = [
    { label: "취득세", icon: Calculator, color: "text-blue-500", bg: "bg-blue-50", href: "/tools/tax" },
    { label: "대출이자", icon: Landmark, color: "text-emerald-500", bg: "bg-emerald-50", href: "/tools/loan" },
    { label: "수익률계산", icon: Percent, color: "text-purple-500", bg: "bg-purple-50", href: "/tools/yield" },
    { label: "청약가점", icon: Award, color: "text-orange-500", bg: "bg-orange-50", href: "/tools/score" },
    { label: "평형변환", icon: Ruler, color: "text-rose-500", bg: "bg-rose-50", href: "/tools/convert" },
    { label: "체크리스트", icon: CheckSquare, color: "text-amber-500", bg: "bg-amber-50", href: "/tools/checklist" },
];

export default function ToolShortcutGrid() {
    return (
        <div className="bg-white rounded-[20px] md:rounded-[24px] border border-gray-100 shadow-sm p-4 w-full h-full">
            <div className="grid grid-cols-3 gap-2 md:gap-3 w-full h-full">
                {TOOLS.map((tool, idx) => (
                    <Link
                        key={idx}
                        href={tool.href}
                        /* 🚀 FIX: 부모 Link의 className에서 'hover:bg-gray-50'를 완벽하게 제거했습니다! (배경색 안 바뀜) */
                        className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl active:scale-95 transition-all group"
                    >
                        {/* 🚀 호버 효과(group-hover:scale-110)는 오직 이 동그란 아이콘 컨테이너에만 집중되도록 유지! (또렷하게 커짐) */}
                        <div className={`w-9 h-9 md:w-11 md:h-11 ${tool.bg} ${tool.color} rounded-full flex items-center justify-center shrink-0 aspect-square group-hover:scale-110 transition-transform shadow-sm`}>
                            <tool.icon size={18} className="md:w-5 md:h-5" />
                        </div>
                        <span className="text-[10px] md:text-[12px] font-bold text-[#4A403A] tracking-tight text-center whitespace-nowrap">
                            {tool.label}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}