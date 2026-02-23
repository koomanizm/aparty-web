"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";

// 임시 리뷰 데이터 (나중에 구글 시트에서 불러올 자리)
const INITIAL_REVIEWS = [
    { id: 1, name: "분양관심러", rating: 5, text: "상담이 친절하고 현장 위치가 너무 좋네요! 로얄동 선점하고 갑니다.", date: "2026.02.24" },
    { id: 2, name: "투자자A", rating: 4, text: "주변 인프라는 좋은데 분양가가 살짝 아쉽습니다. 그래도 미래가치는 충분해 보이네요.", date: "2026.02.23" },
];

export default function ReviewSection() {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS);
    const [newText, setNewText] = useState("");
    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;

        // 새 리뷰를 리스트 맨 위에 추가 (임시 작동)
        const newReview = {
            id: Date.now(),
            name: "방문객", // 나중에는 로그인 연동이나 이름 입력칸 추가 가능
            rating: rating,
            text: newText,
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        };

        setReviews([newReview, ...reviews]);
        setNewText(""); // 입력창 초기화
        setRating(5); // 별점 초기화
    };

    return (
        <div className="w-full mt-16 pt-10 border-t border-gray-100 text-left">
            <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4">
                <MessageSquare className="text-[#ff6f42] w-5 h-5" />
                현장 방문자 리뷰
                <span className="text-xs text-[#ff6f42] bg-orange-50 px-2 py-0.5 rounded-full font-black ml-1">
                    {reviews.length}건
                </span>
            </h3>

            {/* 🚀 1. 리뷰 작성 폼 */}
            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-[24px] mb-10 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-[14px] font-bold text-gray-600">이 현장에 대한 별점을 남겨주세요</span>
                    <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    size={24}
                                    className={`${(hoveredStar || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="현장 방문 후기나 궁금한 점을 자유롭게 남겨주세요!"
                        className="w-full px-5 py-4 min-h-[120px] rounded-2xl border border-gray-200 focus:border-[#FF8C42] focus:ring-2 focus:ring-orange-100 outline-none resize-none text-[15px] transition-all bg-white"
                    />
                    <button
                        type="submit"
                        disabled={!newText.trim()}
                        className="absolute bottom-4 right-4 bg-[#4A403A] text-white px-6 py-2.5 rounded-xl font-black text-[14px] hover:bg-[#FF8C42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        등록하기
                    </button>
                </div>
            </form>

            {/* 🚀 2. 리뷰 리스트 */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="font-black text-[#4A403A] text-[15px]">{review.name}</span>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                    ))}
                                </div>
                            </div>
                            <span className="text-[12px] font-bold text-gray-400">{review.date}</span>
                        </div>
                        <p className="text-[14px] text-gray-600 leading-relaxed mt-1">{review.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}