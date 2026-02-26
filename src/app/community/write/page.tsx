"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Loader2, LayoutGrid, UserCircle, Type, AlignLeft, Camera, X, Image as ImageIcon } from "lucide-react";

const COMMUNITY_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwqxyuadlck9eWmXjvDuSge30z2K0m4eCeTDzdeNNW5kE_krDc15zitAQMmwYLg8NUh/exec";

export default function WritePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [category, setCategory] = useState("자유게시판");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nickname, setNickname] = useState("");

    // 📸 사진 관련 상태
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [base64Image, setBase64Image] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedNickname = localStorage.getItem("aparty_nickname");
        if (savedNickname) setNickname(savedNickname);
    }, []);

    // 📸 사진 선택 핸들러
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // 파일 크기 제한 (GAS는 너무 크면 힘들어해요. 5MB 이하 추천)
            if (file.size > 5 * 1024 * 1024) {
                alert("사진 크기가 너무 커요! 5MB 이하의 사진을 올려주세요. 😉");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result); // 화면 미리보기용
                setBase64Image(result);  // 서버 전송용
            };
            reader.readAsDataURL(file);
        }
    };

    // 📸 사진 삭제 핸들러
    const removeImage = () => {
        setImagePreview(null);
        setBase64Image(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

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
            action: "addPost",
            id: Date.now().toString(),
            category,
            title,
            content: content.replace(/\n/g, "<br>"),
            author: nickname.trim(),
            authorImage: session.user?.image || "",
            date: new Date().toLocaleDateString("ko-KR", { year: 'numeric', month: '2-digit', day: '2-digit' }),
            image: base64Image // 🚀 [추가] 사진 문자열 전송
        };

        try {
            await fetch(COMMUNITY_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPost),
            });
            alert("글이 성공적으로 등록되었습니다! ✨");
            router.push("/community");
            router.refresh();
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
                                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF8C42] outline-none text-[13px] md:text-[14px] font-bold text-[#4A403A] bg-gray-50/50 appearance-none cursor-pointer"
                                >
                                    <option value="자유게시판">자유게시판</option>
                                    <option value="분양질문">분양/청약 질문</option>
                                    <option value="임장후기">임장 후기</option>
                                    <option value="임장후기">분양 현장소식</option>
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
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={10}
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#FF8C42] outline-none text-[13px] md:text-[14px] font-bold text-[#4A403A] bg-gray-50/50"
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
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-[#FF8C42] outline-none text-[14px] md:text-[15px] font-bold text-[#4A403A] bg-gray-50/50"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* 📸 사진 업로드 영역 */}
                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                            <Camera size={14} className="text-[#FF8C42]" /> 사진 첨부
                        </label>

                        <div className="flex items-start gap-4">
                            {/* 사진 선택 버튼 */}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#FF8C42] hover:text-[#FF8C42] hover:bg-orange-50/30 transition-all"
                            >
                                <Camera size={24} />
                                <span className="text-[11px] font-bold">사진 추가</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />

                            {/* 사진 미리보기 */}
                            {imagePreview && (
                                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 group">
                                    <img src={imagePreview} alt="미리보기" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-2 pl-1">* 현장 사진이나 임장 사진을 1장 올릴 수 있습니다.</p>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-500 mb-2 pl-1">
                            <AlignLeft size={14} className="text-[#FF8C42]" /> 내용
                        </label>
                        <textarea
                            placeholder="부동산과 관련된 자유로운 이야기를 남겨주세요."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-4 md:p-5 rounded-xl border border-gray-200 focus:border-[#FF8C42] outline-none text-[14px] md:text-[15px] text-[#4A403A] bg-gray-50/50 min-h-[220px] leading-relaxed"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end mt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !content.trim()}
                            className="px-8 py-2.5 md:py-3 rounded-xl font-black text-[13px] md:text-[14px] flex items-center gap-1.5 transition-all shadow-sm
                             disabled:bg-gray-200 disabled:text-gray-400 bg-[#FF5A00] hover:bg-[#E04D00] text-white"
                        >
                            {isSubmitting ? <><Loader2 size={14} className="animate-spin" /> 등록 중...</> : <><Send size={14} /> 등록</>}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}