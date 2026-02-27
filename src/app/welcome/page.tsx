"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Camera, User as UserIcon, Loader2 } from "lucide-react";

export default function WelcomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. 로그인 확인 및 기존 정보 불러오기
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/"); // 비로그인 유저는 쫓아냅니다
                return;
            }

            setUser(session.user);

            // DB에서 현재 프로필 가져오기
            const { data, error } = await supabase
                .from('profiles')
                .select('nickname, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (data) {
                // 이미 설정이 끝난 유저(Guest가 아닌 사람)는 메인으로 쫓아냅니다
                if (data.nickname !== 'Guest') {
                    router.push("/");
                } else {
                    // Guest라면 현재 껍데기 정보를 세팅해둡니다
                    setNickname(""); // 입력하라고 비워둠
                    setAvatarUrl(data.avatar_url);
                }
            }
        };
        checkUser();
    }, [router]);

    // 2. 프로필 사진 업로드 함수 (Storage에 저장)
    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("이미지를 선택해야 합니다.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            // 파일 이름을 랜덤하게 만들어서 충돌 방지 (유저ID + 시간 + 확장자)
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            // 🚀 방금 만든 'avatars' 창고에 사진 올리기!
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 방금 올린 사진의 '진짜 공개 주소'를 가져오기
            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요!");
            return;
        }

        try {
            setUploading(true);

            // 🚀 저장 시도
            const { error, count } = await supabase
                .from('profiles')
                .update({
                    nickname: nickname,
                    avatar_url: avatarUrl,
                    last_nickname_update: new Date().toISOString()
                })
                .eq('id', user.id)
                .select(); // 👈 select()를 붙이면 실제로 수정된 데이터를 다시 가져옵니다.

            if (error) {
                console.error("수정 실패 상세:", error);
                throw error;
            }

            // 🚀 만약 수정된 데이터가 없다면? (ID가 안 맞거나 권한 문제)
            if (!nickname) {
                alert("프로필을 찾을 수 없거나 수정 권한이 없습니다.");
                return;
            }

            alert("프로필 설정 완료! 아파티에 오신 것을 환영합니다 🎉");

            // 🚀 저장 성공을 확인했으니 이제 메인으로!
            window.location.href = "/";

        } catch (error: any) {
            console.error("전체 에러:", error);
            alert("저장 실패: " + (error.message || "알 수 없는 에러"));
        } finally {
            setUploading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin text-[#FF8C42]" /></div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-5 relative overflow-hidden">
            {/* 장식용 배경 요소 */}
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-b from-[#FF8C42]/10 to-transparent blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative z-10 text-center">
                <h1 className="text-2xl font-black text-[#4A403A] mb-2">아파티에 오신 것을 환영합니다!</h1>
                <p className="text-[13px] font-bold text-gray-400 mb-8 break-keep">
                    아파티에서 사용할 멋진 닉네임과<br />프로필 사진을 설정해 주세요.
                </p>

                {/* 프로필 사진 설정 영역 */}
                <div className="relative inline-block mb-8">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="프로필 사진" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={48} className="text-gray-300" />
                        )}
                    </div>

                    {/* 사진 업로드 버튼 */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 w-9 h-9 bg-[#FF8C42] rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm hover:bg-[#E07A30] transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    {/* 실제 파일 선택 창 (숨김 처리) */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={uploadAvatar}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                {/* 닉네임 입력 영역 */}
                <div className="mb-8 text-left">
                    <label className="block text-[12px] font-bold text-gray-500 mb-2 ml-1">나만의 닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="예: 부동산고수아빠"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] font-bold text-[#4A403A] outline-none focus:border-[#FF8C42] focus:bg-white transition-all placeholder:text-gray-300"
                    />
                </div>

                {/* 저장 버튼 */}
                <button
                    onClick={handleSaveProfile}
                    disabled={!nickname.trim() || uploading}
                    className="w-full bg-[#4A403A] text-white font-black py-4 rounded-2xl hover:bg-[#322a26] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
                >
                    아파티 시작하기
                </button>
            </div>
        </main>
    );
}