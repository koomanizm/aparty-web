"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import {
    ChevronLeft, MessageSquare, MessageCircle, Star,
    Coins, Clock, ChevronRight, LayoutGrid, Loader2, Info
} from "lucide-react";
import Link from "next/link";

type ActivityItem = {
    id: string;
    type: 'post' | 'comment' | 'review' | 'point';
    title: string;
    content?: string;
    date: string;
    amount?: number; // 포인트용
    link: string;
};

export default function ActivityDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'post' | 'comment' | 'review' | 'point'>('all');
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchAllActivities = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }

            const userId = session.user.id;

            // 🚀 4가지 데이터를 동시에 가져오기 (성능 최적화)
            const [posts, comments, reviews, points] = await Promise.all([
                supabase.from('posts').select('id, title, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('comments').select('id, content, post_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('property_reviews').select('id, content, property_id, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
                supabase.from('point_logs').select('id, reason, amount, created_at').eq('user_id', userId).order('created_at', { ascending: false })
            ]);

            // 데이터 통합 및 가공
            const combined: ActivityItem[] = [
                ...(posts.data?.map(p => ({
                    id: p.id, type: 'post' as const, title: p.title,
                    date: p.created_at, link: `/community/${p.id}`
                })) || []),
                ...(comments.data?.map(c => ({
                    id: c.id, type: 'comment' as const, title: "댓글을 남겼습니다",
                    content: c.content.replace(/<br>/g, " "), date: c.created_at, link: `/community/${c.post_id}`
                })) || []),
                ...(reviews.data?.map(r => ({
                    id: r.id, type: 'review' as const, title: "현장 리뷰를 작성했습니다",
                    content: r.content.replace(/<br>/g, " "), date: r.created_at, link: `/property/${r.property_id}`
                })) || []),
                ...(points.data?.map(p => ({
                    id: p.id, type: 'point' as const,
                    title: p.reason === 'attendance' ? '출석 체크 적립' : p.reason === 'quiz' ? '퀴즈 정답 보너스' : p.reason === 'post' ? '게시글 작성 혜택' : p.reason === 'comment' ? '댓글 작성 혜택' : '리뷰 작성 혜택',
                    amount: p.amount, date: p.created_at, link: '/point'
                })) || [])
            ];

            // 전체 날짜순 정렬
            setActivities(combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setIsLoading(false);
        };

        fetchAllActivities();
    }, [router]);

    // 탭 필터링 로직
    const filteredActivities = activeTab === 'all'
        ? activities
        : activities.filter(a => a.type === activeTab);

    if (isLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfbf7]">
            <Loader2 className="animate-spin text-[#FF8C42] mb-4" size={32} />
            <p className="text-gray-400 font-bold">기록을 불러오고 있어요...</p>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-20 text-left">
            {/* 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-900 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                <h1 className="text-[15px] font-black text-[#4A403A]">내 활동 내역</h1>
                <div className="w-6"></div>
            </nav>

            {/* 상단 탭 메뉴 (가로 스크롤 가능) */}
            <div className="sticky top-14 z-40 bg-white border-b border-gray-50 flex overflow-x-auto scrollbar-hide px-4 py-2 gap-2">
                {[
                    { id: 'all', label: '전체' },
                    { id: 'post', label: '글' },
                    { id: 'comment', label: '댓글' },
                    { id: 'review', label: '리뷰' },
                    { id: 'point', label: '포인트' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all ${activeTab === tab.id ? 'bg-[#4A403A] text-white shadow-md' : 'bg-gray-100 text-gray-400'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="max-w-2xl mx-auto px-5 py-6">
                {filteredActivities.length > 0 ? (
                    <div className="space-y-4">
                        {filteredActivities.map((item) => (
                            <Link key={item.id} href={item.link}>
                                <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md active:scale-[0.98] transition-all mb-3 flex items-start gap-4">
                                    {/* 아이콘 영역 */}
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${item.type === 'post' ? 'bg-orange-50 text-orange-500' :
                                            item.type === 'comment' ? 'bg-blue-50 text-blue-500' :
                                                item.type === 'review' ? 'bg-purple-50 text-purple-500' :
                                                    'bg-emerald-50 text-emerald-500'
                                        }`}>
                                        {item.type === 'post' && <MessageSquare size={18} />}
                                        {item.type === 'comment' && <MessageCircle size={18} />}
                                        {item.type === 'review' && <Star size={18} />}
                                        {item.type === 'point' && <Coins size={18} />}
                                    </div>

                                    {/* 텍스트 영역 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-[14px] font-black text-[#4A403A] truncate pr-2">{item.title}</h3>
                                            {item.amount && (
                                                <span className="text-[13px] font-black text-emerald-500 shrink-0">+{item.amount}P</span>
                                            )}
                                        </div>
                                        {item.content && (
                                            <p className="text-[12px] text-gray-500 line-clamp-1 mb-2 leading-relaxed font-medium">
                                                {item.content}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-300 font-bold">
                                            <Clock size={12} />
                                            {new Date(item.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-200 self-center" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-32 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-200">
                            <Info size={32} />
                        </div>
                        <p className="text-gray-400 font-bold text-[14px]">아직 기록이 없어요!</p>
                        <p className="text-gray-300 text-[12px] mt-1">아파티에서 첫 활동을 시작해보세요.</p>
                    </div>
                )}
            </div>
        </main>
    );
}