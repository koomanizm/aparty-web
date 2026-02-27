"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Pencil, Loader2, User, Heart, ChevronLeft, Search } from "lucide-react";
import { getPostsFromSheet, Post } from "../../lib/sheet";

// 🚀 [추가됨] 수파베이스와 로그인 모달 임포트
import { supabase } from "../../lib/supabase";
import LoginModal from "../../components/LoginModal";

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("전체");
    const [searchQuery, setSearchQuery] = useState("");

    // 🚀 [추가됨] 로그인 모달 제어 상태
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const router = useRouter();
    const categories = ["전체", "자유게시판", "분양질문", "임장후기"];

    // 1. 게시글 불러오기 로직 (기존 유지)
    useEffect(() => {
        async function loadPosts() {
            setIsLoading(true);
            const data = await getPostsFromSheet();
            setPosts(data);
            setIsLoading(false);
        }
        loadPosts();
    }, []);

    // 2. 검색 및 탭 필터링 로직 (기존 유지)
    const filteredPosts = posts.filter(post => {
        const matchesTab = activeTab === "전체" || post.category.includes(activeTab);
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // 🚀 3. [추가됨] 글쓰기 권한 체크 함수
    const handleWriteClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // 링크 클릭 시 즉시 이동 방지

        // 수파베이스에게 현재 로그인 상태 물어보기
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            alert("로그인이 필요한 서비스입니다.");
            setIsLoginModalOpen(true); // 로그인 안됐으면 모달 띄우기
            return;
        }

        // 로그인 되어있다면 글쓰기 페이지로 당당하게 입장!
        router.push("/community/write");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="animate-spin text-orange-500 mb-4" size={36} />
                <p className="text-gray-900 font-bold text-[14px]">라운지 소식 불러오는 중...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f9fa] selection:bg-orange-100 pb-32">

            {/* 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-1.5 text-gray-900">
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs tracking-tight">홈으로</span>
                    </Link>
                    <span className="text-[10px] font-black tracking-[0.2em] text-gray-300 uppercase font-sans">Aparty Lounge</span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-5 pt-10 pb-20">

                {/* 헤더 영역 */}
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="bg-orange-500 p-1.5 rounded-lg">
                                <MessageSquare size={16} className="text-white" />
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
                                아파티 라운지
                            </h1>
                        </div>
                        <p className="text-[12px] font-medium text-gray-400">분양, 청약, 부동산 인사이트를 자유롭게 나누는 공간</p>
                    </div>

                    {/* 🚀 [수정됨] onClick으로 권한 체크 함수 연결 */}
                    <Link
                        href="/community/write"
                        onClick={handleWriteClick}
                        className="bg-[#FF5A00] hover:bg-[#E04D00] text-white px-6 py-3 rounded-xl font-black text-[13px] md:text-[14px] flex items-center justify-center gap-1.5 shadow-[0_6px_15px_rgba(255,90,0,0.2)] hover:shadow-lg transition-all shrink-0"
                    >
                        <Pencil size={14} /> 글쓰기
                    </Link>
                </header>

                {/* 검색바 */}
                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FF5A00] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="게시글을 검색하세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 text-[14px] shadow-sm focus:ring-2 focus:ring-[#FF5A00]/10 focus:border-[#FF5A00] transition-all outline-none placeholder:text-gray-300 font-medium text-gray-900"
                    />
                </div>

                {/* 카테고리 탭 */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`shrink-0 px-5 py-2 rounded-full text-[12px] font-bold transition-all border-2 ${activeTab === cat
                                ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                : "bg-white text-gray-400 border-gray-50 shadow-sm hover:border-[#FF5A00]/30"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* 게시글 리스트 */}
                <div className="space-y-3">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/community/${post.id}`}
                                className="block bg-white px-5 py-4 rounded-[28px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 hover:border-[#FF5A00]/20 hover:shadow-md transition-all group"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-[10px] font-bold text-[#FF5A00] bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100/50">
                                                {post.category}
                                            </span>
                                            <span className="text-[11px] text-gray-400 font-bold">{post.date}</span>
                                        </div>

                                        <h2 className="text-[14px] font-bold text-gray-900 group-hover:text-[#FF5A00] transition-colors truncate">
                                            {post.title}
                                        </h2>

                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-5 h-5 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                    {post.authorImage ? <img src={post.authorImage} className="w-full h-full object-cover" /> : <User size={10} className="text-gray-300" />}
                                                </div>
                                                <span className="text-[12px] font-bold text-gray-500">{post.author}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-200">
                                                <div className="flex items-center gap-1">
                                                    <Heart size={13} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                                                    <span className="text-[11px] font-bold text-gray-400">{post.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare size={13} className="text-gray-300" />
                                                    <span className="text-[11px] font-bold text-gray-400">댓글</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {post.postImage && (
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[20px] overflow-hidden shrink-0 border border-gray-50 shadow-inner bg-gray-50">
                                            <img
                                                src={post.postImage.split(',')[0]}
                                                alt="썸네일"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                            <p className="text-gray-400 font-bold text-[14px]">아직 올라온 소식이 없네요. 😉</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 🚀 [추가됨] 로그인 모달 컴포넌트 */}
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

            <footer className="text-center pb-12 opacity-30">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 font-sans">© Aparty Lounge</p>
            </footer>
        </main>
    );
}