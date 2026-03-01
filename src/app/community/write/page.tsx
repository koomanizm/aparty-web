"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../lib/supabase";
import { useRouter } from "next/navigation";
import { ChevronLeft, Send, Loader2, LayoutGrid, UserCircle, Type, AlignLeft, Camera, X } from "lucide-react";

export default function WritePage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [category, setCategory] = useState("자유게시판");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [nickname, setNickname] = useState("");

    // 🚀 [핵심 수정] 사진 여러 장을 위한 상태 (파일 배열 & 미리보기 URL 배열)
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profileData) {
                    setProfile(profileData);
                    setNickname(profileData.nickname || "");
                }
                setStatus("authenticated");
            } else {
                setStatus("unauthenticated");
            }
        };
        checkAuth();
    }, []);

    // 📸 사진 선택 핸들러 (최대 5장)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedFiles.length + files.length > 5) {
            alert("사진은 최대 5장까지만 올릴 수 있어요! 📸");
            return;
        }

        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    // 📸 사진 삭제 핸들러
    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) return alert("닉네임을 먼저 설정해 주세요!");
        if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해 주세요!");

        setIsSubmitting(true);

        try {
            const uploadedUrls = [];

            // 🚀 1. 여러 장의 사진을 차례대로 업로드
            for (const file of selectedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('community').upload(fileName, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('community').getPublicUrl(fileName);
                    uploadedUrls.push(publicUrl);
                }
            }

            // 🚀 2. 사진 URL 배열(jsonb)과 글 저장
            const { error } = await supabase.from('posts').insert({
                user_id: user.id,
                category,
                title,
                content: content.replace(/\n/g, "<br>"),
                image_data: uploadedUrls // 이제 배열이 들어갑니다!
            });

            if (error) throw error;

            // 💰 포인트 지급 (10P)
            const { data: pData } = await supabase.from('profiles').select('points').eq('id', user.id).single();
            await Promise.all([
                supabase.from('point_logs').insert({ user_id: user.id, amount: 10, reason: 'post' }),
                supabase.from('profiles').update({ points: (pData?.points || 0) + 10 }).eq('id', user.id)
            ]);

            alert("글이 성공적으로 등록되었습니다! ✨ 💰 10P 적립 완료!");
            router.push("/community");
        } catch (error) {
            console.error(error);
            alert("등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center">로딩 중...</div>;

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-8 flex justify-center pb-32">
            <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 border-t-[5px] border-t-[#FF8C42]">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-50">
                    <button onClick={() => router.back()} className="text-gray-400 font-bold flex items-center gap-1"><ChevronLeft size={18} /> 뒤로가기</button>
                    <h1 className="text-[17px] font-black text-[#4A403A]">새 글 쓰기 ✨</h1>
                    <div className="w-16"></div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[12px] font-bold text-gray-500 mb-2 block">카테고리</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-200 outline-none font-bold text-[14px] bg-gray-50/50">
                                <option value="자유게시판">자유게시판</option>
                                <option value="분양질문">분양/청약 질문</option>
                                <option value="임장후기">임장 후기</option>
                                <option value="현장소식">분양 현장소식</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[12px] font-bold text-gray-500 mb-2 block">작성자</label>
                            <input type="text" value={nickname} className="w-full p-3.5 rounded-xl border border-gray-200 bg-gray-100 font-bold text-[14px]" disabled />
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">제목</label>
                        <input type="text" placeholder="제목을 입력해 주세요." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 outline-none font-bold bg-gray-50/50" />
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">사진 첨부 ({selectedFiles.length}/5)</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 shrink-0 hover:bg-orange-50/30">
                                <Camera size={24} />
                                <span className="text-[10px] font-bold">추가</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" multiple />

                            {imagePreviews.map((src, index) => (
                                <div key={index} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">내용</label>
                        <textarea placeholder="부동산 이야기를 남겨주세요." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 md:p-5 rounded-xl border border-gray-200 outline-none min-h-[200px] leading-relaxed bg-gray-50/50" />
                    </div>

                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#FF5A00] text-white rounded-xl font-black shadow-lg disabled:bg-gray-300">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "등록하기"}
                    </button>
                </form>
            </div>
        </div>
    );
}