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
        // 🚀 모바일에서는 패딩(p)을 살짝 줄였습니다. (p-4, PC는 p-5)
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1.5 md:gap-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 md:gap-3">
                    {/* 🚀 작성자 이름 크기 축소 */}
                    <span className="font-black text-[#4A403A] text-[13px] md:text-[15px]">{review.name}</span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            // 🚀 별 크기도 모바일에서 살짝 작게
                            <Star key={i} className={`w-3 h-3 md:w-3.5 md:h-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                        ))}
                    </div>
                </div>
                <span className="text-[10px] md:text-[12px] font-bold text-gray-400">{review.date}</span>
            </div>
            <div>
                {/* 🚀 본문 텍스트 크기 축소 (text-13px, PC는 text-14px) */}
                <p className={`text-[13px] md:text-[14px] text-gray-600 leading-relaxed mt-1 whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-1" : ""}`}>
                    {displayText}
                </p>
                {isLongText && (
                    <div className="text-right mt-1.5">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-[11px] md:text-[12px] font-bold text-[#ff6f42] hover:underline"
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

    const MAX_CHARS = 500; // 🚀 최대 글자 수 제한 설정

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

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    return (
        <div className="w-full mt-12 md:mt-16 pt-8 md:pt-10 border-t border-gray-100 text-left">
            <h3 className="text-base md:text-lg font-bold text-[#2d2d2d] flex items-center gap-1.5 md:gap-2 mb-4">
                <MessageSquare className="text-[#ff6f42] w-4 h-4 md:w-5 md:h-5" />
                현장 방문자 리뷰
                <span className="text-[10px] md:text-xs text-[#ff6f42] bg-orange-50 px-2 py-0.5 rounded-full font-black ml-1">
                    {reviews.length}건
                </span>
                {/* ... (평점 표시 생략) ... */}
            </h3>

            <form onSubmit={handleSubmit} className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] mb-8 shadow-inner border border-gray-100/50">

                <div className="flex flex-row items-center justify-between sm:justify-start sm:gap-4 mb-3 md:mb-4">
                    {/* 작성자 & 별점 입력 영역 (기존과 동일) */}
                    <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-[11px] md:text-[13px] font-bold text-gray-500 whitespace-nowrap">작성자</span>
                        <input
                            type="text"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="방문객 (선택)"
                            maxLength={10}
                            disabled={isSubmitting}
                            className="w-20 md:w-28 px-2 md:px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[12px] md:text-sm focus:border-[#FF8C42] outline-none transition-all shadow-sm"
                        />
                    </div>

                    {/* 🚀 실시간 글자 수 카운터 추가 */}
                    <div className="ml-auto sm:ml-4 text-[10px] md:text-[11px] font-black tracking-tighter transition-colors">
                        <span className={newText.length >= MAX_CHARS ? "text-red-500" : "text-orange-500"}>
                            {newText.length}
                        </span>
                        <span className="text-gray-300"> / {MAX_CHARS}</span>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="현장 방문 후기를 남겨주세요! (최대 500자)"
                        // 🚀 maxLength 속성으로 물리적 제한 추가
                        maxLength={MAX_CHARS}
                        className="w-full px-4 md:px-5 py-3 md:py-3.5 pb-12 md:pb-12 min-h-[100px] md:min-h-[120px] rounded-[16px] md:rounded-2xl border border-gray-200 focus:border-[#FF8C42] focus:ring-2 focus:ring-orange-100 outline-none resize-none text-[13px] md:text-[14px] transition-all bg-white shadow-sm"
                        disabled={isSubmitting}
                    />

                    {/* 🚀 글자 수가 가득 찼을 때 안내 문구 (선택 사항) */}
                    {newText.length >= MAX_CHARS && (
                        <span className="absolute left-4 bottom-3 text-[10px] text-red-400 font-bold animate-pulse">
                            최대 글자 수에 도달했습니다.
                        </span>
                    )}

                    <button
                        type="submit"
                        disabled={!newText.trim() || isSubmitting}
                        className="absolute bottom-2.5 md:bottom-3 right-2.5 md:right-3 bg-[#4A403A] text-white px-4 md:px-5 py-1.5 md:py-2 rounded-xl font-black text-[12px] md:text-[13px] hover:bg-[#FF8C42] transition-colors disabled:opacity-50 flex items-center gap-1.5 md:gap-2"
                    >
                        {isSubmitting ? <><Loader2 size={12} className="animate-spin" /> 전송 중</> : "등록하기"}
                    </button>
                </div>
            </form>

            <div className="space-y-3 min-h-[100px] max-h-[480px] overflow-y-auto pr-1 md:pr-2" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 md:py-10 text-gray-400 text-[13px] md:text-sm font-bold animate-pulse">
                        리뷰를 불러오는 중입니다...
                    </div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                    ))
                ) : (
                    <div className="text-center py-8 md:py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                        <p className="text-[12px] md:text-sm font-bold text-gray-400">아직 작성된 리뷰가 없습니다.<br />첫 번째 리뷰를 남겨주세요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}