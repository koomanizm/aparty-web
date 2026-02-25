"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Pencil, Loader2, User, Heart, ChevronLeft, ChevronRight } from "lucide-react";
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
        <main className="min-h-screen bg-[#f8f9fa] selection:bg-orange-100 pb-32">

            {/* 🚀 1. 소식 페이지와 동일한 모던 네비게이션 바 */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-1.5 text-gray-900">
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs tracking-tight">홈으로</span>
                    </Link>
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase font-sans">Aparty Lounge</span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-5 pt-10 relative z-20">

                {/* 🚀 2. 소식 페이지와 동일한 깔끔한 헤더 + 새 글 쓰기 버튼 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-[#FF5A00] p-1.5 rounded-lg">
                                <MessageSquare size={16} className="text-white" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
                                아파티 라운지
                            </h1>
                        </div>
                        <p className="text-[12px] font-medium text-gray-400">분양, 청약, 부동산 인사이트를 자유롭게 나누는 공간</p>
                    </div>

                    <Link
                        href="/community/write"
                        className="bg-[#FF5A00] hover:bg-[#E04D00] text-white px-6 py-3 rounded-xl font-black text-[13px] md:text-[14px] flex items-center justify-center gap-1.5 shadow-[0_6px_15px_rgba(255,90,0,0.2)] hover:shadow-lg transition-all shrink-0"
                    >
                        <Pencil size={14} /> 새 글 쓰기
                    </Link>
                </header>

                {/* 3. 🚀 수정됨: 사이즈 축소 & 모바일 최적화된 카테고리 탭 */}
                <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide w-full">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 md:px-5 md:py-2 rounded-full text-[11px] md:text-[13px] font-black tracking-tight transition-all border ${activeTab === cat
                                ? "bg-[#4A403A] text-white border-[#4A403A] shadow-md"
                                : "bg-white text-gray-500 border-gray-200 hover:border-[#FF5A00] hover:text-[#FF5A00] shadow-sm"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 4. 게시글 카드 리스트 (기존 유지) */}
                <div className="space-y-4 md:space-y-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[24px] border border-gray-100 shadow-sm gap-4">
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
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2.5 mb-2.5">
                                            <span className="text-[11px] font-black text-[#FF5A00] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/50 shrink-0">
                                                {post.category}
                                            </span>
                                            <h2 className="text-[16px] md:text-[18px] font-black text-[#4A403A] group-hover:text-[#FF5A00] transition-colors truncate">
                                                {post.title}
                                            </h2>
                                        </div>

                                        <p className="text-[14px] md:text-[15px] text-gray-500 line-clamp-2 leading-relaxed mb-5 font-medium break-keep">
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
                        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[24px] border border-gray-100 shadow-sm">
                            <div className="text-5xl mb-4">📭</div>
                            <p className="text-gray-400 font-bold text-[15px] mb-6">해당 카테고리의 소식이 없습니다.</p>
                            <Link href="/community/write" className="bg-[#4A403A] text-white px-6 py-2.5 rounded-full font-bold text-[13px] hover:bg-black transition-colors">
                                첫 번째 글 남기기
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <footer className="text-center pt-24 pb-12 opacity-30">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 font-sans">© Aparty Lounge</p>
            </footer>
        </main>
    );
}