"use client";

export default function SideAdRail({
    side,
    top = 116,
}: {
    side: "left" | "right";
    top?: number;
}) {
    return (
        <aside className="w-full h-full">
            <div className="sticky" style={{ top }}>
                <div className="rounded-2xl border border-[#F1E7DF] bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">

                    {/* AD 라벨 영역 */}
                    <div className="px-4 py-2 border-b border-[#F5EDE7] bg-[#FAFAFA] flex justify-between items-center">
                        <p className="text-[10px] font-black tracking-[0.1em] text-gray-400">
                            AD
                        </p>
                        <p className="text-[10px] font-bold text-gray-400">
                            {side === "left" ? "분양광고" : "제휴광고"}
                        </p>
                    </div>

                    {/* 🚀 160x600 표준 사이즈 광고 이미지 영역 */}
                    <div className="w-full h-[600px] relative bg-gray-100 flex items-center justify-center">
                        {/* 테스트용 외부 이미지입니다. 
                            나중에 실제 이미지가 나오면 src="/my-ad-left.png" 식으로 변경하시면 됩니다!
                        */}
                        <img
                            src={`https://placehold.co/160x600/${side === 'left' ? 'FF8C42' : '4A403A'}/FFFFFF?text=${side === 'left' ? 'Aparty+AD' : 'Sponsor'}\\n160x600`}
                            alt="광고 배너"
                            className="w-full h-full object-cover"
                        />
                    </div>

                </div>
            </div>
        </aside>
    );
}