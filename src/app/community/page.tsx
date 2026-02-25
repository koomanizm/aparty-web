"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronLeft, Send, Loader2, UserCircle } from "lucide-react";

// 🚀 대표님이 주신 최신 구글 앱스 스크립트 주소입니다!
const COMMUNITY_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqxyuadlck9eWmXjvDuSge30z2K0m4eCeTDzdeNNW5kE_krDc15zitAQMmwYLg8NUh/exec";

export default function WritePage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [category, setCategory] = useState("자유게시판");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nickname, setNickname] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 💾 브라우저에 저장된 닉네임 불러오기
    useEffect(() => {
        const savedNickname = localStorage.getItem("aparty_nickname");
        if (savedNickname) setNickname(savedNickname);
    }, []);

    // 🔒 로그인 안 되어 있으면 입장 컷!
    if (status === "unauthenticated") {
        alert("로그인이 필요한 서비스입니다! 🔒");
        router.push("/");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) return alert("사용하실 닉네임을 입력해 주세요! 🥸");
        if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 작성해 주세요!");

        setIsSubmitting(true);

        // 닉네임 기억해두기 (다음번에 또 안 써도 되게!)
        localStorage.setItem("aparty_nickname", nickname.trim());

        const postData = {
            action: "addPost", // 🚀 구글 스크립트에서 "기타(else)"로 처리되거나 "addPost"로 명시 가능
            id: Date.now().toString(),
            category,
            title,
            content: content.replace(/\n/g, "<br>"), // 줄바꿈 보존
            author: nickname.trim(),
            authorImage: session?.user?.image || "",
            date: new Date().toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }),
        };

        try {
            const response = await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors", // 구글 스크립트 특성상 no-cors 필수
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData),
            });

            alert("글이 성공적으로 등록되었습니다! ✨");
            router.push("/community"); // 등록 후 목록으로 이동
            router.refresh(); // 최신 데이터로 새로고침
        } catch (error) {
            console.error("등록 실패:", error);
            alert("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-10 pt-28 flex justify-center">
            <div className="w-full max-w-2xl">
                <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-[#FF5A00] font-bold mb-6 transition-colors">
                    <ChevronLeft size={20} /> 돌아가기
                </button>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-10">
                    <h1 className="text-2xl font-black text-[#4A403A] mb-8">새로운 소식 남기기</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* 닉네임 입력 (로그인한 사람만 쓸 수 있지만, 닉네임은 자유!) */}
                        <div>
                            <label className="text-[13px] font-black text-[#4A403A] mb-2 flex items-center gap-1.5">
                                <UserCircle size={16} className="text-[#FF5A00]" /> 커뮤니티 닉네임
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="사용하실 닉네임을 입력하세요 (최대 10자)"
                                maxLength={10}
                                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#FF5A00] outline-none text-[15px] font-bold transition-all"
                            />
                        </div>

                        {/* 카테고리 선택 */}
                        <div>
                            <label className="text-[13px] font-black text-[#4A403A] mb-2 block">카테고리</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                {["자유게시판", "가입인사", "분양질문", "임장후기"].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat)}
                                        className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${category === cat ? "bg-[#4A403A] text-white border-[#4A403A]" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 제목 입력 */}
                        <div>
                            <label className="text-[13px] font-black text-[#4A403A] mb-2 block">제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="제목을 입력해 주세요"
                                className="w-full px-5 py-3.5 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#FF5A00] outline-none text-[15px] font-bold transition-all"
                            />
                        </div>

                        {/* 내용 입력 */}
                        <div>
                            <label className="text-[13px] font-black text-[#4A403A] mb-2 block">내용</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="아파티 가족들과 나누고 싶은 이야기를 적어주세요!"
                                rows={8}
                                className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-[#FF5A00] outline-none text-[15px] font-medium transition-all resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#FF5A00] hover:bg-[#E04D00] text-white py-4 rounded-2xl font-black text-[16px] flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all disabled:bg-gray-200 disabled:shadow-none"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={18} /> 등록하기</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}