"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Gift, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function WelcomePopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [nickname, setNickname] = useState("");

    useEffect(() => {
        const checkShowPopup = async () => {
            // 1. 이미 팝업을 껐던 유저인지 확인 (로컬 스토리지)
            const hidePopup = localStorage.getItem("hideKakaoWelcomePopup");
            if (hidePopup) return;

            // 2. 로그인한 유저인지 확인
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // 닉네임 가져오기 (더 친근하게 부르기 위해!)
                const { data } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single();
                if (data?.nickname) setNickname(data.nickname);

                // 로그인 직후 너무 확 뜨면 놀라니까 1.5초 뒤에 자연스럽게 띄움
                setTimeout(() => setIsOpen(true), 1500);
            }
        };
        checkShowPopup();
    }, []);

    const handleClose = () => {
        // '닫기' 누르면 브라우저에 "이 사람 팝업 껐음" 이라고 메모장(localStorage)에 적어둠
        localStorage.setItem("hideKakaoWelcomePopup", "true");
        setIsOpen(false);
    };

    const handleAddChannel = () => {
        // '채널 추가' 눌러도 다시 안 뜨게 메모해 둠
        localStorage.setItem("hideKakaoWelcomePopup", "true");
        setIsOpen(false);
        // 카카오톡 채널 링크로 새 창 띄우기!
        window.open("http://pf.kakao.com/_EbnAX/friend", "_blank");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
                {/* 우측 상단 X 버튼 */}
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white/50 rounded-full p-1 z-10 transition-colors">
                    <X size={20} />
                </button>

                {/* 상단 일러스트/색상 영역 */}
                <div className="bg-[#fdfbf7] pt-8 pb-6 px-6 text-center relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-orange-100 opacity-50"><Sparkles size={100} /></div>
                    <div className="w-16 h-16 bg-[#FEE500] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md z-10 relative">
                        <MessageCircle size={32} fill="#3c1e1e" className="text-[#3c1e1e]" />
                    </div>
                    <h2 className="text-xl font-black text-[#4A403A] mb-2 relative z-10">
                        환영합니다, {nickname || "고객"}님! 🎉
                    </h2>
                    <p className="text-[14px] text-gray-600 font-medium leading-relaxed">
                        아파티 카카오톡 채널을 추가하고<br />
                        <strong className="text-[#FF5A00]">시크릿 매물 정보</strong>와 혜택을 받아보세요!
                    </p>
                </div>

                {/* 하단 버튼 영역 */}
                <div className="p-6 bg-white flex flex-col gap-3">
                    <button
                        onClick={handleAddChannel}
                        className="w-full bg-[#FEE500] text-[#3c1e1e] py-3.5 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2 hover:bg-[#fdd835] transition-colors shadow-sm"
                    >
                        <MessageCircle size={18} fill="currentColor" />
                        카카오톡 채널 추가하기
                    </button>
                    <button
                        onClick={handleClose}
                        className="w-full py-3 text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors underline decoration-gray-300 underline-offset-4"
                    >
                        다음에 할게요
                    </button>
                </div>
            </div>
        </div>
    );
}