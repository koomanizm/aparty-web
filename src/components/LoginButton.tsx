"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import LoginModal from "./LoginModal";
import {
    User, LogOut, ChevronDown, Coins,
    CreditCard, LayoutDashboard, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function LoginButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(session.user);
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();
            setProfile(data);
        } else {
            setUser(null);
            setProfile(null);
        }
    };

    useEffect(() => {
        fetchProfile();

        // 인증 상태가 변경될 때 프로필 갱신
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN") {
                fetchProfile();
                if (window.location.hash.includes("access_token")) {
                    window.history.replaceState(null, "", window.location.pathname);
                }
            } else if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
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

    // 🚀 [추가됨] 드롭다운 메뉴가 열릴 때마다 최신 포인트를 다시 불러옴
    useEffect(() => {
        if (isMenuOpen && user) {
            fetchProfile();
        }
    }, [isMenuOpen]);

    const handleLogout = async () => {
        if (confirm("로그아웃 하시겠습니까?")) {
            await supabase.auth.signOut();
            window.location.href = "/";
        }
    };

    if (!user || !profile) {
        return (
            <>
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative flex items-center justify-center bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 p-1 pr-3.5 md:pl-4 md:pr-1.5 md:py-1.5 gap-2 md:gap-0"
                >
                    <div className="md:hidden w-7 h-7 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 shrink-0 group-hover:bg-[#FF5A00] transition-colors">
                        <User size={13} className="text-[#FF5A00] group-hover:text-white transition-colors" />
                    </div>
                    <span className="md:hidden text-[12px] font-black text-[#4A403A] tracking-tight group-hover:text-[#FF5A00] transition-colors">
                        로그인
                    </span>

                    <div className="hidden md:flex flex-col items-start text-left mr-3">
                        <span className="text-[13px] font-extrabold text-[#4A403A] group-hover:text-[#FF5A00] tracking-tighter leading-none mb-0.5 transition-colors duration-300">
                            아파티 시작하기
                        </span>
                        <span className="text-[9px] font-medium text-gray-400 group-hover:text-[#FF5A00]/70 tracking-tight leading-none transition-colors duration-300">
                            로그인 / 회원가입
                        </span>
                    </div>

                    <div className="hidden md:flex w-7 h-7 md:w-8 md:h-8 bg-orange-50/80 group-hover:bg-[#FF5A00] rounded-full items-center justify-center transition-all duration-300 shrink-0">
                        <ArrowRight size={14} className="text-[#FF5A00] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300" />
                    </div>
                </button>
                <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            </>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-orange-200 transition-all group active:scale-90 w-auto h-auto p-1 pr-3 md:pl-1.5 md:pr-4 md:py-1.5 rounded-full gap-2 md:gap-3"
            >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full overflow-hidden bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="P" className="w-full h-full object-cover" />
                    ) : (
                        <User size={14} className="text-[#FF5A00]" />
                    )}
                </div>

                <div className="flex flex-col items-start text-left leading-tight">
                    <span className="hidden md:block text-[9px] font-bold text-gray-400 mb-0.5">안녕하세요!</span>
                    <div className="flex items-baseline">
                        <span className="text-[12px] md:text-[13px] font-black text-[#FF5A00] tracking-tight">{profile.nickname}</span>
                        <span className="hidden md:inline text-[12px] font-bold text-[#4A403A] ml-0.5">님</span>
                    </div>
                </div>

                <ChevronDown size={14} className="hidden md:block ml-0.5 text-gray-300 group-hover:text-gray-400 transition-all" />
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-[24px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">

                    <div className="bg-[#fdfbf7] p-5 border-b border-gray-50">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-gray-400">보유 포인트</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins size={18} className="text-[#FF5A00]" />
                            {/* 🚀 [수정됨] profile.point -> profile.points 로 변경 */}
                            <span className="text-lg md:text-xl font-black text-[#4A403A]">{profile.points?.toLocaleString() || 0} P</span>
                        </div>
                    </div>

                    <div className="p-2.5">
                        <div className="md:hidden px-3.5 pt-2 pb-4 border-b border-gray-50 mb-2">
                            <span className="text-[16px] font-black text-[#FF5A00] tracking-tighter">
                                {profile.nickname}
                            </span>
                            <span className="text-[14px] font-bold text-[#4A403A] ml-0.5">님</span>
                        </div>

                        <Link
                            href="/mypage"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-[#FF5A00] transition-all group"
                        >
                            <User size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">마이페이지</span>
                        </Link>

                        {/* components/LoginButton.tsx 메뉴 부분 */}

                        <Link
                            href="/mypage/activity" // 🚀 경로 확인!
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-[#FF5A00] transition-all group"
                        >
                            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">내 활동 내역</span>
                        </Link>

                        <Link
                            href="/point"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-orange-50 text-gray-600 hover:text-[#FF5A00] transition-all group"
                        >
                            <CreditCard size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-bold">포인트 관리</span>
                        </Link>

                        <div className="h-[1px] bg-gray-50 my-2 mx-2"></div>

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all group"
                        >
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            <span className="text-[13px] font-bold">로그아웃</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}