"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// 🚀 Coins 아이콘 추가 (이미 import 되어 있을 수도 있지만 확인!)
import {
    ChevronLeft, Edit3, Gift, Ticket, Bell, ChevronRight,
    CheckCircle2, LogOut, User as UserIcon, MessageSquare, Heart, Camera, Loader2, Coins
} from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState("");
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

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            const file = e.target.files?.[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            alert("프로필 사진이 변경되었습니다!");
            fetchProfile(user.id);

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
        <main className="min-h-screen bg-[#f8f9fa] pb-32 text-left">
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
                {/* 1. 프로필 카드 */}
                <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                        <label className="relative w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-orange-100 text-[#FF8C42] cursor-pointer group">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserIcon size={32} />
                            )}
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                {isUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
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

                {/* 🚀 2. 내 자산 (포인트) 영역 - 깔끔한 텍스트 & 산뜻한 컬러 */}
                <div className="bg-white rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-6 border border-orange-100 relative overflow-hidden">
                    {/* 배경 꾸밈: 은은한 장식 */}
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-50 rounded-full opacity-50 pointer-events-none"></div>

                    <div className="relative z-10 text-left">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] font-black text-orange-400 uppercase tracking-wider">My Points</p>
                            <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
                                <Coins size={16} className="text-[#FF8C42]" />
                            </div>
                        </div>

                        {/* 포인트 숫자 클릭 시 이동 */}
                        <Link href="/point" className="inline-flex items-baseline gap-1 mb-6 group">
                            <span className="text-3xl font-black text-[#4A403A] group-hover:text-[#FF8C42] transition-colors tracking-tight">
                                {profile.points?.toLocaleString() || 0}
                            </span>
                            <span className="text-[16px] font-bold text-[#4A403A]/40">P</span>
                            <ChevronRight size={18} className="text-gray-300 ml-1 group-hover:translate-x-1 transition-all" />
                        </Link>

                        {/* 하단 버튼 그룹: 이모티콘 제거 및 컬러 수정 */}
                        <div className="flex gap-2.5">
                            <Link href="/point" className="flex-1 bg-[#FF8C42] text-white py-3.5 rounded-2xl font-black text-[13px] hover:bg-[#FF5A00] transition-all flex items-center justify-center shadow-sm shadow-orange-100 active:scale-95">
                                포인트 적립
                            </Link>
                            {/* 리워드 샵: 칙칙한 색 대신 산뜻한 블루그레이/인디고 계열로 변경 */}
                            <Link href="/point/shop" className="flex-1 bg-[#5C7CFA] text-white py-3.5 rounded-2xl font-black text-[13px] hover:bg-[#4263eb] transition-all flex items-center justify-center shadow-sm shadow-blue-100 active:scale-95">
                                리워드 샵
                            </Link>
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
                        <h3 className="text-[13px] font-black text-left">서비스 설정</h3>
                    </div>
                    <ul className="divide-y divide-gray-50 text-gray-700 text-left">
                        {/* 🚀 여기를 Link로 감싸서 연결합니다! */}
                        <Link href="/mypage/activity" className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3">
                                <Ticket size={18} className="text-gray-400" />
                                <span className="text-[14px] font-bold">내 활동 상세 내역</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-200" />
                        </Link>

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