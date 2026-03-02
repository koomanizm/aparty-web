"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {
    ChevronLeft, Gift, CheckCircle2, HelpCircle,
    MessageSquare, MapPin, Coins, Trophy, Star, X, Loader2
} from "lucide-react";
import Link from "next/link";

// 📚 [방대한 퀴즈 뱅크] 대표님, 여기에 문제를 계속 추가하시면 됩니다!
const QUIZ_BANK = [
    // --- [청약 상식] ---
    { question: "주택청약에서 '줍줍'이라 불리는 무순위 청약은 청약통장이 반드시 필요할까요?", answer: false, desc: "무순위 청약은 청약통장 가입 여부와 상관없이 신청 가능한 경우가 많습니다!" },
    { question: "청약 가점제에서 무주택 기간은 만 30세부터 기산하는 것이 원칙이다.", answer: true, desc: "만 30세부터 기산하되, 그 전이라도 혼인신고를 했다면 혼인신고일부터 계산합니다." },
    { question: "부양가족 가점 계산 시, 배우자는 세대분리가 되어 있어도 부양가족에 포함된다.", answer: true, desc: "배우자는 주민등록상 분리되어 있어도 무조건 부양가족 1명(5점)으로 인정됩니다." },
    { question: "노부모 부양 특별공급은 부모님과 같은 등본에 1년만 있으면 신청 가능하다.", answer: false, desc: "노부모 부양 특공은 동일 등본상에 최소 3년 이상 연속하여 거주해야 자격이 생깁니다." },
    { question: "청약통장 가입 기간 점수의 만점은 17점이다.", answer: true, desc: "가입 기간 15년 이상일 때 만점인 17점을 받게 됩니다." },
    { question: "공공분양에서 전용면적 40㎡ 초과 주택은 저축 총액이 많은 순으로 당첨자를 정한다.", answer: true, desc: "맞습니다. 40㎡ 초과는 저축 총액, 40㎡ 이하는 납입 횟수가 많은 순서로 결정합니다." },
    { question: "예비당첨자도 동·호수 추첨 후 계약을 포기하면 청약통장 재사용이 불가능하다.", answer: true, desc: "동·호수가 배정된 후 포기하면 당첨자로 간주되어 통장을 다시 쓸 수 없습니다." },

    // --- [세금 상식] ---
    { question: "부동산 취득세는 집을 팔 때 내는 세금이다.", answer: false, desc: "취득세는 부동산을 '살 때' 내는 세금입니다. 팔 때는 양도소득세를 냅니다." },
    { question: "1세대 1주택자가 2년 거주 요건을 채우면 양도소득세가 무조건 전액 면제된다.", answer: false, desc: "고가주택(실거래가 12억 초과)인 경우 12억 초과분에 대해서는 양도세가 부과됩니다." },
    { question: "종합부동산세는 매년 6월 1일 소유자를 기준으로 부과된다.", answer: true, desc: "재산세와 종부세의 과세기준일은 매년 6월 1일입니다." },
    { question: "증여세는 받는 사람이 아니라 주는 사람이 내는 세금이다.", answer: false, desc: "증여세는 재산을 증여받은 사람(수증자)이 납부하는 것이 원칙입니다." },
    { question: "취득세 계산 시 오피스텔은 무조건 주택 수에 포함되어 중과된다.", answer: false, desc: "오피스텔은 취득 시점에 용도가 정해지지 않아 업무시설 세율(4.6%)이 적용됩니다." },

    // --- [대출/금융] ---
    { question: "LTV가 70%라면, 10억 주택 구매 시 최대 7억까지 대출이 가능할까요?", answer: true, desc: "맞습니다. 주택 가액의 일정 비율만큼 대출해주는 제도가 LTV입니다." },
    { question: "DSR은 연봉 대비 원금과 '이자' 상환액 전체를 따지는 규제이다.", answer: true, desc: "그렇습니다. 원금뿐만 아니라 모든 대출 이자까지 합쳐 상환 능력을 봅니다." },
    { question: "변동금리 대출은 시장 금리가 내려가면 내 이자 부담도 줄어든다.", answer: true, desc: "맞습니다. 기준금리와 연동되어 이자율이 주기적으로 변하기 때문입니다." },
    { question: "마이너스 통장 대출은 사용한 금액에 대해서만 이자가 발생한다.", answer: true, desc: "네, 한도 전체가 아니라 실제 빌려 쓴 금액과 기간에 대해서만 이자를 냅니다." },

    // --- [용어/면적] ---
    { question: "용적률이 높을수록 건물을 더 높게 지을 수 있다.", answer: true, desc: "용적률은 대지 면적 대비 건물 연면적 비율로, 높을수록 고층 건물이 가능합니다." },
    { question: "건폐율이 100%인 아파트 단지가 존재할 수 있다.", answer: false, desc: "건폐율은 땅 대비 건물이 차지하는 바닥 면적으로, 법적 제한 때문에 100%는 불가능합니다." },
    { question: "아파트의 '전용면적'에는 발코니 면적이 포함된다.", answer: false, desc: "발코니는 '서비스 면적'으로 분류되어 전용면적 수치에는 들어가지 않습니다." },
    { question: "공유면적에는 엘리베이터, 복도, 계단 등이 포함된다.", answer: true, desc: "맞습니다. 여러 세대가 공동으로 사용하는 공간이 공용면적입니다." },
    { question: "베이(Bay) 수가 많을수록 채광과 통풍에 유리한 구조이다.", answer: true, desc: "전면 발코니 쪽으로 배치된 거실/방의 개수가 많을수록 햇빛이 잘 듭니다." },

    // --- [법률/계약] ---
    { question: "전세 계약 후 확정일자를 받으면 보증금에 대해 우선변제권이 생긴다.", answer: true, desc: "네, 확정일자와 전입신고는 보증금을 지키는 가장 강력한 수단입니다." },
    { question: "등기부등본의 '갑구'에서는 압류나 가압류 여부를 확인할 수 있다.", answer: true, desc: "갑구는 소유권에 관한 사항으로, 압류/가압류 등 소유권 침해 여부를 보여줍니다." },
    { question: "등기부등본의 '을구'가 깨끗하다는 건 대출(근저당)이 없다는 뜻이다.", answer: true, desc: "을구는 소유권 이외의 권리(저당권, 전세권 등)를 기록하는 곳입니다." },
    { question: "계약갱신청구권은 임차인이 1회에 한해 2년 연장을 요구할 수 있는 권리다.", answer: true, desc: "소위 2+2 제도로, 임차인이 원하면 총 4년까지 거주할 수 있게 보호합니다." },
    { question: "임대인이 실거주를 이유로 갱신을 거절했는데 알고보니 거짓이라면 배상을 청구할 수 있다.", answer: true, desc: "거짓 실거주로 갱신을 거절당한 임차인은 손해배상을 청구할 수 있습니다." },

    // --- [매물/상식] ---
    { question: "아파트에서 '판상형' 구조는 보통 '一'자 모양으로 통풍이 잘 되는 편이다.", answer: true, desc: "앞뒤가 뚫려 있어 환기가 잘 되는 전통적인 인기 구조입니다." },
    { question: "타워형 아파트는 조망권 확보에 유리하지만 통풍은 판상형보다 불리할 수 있다.", answer: true, desc: "Y자나 ㅁ자 구조로 설계되어 조망은 좋지만 맞통풍이 어려운 경우가 많습니다." },
    { question: "분양권과 입주권은 법적으로 완전히 동일한 개념이다.", answer: false, desc: "분양권은 청약 당첨 권리이고, 입주권은 재개발/재건축 조합원의 권리입니다." },
    { question: "임대차 계약서 작성 시 특약사항은 법적 효력이 없다.", answer: false, desc: "법을 위반하지 않는 선에서의 특약은 계약 당사자 간의 강력한 법적 효력을 가집니다." },

    // --- [추가 상식 20개] ---
    { question: "주거용 오피스텔도 전입신고를 하면 주택임대차보호법의 보호를 받는다.", answer: true, desc: "실제 주거용으로 사용하고 전입신고를 했다면 아파트와 똑같이 보호받습니다." },
    { question: "아파트 브랜드 평판지수는 청약 흥행에 영향을 주지 않는다.", answer: false, desc: "브랜드 인지도와 신뢰도는 아파트 가치와 청약 경쟁률에 큰 영향을 줍니다." },
    { question: "분양가 상한제 지역 아파트는 주변 시세보다 비싸게 분양된다.", answer: false, desc: "분양가 상한제는 가격 안정화를 위해 분양가를 일정 수준 이하로 제한하는 제도입니다." },
    { question: "실거주 의무 기간이 있는 단지는 당첨 즉시 전세를 줄 수 없다.", answer: true, desc: "실거주 의무가 있다면 최초 입주 시점에 직접 들어가 살아야 합니다." },
    { question: "부동산 중개수수료(복비)는 계약 시 무조건 0.9%를 지불해야 한다.", answer: false, desc: "0.9%는 상한율일 뿐이며, 구간별 요율에 따라 협의가 가능합니다." },
    { question: "전매 제한 기간 중에는 분양권을 남에게 팔 수 없다.", answer: true, desc: "전매 제한은 투기 방지를 위해 일정 기간 소유권 이전을 금지하는 것입니다." },
    { question: "생애최초 특별공급은 미혼 1인 가구도 신청 가능하다.", answer: true, desc: "전용면적 60㎡ 이하에 한해 1인 가구도 생애최초 특공 신청이 가능하도록 바뀌었습니다." },
    { question: "재산세는 7월과 9월에 두 번 나누어 내는 것이 일반적이다.", answer: true, desc: "주택분 재산세는 세액의 50%씩 7월과 9월에 분할 고지됩니다." },
    { question: "DTI는 연 소득 대비 '주택담보대출'의 원리금 상환액 비중을 말한다.", answer: true, desc: "DSR보다 좁은 의미로, 주담대 외 대출은 이자 상환액만 합산합니다." },
    { question: "아파트 관리비 고지서는 보통 사용한 달의 다음 달에 발행된다.", answer: true, desc: "관리비는 후불제 성격이 강해 전월 사용량을 이번 달에 정산합니다." },
    { question: "입주자 사전점검은 아파트 완공 직후 입주 시작 후에 진행한다.", answer: false, desc: "사전점검은 입주 시작 약 1~2개월 전, 하자를 미리 체크하기 위해 진행합니다." },
    { question: "공시지가는 국토교통부 장관이 조사·평가하여 공시하는 토지 가격이다.", answer: true, desc: "맞습니다. 토지 세금의 기준이 되는 가격입니다." },
    { question: "깡통전세란 매매가보다 전세가가 더 높은 상태를 말한다.", answer: true, desc: "집을 팔아도 보증금을 돌려주기 힘든 위험한 상태를 의미합니다." },
    { question: "주택연금은 만 55세 이상이면 신청할 수 있다.", answer: true, desc: "소유자 또는 배우자 중 한 명이 만 55세 이상이면 신청 가능합니다." },
    { question: "아파트 1층은 보안에 취약해 로열층보다 관리비가 더 비싸다.", answer: false, desc: "관리비 산정 방식은 세대 면적 기준이므로 층수와 상관없이 동일 면적이면 같습니다." },
    { question: "분양 대금 중 '잔금'은 보통 총 금액의 10%이다.", answer: false, desc: "통상적으로 계약금 10~20%, 중도금 60%, 잔금 20~30% 비중이 많습니다." },
    { question: "임차인이 월세를 2기 이상 연체하면 임대인은 계약을 해지할 수 있다.", answer: true, desc: "민법상 월세를 2번 밀리면 임대인이 계약 해지를 통보할 수 있는 사유가 됩니다." },
    { question: "청약 당첨 후 부적격 처리가 되면 향후 최대 1년간 청약이 제한될 수 있다.", answer: true, desc: "수도권이나 투기과열지구 등 지역에 따라 일정 기간 청약 자격이 제한됩니다." },
    { question: "조정대상지역 내 주택은 대출 한도가 더 높게 적용된다.", answer: false, desc: "조정대상지역은 규제 지역으로, 비규제 지역보다 대출 한도가 엄격합니다." },
    { question: "아파트 평수 계산 시 '1평'은 약 3.3㎡이다.", answer: true, desc: "정확히는 3.305785㎡입니다. 보통 3.3으로 계산합니다." }
];

export default function PointLounge() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [points, setPoints] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAttended, setIsAttended] = useState(false);
    const [isQuizDone, setIsQuizDone] = useState(false);

    const [showQuiz, setShowQuiz] = useState(false);
    const [quizStep, setQuizStep] = useState<'question' | 'result'>('question');
    const [quizResult, setQuizResult] = useState(false);

    // 🚀 [신규 로직] 오늘 날짜를 기반으로 퀴즈 인덱스 결정 (매일 바뀜)
    const [todayQuiz, setTodayQuiz] = useState(QUIZ_BANK[0]);

    useEffect(() => {
        // 날짜를 숫자로 변환 (예: 20240523)
        const now = new Date();
        const dateSeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        // 퀴즈 뱅크 크기로 나눈 나머지를 인덱스로 사용 (무한 로테이션)
        const quizIndex = dateSeed % QUIZ_BANK.length;
        setTodayQuiz(QUIZ_BANK[quizIndex]);

        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                alert("로그인이 필요한 서비스입니다! 🔒");
                router.push("/");
                return;
            }
            setUser(session.user);

            const { data: profile } = await supabase.from('profiles').select('points').eq('id', session.user.id).single();
            setPoints(profile?.points || 0);

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

    const awardPoint = async (amount: number, reason: string) => {
        if (!user) return;
        try {
            await supabase.from('point_logs').insert({ user_id: user.id, amount, reason });
            const newTotal = points + amount;
            await supabase.from('profiles').update({ points: newTotal }).eq('id', user.id);
            setPoints(newTotal);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleAttendance = async () => {
        if (isAttended) return;
        const success = await awardPoint(10, 'attendance');
        if (success) {
            setIsAttended(true);
            alert("✨ 출석 체크 완료! 10P가 적립되었습니다.");
        }
    };

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
        <main className="min-h-screen bg-[#f8f9fa] pb-20 text-left selection:bg-orange-100">
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-gray-900 active:scale-90 transition-transform"><ChevronLeft size={24} /></button>
                <h1 className="text-[15px] font-black text-[#4A403A]">포인트 라운지</h1>
                <div className="w-6"></div>
            </nav>

            <div className="max-w-2xl mx-auto px-5 pt-6">
                <div className="bg-gradient-to-br from-[#FF8C42] to-[#FF5A00] rounded-[32px] p-7 shadow-[0_10px_30px_rgba(255,90,0,0.2)] text-white mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[13px] font-bold opacity-90">내 보유 포인트</span>
                        <Trophy size={20} className="opacity-90" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Coins size={32} className="text-yellow-300" />
                        <span className="text-4xl font-black tracking-tight">{points.toLocaleString()}</span>
                        <span className="text-xl font-bold mt-1">P</span>
                    </div>
                    <button
                        onClick={() => router.push('/point/shop')} // 🚀 리워드 샵 페이지로 이동!
                        className="w-full mt-7 bg-white/20 hover:bg-white/30 py-3.5 rounded-2xl font-black text-[13px] transition-all active:scale-95 border border-white/10 backdrop-blur-sm"
                    >
                        리워드샵
                    </button>
                </div>

                <section className="mb-8">
                    <h2 className="text-[17px] font-black text-[#4A403A] mb-5 flex items-center gap-2">
                        <div className="bg-orange-500 w-1.5 h-4 rounded-full"></div>
                        데일리 미션
                    </h2>
                    <div className="grid gap-3">
                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-[#4A403A]">오늘의 청약 도장</h3>
                                    <p className="text-[12px] text-gray-400 font-medium">매일 10P 적립</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAttendance}
                                disabled={isAttended}
                                className={`px-5 py-2.5 rounded-xl font-black text-[12px] transition-all ${isAttended ? 'bg-gray-100 text-gray-400' : 'bg-[#4A403A] text-white shadow-lg active:scale-95 hover:bg-black'}`}
                            >
                                {isAttended ? "참여완료" : "도장찍기"}
                            </button>
                        </div>

                        <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-[#4A403A]">오늘의 부동산 고사</h3>
                                    <p className="text-[12px] text-gray-400 font-medium">정답 맞히면 20P 적립</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowQuiz(true)}
                                disabled={isQuizDone}
                                className={`px-5 py-2.5 rounded-xl font-black text-[12px] transition-all ${isQuizDone ? 'bg-gray-100 text-gray-400' : 'bg-[#3B82F6] text-white shadow-lg active:scale-95 hover:bg-blue-600'}`}
                            >
                                {isQuizDone ? "참여완료" : "문제풀기"}
                            </button>
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className="text-[17px] font-black text-[#4A403A] mb-5 flex items-center gap-2">
                        <div className="bg-orange-500 w-1.5 h-4 rounded-full"></div>
                        상시 미션
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/community" className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center group transition-all hover:border-orange-200 hover:shadow-md">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MessageSquare size={28} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#4A403A]">라운지 소통왕</h3>
                                <p className="text-[11px] text-gray-400 mt-1 font-bold">글 10P / 댓글 5P</p>
                            </div>
                        </Link>
                        <Link href="/" className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex flex-col items-center gap-3 text-center group transition-all hover:border-orange-200 hover:shadow-md">
                            <div className="w-14 h-14 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <MapPin size={28} />
                            </div>
                            <div>
                                <h3 className="text-[14px] font-bold text-[#4A403A]">동네 보안관</h3>
                                <p className="text-[11px] text-gray-400 mt-1 font-bold">현장 리뷰 10P</p>
                            </div>
                        </Link>
                    </div>
                </section>
            </div>

            {/* 🚀 퀴즈 모달 (개선된 UI) */}
            {showQuiz && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A403A]/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 text-center">
                            {quizStep === 'question' ? (
                                <>
                                    <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <HelpCircle size={40} />
                                    </div>
                                    <h4 className="text-[14px] font-black text-blue-500 mb-2 uppercase tracking-widest">Question</h4>
                                    <h3 className="text-xl font-black text-[#4A403A] mb-8 leading-tight px-2">{todayQuiz.question}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => handleQuizAnswer(true)} className="py-5 bg-gray-50 hover:bg-orange-50 rounded-[24px] text-3xl font-black text-orange-500 border border-gray-100 transition-all active:scale-95">O</button>
                                        <button onClick={() => handleQuizAnswer(false)} className="py-5 bg-gray-50 hover:bg-blue-50 rounded-[24px] text-3xl font-black text-blue-500 border border-gray-100 transition-all active:scale-95">X</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 ${quizResult ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                        {quizResult ? <Trophy size={40} /> : <X size={40} />}
                                    </div>
                                    <h3 className="text-2xl font-black text-[#4A403A] mb-3">{quizResult ? "정답입니다! 🎉" : "아쉬워요! 😢"}</h3>
                                    <div className="bg-gray-50 p-5 rounded-2xl mb-8">
                                        <p className="text-[14px] text-gray-600 leading-relaxed font-bold">{todayQuiz.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowQuiz(false); setQuizStep('question'); }}
                                        className="w-full bg-[#4A403A] text-white py-4 rounded-2xl font-black text-[16px] shadow-lg active:scale-95 transition-transform"
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