"use client";

interface TrendQuickFiltersProps {
    onSelect: (keyword: string) => void;
}

export default function TrendQuickFilters({ onSelect }: TrendQuickFiltersProps) {
    const trends = [
        { icon: "🔥", text: "마감임박", query: "마감임박" },
        { icon: "🌊", text: "오션뷰", query: "오션뷰" },
        { icon: "💰", text: "소액투자", query: "소액" },
        { icon: "🚇", text: "초역세권", query: "역세권" },
        { icon: "✨", text: "중도금무이자", query: "무이자" }
    ];

    return (
        <div className="w-full pb-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 w-max px-1">
                {trends.map((trend, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelect(trend.query)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:border-[#FF7A2F] hover:bg-orange-50 transition-all group"
                    >
                        <span className="text-[13px] group-hover:scale-110 transition-transform">{trend.icon}</span>
                        <span className="text-[13px] font-bold text-[#4A403A] group-hover:text-[#FF7A2F]">{trend.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}