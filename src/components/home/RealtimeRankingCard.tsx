// src/components/home/RealtimeRankingCard.tsx
"use client";
import Link from "next/link";
import { Trophy, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
    realtimeRankings: { id: string, view_count: number }[];
    properties: any[];
}

export default function RealtimeRankingCard({ realtimeRankings, properties }: Props) {
    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 p-4 md:p-5 flex flex-col h-[340px] shrink-0 overflow-hidden">
            <style>
                {`
          @keyframes flipPaper {
            0% { transform: perspective(1000px) rotateX(-90deg); opacity: 0; }
            100% { transform: perspective(1000px) rotateX(0deg); opacity: 1; }
          }
          .paper-animate { animation: flipPaper 0.7s cubic-bezier(0.2, 0.8, 0.2, 1.1) forwards; transform-origin: top; }
          .scroll-container { container-type: inline-size; }
          @keyframes smartScroll {
            0%, 20% { transform: translateX(0); }
            80%, 100% { transform: translateX(calc(-1 * max(0px, 100% - 100cqw))); }
          }
          .rolling-text-smart { display: inline-block; white-space: nowrap; animation: smartScroll 4s linear infinite; }
        `}
            </style>
            <h3 className="text-[12px] md:text-[13px] font-black text-[#4A403A] mb-3 md:mb-4 flex items-center justify-between border-b border-gray-50 pb-2 md:pb-3 shrink-0">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-[#FF8C42]" /> 실시간 인기순위
                </div>
                <span className="flex items-center gap-1 text-[9px] text-orange-500 font-bold">
                    <span className="w-1 h-1 bg-orange-500 rounded-full animate-ping"></span> LIVE
                </span>
            </h3>
            <div key={realtimeRankings[0]?.id || 'loading'} className="flex flex-col gap-3 md:gap-3.5 overflow-y-auto pr-1 scrollbar-hide custom-scroll">
                {realtimeRankings.length > 0 ? (
                    realtimeRankings.map((rank, idx) => {
                        const prop = properties.find(p => String(p.id) === String(rank.id));
                        if (!prop) return null;

                        const getTrendIcon = (id: string) => {
                            const val = Number(id) % 5;
                            if (val === 0 || val === 2) return <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center text-red-500 shrink-0"><ChevronUp size={11} strokeWidth={3} /></div>;
                            if (val === 1) return <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0"><ChevronDown size={11} strokeWidth={3} /></div>;
                            return <div className="w-4 h-4 rounded-full bg-gray-50 flex items-center justify-center text-[#4A403A] shrink-0"><div className="w-1.5 h-[2px] bg-[#4A403A] rounded-full"></div></div>;
                        };
                        const trendIcon = getTrendIcon(rank.id);

                        return (
                            <Link key={rank.id} href={`/property/${rank.id}`} className="paper-animate flex items-center gap-2 group py-0.5 border-b border-gray-50/50 last:border-0 pb-2" style={{ animationDelay: `${idx * 80}ms`, opacity: 0 }}>
                                <div className="flex items-center gap-2 shrink-0 w-[38px] justify-between pl-1">
                                    <span className={`text-[13px] md:text-[14px] font-black w-4 text-center ${idx < 3 ? 'text-[#FF8C42]' : 'text-gray-300'}`}>{idx + 1}</span>
                                    {trendIcon}
                                </div>
                                <div className="flex-1 overflow-hidden relative ml-1 scroll-container min-w-0">
                                    <span className="rolling-text-smart text-[11px] md:text-[12px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] transition-colors pr-2">{prop.title}</span>
                                </div>
                            </Link>
                        );
                    })
                ) : (<div className="h-full flex items-center justify-center text-gray-300 text-[11px] animate-pulse py-10">순위 분석 중...</div>)}
            </div>
        </div>
    );
}