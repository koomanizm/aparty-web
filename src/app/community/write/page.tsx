"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Loader2, LayoutGrid, UserCircle, Type, AlignLeft } from "lucide-react";

// 🚨 여기에 앱스 스크립트 웹 앱 URL을 꼭 넣어주세요!
const COMMUNITY_SCRIPT_URL = "https://script.google.com/macros/s/여기에_복사한_주소를_붙여넣으세요/exec";

export default function WritePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [category, setCategory] = useState("자유게시판");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nickname, setNickname] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem("aparty_nickname");
        if (savedNickname) setNickname(savedNickname);
    }, []);

    if (status === "loading") {
        return <div className="min-h-screen flex items-center justify-center text-gray-400 font-bold">신분증 확인 중... 🕵️‍♂️</div>;
    }

    if (!session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
                <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-sm border border-gray-100 text-center max-w-sm w-full border-t-[4px] border-t-[#FF8C42]">
                    <div className="w-14 h-14 bg-orange-50 text-[#FF8C42] rounded-full flex items-center justify-center mx-auto mb-5 text-xl">🔒</div>
                    <h2 className="text-lg font-black text-[#4A403A] mb-2">로그인이 필요합니다</h2>
                    <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">커뮤니티에 글을 작성하시려면<br />카카오 로그인을 진행해 주세요.</p>
                    <button onClick={() => router.push("/")} className="w-full bg-[#4A403A] text-white font-bold py-3.5 rounded-xl hover:bg-black transition-colors text-[14px]">
                        메인으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) return alert("사용하실 닉네임을 입력해 주세요! 🥸");
        if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 입력해 주세요!");

        setIsSubmitting(true);
        localStorage.setItem("aparty_nickname", nickname.trim());

        const newPost = {
            id: Date.now().toString(),
            category,
            title,
            content: content.replace(/\n/g, "<br>"),
            author: nickname.trim(),
            authorImage: session.user?.image || "",
            date: new Date().toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }),
        };

        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            });
            router.push("/community");
        } catch (error) {
            alert("등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fdfbf7] to-[#f4f0ea] p-4 md:p-8 flex justify-center pb-32">
            <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 border-t-[5px] border-t-[#FF8C42] p-6 md:p-8">

                {/* 헤더 */}
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-100/60">
                    <button onClick={() => router.back()} className="flex items-center text-gray-400 hover:text-[#FF8C42] font-bold transition-colors">
                        <ChevronLeft size={18} /> <span className="text-[13px] md:text-[14px]">뒤로가기</span>
                    </button>
                    <h1 className="text-[17px] md:text-[19px] font-black text-[#4A403A]">새 글 쓰기 ✨</h1>
                    <div className="w-16"></div>
                </div>

                {/* 폼 영역 */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                                <LayoutGrid size={14} className="text-[#FF8C42]" /> 카테고리
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF8C42] focus:ring-4 focus:ring-orange-50/50 outline-none text-[13px] md:text-[14px] font-bold text-[#4A403A] bg-gray-50/50 hover:bg-gray-50 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="자유게시판">자유게시판</option>
                                    <option value="가입인사">가입인사</option>
                                    <option value="분양질문">분양/청약 질문</option>
                                    <option value="임장후기">임장 후기</option>
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronLeft size={14} className="-rotate-90" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                                <UserCircle size={15} className="text-[#FF8C42]" /> 작성자 닉네임
                            </label>
                            <input
                                type="text"
                                placeholder="닉네임 (최대 10자)"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={10}
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF8C42] focus:ring-4 focus:ring-orange-50/50 outline-none text-[13px] md:text-[14px] font-bold text-[#4A403A] bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-300"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                            <Type size={14} className="text-[#FF8C42]" /> 제목
                        </label>
                        <input
                            type="text"
                            placeholder="게시글 제목을 입력해 주세요."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#FF8C42] focus:ring-4 focus:ring-orange-50/50 outline-none text-[14px] md:text-[15px] font-bold text-[#4A403A] bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all placeholder:font-medium placeholder:text-gray-300"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                            <AlignLeft size={14} className="text-[#FF8C42]" /> 내용
                        </label>
                        <textarea
                            placeholder="분양, 청약, 부동산과 관련된 자유로운 이야기를 남겨주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-4 md:p-5 rounded-xl border border-gray-200 focus:border-[#FF8C42] focus:ring-4 focus:ring-orange-50/50 outline-none text-[14px] md:text-[15px] text-[#4A403A] bg-gray-50/50 hover:bg-gray-50 focus:bg-white transition-all resize-none min-h-[220px] md:min-h-[260px] leading-relaxed placeholder:font-medium placeholder:text-gray-300"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 🚀 4. 작고 세련된 우측 정렬 (반투명 제거, 회색 -> 쨍한 오렌지 변신!) */}
                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                            // 💡 글 쓰기 전(disabled): 단단한 회색 / 글 쓴 후: 엄청 쨍한 퓨어 오렌지(#FF5A00)
                            className="px-8 py-2.5 md:py-3 rounded-xl font-black text-[13px] md:text-[14px] flex items-center gap-1.5 transition-all shadow-sm
              disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
              bg-[#FF5A00] hover:bg-[#E04D00] text-white hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> 등록 중...</> : <><Send size={14} /> 등록</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}