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
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    className="group relative flex items-center justify-center border border-[#4A403A]/10 bg-white hover:bg-[#FF5A00] hover:border-[#FF5A00] rounded-full transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-90
                    w-10 h-10 md:w-auto md:h-auto md:px-6 md:py-2.5"
                >
                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex flex-col items-start leading-tight text-left">
                            <span className="text-[14px] font-black text-[#4A403A] group-hover:text-white transition-colors duration-300 tracking-tighter">시작하기</span>
                            <span className="text-[10px] font-medium text-gray-400 group-hover:text-white/70 transition-colors duration-300">로그인/가입</span>
                        </div>
                        <ArrowRight size={18} className="text-[#FF5A00] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300 shrink-0" />
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
                className="flex items-center justify-center bg-white border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-orange-200 transition-all group active:scale-90
                w-10 h-10 rounded-full p-0 md:w-auto md:h-auto md:pl-1.5 md:pr-4 md:py-1.5 md:rounded-full md:gap-3"
            >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                    {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt="P" className="w-full h-full object-cover" />
                    ) : (
                        <User size={16} className="text-[#FF5A00]" />
                    )}
                </div>

                <div className="hidden md:flex flex-col items-start text-left leading-tight">
                    <span className="text-[9px] font-bold text-gray-400 mb-0.5">안녕하세요!</span>
                    <div className="flex items-baseline">
                        <span className="text-[13px] font-black text-[#FF5A00] tracking-tight">{profile.nickname}</span>
                        <span className="text-[12px] font-bold text-[#4A403A] ml-0.5">님</span>
                    </div>
                </div>

                <ChevronDown size={14} className="hidden md:block ml-0.5 text-gray-300 group-hover:text-gray-400 transition-all" />
            </button>

            {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 md:w-60 bg-white rounded-[24px] shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* 🚀 상단 포인트 섹션 (PC/모바일 공통 레이아웃, VIP 삭제) */}
                    <div className="bg-[#fdfbf7] p-5 border-b border-gray-50">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-gray-400">보유 포인트</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Coins size={18} className="text-[#FF5A00]" />
                            <span className="text-lg md:text-xl font-black text-[#4A403A]">{profile.point?.toLocaleString() || 0} P</span>
                        </div>
                    </div>

                    {/* 하단 메뉴 섹션 */}
                    <div className="p-2.5">
                        {/* 🚀 모바일 전용: 메뉴 박스 최상단에 닉네임 배치 */}
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

                        <Link
                            href="/mypage/activity"
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