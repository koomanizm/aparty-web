"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
    LayoutDashboard, Users, Coins, Activity,
    Search, LogOut, ShieldAlert, ArrowLeft, Settings, Trash2, History, X, Bell, Save, FileText, Megaphone, MessageCircle, Edit2
} from "lucide-react";
import Link from "next/link";

const ADMIN_EMAILS = ["koomani.job@gmail.com"];

export default function AdminDashboard() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const [activeTab, setActiveTab] = useState("dashboard");

    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        totalUsers: 0,
        todayVisitors: 24,
        totalPoints: 0,
    });

    const [isPointModalOpen, setIsPointModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [pointLogs, setPointLogs] = useState<any[]>([]);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isPostsLoading, setIsPostsLoading] = useState(false);

    // 🚀 [업그레이드] 공지사항 상태 관리
    const [adminNotices, setAdminNotices] = useState<any[]>([]); // 공지사항 리스트
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null); // 수정 모드 체크용
    const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

    useEffect(() => {
        checkAdminAuth();
    }, []);

    const checkAdminAuth = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.user?.email) {
                alert("로그인이 필요합니다."); router.replace("/"); return;
            }
            if (!ADMIN_EMAILS.includes(session.user.email)) {
                alert("관리자 권한이 없습니다."); router.replace("/"); return;
            }
            setIsAdmin(true);
            fetchAdminData();
            fetchAdminNotices(); // 🚀 렌더링 시 공지사항 목록도 불러오기
        } catch (error) {
            console.error("Auth check error:", error); router.replace("/");
        }
    };

    const fetchAdminData = async () => {
        try {
            const { data: profiles, error } = await supabase.from('profiles').select('*');
            if (error) throw error;

            if (profiles) {
                const sortedProfiles = profiles.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });

                setUsers(sortedProfiles);
                const totalPts = sortedProfiles.reduce((sum, user) => sum + (user.points || 0), 0);
                setStats({
                    totalUsers: sortedProfiles.length,
                    todayVisitors: Math.floor(Math.random() * 50) + 10,
                    totalPoints: totalPts,
                });
            }
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 🚀 [신규] 관리자용 공지사항 리스트 불러오기
    const fetchAdminNotices = async () => {
        try {
            const { data, error } = await supabase
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setAdminNotices(data || []);
        } catch (error) {
            console.error("공지사항 로딩 실패:", error);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "날짜 미상";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return "날짜 미상";
            return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        } catch {
            return "날짜 미상";
        }
    };

    const handleViewPoints = async (user: any) => {
        setSelectedUser(user); setIsPointModalOpen(true); setIsLogsLoading(true);
        try {
            const { data, error } = await supabase.from('point_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) throw error;
            setPointLogs(data || []);
        } catch (error) { setPointLogs([]); } finally { setIsLogsLoading(false); }
    };

    const handleAddPoints = async (userId: string, currentPoints: number) => {
        const amount = prompt(`현재 ${currentPoints}P 입니다.\n지급할 금액을 입력하세요 (차감 시 마이너스):`, "500");
        if (!amount || isNaN(Number(amount))) return;

        const numAmount = Number(amount); const newPoints = currentPoints + numAmount;

        const { error: profileError } = await supabase.from('profiles').update({ points: newPoints }).eq('id', userId);
        if (profileError) { alert("포인트 지급 실패!"); return; }

        await supabase.from('point_logs').insert([{ user_id: userId, amount: numAmount, reason: numAmount > 0 ? "관리자 수동 지급" : "관리자 수동 차감" }]);
        alert(`${numAmount}P 처리 완료!`); fetchAdminData();
    };

    const handleViewPosts = async (user: any) => {
        setSelectedUser(user); setIsPostModalOpen(true); setIsPostsLoading(true);
        try {
            const { data, error } = await supabase.from('posts').select('id, title, content, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
            if (error) throw error;
            setUserPosts(data || []);
        } catch (error) { setUserPosts([]); } finally { setIsPostsLoading(false); }
    };

    // 🚀 [업그레이드] 공지사항 등록 및 수정 통합 로직
    const handleSubmitNotice = async () => {
        if (!noticeTitle.trim()) { alert("공지사항 제목을 입력해주세요."); return; }
        setIsSubmittingNotice(true);
        try {
            if (editingNoticeId) {
                // 수정 모드
                const { error } = await supabase.from('notices')
                    .update({ title: noticeTitle, content: noticeContent })
                    .eq('id', editingNoticeId);
                if (error) throw error;
                alert("공지사항이 수정되었습니다.");
            } else {
                // 신규 등록 모드
                const { error } = await supabase.from('notices')
                    .insert([{ title: noticeTitle, content: noticeContent }]);
                if (error) throw error;
                alert("새 공지사항이 등록되었습니다.");
            }

            // 폼 초기화 및 목록 새로고침
            handleCancelEdit();
            fetchAdminNotices();
        } catch (error: any) {
            alert(`처리 실패: ${error.message}`);
        } finally {
            setIsSubmittingNotice(false);
        }
    };

    // 🚀 [신규] 공지사항 수정 세팅
    const handleEditNotice = (notice: any) => {
        setNoticeTitle(notice.title);
        setNoticeContent(notice.content || "");
        setEditingNoticeId(notice.id);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // 상단 폼으로 스크롤 이동
    };

    // 🚀 [신규] 공지사항 수정 취소
    const handleCancelEdit = () => {
        setNoticeTitle("");
        setNoticeContent("");
        setEditingNoticeId(null);
    };

    // 🚀 [신규] 공지사항 삭제
    const handleDeleteNotice = async (id: number) => {
        if (!confirm("정말 이 공지사항을 삭제하시겠습니까?\n(메인 화면과 공지사항 페이지에서도 즉시 사라집니다)")) return;

        try {
            const { error } = await supabase.from('notices').delete().eq('id', id);
            if (error) throw error;
            alert("삭제되었습니다.");

            // 만약 삭제하려는 글을 수정 중이었다면 폼도 초기화
            if (editingNoticeId === id) handleCancelEdit();

            fetchAdminNotices();
        } catch (error: any) {
            alert(`삭제 실패: ${error.message}`);
        }
    };

    const handleDeleteUser = (nickname: string) => {
        if (confirm(`정말 [${nickname}] 유저를 강제 탈퇴 처리하시겠습니까?\n(현재는 UI 데모입니다)`)) alert("탈퇴 처리되었습니다.");
    };

    const filteredUsers = users.filter(u =>
        (u.nickname || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] font-bold text-gray-500">관리자 인증 중... <ShieldAlert className="ml-2 animate-pulse" /></div>;
    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-[#f4f7f6] flex flex-col md:flex-row font-sans">

            <aside className="w-full md:w-64 bg-[#4A403A] text-white flex flex-col shrink-0 md:h-screen sticky top-0 z-10">
                <div className="p-6 border-b border-white/10 flex items-center justify-between md:block">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="text-[#FF8C42]" size={24} />
                        <h1 className="text-xl font-black tracking-tight">APARTY <span className="text-[#FF8C42] text-sm">ADMIN</span></h1>
                    </div>
                    <Link href="/" className="md:hidden text-white/50 hover:text-white"><LogOut size={20} /></Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 hidden md:block">
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-[#FF8C42] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><LayoutDashboard size={18} /> 대시보드</button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-[#FF8C42] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><Users size={18} /> 유저 관리</button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-[#FF8C42] text-white shadow-md' : 'text-white/60 hover:text-white hover:bg-white/5'}`}><Settings size={18} /> 시스템 설정</button>
                </nav>

                <div className="p-4 border-t border-white/10 hidden md:block">
                    <Link href="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white/60 hover:text-white bg-black/20 hover:bg-black/40 rounded-xl font-bold transition-all"><ArrowLeft size={16} /> 서비스로 돌아가기</Link>
                </div>
            </aside>

            <div className="flex-1 p-6 md:p-10 md:h-screen md:overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-[#2d2d2d] mb-1">
                            {activeTab === 'dashboard' && "대시보드 요약"}
                            {activeTab === 'users' && "유저 상세 관리"}
                            {activeTab === 'settings' && "시스템 환경 설정"}
                        </h2>
                        <p className="text-sm font-bold text-gray-400">
                            {activeTab === 'dashboard' && "아파티의 주요 지표와 공지사항을 관리하세요."}
                            {activeTab === 'users' && "유저 현황 및 포인트, 작성글 내역을 관리합니다."}
                            {activeTab === 'settings' && "서비스 전역 설정 및 알림 기능을 제어합니다."}
                        </p>
                    </div>
                </header>

                {/* ====================================================
                    1. 대시보드 탭 (지표 + 공지사항 작성 + 현황판)
                ==================================================== */}
                {activeTab === 'dashboard' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* 핵심 지표 */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
                            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-2">
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">총 가입 유저</span><div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center"><Users size={20} /></div></div>
                                <h3 className="text-3xl font-black text-[#2d2d2d]">{stats.totalUsers.toLocaleString()} <span className="text-base text-gray-400 font-bold">명</span></h3>
                            </div>
                            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-2">
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">오늘의 접속자 (추정)</span><div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><Activity size={20} /></div></div>
                                <h3 className="text-3xl font-black text-[#2d2d2d]">{stats.todayVisitors} <span className="text-base text-gray-400 font-bold">명</span></h3>
                            </div>
                            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col gap-2">
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">누적 지급 포인트</span><div className="w-10 h-10 bg-orange-50 text-[#FF8C42] rounded-xl flex items-center justify-center"><Coins size={20} /></div></div>
                                <h3 className="text-3xl font-black text-[#2d2d2d]">{stats.totalPoints.toLocaleString()} <span className="text-base text-gray-400 font-bold">P</span></h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 🚀 공지사항 작성/수정 폼 */}
                            <div className={`bg-white rounded-[24px] shadow-sm border ${editingNoticeId ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'} p-6 md:p-8 transition-all`}>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${editingNoticeId ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                                        {editingNoticeId ? <Edit2 size={16} /> : <Megaphone size={16} />}
                                    </div>
                                    <h3 className="text-lg font-black text-[#4A403A]">
                                        {editingNoticeId ? "공지사항 수정하기" : "공지사항 새 글 작성"}
                                    </h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="공지사항 제목을 입력하세요"
                                            value={noticeTitle}
                                            onChange={(e) => setNoticeTitle(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[#2d2d2d] focus:border-red-400 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="공지 내용을 입력하세요."
                                            value={noticeContent}
                                            onChange={(e) => setNoticeContent(e.target.value)}
                                            className="w-full h-40 px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-[#2d2d2d] focus:border-red-400 focus:bg-white outline-none resize-none transition-all"
                                        ></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        {editingNoticeId && (
                                            <button onClick={handleCancelEdit} className="px-6 py-3.5 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition-all">취소</button>
                                        )}
                                        <button
                                            onClick={handleSubmitNotice}
                                            disabled={isSubmittingNotice}
                                            className={`${editingNoticeId ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 'bg-red-500 hover:bg-red-600 shadow-red-500/20'} text-white font-black px-8 py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50`}
                                        >
                                            {isSubmittingNotice ? "처리 중..." : (editingNoticeId ? <><Save size={18} /> 변경사항 저장</> : <><Bell size={18} /> 새 공지 등록</>)}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 🚀 공지사항 리스트 현황판 */}
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col h-full max-h-[550px]">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <h3 className="text-lg font-black text-[#4A403A] flex items-center gap-2"><FileText className="text-gray-400" size={18} /> 등록된 공지사항 현황</h3>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">총 {adminNotices.length}개</span>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                                    {adminNotices.length > 0 ? adminNotices.map((notice) => (
                                        <div key={notice.id} className="p-4 border border-gray-100 rounded-2xl hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[14px] font-black text-[#2d2d2d] truncate mb-1">{notice.title}</h4>
                                                <p className="text-[11px] text-gray-400 font-bold">{formatDate(notice.created_at)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button onClick={() => handleEditNotice(notice)} className="px-3 py-1.5 bg-gray-50 text-gray-600 font-bold text-[11px] rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-1">
                                                    <Edit2 size={12} /> 수정
                                                </button>
                                                <button onClick={() => handleDeleteNotice(notice.id)} className="px-3 py-1.5 bg-gray-50 text-gray-600 font-bold text-[11px] rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-1">
                                                    <Trash2 size={12} /> 삭제
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center py-10 text-gray-400">
                                            <Megaphone size={32} className="mb-2 opacity-50" />
                                            <p className="text-sm font-bold">등록된 공지가 없습니다.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. 유저 관리 탭 */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-lg font-black text-[#4A403A]">전체 유저 목록 ({filteredUsers.length}명)</h3>
                            <div className="relative w-full sm:w-64">
                                <input type="text" placeholder="닉네임 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:border-[#FF8C42] transition-colors" />
                                <Search size={16} className="absolute left-3.5 top-2.5 text-gray-400" />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[850px]">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[12px] text-gray-400 border-b border-gray-50">
                                        <th className="p-4 font-bold">유저 정보</th>
                                        <th className="p-4 font-bold text-center">보유 포인트</th>
                                        <th className="p-4 font-bold text-center">가입일시</th>
                                        <th className="p-4 font-bold text-center">관리 액션</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                                        <tr key={u.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                                        {u.avatar_url ? <img src={u.avatar_url} alt="P" className="w-full h-full object-cover" /> : <UserPlaceholder />}
                                                    </div>
                                                    <div>
                                                        <p className="text-[14px] font-bold text-[#2d2d2d] flex items-center gap-1">
                                                            {u.nickname || "미설정"} {u.email && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{u.email}</span>}
                                                        </p>
                                                        <p className="text-[11px] text-gray-400">UID: {u.id.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center"><span className="text-[14px] font-black text-[#FF8C42] bg-orange-50 px-2 py-1 rounded-md inline-block min-w-[60px]">{u.points?.toLocaleString() || 0} P</span></td>
                                            <td className="p-4 text-center text-[12px] text-gray-500 font-medium">{formatDate(u.created_at)}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button onClick={() => handleViewPosts(u)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all" title="작성글 내역 확인"><FileText size={16} /></button>
                                                    <button onClick={() => handleViewPoints(u)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all" title="포인트 내역 보기"><History size={16} /></button>
                                                    <button onClick={() => handleAddPoints(u.id, u.points || 0)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-[#FF8C42] hover:text-[#FF8C42] hover:bg-orange-50 transition-all" title="포인트 수동 지급/차감"><Coins size={16} /></button>
                                                    <button onClick={() => handleDeleteUser(u.nickname || '알수없음')} className="p-2 bg-white border border-gray-200 text-gray-400 rounded-lg hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all" title="강제 탈퇴"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={4} className="p-10 text-center text-gray-400 font-bold text-sm">검색 결과가 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 3. 시스템 설정 탭 */}
                {activeTab === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                            <h3 className="text-lg font-black text-[#4A403A] mb-6 flex items-center gap-2"><Coins className="text-[#FF8C42]" /> 포인트 보상 설정</h3>
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-400 mb-1">신규 가입 축하 포인트</label><input type="number" defaultValue="1000" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl font-bold text-[#2d2d2d] focus:border-[#FF8C42] outline-none" /></div>
                                <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#4A403A] text-white rounded-xl font-bold hover:bg-[#3A322D] transition-all"><Save size={16} /> 저장 (데모)</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 모달 1: 포인트 내역 */}
            {isPointModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="bg-gray-50 p-6 flex justify-between items-center border-b border-gray-100">
                            <div>
                                <h3 className="font-black text-lg text-[#2d2d2d]">[{selectedUser.nickname}] 포인트 내역</h3>
                                <p className="text-xs font-bold text-gray-400 mt-0.5">현재 잔여: <span className="text-[#FF8C42]">{selectedUser.points?.toLocaleString() || 0} P</span></p>
                            </div>
                            <button onClick={() => setIsPointModalOpen(false)} className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-800 shadow-sm border border-gray-200 transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            {isLogsLoading ? (
                                <div className="py-10 text-center text-sm font-bold text-gray-400 animate-pulse">불러오는 중...</div>
                            ) : pointLogs.length > 0 ? (
                                <div className="space-y-3">
                                    {pointLogs.map((log, idx) => {
                                        let displayReason = log.reason;
                                        if (log.reason === 'attendance') displayReason = '출석 체크 적립';
                                        else if (log.reason === 'quiz') displayReason = '퀴즈 정답 보너스';
                                        else if (log.reason === 'post') displayReason = '게시글 작성 혜택';
                                        else if (log.reason === 'comment') displayReason = '댓글 작성 혜택';
                                        else if (log.reason === 'review') displayReason = '리뷰 작성 혜택';

                                        return (
                                            <div key={idx} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:border-orange-200 transition-colors">
                                                <div>
                                                    <p className="text-[13px] font-black text-[#4A403A]">{displayReason}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{formatDate(log.created_at)}</p>
                                                </div>
                                                <span className={`text-[14px] font-black ${log.amount > 0 ? 'text-[#FF8C42]' : 'text-blue-500'}`}>{log.amount > 0 ? '+' : ''}{log.amount?.toLocaleString()} P</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="py-10 text-center flex flex-col items-center">
                                    <History size={32} className="text-gray-300 mb-3" />
                                    <p className="text-sm font-bold text-gray-400">포인트 내역이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 모달 2: 작성글 확인 */}
            {isPostModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden relative">
                        <div className="bg-emerald-50 p-6 flex justify-between items-center border-b border-emerald-100">
                            <div>
                                <h3 className="font-black text-lg text-emerald-900 flex items-center gap-2">
                                    <FileText size={20} className="text-emerald-600" /> [{selectedUser.nickname}] 작성글
                                </h3>
                                <p className="text-xs font-bold text-emerald-600/70 mt-1">총 <span className="text-emerald-600 font-black">{userPosts.length}</span>개의 글을 작성했습니다.</p>
                            </div>
                            <button onClick={() => setIsPostModalOpen(false)} className="p-2 bg-white rounded-full text-emerald-600 hover:text-emerald-900 shadow-sm transition-colors"><X size={20} /></button>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50/50">
                            {isPostsLoading ? (
                                <div className="py-10 text-center text-sm font-bold text-gray-400 animate-pulse">게시글을 불러오는 중...</div>
                            ) : userPosts.length > 0 ? (
                                <div className="space-y-4">
                                    {userPosts.map((post) => (
                                        <div key={post.id} className="bg-white p-4 border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-300 transition-all text-left">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-[14px] font-black text-[#2d2d2d] leading-tight flex-1 pr-2">{post.title}</h4>
                                                <Link href={`/community/${post.id}`} target="_blank" className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded shrink-0 hover:bg-emerald-500 hover:text-white transition-colors">원문보기</Link>
                                            </div>
                                            <p className="text-[12px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{post.content?.replace(/<[^>]*>?/gm, '') || "내용 없음"}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">{formatDate(post.created_at)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center flex flex-col items-center">
                                    <MessageCircle size={32} className="text-gray-300 mb-3" />
                                    <p className="text-sm font-bold text-gray-400">작성한 게시글이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

function UserPlaceholder() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-2 text-gray-400">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    );
}