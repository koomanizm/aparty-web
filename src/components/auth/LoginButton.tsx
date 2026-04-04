"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import LoginModal from "@/components/auth/LoginModal";
import {
    User, LogOut, ChevronDown, Coins,
    CreditCard, LayoutDashboard, ArrowRight, Bell, Loader2
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface LoginButtonProps {
    compact?: boolean;
}

export default function LoginButton({ compact = false }: LoginButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const [loading, setLoading] = useState(true);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const fetchProfileAndNotifications = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profileData } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('is_read', false);

            setUser(session.user);
            setProfile(profileData);
            setUnreadCount(count || 0);
        } else {
            setUser(null);
            setProfile(null);
            setUnreadCount(0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfileAndNotifications();

        const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === "SIGNED_IN") {
                fetchProfileAndNotifications();
                if (window.location.hash.includes("access_token")) {
                    window.history.replaceState(null, "", window.location.pathname);
                }
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
                setUnreadCount(0);
                setLoading(false);
            }
        });

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isMenuOpen && user) {
            fetchProfileAndNotifications();
        }
    }, [isMenuOpen, user]);

    const handleLogout = async () => {
        if (confirm("로그아웃 하시겠습니까?")) {
            await supabase.auth.signOut();
            window.location.href = "/";
        }
    };

    const isNewUser = user && (!profile || profile.nickname === 'Guest' || !profile.nickname);

    useEffect(() => {
        if (!loading && isNewUser && pathname !== "/welcome") {
            router.push("/welcome");
        }
    }, [isNewUser, pathname, router, loading]);

    if (loading) {
        return <div className="w-9 h-9 md:w-28 md:h-10 bg-gray-50 rounded-full animate-pulse" />;
    }

    if (!user) {
        return (
            <>
                {compact ? (
                    <button onClick={() => setIsOpen(true)} className="relative block active:scale-95 transition-transform">
                        <div className="w-9 h-9 rounded-full border border-gray-200 shadow-sm flex items-center justify-center bg-white text-gray-400 hover:text-[#172554] hover:border-blue-200 transition-colors">
                            <User size={18} />
                        </div>
                    </button>
                ) : (
                    <button onClick={() => setIsOpen(true)} className="group relative flex items-center justify-center bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 p-1 pr-3.5 md:pl-4 md:pr-1.5 md:py-1.5 gap-2 md:gap-0">
                        <div className="md:hidden w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 shrink-0 group-hover:bg-[#172554] transition-colors">
                            <User size={13} className="text-[#172554] group-hover:text-white transition-colors" />
                        </div>
                        <span className="md:hidden text-[12px] font-black text-[#4A403A] tracking-tight group-hover:text-[#172554] transition-colors">로그인</span>
                        <div className="hidden md:flex flex-col items-start text-left mr-3">
                            <span className="text-[13px] font-extrabold text-[#4A403A] group-hover:text-[#172554] tracking-tighter leading-none mb-0.5 transition-colors duration-300">아파티 시작하기</span>
                            <span className="text-[9px] font-medium text-gray-400 group-hover:text-[#172554]/70 tracking-tight leading-none transition-colors duration-300">로그인 / 회원가입</span>
                        </div>
                        <div className="hidden md:flex w-7 h-7 md:w-8 md:h-8 bg-blue-50/80 group-hover:bg-[#172554] rounded-full items-center justify-center transition-all duration-300 shrink-0">
                            <ArrowRight size={14} className="text-[#172554] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                        </div>
                    </button>
                )}
                <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </>
        );
    }

    if (isNewUser) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full border border-blue-100">
                <Loader2 size={14} className="animate-spin text-[#172554]" />
                <span className="text-[12px] font-bold text-[#172554]">프로필 확인 중</span>
            </div>
        );
    }

    return (
        <div className="relative z-50" ref={dropdownRef}>
            {compact ? (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="relative block active:scale-95 transition-transform">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 shadow-sm hover:border-blue-300 flex items-center justify-center bg-blue-50">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="P" className="w-full h-full object-cover" />
                        ) : (
                            <User size={16} className="text-[#172554]" />
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                    )}
                </button>
            ) : (
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-center bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-blue-200 transition-all group active:scale-90 w-auto h-auto p-1 pr-3 md:pl-1.5 md:pr-4 md:py-1.5 rounded-full gap-2 md:gap-3 relative">
                    <div className="relative w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt="P" className="w-full h-full object-cover" /> : <User size={14} className="text-[#172554]" />}
                    </div>
                    <div className="flex flex-col items-start text-left leading-tight">
                        <span className="hidden md:block text-[9px] font-bold text-gray-400 mb-0.5">안녕하세요!</span>
                        <div className="flex items-baseline">
                            <span className="text-[12px] md:text-[13px] font-black text-[#172554] tracking-tight">{profile?.nickname}</span>
                            <span className="hidden md:inline text-[12px] font-bold text-[#4A403A] ml-0.5">님</span>
                        </div>
                    </div>
                    <ChevronDown size={14} className="hidden md:block ml-0.5 text-gray-300 group-hover:text-gray-400 transition-all" />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white shadow-sm z-10"></div>
                    )}
                </button>
            )}

            {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-[24px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-[#fdfbf7] p-5 border-b border-gray-50">
                        {unreadCount > 0 ? (
                            <Link href="/notifications" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-1.5 mb-3 bg-red-50 text-red-500 px-3 py-1.5 rounded-lg w-fit hover:bg-red-100 transition-colors cursor-pointer group">
                                <Bell size={12} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black">{unreadCount}개의 새로운 소식!</span>
                            </Link>
                        ) : (
                            <Link href="/notifications" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-1.5 mb-3 text-gray-400 hover:text-[#172554] transition-colors cursor-pointer">
                                <Bell size={12} />
                                <span className="text-[10px] font-bold">새로운 소식 확인</span>
                            </Link>
                        )}
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-gray-400">보유 포인트</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins size={18} className="text-[#172554]" />
                            <span className="text-lg md:text-xl font-black text-[#4A403A]">{profile?.points?.toLocaleString() || 0} P</span>
                        </div>
                    </div>

                    <div className="p-2.5">
                        <Link href="/mypage" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-[#172554] transition-all group">
                            <User size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">마이페이지</span>
                        </Link>
                        <Link href="/mypage/activity" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-[#172554] transition-all group">
                            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">내 활동 내역</span>
                        </Link>
                        <Link href="/point" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-[#172554] transition-all group">
                            <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">포인트 관리</span>
                        </Link>
                        <div className="h-[1px] bg-gray-50 my-2 mx-2"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all group">
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-[13px] font-bold">로그아웃</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}