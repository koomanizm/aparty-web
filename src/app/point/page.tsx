"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
    ChevronLeft, Gift, CheckCircle2, HelpCircle,
    MessageSquare, MapPin, Coins, Trophy, Star, X, Loader2
} from "lucide-react";
import Link from "next/link";

export default function PointLounge() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [points, setPoints] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // 미션 상태 확인용
    const [isAttended, setIsAttended] = useState(false);
    const [isQuizDone, setIsQuizDone] = useState(false);

    // 퀴즈 모달 상태
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState<'question' | 'result'>('question');
    const [quizResult, setQuizResult] = useState(false);

    // 가짜 퀴즈 데이터 (나중에 DB에서 불러올 수 있습니다)
    const todayQuiz = {
        question: "주택청약에서 '줍줍'이라 불리는 무순위 청약은 청약통장이 반드시 필요할까요?",
        answer: false, // X가 정답
        desc: "무순위 청약(줍줍)은 청약통장 가입 여부와 상관없이 신청 가능한 경우가 많습니다!"
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("로그인이 필요한 서비스입니다! 🔒");
                router.push("/");
                return;
            }
            setUser(session.user);

            // 1. 현재 포인트 가져오기
            const { data: profile } = await supabase.from('profiles').select('points').eq('id', session.user.id).single();
            setPoints(profile?.points || 0);

            // 2. 오늘 미션 완료 여부 확인
            const today = new Date().toISOString().split('T')[0];
            const { data: logs } = await supabase
                .from('point_logs')
                .select('reason')
                .eq('user_id', session.user.id)
                .gte('created_at', today);

            const reasons = logs?.map(l => l.reason) || [];
            if (reasons.includes('attendance')) setIsAttended(true);
            if (reasons.includes('quiz')) setIsQuizDone(true);

            setIsLoading(false);
        };
        fetchUserData();
    }, [router]);

    // 🚀 포인트 지급 공통 함수
    const awardPoint = async (amount: number, reason: string) => {
        if (!user) return;
        try {
            // 1. 로그 기록
            await supabase.from('point_logs').insert({ user_id: user.id, amount, reason });
            // 2. 프로필 합계 업데이트
            const newTotal = points + amount;
            await supabase.from('profiles').update({ points: newTotal }).eq('id', user.id);
            setPoints(newTotal);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    // ✅ 출석체크 버튼 클릭
    const handleAttendance = async () => {
        if (isAttended) return;
        const success = await awardPoint(10, 'attendance');
        if (success) {
            setIsAttended(true);
            alert("✨ 출석 체크 완료! 10P가 적립되었습니다.");
        }
    };

    // ✅ 퀴즈 정답 선택
    const handleQuizAnswer = async (userAnswer: boolean) => {
        const isCorrect = userAnswer === todayQuiz.answer;
        setQuizResult(isCorrect);
        setQuizStep('result');

        if (isCorrect && !isQuizDone) {
            await awardPoint(20, 'quiz');
            setIsQuizDone(true);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-orange-500 font-bold">로딩 중...</div>;

    return (
        <main className="min-h-screen bg-[#f8f9fa] pb-20 text-left">
            {/* 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-900"><ChevronLeft size={24} /></button>
                <h1 className="text-[15px] font-black text-[#4A403A]">포인트 라운지</h1>
                <div className="w-6"></div>
            </nav>

            <div className="max-w-2xl mx-auto px-5 pt-6">
                {/* 내 포인트 카드 */}
                <div className="bg-gradient-to-br from-[#FF8C42] to-[#FF5A00] rounded-[28px] p-6 shadow-lg text-white mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[13px] font-bold opacity-80">내 보유 포인트</span>
                        <Trophy size={20} className="opacity-80" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins size={28} className="text-yellow-300" />
                        <span className="text-4xl font-black">{points.toLocaleString()}</span>
                        <span className="text-xl font-bold mt-1">P</span>
                    </div>
                    <button className="w-full mt-6 bg-white/20 hover:bg-white/30 py-3 rounded-xl font-bold text-[13px] transition-colors">
                        포인트 사용하기 (리워드 샵)
                    </button>
                </div>

                {/* 데일리 미션 섹션 */}
                <section className="mb-8">
                    <h2 className="text-[17px] font-black text-[#4A403A] mb-4 flex items-center gap-2">
                        <Star size={18} className="text-orange-500 fill-orange-500" /> 데일리 미션
                    </h2>
                    <div className="grid gap-3">
                        {/* 1. 출석체크 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-[#4A403A]">오늘의 청약 도장</h3>
                                    <p className="text-[12px] text-gray-400">매일 10P 적립</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAttendance}
                                disabled={isAttended}
                                className={`px-5 py-2 rounded-xl font-black text-[12px] transition-all ${isAttended ? 'bg-gray-100 text-gray-400' : 'bg-[#4A403A] text-white shadow-md active:scale-95'}`}
                            >
                                {isAttended ? "참여완료" : "도장찍기"}
                            </button>
                        </div>

                        {/* 2. 부동산 퀴즈 */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-[#4A403A]">오늘의 부동산 고사</h3>
                                    <p className="text-[12px] text-gray-400">정답 맞히면 20P 적립</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowQuiz(true)}
                                disabled={isQuizDone}
                                className={`px-5 py-2 rounded-xl font-black text-[12px] transition-all ${isQuizDone ? 'bg-gray-100 text-gray-400' : 'bg-[#3B82F6] text-white shadow-md active:scale-95'}`}
                            >
                                {isQuizDone ? "참여완료" : "문제풀기"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* 상시 미션 섹션 */}
                <section>
                    <h2 className="text-[17px] font-black text-[#4A403A] mb-4 flex items-center gap-2">
                        <Gift size={18} className="text-orange-500 fill-orange-500" /> 상시 미션
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/community" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center group transition-all hover:border-orange-200">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#4A403A]">라운지 소통왕</h3>
                                <p className="text-[10px] text-gray-400 mt-1">글 10P / 댓글 5P</p>
                            </div>
                        </Link>
                        <Link href="/" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center group transition-all hover:border-orange-200">
                            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#4A403A]">동네 보안관</h3>
                                <p className="text-[10px] text-gray-400 mt-1">현장 리뷰 10P</p>
                            </div>
                        </Link>
                    </div>
                </section>
            </div>

            {/* 🚀 퀴즈 모달 */}
            {showQuiz && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            {quizStep === 'question' ? (
                                <>
                                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HelpCircle size={32} />
                                    </div>
                                    <h3 className="text-lg font-black text-[#4A403A] mb-4 leading-tight">{todayQuiz.question}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleQuizAnswer(true)} className="py-4 bg-gray-50 hover:bg-orange-50 rounded-2xl text-2xl font-black text-orange-500 border border-gray-100 transition-colors">O</button>
                                        <button onClick={() => handleQuizAnswer(false)} className="py-4 bg-gray-50 hover:bg-blue-50 rounded-2xl text-2xl font-black text-blue-500 border border-gray-100 transition-colors">X</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${quizResult ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                        {quizResult ? <Trophy size={32} /> : <X size={32} />}
                                    </div>
                                    <h3 className="text-xl font-black text-[#4A403A] mb-2">{quizResult ? "정답입니다! 🎉" : "아쉬워요! 😢"}</h3>
                                    <p className="text-[14px] text-gray-500 mb-6 leading-relaxed px-2">{todayQuiz.desc}</p>
                                    <button
                                        onClick={() => { setShowQuiz(false); setQuizStep('question'); }}
                                        className="w-full bg-[#4A403A] text-white py-3.5 rounded-2xl font-black text-[15px] shadow-md"
                                    >
                                        확인
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}