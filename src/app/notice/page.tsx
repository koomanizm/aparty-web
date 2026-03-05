"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase"; // 🚀 구글 시트 대신 Supabase 임포트
import { ChevronLeft, Calendar, Megaphone, Plus, Minus, Clock } from "lucide-react";
import Link from "next/link";
import LoginButton from "../../components/LoginButton";

// 🚀 [신규 추가] 구글 시트 타입 대신 로컬 타입 정의 (UI 에러 방지용)
type Notice = {
    id: string;
    title: string;
    content: string;
    date: string;
};

// 시간을 "N분 전", "N시간 전"으로 변환해주는 함수 (기존 100% 유지)
function formatTimeAgo(dateString: string) {
    try {
        const now = new Date();
        const noticeDate = new Date(dateString);

        if (isNaN(noticeDate.getTime())) return dateString;

        const diffInSeconds = Math.floor((now.getTime() - noticeDate.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;

        return dateString;
    } catch (e) {
        return dateString;
    }
}

export default function NoticePage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);

    // 🚀 [수정됨] 구글 시트 대신 Supabase에서 공지사항을 불러옵니다.
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const { data, error } = await supabase
                    .from('notices')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Supabase 데이터를 기존 UI가 이해하는 형태로 변환 (id, title, content, date)
                const formattedData: Notice[] = data?.map(n => ({
                    id: String(n.id),
                    title: n.title,
                    content: n.content || "상세 내용이 없습니다.",
                    date: n.created_at // formatTimeAgo 함수가 ISO 날짜를 알아서 변환해줌
                })) || [];

                setNotices(formattedData);
            } catch (error) {
                console.error("공지사항 불러오기 실패:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    const toggleNotice = (id: string) => {
        setOpenId(openId === id ? null : id);
    };

    // 👇 아래 UI 코드는 대표님이 짜신 원본 그대로 100% 동일합니다! 👇
    return (
        <main className="min-h-screen bg-[#f8f9fa] selection:bg-orange-100">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
                    <Link href="/" className="group flex items-center gap-1.5 text-gray-900">
                        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                        <span className="font-bold text-xs tracking-tight">홈으로</span>
                    </Link>

                    <div className="flex items-center justify-end w-10">
                        <div className="-mr-2">
                            <LoginButton compact />
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-5 pt-10 pb-20">
                <header className="mb-10 text-left">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                            <Megaphone size={16} className="text-white" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter">
                            공지사항
                        </h1>
                    </div>
                    <p className="text-[12px] font-medium text-gray-400">아파티의 최신 소식을 실시간으로 전해드립니다.</p>
                </header>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-14 bg-white rounded-xl animate-pulse border border-gray-50" />
                        ))}
                    </div>
                ) : notices.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden text-left">
                        <div className="divide-y divide-gray-50">
                            {notices.map((notice, idx) => {
                                const safeId = notice.id || `notice-${idx}`;
                                const isOpen = openId === safeId;

                                return (
                                    <div key={safeId} className={`transition-colors ${isOpen ? "bg-orange-50/20" : "hover:bg-gray-50/50"}`}>
                                        <button
                                            onClick={() => toggleNotice(safeId)}
                                            className="w-full py-4.5 px-5 flex items-center justify-between text-left group"
                                        >
                                            <div className="flex-1 pr-4 overflow-hidden">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                                        Update
                                                    </span>
                                                    <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} className="text-gray-300" /> {formatTimeAgo(notice.date)}
                                                    </span>
                                                </div>
                                                <h2 className={`text-[14px] md:text-[15px] font-bold tracking-tight transition-colors truncate ${isOpen ? "text-[#4a403a]" : "text-gray-700"}`}>
                                                    {notice.title}
                                                </h2>
                                            </div>
                                            <div className={`shrink-0 transition-transform duration-300 ${isOpen ? "text-orange-500 rotate-180" : "text-gray-300"}`}>
                                                <Plus size={18} strokeWidth={2.5} />
                                            </div>
                                        </button>

                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                                            <div className="px-5 pb-6 pt-1">
                                                <div className="text-[13.5px] md:text-[14.5px] text-gray-500 leading-relaxed whitespace-pre-wrap font-medium border-t border-gray-50 pt-5">
                                                    {notice.content}
                                                </div>
                                                <div className="mt-6 text-[11px] text-gray-300 flex items-center gap-1">
                                                    <Calendar size={10} /> 등록일: {new Date(notice.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-[13px] text-gray-300 font-bold">새로운 소식을 준비하고 있습니다.</p>
                    </div>
                )}
            </div>

            <footer className="text-center pb-12 opacity-30">
                <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-400 font-sans">© Aparty Information Center</p>
            </footer>
        </main>
    );
}