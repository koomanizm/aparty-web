"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { ChevronLeft, Bell, MessageSquare, Heart, Info, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push("/");
                return;
            }
            setUser(session.user);

            // 내 알림만 최신순으로 가져오기
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setNotifications(data);
            }
            setIsLoading(false);
        };

        fetchNotifications();
    }, [router]);

    // 알림 클릭 시: 읽음 처리 후 해당 글로 이동
    const handleNotificationClick = async (notif: any) => {
        if (!notif.is_read) {
            await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
        }
        if (notif.post_id) {
            router.push(`/community/${notif.post_id}`);
        }
    };

    // 모두 읽음 처리
    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-[#FF8C42]" /></div>;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-20 text-left selection:bg-orange-100">
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-900 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                <h1 className="text-[15px] font-black text-[#4A403A]">새로운 소식</h1>
                <div className="w-6"></div>
            </nav>

            <div className="max-w-2xl mx-auto px-5 pt-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-black text-[#4A403A] flex items-center gap-2">
                        알림 <span className="text-[#FF8C42] bg-orange-50 px-2.5 py-0.5 rounded-full text-[13px]">{unreadCount}</span>
                    </h2>
                    {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} className="text-[11px] font-bold text-gray-400 hover:text-[#4A403A] flex items-center gap-1 transition-colors">
                            <CheckCircle2 size={12} /> 모두 읽음
                        </button>
                    )}
                </div>

                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-4 md:p-5 rounded-[24px] border cursor-pointer transition-all active:scale-[0.98] flex gap-4 items-start ${notif.is_read ? 'bg-transparent border-transparent opacity-60 hover:bg-white' : 'bg-white border-orange-100 shadow-[0_4px_20px_rgba(255,140,66,0.08)]'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'comment' ? 'bg-orange-50 text-[#FF8C42]' : 'bg-red-50 text-red-500'}`}>
                                    {notif.type === 'comment' ? <MessageSquare size={18} /> : <Heart size={18} />}
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5 text-left">
                                    <p className={`text-[13px] md:text-[14px] leading-relaxed mb-1 ${notif.is_read ? 'text-gray-500 font-medium' : 'text-[#4A403A] font-bold'}`}>
                                        {notif.content}
                                    </p>
                                    <span className="text-[10px] md:text-[11px] font-bold text-gray-300">
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#FF8C42] shrink-0 mt-2 shadow-[0_0_8px_rgba(255,140,66,0.5)]"></div>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                            <Bell size={32} />
                        </div>
                        <p className="text-gray-400 font-bold text-[14px]">아직 도착한 소식이 없어요!</p>
                    </div>
                )}
            </div>
        </main>
    );
}