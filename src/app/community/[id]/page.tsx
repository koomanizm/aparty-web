"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { ChevronLeft, User, Loader2, Heart, MessageSquare, Send, UserCircle, Trash2, Clock, Pencil, X } from "lucide-react";

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [profile, setProfile] = useState<any>(null);

    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [localLikes, setLocalLikes] = useState(0);

    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState("");

    useEffect(() => {
        const fetchAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profileData) {
                    setProfile(profileData);
                    setNickname(profileData.nickname || "");
                }
            }
        };
        fetchAuth();
    }, []);

    useEffect(() => {
        async function loadData() {
            if (!params.id) return;
            setIsLoading(true);

            try {
                const { data: postData, error: postError } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (postError) throw postError;

                if (postData) {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('nickname, avatar_url')
                        .eq('id', postData.user_id)
                        .single();

                    setPost({
                        ...postData,
                        profiles: profileData
                    });
                    setLocalLikes(postData.likes || 0);

                    const { data: commentsData } = await supabase
                        .from('comments')
                        .select('*, profiles(nickname, avatar_url)')
                        .eq('post_id', params.id)
                        .order('created_at', { ascending: true });

                    setComments(commentsData || []);
                }
            } catch (error) {
                console.error("데이터 로드 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [params.id]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("로그인 후 댓글을 남길 수 있습니다! 🔒");
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const { data: insertedComment, error } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    user_id: user.id,
                    content: newComment.replace(/\n/g, "<br>")
                })
                .select('*, profiles(nickname, avatar_url)')
                .single();

            if (error) throw error;

            const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
            const currentPoints = profile?.points || 0;

            await Promise.all([
                supabase.from('point_logs').insert({ user_id: user.id, amount: 5, reason: 'comment' }),
                supabase.from('profiles').update({ points: currentPoints + 5 }).eq('id', user.id)
            ]);

            // 🚀🚀🚀 [신규 추가] 게시글 작성자에게 알림 전송 로직 🚀🚀🚀
            // 내가 쓴 글에 내가 댓글 단 경우가 아닐 때만 알림 전송
            if (post.user_id !== user.id) {
                await supabase.from('notifications').insert({
                    user_id: post.user_id, // 알림을 받을 사람 (게시글 작성자)
                    actor_id: user.id,     // 알림을 보낸 사람 (댓글 단 사람)
                    type: 'comment',
                    post_id: post.id,
                    content: `${nickname || "아파티유저"}님이 회원님의 게시글에 댓글을 남겼습니다. 💬`
                });
            }
            // 🚀🚀🚀 ----------------------------------------- 🚀🚀🚀

            setComments([...comments, insertedComment]);
            setNewComment("");
            alert("댓글이 등록되었습니다! 💰 5P가 적립되었습니다.");

        } catch (error) {
            alert("댓글 등록 실패");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
            setComments(comments.filter(c => c.id !== commentId));
        } catch (e) {
            alert("삭제 권한이 없거나 실패했습니다.");
        }
    };

    const handleCommentEditSubmit = async (commentId: string) => {
        if (!editCommentText.trim()) return;
        try {
            const formattedContent = editCommentText.replace(/\n/g, "<br>");
            const { error } = await supabase
                .from('comments')
                .update({ content: formattedContent })
                .eq('id', commentId);

            if (error) throw error;

            setComments(comments.map(c => c.id === commentId ? { ...c, content: formattedContent } : c));
            setEditingCommentId(null);
            setEditCommentText("");
        } catch (e) {
            alert("댓글 수정에 실패했습니다.");
        }
    };

    const handleCommentLike = async (commentId: string, currentLikes: number) => {
        if (!user) return alert("로그인 후 공감할 수 있습니다! 🔒");
        const likeKey = `liked_comment_${commentId}`;
        if (localStorage.getItem(likeKey)) return alert("이미 공감하셨습니다! 😊");

        const newLikes = currentLikes + 1;
        setComments(comments.map(c => c.id === commentId ? { ...c, likes: newLikes } : c));
        localStorage.setItem(likeKey, "true");
        await supabase.from('comments').update({ likes: newLikes }).eq('id', commentId);
    };

    const handleLike = async () => {
        if (!post || !user) return alert("로그인 후 공감할 수 있습니다! 😊");
        const likeKey = `liked_post_${post.id}`;
        if (localStorage.getItem(likeKey)) return alert("이미 공감하셨습니다! ❤️");
        const newLikes = localLikes + 1;
        setLocalLikes(newLikes);
        localStorage.setItem(likeKey, "true");
        await supabase.from('posts').update({ likes: newLikes }).eq('id', post.id);

        // 🚀 [보너스 추가] 게시글 공감 시에도 알림 전송 (옵션)
        if (post.user_id !== user.id) {
            await supabase.from('notifications').insert({
                user_id: post.user_id,
                actor_id: user.id,
                type: 'like',
                post_id: post.id,
                content: `${nickname || "아파티유저"}님이 회원님의 게시글에 공감했습니다. ❤️`
            });
        }
    };

    const handleDeletePost = async () => {
        if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
        setIsDeleting(true);
        const { error } = await supabase.from('posts').delete().eq('id', post.id);
        if (!error) { router.push("/community"); }
        else { setIsDeleting(false); }
    };

    if (isLoading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin text-[#FF5A00]" size={36} /></div>;
    if (!post) return <div className="min-h-screen flex justify-center items-center text-xl font-bold">게시글을 찾을 수 없습니다.</div>;

    const images = (Array.isArray(post.image_data)
        ? post.image_data
        : post.image_data ? [post.image_data] : [])
        .filter((img: string) => typeof img === 'string' && img.trim() !== "");

    return (
        <main className="min-h-screen bg-[#fdfbf7] p-4 md:p-8 pb-32 flex justify-center text-left">
            <div className="w-full max-w-3xl">
                <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-[#FF5A00] font-bold mb-6 transition-colors text-[14px]">
                    <ChevronLeft size={18} /> 목록으로
                </button>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10 mb-6 relative group/post">
                    {user && post.user_id === user.id && (
                        <div className="absolute top-5 right-5 flex items-center gap-1.5 opacity-100 md:opacity-0 group-hover/post:opacity-100 transition-opacity bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm">
                            <button onClick={() => router.push(`/community/edit/${post.id}`)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <Pencil size={15} strokeWidth={2.5} />
                            </button>
                            <div className="w-[1px] h-3 bg-gray-200"></div>
                            <button onClick={handleDeletePost} disabled={isDeleting} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                {isDeleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} strokeWidth={2.5} />}
                            </button>
                        </div>
                    )}

                    <div className="mb-6 pb-6 border-b border-gray-100/60 text-left">
                        <span className="inline-block text-[11px] font-black text-[#FF5A00] bg-orange-50 px-2.5 py-1 rounded-md mb-3 border border-orange-100/50">{post.category || "자유게시판"}</span>
                        <h1 className="text-2xl md:text-3xl font-black text-[#4A403A] mb-4 leading-tight pr-10">{post.title}</h1>
                        <div className="flex items-center gap-3">
                            {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-10 h-10 rounded-full border object-cover" /> : <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border"><User size={18} /></div>}
                            <div className="text-left">
                                <div className="text-[14px] font-bold text-[#4A403A]">{post.profiles?.nickname || "아파티유저"}</div>
                                <div className="text-[12px] text-gray-400 font-medium flex items-center gap-1"><Clock size={12} />{new Date(post.created_at).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div className="flex flex-col gap-3 mb-10">
                            {images.map((img: string, index: number) => (
                                <div key={index} className="rounded-2xl overflow-hidden">
                                    <img src={img} alt={`이미지 ${index + 1}`} className="w-full h-auto object-cover max-h-[800px] mx-auto" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="min-h-[150px] text-[15px] md:text-[16px] text-gray-600 leading-[1.8] whitespace-pre-wrap font-medium mb-10 text-left">
                        {post.content.split('<br>').map((line: string, index: number) => <span key={index}>{line}<br /></span>)}
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

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10">
                    <h3 className="text-lg font-black text-[#4A403A] mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#FF5A00]" /> 댓글 <span className="text-[#FF5A00]">{comments.length}</span>
                    </h3>

                    <form onSubmit={handleCommentSubmit} className="mb-8 relative bg-[#fdfbf7] p-4 md:p-5 rounded-2xl border border-gray-100/60">
                        {!user && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-2xl">
                                <span className="text-[13px] font-bold text-[#4A403A] bg-white px-4 py-2 rounded-full shadow-sm">로그인 후 댓글을 남길 수 있습니다 🔒</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1"><UserCircle size={14} className="text-[#FF5A00]" /> 닉네임</span>
                            <input type="text" value={nickname} readOnly className="w-32 px-3 py-1.5 rounded-lg border border-gray-200 outline-none text-[13px] font-bold text-[#4A403A] bg-gray-100 cursor-not-allowed" />
                        </div>
                        <div className="relative">
                            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="따뜻한 댓글을 남겨주세요!" className="w-full p-4 pb-14 rounded-xl border border-gray-200 focus:border-[#FF5A00] outline-none resize-none text-[14px] bg-white font-medium shadow-sm transition-all" rows={3} />
                            <button type="submit" disabled={isSubmitting || !newComment.trim()} className="absolute bottom-3 right-3 px-4 py-2 rounded-xl text-[13px] font-bold flex items-center gap-1.5 transition-all shadow-sm bg-[#FF5A00] hover:bg-[#E04D00] text-white disabled:bg-gray-200">
                                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} /> 등록</>}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-4">
                        {comments.length > 0 ? comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 md:gap-4 group relative text-left">
                                {comment.profiles?.avatar_url ? (
                                    <img src={comment.profiles.avatar_url} className="w-6 h-6 md:w-10 md:h-10 rounded-full border object-cover shrink-0 mt-1" />
                                ) : (
                                    <div className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 border shrink-0 mt-1"><User size={12} className="md:w-5 md:h-5" /></div>
                                )}
                                <div className="flex-1 bg-[#fdfbf7] px-3.5 py-3 md:p-4 rounded-2xl rounded-tl-none border border-gray-100/60 relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-[12px] md:text-[13px] text-[#4A403A]">{comment.profiles?.nickname || "아파티유저"}</span>
                                        <span className="text-[10px] md:text-[11px] text-gray-400 font-medium">{new Date(comment.created_at).toLocaleDateString()}</span>
                                    </div>

                                    {editingCommentId === comment.id ? (
                                        <div className="mt-2 mb-2">
                                            <textarea
                                                value={editCommentText}
                                                onChange={(e) => setEditCommentText(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-blue-200 focus:border-blue-400 outline-none text-[13px] bg-white resize-none shadow-inner"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex justify-end gap-1.5 mt-2">
                                                <button onClick={() => setEditingCommentId(null)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">취소</button>
                                                <button onClick={() => handleCommentEditSubmit(comment.id)} className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm">수정 완료</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[12px] md:text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap mb-1.5 text-left">
                                            {comment.content.split('<br>').map((line: string, idx: number) => <span key={idx}>{line}<br /></span>)}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100/30 mt-1">
                                        <button onClick={() => handleCommentLike(comment.id, comment.likes || 0)} className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-all group/like">
                                            <Heart size={12} className={(comment.likes || 0) > 0 ? "fill-red-500 text-red-500" : "group-hover/like:scale-110 transition-transform"} />
                                            <span className={`text-[11px] md:text-[12px] font-bold ${(comment.likes || 0) > 0 ? "text-red-500" : ""}`}>{comment.likes || 0}</span>
                                        </button>
                                    </div>

                                    {user && comment.user_id === user.id && editingCommentId !== comment.id && (
                                        <div className="absolute -right-1 -top-3 md:-right-2 md:-top-3 flex items-center gap-1 bg-white px-2 py-1 rounded-xl shadow-sm border border-gray-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingCommentId(comment.id);
                                                    setEditCommentText(comment.content.replace(/<br>/g, "\n"));
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                            >
                                                <Pencil size={12} strokeWidth={2.5} />
                                            </button>
                                            <div className="w-[1px] h-2.5 bg-gray-200"></div>
                                            <button onClick={() => handleDeleteComment(comment.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={12} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-gray-400 font-medium text-[14px]">첫 번째 댓글의 주인공이 되어보세요! ✨</div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}