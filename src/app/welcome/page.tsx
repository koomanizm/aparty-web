"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Camera, User as UserIcon, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function WelcomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // 🚀 [중복 검사 상태값 추가]
    const [isChecking, setIsChecking] = useState(false);
    const [nicknameStatus, setNicknameStatus] = useState<'none' | 'available' | 'duplicate' | 'invalid'>('none');
    const [statusMsg, setStatusMsg] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. 로그인 확인 및 기존 정보 불러오기
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }

            setUser(session.user);

            const { data, error } = await supabase
                .from('profiles')
                .select('nickname, avatar_url')
                .eq('id', session.user.id)
                .single();

            if (data) {
                // 이미 설정이 끝난 유저는 메인으로 (무한 루프 방지 조건 강화)
                if (data.nickname && data.nickname !== 'Guest' && data.nickname.trim() !== "") {
                    router.push("/");
                } else {
                    setNickname("");
                    setAvatarUrl(data.avatar_url);
                }
            }
        };
        checkUser();
    }, [router]);

    // 🚀 [닉네임 중복 검사 함수]
    const checkNicknameAvailability = async () => {
        const trimmedNickname = nickname.trim();
        if (trimmedNickname.length < 2) {
            setNicknameStatus('invalid');
            setStatusMsg("닉네임은 최소 2글자 이상이어야 합니다.");
            return;
        }

        if (trimmedNickname.toLowerCase() === 'guest') {
            setNicknameStatus('invalid');
            setStatusMsg("'Guest'는 사용할 수 없는 이름입니다.");
            return;
        }

        setIsChecking(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('nickname')
                .eq('nickname', trimmedNickname)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setNicknameStatus('duplicate');
                setStatusMsg("이미 누군가 사용 중인 닉네임입니다. 🥲");
            } else {
                setNicknameStatus('available');
                setStatusMsg("사용 가능한 멋진 닉네임입니다! ✨");
            }
        } catch (error) {
            console.error(error);
            setStatusMsg("검사 중 오류가 발생했습니다.");
        } finally {
            setIsChecking(false);
        }
    };

    // 2. 프로필 사진 업로드 함수
    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    // 3. 프로필 저장 함수
    const handleSaveProfile = async () => {
        if (nicknameStatus !== 'available') {
            alert("닉네임 중복 확인을 먼저 완료해주세요!");
            return;
        }

        try {
            setUploading(true);

            // 🚀 update 대신 upsert를 사용하면 데이터가 없을 때 새로 만들어줍니다!
            const { data, error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id, // 필수: 누구의 데이터인지 명시
                    nickname: nickname.trim(),
                    avatar_url: avatarUrl,
                    last_nickname_update: new Date().toISOString()
                })
                .select();

            if (error) {
                console.error("DB 작업 에러:", error);
                throw error;
            }

            alert("아파티에 오신 것을 환영합니다! 🎉");
            window.location.href = "/"; // 🚀 성공 후 강제 새로고침 이동

        } catch (error: any) {
            console.error("전체 에러 상세:", error);
            alert("저장 실패: " + (error.message || "알 수 없는 에러"));
        } finally {
            setUploading(false);
        }
    };
    if (!user) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin text-[#FF8C42]" /></div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-5 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-b from-[#FF8C42]/10 to-transparent blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative z-10 text-center">
                <h1 className="text-2xl font-black text-[#4A403A] mb-2">아파티에 오신 것을 환영합니다!</h1>
                <p className="text-[13px] font-bold text-gray-400 mb-8 break-keep">
                    아파티에서 사용할 멋진 닉네임과<br />프로필 사진을 설정해 주세요.
                </p>

                {/* 프로필 사진 설정 */}
                <div className="relative inline-block mb-8">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="프로필 사진" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={48} className="text-gray-300" />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 w-9 h-9 bg-[#FF8C42] rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm hover:bg-[#E07A30] transition-colors disabled:opacity-50"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={uploadAvatar} accept="image/*" className="hidden" />
                </div>

                {/* 닉네임 입력 및 중복 체크 */}
                <div className="mb-8 text-left">
                    <label className="block text-[12px] font-bold text-gray-500 mb-2 ml-1">나만의 닉네임</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setNicknameStatus('none'); // 입력 시 다시 체크하도록 초기화
                            }}
                            placeholder="예: 부동산고수아빠"
                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] font-bold text-[#4A403A] outline-none focus:border-[#FF8C42] focus:bg-white transition-all placeholder:text-gray-300"
                        />
                        <button
                            onClick={checkNicknameAvailability}
                            disabled={isChecking || nickname.trim().length === 0}
                            className="px-5 py-4 bg-[#4A403A] text-white text-[13px] font-bold rounded-2xl hover:bg-black disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {isChecking ? <Loader2 size={16} className="animate-spin" /> : "중복 확인"}
                        </button>
                    </div>

                    {/* 상태 메시지 */}
                    {nicknameStatus !== 'none' && (
                        <div className={`flex items-center gap-1 mt-2 ml-1 text-[12px] font-bold ${nicknameStatus === 'available' ? 'text-green-600' : 'text-red-500'}`}>
                            {nicknameStatus === 'available' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {statusMsg}
                        </div>
                    )}
                </div>

                {/* 저장 버튼 (중복 확인 통과 시에만 활성화) */}
                <button
                    onClick={handleSaveProfile}
                    disabled={nicknameStatus !== 'available' || uploading}
                    className="w-full bg-[#FF8C42] text-white font-black py-4 rounded-2xl hover:bg-[#E07A30] transition-all shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[15px]"
                >
                    아파티 시작하기
                </button>
            </div>
        </main>
    );
}