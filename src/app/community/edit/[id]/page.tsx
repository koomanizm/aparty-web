"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../lib/supabase";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, Loader2, Camera, X, MessageSquare, Pencil } from "lucide-react"; // 🚀 아이콘 추가

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();

    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 📝 폼 상태 관리
    const [category, setCategory] = useState("자유게시판");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // 📸 이미지 상태 관리 (기존 사진 vs 새로 추가할 사진)
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchPostData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("로그인이 필요합니다.");
                router.push("/");
                return;
            }
            setUser(session.user);

            try {
                // 1. 기존 게시글 정보 불러오기
                const { data: post, error } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;

                // 2. 권한 체크 (내 글이 맞는지)
                if (post.user_id !== session.user.id) {
                    alert("수정 권한이 없습니다.");
                    router.back();
                    return;
                }

                // 3. 데이터 세팅
                setCategory(post.category || "자유게시판");
                setTitle(post.title || "");
                // <br>을 다시 줄바꿈(\n)으로 되돌려서 텍스트창에 예쁘게 나오게 함
                setContent((post.content || "").replace(/<br>/g, "\n"));

                // 이미지 배열 정규화
                const images = (Array.isArray(post.image_data)
                    ? post.image_data
                    : post.image_data ? [post.image_data] : [])
                    .filter((img: string) => typeof img === 'string' && img.trim() !== "");

                setExistingImages(images);

            } catch (error) {
                console.error(error);
                alert("게시글을 불러오는 데 실패했습니다.");
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) fetchPostData();
    }, [params.id]);

    // 📸 새로운 사진 선택 (합쳐서 최대 5장)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImagesCount = existingImages.length + newFiles.length + files.length;

        if (totalImagesCount > 5) {
            alert("사진은 최대 5장까지만 올릴 수 있어요! 📸");
            return;
        }

        setNewFiles([...newFiles, ...files]);
        const previews = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews([...newImagePreviews, ...previews]);
    };

    // 🗑️ 기존 사진 삭제
    const removeExistingImage = (index: number) => {
        setExistingImages(existingImages.filter((_, i) => i !== index));
    };

    // 🗑️ 새로 추가한 사진 삭제
    const removeNewImage = (index: number) => {
        setNewFiles(newFiles.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    // 💾 수정 완료 (저장)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return alert("제목과 내용을 입력해 주세요!");

        setIsSubmitting(true);

        try {
            const newlyUploadedUrls = [];

            // 1. 새로 추가한 사진들만 수파베이스 창고에 업로드
            for (const file of newFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('community').upload(fileName, file);

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage.from('community').getPublicUrl(fileName);
                    newlyUploadedUrls.push(publicUrl);
                }
            }

            // 2. 살아남은 기존 사진 + 새로 올린 사진 URL 합치기
            const finalImageUrls = [...existingImages, ...newlyUploadedUrls];

            // 3. DB 업데이트 (줄바꿈을 다시 <br>로)
            const { error } = await supabase.from('posts').update({
                category,
                title,
                content: content.replace(/\n/g, "<br>"),
                image_data: finalImageUrls
            }).eq('id', params.id);

            if (error) throw error;

            alert("글이 성공적으로 수정되었습니다! ✨");
            router.push(`/community/${params.id}`); // 수정된 글로 돌아가기
        } catch (error) {
            console.error(error);
            alert("수정에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-[#FF8C42]" size={32} /></div>;

    return (
        <div className="min-h-screen bg-[#fdfbf7] p-4 md:p-8 flex justify-center pb-32 text-left selection:bg-orange-100">
            <div className="w-full max-w-2xl bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 border-t-[5px] border-t-[#FF8C42]">
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-gray-50">
                    <button onClick={() => router.back()} className="text-gray-400 font-bold flex items-center gap-1 active:scale-95 transition-transform"><ChevronLeft size={18} /> 취소</button>
                    {/* 🚀 타이틀 디자인 통일 */}
                    <div className="flex items-center gap-2">
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                            <Pencil size={16} className="text-white" />
                        </div>
                        <h1 className="text-[17px] font-black text-[#4A403A]">게시글 수정</h1>
                    </div>
                    <div className="w-16"></div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[12px] font-bold text-gray-500 mb-2 block">카테고리</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3.5 rounded-xl border border-gray-200 outline-none font-bold text-[14px] bg-gray-50/50 focus:border-orange-300 transition-colors">
                                <option value="자유게시판">자유게시판</option>
                                <option value="분양질문">분양/청약 질문</option>
                                <option value="임장후기">임장 후기</option>
                                <option value="현장소식">분양 현장소식</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">제목</label>
                        {/* 🚀 인풋 스타일 오렌지로 통일 */}
                        <input type="text" placeholder="제목을 입력해 주세요." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 outline-none font-bold bg-gray-50/50 focus:bg-white focus:border-orange-400 transition-all placeholder:text-gray-300" />
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">사진 첨부 (총 {existingImages.length + newFiles.length}/5)</label>
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide items-center">
                            {/* 🚀 추가 버튼 스타일 오렌지로 통일 */}
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 shrink-0 hover:bg-orange-50/50 hover:border-orange-200 transition-colors">
                                <Camera size={24} />
                                <span className="text-[10px] font-bold">추가</span>
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" multiple />

                            {/* 기존에 올렸던 사진들 (배지 오렌지로 통일) */}
                            {existingImages.map((src, index) => (
                                <div key={`old-${index}`} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-gray-100 shrink-0 shadow-sm">
                                    <div className="absolute top-0 left-0 bg-gray-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-10 border border-white/20">기존</div>
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center z-10 hover:bg-red-500 transition-colors"><X size={12} /></button>
                                </div>
                            ))}

                            {/* 방금 새로 고른 사진들 (아파티 오렌지 배지) */}
                            {newImagePreviews.map((src, index) => (
                                <div key={`new-${index}`} className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-orange-100 shrink-0 shadow-sm">
                                    <div className="absolute top-0 left-0 bg-[#FF8C42] text-white text-[9px] font-black px-1.5 py-0.5 rounded-br-lg z-10 border border-white/20">NEW</div>
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center z-10 hover:bg-red-500 transition-colors"><X size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[12px] font-bold text-gray-500 mb-2 block">내용</label>
                        {/* 🚀 텍스트에어리어 스타일 오렌지로 통일 */}
                        <textarea placeholder="부동산 이야기를 남겨주세요." value={content} onChange={(e) => setContent(e.target.value)} className="w-full p-4 md:p-5 rounded-xl border border-gray-200 outline-none min-h-[300px] leading-relaxed bg-gray-50/50 focus:bg-white focus:border-orange-400 transition-all placeholder:text-gray-300" />
                    </div>

                    {/* 🚀 메인 버튼 스타일 오렌지로 통일 */}
                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#FF5A00] text-white rounded-xl font-black shadow-[0_6px_20px_rgba(255,90,0,0.2)] disabled:bg-gray-300 hover:bg-[#E04D00] hover:shadow-lg transition-all active:scale-[0.98] mt-4">
                        {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "수정 완료 ✨"}
                    </button>
                </form>
            </div>
        </div>
    );
}