"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Gift, Ticket, Bell, ChevronRight, CheckCircle2, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function MyPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [newNickname, setNewNickname] = useState("");

    // 1. 프로필 정보 불러오기
    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (data) {
            setProfile(data);
            setNewNickname(data.nickname);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchProfile(session.user.id);
            } else {
                window.location.href = "/"; // 로그인 안됐으면 메인으로
            }
        });
    }, []);

    // 2. 닉네임 변경 함수 (월 1회 제한 로직 포함)
    const handleUpdateNickname = async () => {
        if (!newNickname || newNickname === profile.nickname) {
            setIsEditing(false);
            return;
        }

        // 월 1회 제한 체크
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
            .update({
                nickname: newNickname,
                last_nickname_update: new Date().toISOString()
            })
            .eq('id', user.id);

        if (error) {
            alert("변경 중 오류가 발생했습니다.");
        } else {
            alert("닉네임이 변경되었습니다!");
            setIsEditing(false);
            fetchProfile(user.id); // 변경된 정보 다시 불러오기
        }
    };

    // 3. 로그아웃 함수
    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
    };

    if (!profile) return <div className="p-10 text-center font-bold">로딩 중...</div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-32">
            {/* 네비게이션 */}
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
                {/* 1. 프로필 영역 */}
                <div className="bg-white rounded-[28px] p-6 shadow-sm border border-gray-100 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border-2 border-orange-100 text-[#FF8C42]">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            {isEditing ? (
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                        className="border-b-2 border-[#FF8C42] outline-none text-[18px] font-black w-32"
                                        autoFocus
                                    />
                                    <button onClick={handleUpdateNickname} className="text-[10px] text-blue-500 font-bold text-left text-orange-500 underline">저장하기</button>
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
                            <span className="text-3xl font-black text-white">{profile.points?.toLocaleString()}</span>
                            <span className="text-[14px] font-bold text-[#FF8C42] mb-1">P</span>
                        </div>
                        <div className="flex gap-2 text-white">
                            <button className="flex-1 bg-[#FF8C42] py-3 rounded-xl font-bold text-[13px] hover:bg-[#E07A30]">포인트 적립</button>
                            <button className="flex-1 bg-white/10 py-3 rounded-xl font-bold text-[13px] hover:bg-white/20">리워드 샵</button>
                        </div>
                    </div>
                </div>

                {/* 3. 활동 메뉴 */}
                <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center gap-2 text-[#4A403A]">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <h3 className="text-[13px] font-black">서비스 설정</h3>
                    </div>
                    <ul className="divide-y divide-gray-50 text-gray-700">
                        <li className="flex items-center justify-between p-5 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Ticket size={18} className="text-gray-400" />
                                <span className="text-[14px] font-bold">내 활동 내역</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-200" />
                        </li>
                        <li onClick={handleLogout} className="flex items-center justify-between p-5 hover:bg-red-50 cursor-pointer text-red-400">
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