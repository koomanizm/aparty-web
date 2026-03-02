"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, User, Trash2, Heart, Pencil, X } from "lucide-react"; // 🚀 Pencil, X 추가
import { supabase } from "../lib/supabase";

// 🚀 개별 리뷰 컴포넌트
const ReviewItem = ({ review, currentUser, onDelete, onLike, onEdit }: { review: any, currentUser: any, onDelete: (id: string) => void, onLike: (id: string, currentLikes: number) => void, onEdit: (id: string, newContent: string, newRating: number) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // 🚀 [신규 추가] 수정 모드 상태 관리
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);

    const displayText = review.content || "";
    const isLongText = displayText.length > 45 || displayText.includes('<br>');

    // 🚀 수정 모드 진입
    const handleEditStart = () => {
        setEditContent(displayText.replace(/<br>/g, "\n"));
        setEditRating(review.rating);
        setIsEditing(true);
    };

    // 🚀 수정 취소
    const handleEditCancel = () => {
        setIsEditing(false);
        setEditContent("");
        setHoveredStar(0);
    };

    // 🚀 수정 완료
    const handleEditSubmit = () => {
        if (!editContent.trim()) return;
        const formattedContent = editContent.replace(/\n/g, "<br>");
        onEdit(review.id, formattedContent, editRating);
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm("이 리뷰를 삭제하시겠습니까?")) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('property_reviews').delete().eq('id', review.id);
            if (error) throw error;
            onDelete(review.id);
        } catch (error) {
            alert("리뷰 삭제에 실패했습니다.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col text-left group/review relative">
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    {review.profiles?.avatar_url ? (
                        <img src={review.profiles.avatar_url} alt="프로필" className="w-6 h-6 rounded-full border border-gray-100 object-cover shrink-0" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100 shrink-0"><User size={12} /></div>
                    )}
                    <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-semibold text-[#4A403A] text-[12px] md:text-[13px]">
                                {review.profiles?.nickname || "아파티유저"}
                            </span>
                            <span className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(review.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                            </span>
                        </div>
                        {/* 🚀 수정 모드가 아닐 때만 기존 별점 노출 */}
                        {!isEditing && (
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 🚀 [신규 수정] 수정/삭제 아이콘 영역 (호버 시 노출) */}
                {currentUser && currentUser.id === review.user_id && !isEditing && (
                    <div className="flex items-center gap-0.5 opacity-100 md:opacity-0 group-hover/review:opacity-100 transition-opacity bg-white px-1.5 py-1 rounded-lg border border-gray-100 shadow-sm">
                        <button onClick={handleEditStart} className="text-gray-300 hover:text-blue-500 transition-colors p-1 rounded-md">
                            <Pencil size={12} strokeWidth={2.5} />
                        </button>
                        <div className="w-[1px] h-3 bg-gray-200"></div>
                        <button onClick={handleDelete} disabled={isDeleting} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md flex items-center justify-center">
                            {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} strokeWidth={2.5} />}
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-2">
                {/* 🚀 [신규 추가] 인라인 수정 폼 */}
                {isEditing ? (
                    <div className="bg-[#fcfcfc] p-3 rounded-xl border border-blue-200 shadow-inner mt-2 mb-1">
                        <div className="flex items-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setEditRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                    <Star className={`w-4 h-4 transition-colors ${star <= (hoveredStar || editRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-2 py-1.5 min-h-[60px] rounded-lg border border-gray-200 focus:border-blue-400 outline-none text-[12px] bg-white resize-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-1.5 mt-2">
                            <button onClick={handleEditCancel} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
                            <button onClick={handleEditSubmit} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm">수정 완료</button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className={`text-[12px] md:text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap ${!isExpanded && isLongText ? "line-clamp-2" : ""}`}>
                            {displayText.split('<br>').map((line: string, idx: number) => <span key={idx}>{line}<br /></span>)}
                        </p>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <button onClick={() => onLike(review.id, review.likes || 0)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-all group/like">
                                <Heart size={12} className={(review.likes || 0) > 0 ? "fill-red-500 text-red-500" : "group-hover/like:scale-110 transition-transform"} />
                                <span className={`text-[11px] font-bold ${(review.likes || 0) > 0 ? "text-red-500" : ""}`}>{review.likes || 0}</span>
                            </button>

                            {isLongText && (
                                <button onClick={() => setIsExpanded(!isExpanded)} className="text-[11px] font-bold text-[#ff6f42] hover:underline">
                                    {isExpanded ? "접기" : "자세히 보기"}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default function ReviewSection({ propertyId }: { propertyId: string }) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [newText, setNewText] = useState("");
    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);

    const [user, setUser] = useState<any>(null);
    const [nickname, setNickname] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MAX_CHARS = 500;

    useEffect(() => {
        const fetchAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: profileData } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single();
                if (profileData) setNickname(profileData.nickname || "");
            }
        };
        fetchAuth();
    }, []);

    useEffect(() => {
        async function loadReviews() {
            if (!propertyId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('property_reviews')
                    .select('*, profiles(nickname, avatar_url)')
                    .eq('property_id', propertyId)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setReviews(data || []);
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
        if (!user) return alert("로그인 후 리뷰를 남길 수 있습니다! 🔒");
        if (!newText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const { data: insertedReview, error } = await supabase
                .from('property_reviews')
                .insert({
                    property_id: propertyId,
                    user_id: user.id,
                    rating: rating,
                    content: newText.replace(/\n/g, "<br>")
                })
                .select('*, profiles(nickname, avatar_url)')
                .single();

            if (error) throw error;

            const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
            const currentPoints = profile?.points || 0;

            await Promise.all([
                supabase.from('point_logs').insert({ user_id: user.id, amount: 10, reason: 'review' }),
                supabase.from('profiles').update({ points: currentPoints + 10 }).eq('id', user.id)
            ]);

            setReviews([insertedReview, ...reviews]);
            setNewText("");
            setRating(5);
            alert("정성스러운 리뷰 감사합니다! 💰 10P가 적립되었습니다.");

        } catch (error) {
            alert("리뷰 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteReview = (deletedId: string) => {
        setReviews(reviews.filter(r => r.id !== deletedId));
    };

    // 🚀 [신규 추가] 리뷰 수정 처리 (DB 업데이트 및 화면 반영)
    const handleEditReview = async (editId: string, newContent: string, newRating: number) => {
        try {
            const { error } = await supabase
                .from('property_reviews')
                .update({ content: newContent, rating: newRating })
                .eq('id', editId);

            if (error) throw error;

            setReviews(reviews.map(r => r.id === editId ? { ...r, content: newContent, rating: newRating } : r));
        } catch (error) {
            alert("리뷰 수정 중 오류가 발생했습니다.");
        }
    };

    const handleLikeReview = async (reviewId: string, currentLikes: number) => {
        if (!user) return alert("로그인 후 공감할 수 있습니다! 🔒");
        const likeKey = `liked_property_review_${reviewId}`;
        if (localStorage.getItem(likeKey)) return alert("이미 공감하셨습니다! 😊");

        const newLikes = currentLikes + 1;
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, likes: newLikes } : r));
        localStorage.setItem(likeKey, "true");
        await supabase.from('property_reviews').update({ likes: newLikes }).eq('id', reviewId);
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
                {reviews.length > 0 && (
                    <span className="text-[12px] md:text-sm font-bold text-gray-500 ml-auto flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {averageRating}
                    </span>
                )}
            </h3>

            <form onSubmit={handleSubmit} className="relative bg-[#fcfcfc] p-4 rounded-2xl mb-6 shadow-sm border border-gray-200">
                {!user && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                        <span className="text-[12px] font-bold text-[#4A403A] bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                            로그인 후 리뷰를 남길 수 있습니다 🔒
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[14px] font-bold text-gray-800">
                                {nickname || "방문객"}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                    <Star className={`w-4 h-4 transition-colors ${star <= (hoveredStar || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="text-[10px] font-semibold text-gray-400">
                        <span className={newText.length >= MAX_CHARS ? "text-red-500" : ""}>{newText.length}</span> / {MAX_CHARS}
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="현장 방문 후기나 장단점을 자유롭게 남겨주세요!"
                        maxLength={MAX_CHARS}
                        className="w-full px-3 py-2.5 pb-10 min-h-[80px] rounded-xl border border-gray-200 focus:border-[#FF8C42] focus:ring-1 focus:ring-[#FF8C42] outline-none resize-none text-[13px] bg-white transition-all placeholder:text-gray-300"
                        disabled={isSubmitting || !user}
                    />
                    <button type="submit" disabled={!newText.trim() || isSubmitting || !user} className="absolute bottom-2 right-2 bg-[#FF5A00] text-white px-4 py-1.5 rounded-lg font-bold text-[12px] hover:bg-[#E04D00] transition-colors disabled:opacity-50 flex items-center gap-1">
                        {isSubmitting ? <><Loader2 size={12} className="animate-spin" /> 전송 중</> : "등록"}
                    </button>
                </div>
            </form>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                {isLoading ? (
                    <div className="text-center py-6 text-gray-400 text-[12px] font-bold animate-pulse">리뷰를 불러오는 중입니다...</div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            currentUser={user}
                            onDelete={handleDeleteReview}
                            onLike={handleLikeReview}
                            onEdit={handleEditReview} // 🚀 수정 함수 전달!
                        />
                    ))
                ) : (
                    <div className="text-center py-8 bg-[#fcfcfc] rounded-xl border border-gray-100 border-dashed">
                        <p className="text-[12px] font-semibold text-gray-400">아직 작성된 리뷰가 없습니다.<br />첫 번째 리뷰를 남겨주세요!</p>
                    </div>
                )}
            </div>
        </div>
    );
}