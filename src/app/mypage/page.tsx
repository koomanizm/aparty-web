"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 🚀 Camera, Loader2(로딩용) 아이콘 추가
import {
    ChevronLeft, Edit3, Gift, Ticket, Bell, ChevronRight,
    CheckCircle2, LogOut, User as UserIcon, MessageSquare, Heart, Camera, Loader2
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState("");

    // 🚀 [추가됨] 사진 업로드 중 로딩 상태
    const [isUploading, setIsUploading] = useState(false);

    const [postCount, setPostCount] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (data) {
            setProfile(data);
            setNewNickname(data.nickname);
        }

        const { count: pCount } = await supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        setPostCount(pCount || 0);

        const { count: lCount } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        setLikeCount(lCount || 0);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                window.location.href = "/";
            }
        });
    }, []);

    // 🚀 [추가됨] 프로필 사진 업로드 함수
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            // 1. 파일 이름 만들기 (중복 방지를 위해 랜덤 문자열 추가)
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;

            // 2. 수파베이스 'avatars' 창고에 사진 업로드
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 3. 방금 올린 사진의 공개 URL(링크) 가져오기
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            // 4. 내 프로필(profiles) 정보에 새 사진 링크 업데이트
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            alert("프로필 사진이 변경되었습니다!");
            fetchProfile(user.id); // 화면 새로고침해서 새 프사 보여주기

        } catch (error) {
            console.error("사진 업로드 에러:", error);
            alert("사진 업로드에 실패했습니다. (창고 권한을 확인해주세요!)");
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdateNickname = async () => {
        if (!newNickname || newNickname === profile.nickname) {
            setIsEditing(false);
            return;
        }

        if (profile.last_nickname_update) {
            const lastUpdate = new Date(profile.last_nickname_update);
            const now = new Date();
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

            if (lastUpdate > oneMonthAgo) {
                alert("닉네임은 월 1회만 변경 가능합니다.");
                setIsEditing(false);
                return;
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ nickname: newNickname, last_nickname_update: new Date().toISOString() })
            .eq('id', user.id);

        if (error) {
            alert("변경 중 오류가 발생했습니다.");
        } else {
            alert("닉네임이 변경되었습니다!");
            setIsEditing(false);
            fetchProfile(user.id);
        }
    };

    const handleLogout = async () => {
        if (confirm("로그아웃 하시겠습니까?")) {
            await supabase.auth.signOut();
            window.location.href = "/";
        }
    };

    if (!profile) return <div className="p-10 text-center font-bold text-[#FF8C42] animate-pulse">데이터를 불러오는 중...</div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-1.5 text-gray-900">
                        <ChevronLeft size={18} />
                        <span className="font-bold text-xs">뒤로가기</span>
                    </Link>
                    <span className="text-[11px] font-black text-gray-800 uppercase tracking-widest">My Page</span>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-5 pt-8">
                <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">

                        {/* 🚀 [수정됨] 프사를 클릭하면 파일 선택창이 열리도록 변경 */}
                        <label className="relative w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-orange-100 text-[#FF8C42] cursor-pointer group">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserIcon size={32} />
                            )}

                            {/* 업로드 중일 때는 빙글빙글 로딩 / 평소엔 마우스 올리면 카메라 아이콘 표시 */}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
                            </div>

                            {/* 실제 기능하는 파일 입력창 (화면에서는 숨김) */}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarUpload}
                                disabled={isUploading}
                            />
                        </label>

                        <div>
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        className="border-b-2 border-[#FF8C42] outline-none text-[18px] font-black w-32 bg-transparent"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateNickname} className="text-[10px] font-bold text-left text-orange-500 underline">저장하기</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-[18px] font-black text-[#4A403A]">{profile.nickname}</h2>
                                        <span className="bg-orange-50 text-[#FF8C42] text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase">Member</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-300">아파티와 함께하는 중</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button onClick={() => setIsEditing(!isEditing)} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#FF8C42] transition-colors">
                        <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mb-1">
                            <Edit3 size={14} />
                        </div>
                        <span className="text-[9px] font-bold">변경</span>
                    </button>
                </div>

                {/* 2. 내 자산 (포인트) 영역 */}
                <div className="bg-gradient-to-br from-[#4A403A] to-[#2d2521] rounded-[28px] p-6 shadow-md mb-6 relative overflow-hidden text-white">
                    <div className="relative z-10">
                        <p className="text-[12px] font-bold text-white/50 mb-1">보유 포인트</p>
                        <div className="flex items-end gap-1 mb-5">
                            <span className="text-3xl font-black text-white">{profile.points?.toLocaleString() || 0}</span>
                            <span className="text-[14px] font-bold text-[#FF8C42] mb-1">P</span>
                        </div>
                        <div className="flex gap-2 text-white">
                            <button className="flex-1 bg-[#FF8C42] py-3 rounded-xl font-bold text-[13px] hover:bg-[#E07A30] transition-colors">포인트 적립</button>
                            <button className="flex-1 bg-white/10 py-3 rounded-xl font-bold text-[13px] hover:bg-white/20 transition-colors">리워드 샵</button>
                        </div>
                    </div>
                </div>

                {/* 3. 활동 내역 요약 영역 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link href="/mypage/posts" className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-orange-200 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <MessageSquare size={18} />
                        </div>
                        <span className="text-[12px] font-bold text-gray-500">내 게시글</span>
                        <span className="text-xl font-black text-[#4A403A]">{postCount}<span className="text-[12px] font-bold text-gray-400 ml-0.5">개</span></span>
                    </Link>
                    <Link href="/mypage/likes" className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-orange-200 hover:shadow-md transition-all group">
                        <div className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Heart size={18} />
                        </div>
                        <span className="text-[12px] font-bold text-gray-500">관심 매물</span>
                        <span className="text-xl font-black text-[#4A403A]">{likeCount}<span className="text-[12px] font-bold text-gray-400 ml-0.5">개</span></span>
                    </Link>
                </div>

                {/* 4. 서비스 설정 메뉴 */}
                <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center gap-2 text-[#4A403A]">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <h3 className="text-[13px] font-black">서비스 설정</h3>
                    </div>
                    <ul className="divide-y divide-gray-50 text-gray-700">
                        <li className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Ticket size={18} className="text-gray-400" />
                                <span className="text-[14px] font-bold">내 활동 상세 내역</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-200" />
                        </li>
                        <li onClick={handleLogout} className="flex items-center justify-between p-5 hover:bg-red-50 cursor-pointer text-red-400 transition-colors">
                            <div className="flex items-center gap-3">
                                <LogOut size={18} />
                                <span className="text-[14px] font-bold">로그아웃</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}