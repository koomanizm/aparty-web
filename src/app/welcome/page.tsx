"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
    Camera,
    User as UserIcon,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export default function WelcomePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [nickname, setNickname] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [isChecking, setIsChecking] = useState(false);
    const [nicknameStatus, setNicknameStatus] = useState<
        "none" | "available" | "duplicate" | "invalid"
    >("none");
    const [statusMsg, setStatusMsg] = useState("");

    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                router.push("/");
                return;
            }

            setUser(session.user);

            const { data } = await supabase
                .from("profiles")
                .select("nickname, avatar_url")
                .eq("id", session.user.id)
                .single();

            if (data) {
                if (
                    data.nickname &&
                    data.nickname !== "Guest" &&
                    data.nickname.trim() !== ""
                ) {
                    router.push("/");
                } else {
                    setNickname("");
                    setAvatarUrl(data.avatar_url);
                }
            }
        };

        checkUser();
    }, [router]);

    const checkNicknameAvailability = async () => {
        const trimmedNickname = nickname.trim();

        if (trimmedNickname.length < 2) {
            setNicknameStatus("invalid");
            setStatusMsg("닉네임은 최소 2글자 이상이어야 합니다.");
            return;
        }

        if (trimmedNickname.toLowerCase() === "guest") {
            setNicknameStatus("invalid");
            setStatusMsg("'Guest'는 사용할 수 없는 이름입니다.");
            return;
        }

        setIsChecking(true);

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("nickname")
                .eq("nickname", trimmedNickname)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setNicknameStatus("duplicate");
                setStatusMsg("이미 누군가 사용 중인 닉네임입니다. 🥲");
            } else {
                setNicknameStatus("available");
                setStatusMsg("사용 가능한 멋진 닉네임입니다! ✨");
            }
        } catch (error) {
            console.error(error);
            setStatusMsg("검사 중 오류가 발생했습니다.");
        } finally {
            setIsChecking(false);
        }
    };

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0 || !user) return;

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const filePath = `${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (nicknameStatus !== "available") {
            alert("닉네임 중복 확인을 먼저 완료해주세요!");
            return;
        }

        if (!agreePrivacy) {
            alert("회원가입을 위해 개인정보 수집·이용 동의가 필요합니다.");
            return;
        }

        if (!user) {
            alert("로그인 정보가 확인되지 않았습니다. 다시 시도해주세요.");
            return;
        }

        try {
            setUploading(true);

            const now = new Date().toISOString();

            const { error: profileError } = await supabase.from("profiles").upsert({
                id: user.id,
                nickname: nickname.trim(),
                avatar_url: avatarUrl,
                last_nickname_update: now,
            });

            if (profileError) {
                console.error("DB 작업 에러:", profileError);
                throw profileError;
            }

            const currentMeta = user.user_metadata || {};

            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    ...currentMeta,
                    privacy_consent: true,
                    privacy_consent_at: now,
                    marketing_consent: agreeMarketing,
                    marketing_consent_at: agreeMarketing ? now : null,
                    signup_completed: true,
                },
            });

            if (authError) {
                console.error("Auth 메타데이터 저장 에러:", authError);
                throw authError;
            }

            alert("아파티에 오신 것을 환영합니다! 🎉");
            window.location.href = "/";
        } catch (error: any) {
            console.error("전체 에러 상세:", error);
            alert("저장 실패: " + (error.message || "알 수 없는 에러"));
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <Loader2 className="animate-spin text-[#FF8C42]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-5 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40%] bg-gradient-to-b from-[#FF8C42]/10 to-transparent blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative z-10 text-center">
                <h1 className="text-2xl font-black text-[#4A403A] mb-2">
                    아파티에 오신 것을 환영합니다!
                </h1>
                <p className="text-[13px] font-bold text-gray-400 mb-8 break-keep">
                    아파티에서 사용할 멋진 닉네임과
                    <br />
                    프로필 사진을 설정해 주세요.
                </p>

                <div className="relative inline-block mb-8">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="프로필 사진"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserIcon size={48} className="text-gray-300" />
                        )}
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute bottom-0 right-0 w-9 h-9 bg-[#FF8C42] rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm hover:bg-[#E07A30] transition-colors disabled:opacity-50"
                    >
                        {uploading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Camera size={16} />
                        )}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={uploadAvatar}
                        accept="image/*"
                        className="hidden"
                    />
                </div>

                <div className="mb-6 text-left">
                    <label className="block text-[12px] font-bold text-gray-500 mb-2 ml-1">
                        나만의 닉네임
                    </label>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setNicknameStatus("none");
                            }}
                            placeholder="예: 부동산고수아빠"
                            className="flex-1 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] font-bold text-[#4A403A] outline-none focus:border-[#FF8C42] focus:bg-white transition-all placeholder:text-gray-300"
                        />

                        <button
                            onClick={checkNicknameAvailability}
                            disabled={isChecking || nickname.trim().length === 0}
                            className="px-5 py-4 bg-[#4A403A] text-white text-[13px] font-bold rounded-2xl hover:bg-black disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                            {isChecking ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "중복 확인"
                            )}
                        </button>
                    </div>

                    {nicknameStatus !== "none" && (
                        <div
                            className={`flex items-center gap-1 mt-2 ml-1 text-[12px] font-bold ${nicknameStatus === "available"
                                    ? "text-green-600"
                                    : "text-red-500"
                                }`}
                        >
                            {nicknameStatus === "available" ? (
                                <CheckCircle2 size={14} />
                            ) : (
                                <AlertCircle size={14} />
                            )}
                            {statusMsg}
                        </div>
                    )}
                </div>

                <div className="mb-8 text-left rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreePrivacy}
                            onChange={(e) => setAgreePrivacy(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42]"
                        />
                        <div className="flex-1">
                            <p className="text-[13px] font-bold text-[#4A403A]">
                                [필수] 회원가입을 위한 개인정보 수집·이용에 동의합니다.
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                수집 항목: 이메일, 닉네임, 프로필 사진
                                <br />
                                이용 목적: 회원 식별, 로그인 연동, 서비스 제공, 포인트 운영,
                                관심 단지 알림, 부정 이용 방지
                                <br />
                                보유기간: 회원 탈퇴 시까지
                                <br />
                                동의 거부 시 회원가입 및 서비스 이용이 제한될 수 있습니다.
                            </p>
                        </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeMarketing}
                            onChange={(e) => setAgreeMarketing(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#FF8C42] focus:ring-[#FF8C42]"
                        />
                        <div className="flex-1">
                            <p className="text-[13px] font-bold text-[#4A403A]">
                                [선택] 이벤트 및 혜택 등 마케팅 정보 수신에 동의합니다.
                            </p>
                            <p className="mt-1 text-[11px] leading-5 text-gray-500">
                                수집 항목: 이메일, 휴대전화번호(입력 시)
                                <br />
                                이용 목적: 이벤트, 혜택, 신규 서비스 안내
                                <br />
                                보유기간: 동의 철회 시까지
                            </p>
                        </div>
                    </label>

                    <p className="text-[11px] leading-5 text-gray-500">
                        자세한 내용은
                        <Link
                            href="/terms"
                            className="mx-1 underline underline-offset-2 hover:text-[#4A403A]"
                        >
                            이용약관
                        </Link>
                        및
                        <Link
                            href="/privacy"
                            className="mx-1 underline underline-offset-2 hover:text-[#4A403A]"
                        >
                            개인정보처리방침
                        </Link>
                        에서 확인하실 수 있습니다.
                    </p>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={nicknameStatus !== "available" || uploading || !agreePrivacy}
                    className="w-full bg-[#FF8C42] text-white font-black py-4 rounded-2xl hover:bg-[#E07A30] transition-all shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[15px]"
                >
                    아파티 시작하기
                </button>
            </div>
        </main>
    );
}
