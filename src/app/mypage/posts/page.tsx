"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Clock, Edit3, ChevronRight } from "lucide-react";
import { supabase } from "../../../lib/supabase"; // 🚀 경로 확인!

export default function MyPostsPage() {
    const router = useRouter();
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                // 1. 로그인 확인
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    alert("로그인이 필요합니다.");
                    router.push("/");
                    return;
                }

                // 2. 수파베이스 DB에서 내가 쓴 글만 최신순으로 싹 가져오기
                const { data: postsData, error } = await supabase
                    .from("posts")
                    .select("*")
                    .eq("user_id", session.user.id)
                    .order("created_at", { ascending: false }); // 최신글이 위로 오게 정렬!

                if (error) throw error;

                setMyPosts(postsData || []);
            } catch (error) {
                console.error("게시글 불러오기 실패:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyPosts();
    }, [router]);

    // 날짜 예쁘게 변환하는 마법의 함수 (예: 2026-02-28T14:29:00 -> 2026.02.28)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}.${month}.${day}`;
    };

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 hover:scale-110 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-black text-[#4A403A]">내 게시글</span>
                <div className="w-10"></div>
            </nav>

            <div className="max-w-4xl mx-auto px-5 pt-8">
                {/* 타이틀 영역 */}
                <div className="flex items-center gap-2 mb-8">
                    <MessageSquare className="text-blue-500 fill-blue-500" size={26} />
                    <h1 className="text-2xl font-black text-[#4A403A] tracking-tight">내가 작성한 글</h1>
                    <span className="text-blue-500 font-black ml-1 text-xl">{myPosts.length}</span>
                </div>

                {/* 리스트 출력 영역 */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p className="text-gray-400 font-bold">작성한 글을 불러오고 있습니다...</p>
                    </div>
                ) : myPosts.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {myPosts.map((post) => (
                            // 🚀 각 게시글 카드 (클릭하면 해당 상세 글로 이동하도록 세팅)
                            <Link href={`/community/${post.id}`} key={post.id} className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all block">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-[16px] font-black text-[#4A403A] mb-1.5 truncate group-hover:text-blue-500 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="text-[13px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">
                                            {post.content}
                                        </p>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(post.created_at)}</span>
                                            {/* 만약 나중에 조회수나 댓글수가 추가된다면 여기에 넣으시면 됩니다! */}
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    // 텅 빈 상태 (Empty State) UI
                    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-10 flex flex-col items-center justify-center text-center py-24 mt-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300 border-2 border-dashed border-gray-200">
                            <Edit3 size={32} />
                        </div>
                        <h3 className="text-[18px] font-black text-[#4A403A] mb-2 tracking-tight">아직 작성한 글이 없어요</h3>
                        <p className="text-[13px] text-gray-400 font-medium mb-8">아파티 라운지에서 부동산 정보와 고민을 자유롭게 나눠보세요!</p>
                        <Link href="/community" className="bg-blue-500 text-white font-black px-6 py-3.5 rounded-xl shadow-md hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center gap-2 text-[14px]">
                            <MessageSquare size={16} /> 라운지 첫 글 쓰러가기
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}