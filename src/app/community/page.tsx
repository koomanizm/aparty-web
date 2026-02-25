"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Pencil, Loader2, User, Heart, Sparkles, ChevronRight } from "lucide-react";
import { getPostsFromSheet, Post } from "../../lib/sheet";

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("전체");

    const categories = ["전체", "자유게시판", "가입인사", "분양질문", "임장후기"];

    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            const data = await getPostsFromSheet();
            setPosts(data);
            setIsLoading(false);
        }
        loadPosts();
    }, []);

    const filteredPosts = activeTab === "전체"
        ? posts
        : posts.filter(post => post.category.includes(activeTab));

    return (
        <div className="min-h-screen bg-[#fdfbf7] pb-32">

            {/* 🚀 1. 칙칙함 0%! 화사하고 밝은 크림/오렌지 배너로 교체! */}
            <div className="relative bg-gradient-to-br from-[#FFF5F0] to-[#FFFFFF] border-b border-orange-100 text-[#4A403A] pt-28 pb-16 px-5 md:px-10 overflow-hidden shadow-sm">

                {/* 배경 꾸밈 요소 (햇살처럼 은은한 오렌지 빛) */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF8C42] opacity-[0.04] rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF5A00] opacity-[0.03] rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:justify-between md:items-end relative z-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            {/* 상단 뱃지도 귀엽고 화사하게 */}
                            <span className="bg-orange-100 text-[#FF5A00] text-[11px] font-black px-3 py-1.5 rounded-full tracking-wider">
                                APARTY LOUNGE
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black mb-3 flex items-center gap-2 leading-tight text-[#4A403A]">
                            아파티 라운지 <Sparkles className="text-[#FF5A00]" size={28} />
                        </h1>
                        <p className="text-gray-500 text-[14px] md:text-[15px] font-medium">
                            분양, 청약, 부동산 인사이트를 자유롭게 나누는 프리미엄 공간
                        </p>
                    </div>

                    {/* PC용 새 글 쓰기 버튼 (그림자를 더 화사하게 줘서 둥둥 떠 있는 느낌!) */}
                    <Link
                        href="/community/write"
                        className="hidden md:flex bg-[#FF5A00] hover:bg-[#E04D00] text-white px-7 py-3.5 rounded-2xl font-black text-[15px] items-center gap-2 transition-all shadow-[0_8px_20px_rgba(255,90,0,0.25)] hover:shadow-[0_10px_25px_rgba(255,90,0,0.35)] hover:-translate-y-1"
                    >
                        <Pencil size={18} /> 새 글 쓰기
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-0 mt-8 relative z-20">

                {/* 모바일용 새 글 쓰기 버튼 */}
                <div className="flex justify-end mb-4 md:hidden">
                    <Link
                        href="/community/write"
                        className="bg-[#FF5A00] hover:bg-[#E04D00] text-white px-5 py-2.5 rounded-xl font-black text-[13px] flex items-center gap-1.5 shadow-[0_6px_15px_rgba(255,90,0,0.25)] hover:shadow-lg transition-all"
                    >
                        <Pencil size={14} /> 새 글 쓰기
                    </Link>
                </div>

                {/* 2. 고급스러운 카테고리 탭 */}
                <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] md:text-[14px] font-black transition-all border ${activeTab === cat
                                    ? "bg-[#4A403A] text-white border-[#4A403A] shadow-md"
                                    : "bg-white text-gray-500 border-gray-200 hover:border-[#FF5A00] hover:text-[#FF5A00] shadow-sm"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 3. 게시글 카드 리스트 */}
                <div className="space-y-4 md:space-y-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-gray-100 shadow-sm gap-4">
                            <Loader2 className="animate-spin text-[#FF5A00]" size={36} />
                            <p className="text-[14px] font-bold text-gray-400">라운지 소식을 불러오는 중입니다...</p>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/community/${post.id}`}
                                className="block bg-white p-5 md:p-7 rounded-[24px] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5 mb-2.5">
                                            <span className="text-[11px] font-black text-[#FF5A00] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/50">
                                                {post.category}
                                            </span>
                                            <h2 className="text-[16px] md:text-[18px] font-black text-[#4A403A] group-hover:text-[#FF5A00] transition-colors line-clamp-1">
                                                {post.title}
                                            </h2>
                                        </div>

                                        <p className="text-[14px] md:text-[15px] text-gray-500 line-clamp-2 leading-relaxed mb-5 font-medium">
                                            {post.content.replace(/<br>/g, " ")}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                {post.authorImage ? (
                                                    <img src={post.authorImage} alt="프로필" className="w-6 h-6 rounded-full object-cover border border-gray-100" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                                                        <User size={12} />
                                                    </div>
                                                )}
                                                <span className="text-[13px] font-bold text-gray-700">{post.author}</span>
                                                <span className="text-gray-300 text-[10px]">|</span>
                                                <span className="text-[12px] font-medium text-gray-400">{post.date}</span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <Heart size={14} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                                                <span className={`text-[12px] font-bold ${post.likes > 0 ? "text-red-500" : ""}`}>
                                                    {post.likes}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-300 group-hover:bg-[#FF5A00] group-hover:text-white transition-colors mt-2 shrink-0">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-gray-400 font-bold text-[15px] mb-6">아직 작성된 라운지 소식이 없습니다.</p>
                            <Link href="/community/write" className="bg-[#4A403A] text-white px-6 py-2.5 rounded-full font-bold text-[13px] hover:bg-black transition-colors">
                                첫 번째 글 남기기
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}