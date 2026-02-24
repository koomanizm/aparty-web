"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { getReviewsFromSheet, Review } from "../lib/sheet";

// 🚨 구글 Apps Script에서 발급받은 '웹 앱 URL'을 아래에 꼭 붙여넣으세요!
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyIT-jK42TVPUTGvaHF4kj2dfBvN053z2vYXKK0CqHqpSxRZ9bgi8XEo7CaAx8HLVtv/exec";

const ReviewItem = ({ review }: { review: Review }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const displayText = review.text.replace(/<br>/g, '\n');
    const isLongText = displayText.length > 45 || displayText.includes('\n');

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
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
            <div>
                <p className={`text-[14px] text-gray-600 leading-relaxed mt-1 whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-1" : ""}`}>
                    {displayText}
                </p>
                {isLongText && (
                    // 🚀 1. more 버튼을 우측으로 보내기 위해 text-right 추가!
                    <div className="text-right mt-1.5">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[12px] font-bold text-[#ff6f42] hover:underline"
                        >
                            {isExpanded ? "접기" : "more"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ReviewSection({ propertyId }: { propertyId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newText, setNewText] = useState("");
    const [authorName, setAuthorName] = useState("");
    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function loadReviews() {
            if (!propertyId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const data = await getReviewsFromSheet(propertyId);
                setReviews(data);
            } catch (error) {
                console.error("리뷰 가져오기 에러:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadReviews();
    }, [propertyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim() || isSubmitting) return;

        setIsSubmitting(true);

        const newReview = {
            propertyId: propertyId,
            id: Date.now().toString(),
            name: authorName.trim() || "방문객",
            rating: rating,
            text: newText.replace(/\n/g, "<br>"),
            date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        };

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newReview),
            });

            setReviews([newReview, ...reviews]);
            setNewText("");
            setAuthorName("");
            setRating(5);
        } catch (error) {
            console.error("리뷰 등록 실패:", error);
            alert("리뷰 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🚀 2. 리뷰가 있을 때만 평균 별점 계산! (소수점 1자리까지 표시)
    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="w-full mt-16 pt-10 border-t border-gray-100 text-left">
            <h3 className="text-lg font-bold text-[#2d2d2d] flex items-center gap-2 mb-4">
                <MessageSquare className="text-[#ff6f42] w-5 h-5" />
                현장 방문자 리뷰
                <span className="text-xs text-[#ff6f42] bg-orange-50 px-2 py-0.5 rounded-full font-black ml-1">
                    {reviews.length}건
                </span>
                {/* 🚀 3. 제목 옆에 영롱하게 빛나는 평균 별점 표시! */}
                {reviews.length > 0 && (
                    <span className="text-sm font-bold text-gray-500 ml-1 flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        {averageRating}
                    </span>
                )}
            </h3>

            <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-[24px] mb-8 shadow-inner border border-gray-100/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-500">작성자</span>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="방문객 (선택)"
                            maxLength={10}
                            disabled={isSubmitting}
                            // 🚀 4. bg-white 를 추가해서 배경을 하얗게, 테두리를 아주 살짝 연하게 변경!
                            className="w-28 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:border-[#FF8C42] focus:ring-1 focus:ring-orange-100 outline-none transition-all shadow-sm"
                        />
                    </div>

                    <div className="hidden sm:block w-px h-4 bg-gray-200"></div>

                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-500">별점</span>
                        <div className="flex gap-1" onMouseLeave={() => setHoveredStar(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredStar(star)}
                                    className="transition-transform hover:scale-110 focus:outline-none"
                                >
                                    <Star size={20} className={`${(hoveredStar || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} transition-colors`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="현장 방문 후기나 궁금한 점을 자유롭게 남겨주세요!"
                        className="w-full px-5 py-3.5 min-h-[80px] rounded-2xl border border-gray-200 focus:border-[#FF8C42] focus:ring-2 focus:ring-orange-100 outline-none resize-none text-[14px] transition-all bg-white shadow-sm"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={!newText.trim() || isSubmitting}
                        className="absolute bottom-4 right-4 bg-[#4A403A] text-white px-5 py-2 rounded-xl font-black text-[13px] hover:bg-[#FF8C42] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> 전송 중</> : "등록하기"}
                    </button>
                </div>
            </form>

            <div className="space-y-3 min-h-[100px] max-h-[480px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-10 text-gray-400 text-sm font-bold animate-pulse">
                        리뷰를 불러오는 중입니다...
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <p className="text-sm font-bold text-gray-400">아직 작성된 리뷰가 없습니다.<br />첫 번째 리뷰를 남겨주세요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}