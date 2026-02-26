"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, User, Loader2, Heart, MessageSquare, Send, UserCircle, Trash2 } from "lucide-react";
import { getPostsFromSheet, getCommentsFromSheet, Post, Comment } from "../../../lib/sheet";

const COMMUNITY_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqxyuadlck9eWmXjvDuSge30z2K0m4eCeTDzdeNNW5kE_krDc15zitAQMmwYLg8NUh/exec";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [nickname, setNickname] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);

    useEffect(() => {
        const savedNickname = localStorage.getItem("aparty_nickname");
        if (savedNickname) setNickname(savedNickname);
    }, []);

    // app/community/[id]/page.tsx 내부
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const allPosts = await getPostsFromSheet();
            const foundPost = allPosts.find((p) => p.id === params.id);

            if (foundPost) {
                console.log("🚀 가져온 데이터 전체:", foundPost); // 이 줄을 추가하세요!
                console.log("📸 사진 주소 확인:", foundPost.postImage); // 이 줄도!

                setPost(foundPost);
                setLocalLikes(foundPost.likes);
                // ... 생략
            }
            setIsLoading(false);
        }
        if (params.id) loadData();
    }, [params.id]);

    const handleLike = async () => {
        if (!post) return;
        if (status === "loading") return;
        if (!session || !session.user) {
            alert("로그인 후 하트를 누를 수 있습니다! 🔒");
            return;
        }

        const userIdentifier = nickname || session.user.name || "anonymous";
        const postLikeKey = `liked_post_${post.id}_${userIdentifier}`;

        if (localStorage.getItem(postLikeKey) === "true") {
            alert("공감은 한 번만 할 수 있습니다! 😊");
            return;
        }

        setLocalLikes(prev => prev + 1);
        localStorage.setItem(postLikeKey, "true");

        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "likePost",
                    postId: post.id,
                    userId: userIdentifier
                }),
            });
        } catch (e) { console.error("좋아요 실패", e); }
    };

    const handleCommentLike = async (commentId: string) => {
        if (status === "loading") return;
        if (!session || !session.user) {
            alert("로그인 후 하트를 누를 수 있습니다! 🔒");
            return;
        }

        const userIdentifier = nickname || session.user.name || "anonymous";
        const commentLikeKey = `liked_comment_${commentId}_${userIdentifier}`;

        if (localStorage.getItem(commentLikeKey) === "true") {
            alert("공감은 한 번만 할 수 있습니다! 😊");
            return;
        }

        setComments(prev => prev.map(c =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
        ));
        localStorage.setItem(commentLikeKey, "true");

        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "likeComment",
                    commentId,
                    userId: userIdentifier
                }),
            });
        } catch (e) { console.error("댓글 좋아요 실패", e); }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== "authenticated") return alert("로그인 후 댓글을 남길 수 있습니다! 🔒");
        if (!nickname.trim()) return alert("사용하실 닉네임을 입력해 주세요! 🥸");
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        localStorage.setItem("aparty_nickname", nickname.trim());

        const commentData = {
            action: "addComment",
            id: Date.now().toString(),
            postId: post?.id,
            author: nickname.trim(),
            authorImage: session?.user?.image || "",
            content: newComment.replace(/\n/g, "<br>"),
            date: new Date().toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }),
            likes: 0,
        };

        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(commentData),
            });
            setComments([...comments, commentData as Comment]);
            setNewComment("");
        } catch (error) { alert("댓글 등록에 실패했습니다."); }
        finally { setIsSubmitting(false); }
    };

    const handleDeletePost = async () => {
        if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
        setIsDeleting(true);
        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deletePost", id: post?.id }),
            });
            alert("글이 삭제되었습니다.");
            router.push("/community");
        } catch (e) { alert("삭제에 실패했습니다."); setIsDeleting(false); }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        setComments(comments.filter(c => c.id !== commentId));
        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST", mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "deleteComment", id: commentId }),
            });
        } catch (e) { alert("댓글 삭제에 실패했습니다."); }
    };

    if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#FF5A00]" size={36} /></div>;
    if (!post) return <div className="min-h-screen flex justify-center items-center text-xl font-bold">게시글을 찾을 수 없습니다.</div>;

    return (
        <main className="min-h-screen bg-[#fdfbf7] p-4 md:p-8 pb-32 flex justify-center">
            <div className="w-full max-w-3xl">
                <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-[#FF5A00] font-bold mb-6 transition-colors">
                    <ChevronLeft size={20} /> 목록으로
                </button>

                {/* 게시글 영역 */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10 mb-6 relative">
                    {post.author === nickname && (
                        <button onClick={handleDeletePost} disabled={isDeleting} className="absolute top-6 right-6 md:top-8 md:right-8 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                            {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                    )}
                    <div className="mb-6 pb-6 border-b border-gray-100/60 pr-10">
                        <span className="inline-block text-[11px] font-black text-[#FF5A00] bg-orange-50 px-2.5 py-1 rounded-md mb-3 border border-orange-100/50">{post.category}</span>
                        <h1 className="text-2xl md:text-3xl font-black text-[#4A403A] mb-4 leading-tight">{post.title}</h1>
                        <div className="flex items-center gap-3">
                            {post.authorImage ? <img src={post.authorImage} alt="프로필" className="w-10 h-10 rounded-full border border-gray-100 object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400"><User size={18} /></div>}
                            <div className="text-left">
                                <div className="text-[14px] font-bold text-[#4A403A]">{post.author}</div>
                                <div className="text-[12px] text-gray-400 font-medium">{post.date}</div>
                            </div>
                        </div>
                    </div>

                    {/* 🚀 [추가됨] 사진이 있다면 본문 위에 표시 */}
                    {post.postImage && (
                        <div className="mb-10 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                            <img
                                src={post.postImage}
                                alt="게시글 이미지"
                                className="w-full h-auto object-cover max-h-[600px] mx-auto"
                            />
                        </div>
                    )}

                    <div className="min-h-[150px] text-[15px] md:text-[16px] text-gray-600 leading-[1.8] whitespace-pre-wrap font-medium mb-10 text-left">
                        {post.content.split('<br>').map((line, index) => <span key={index}>{line}<br /></span>)}
                    </div>

                    <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100/60">
                        <button onClick={handleLike} className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors group">
                            <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${localLikes > 0 ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white group-hover:border-red-200 group-hover:bg-red-50'}`}>
                                <Heart size={20} className={localLikes > 0 ? "fill-red-500 text-red-500" : ""} />
                            </div>
                            <span className={`text-[13px] font-bold ${localLikes > 0 ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'}`}>공감 {localLikes}</span>
                        </button>
                        <div className="flex flex-col items-center gap-1.5 text-gray-400">
                            <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400"><MessageSquare size={20} /></div>
                            <span className="text-[13px] font-bold text-gray-400">댓글 {comments.length}</span>
                        </div>
                    </div>
                </div>

                {/* 댓글 영역 */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10">
                    <h3 className="text-lg font-black text-[#4A403A] mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#FF5A00]" /> 댓글 <span className="text-[#FF5A00]">{comments.length}</span>
                    </h3>
                    <form onSubmit={handleCommentSubmit} className="mb-8 relative bg-[#fdfbf7] p-4 md:p-5 rounded-2xl border border-gray-100/60">
                        {status !== "authenticated" && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl">
                                <span className="text-[13px] font-bold text-[#4A403A] bg-white px-4 py-2 rounded-full shadow-sm">로그인 후 댓글을 남길 수 있습니다 🔒</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-3 text-left">
                            <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1"><UserCircle size={14} className="text-[#FF5A00]" /> 닉네임</span>
                            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="사용할 닉네임" maxLength={10} className="w-32 px-3 py-1.5 rounded-lg border border-gray-200 focus:border-[#FF5A00] outline-none text-[13px] font-bold text-[#4A403A] bg-white shadow-sm transition-all" />
                        </div>
                        <div className="relative">
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="게시글에 대한 생각이나 의견을 남겨주세요!" className="w-full p-4 pb-14 rounded-xl border border-gray-200 focus:border-[#FF5A00] outline-none resize-none text-[14px] bg-white font-medium shadow-sm transition-all placeholder:text-gray-300" rows={3} />
                            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="absolute bottom-3 right-3 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm bg-[#FF5A00] hover:bg-[#E04D00] text-white disabled:bg-gray-200">
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> 등록</>}
                            </button>
                        </div>
                    </form>
                    <div className="space-y-5">
                        {comments.length > 0 ? comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3 md:gap-4 group relative text-left">
                                {comment.authorImage ? <img src={comment.authorImage} alt="프로필" className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-gray-100 shrink-0 object-cover" /> : <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0"><User size={16} /></div>}
                                <div className="flex-1 bg-[#fdfbf7] p-4 rounded-2xl rounded-tl-none border border-gray-100/60">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <span className="font-bold text-[13px] md:text-[14px] text-[#4A403A]">{comment.author}</span>
                                        <span className="text-[11px] text-gray-400 font-medium">{comment.date}</span>
                                    </div>
                                    <p className="text-[13px] md:text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap mb-2">
                                        {comment.content.split('<br>').map((line, idx) => <span key={idx}>{line}<br /></span>)}
                                    </p>
                                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100/30">
                                        <button onClick={() => handleCommentLike(comment.id)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-all group/like">
                                            <Heart size={13} className={(comment.likes || 0) > 0 ? "fill-red-500 text-red-500" : "group-hover/like:scale-110 transition-transform"} />
                                            <span className={`text-[12px] font-bold ${(comment.likes || 0) > 0 ? "text-red-500" : ""}`}>{comment.likes || 0}</span>
                                        </button>
                                    </div>
                                </div>
                                {comment.author === nickname && (
                                    <button onClick={() => handleDeleteComment(comment.id)} className="absolute -right-2 -top-2 md:right-0 md:top-2 text-gray-300 hover:text-red-500 bg-white md:bg-transparent rounded-full p-1.5 md:opacity-0 group-hover:opacity-100 shadow-sm md:shadow-none border md:border-none border-gray-100">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 font-medium text-[14px]">첫 번째 댓글을 남겨보세요! ✨</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}