"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Target, BarChart3, ShieldCheck, Zap, Globe, Building2, TrendingUp } from "lucide-react";

export default function AboutPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white text-[#2d2d2d] selection:bg-orange-100 pb-32">
            {/* 🚀 상단 네비게이션 */}
            <nav className="sticky top-0 z-50 flex items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-50">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="ml-4 text-[15px] font-black text-[#4A403A] tracking-tight uppercase">About Aparty</h1>
            </nav>

            {/* 🚀 Hero Section */}
            <section className="relative px-6 pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden border-b border-gray-50">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-block px-4 py-1.5 mb-6 bg-orange-50 text-orange-600 rounded-full text-[11px] font-black tracking-widest uppercase">
                        Real Estate Intelligence
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-[#4A403A] leading-[1.1] mb-8 tracking-tighter">
                        분양 시장의 정보 불균형을 <br />
                        <span className="text-orange-500">데이터와 기술</span>로 해결합니다.
                    </h2>
                    <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                        아파티는 파편화된 분양 정보를 통합하고 시각화하여, 누구나 투명하고 빠르게 내 집 마련의 기회를 선점할 수 있는 프롭테크 플랫폼을 지향합니다.
                    </p>
                </div>
                <div className="absolute -right-20 top-20 w-96 h-96 bg-orange-100/30 rounded-full blur-[100px] pointer-events-none"></div>
            </section>

            {/* 🚀 Mission Section */}
            <section className="px-6 py-20 md:py-32 bg-[#FDFBF7]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#FF8C42]">
                                <Zap size={28} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#4A403A]">초고속 정보 동기화</h3>
                            <p className="text-gray-500 text-[15px] leading-7 break-keep">
                                선착순 분양 및 잔여세대 발생 시 실시간 알림 시스템을 통해 시장보다 한발 앞선 인사이트를 제공합니다.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500">
                                <BarChart3 size={28} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#4A403A]">객관적 시세 시각화</h3>
                            <p className="text-gray-500 text-[15px] leading-7 break-keep">
                                국토부 실거래가 및 인근 시세 빅데이터를 그래프로 구현하여 유저가 스스로 가치를 판단할 수 있는 도구를 제공합니다.
                            </p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={28} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-xl font-black text-[#4A403A]">신뢰 기반 커뮤니티</h3>
                            <p className="text-gray-500 text-[15px] leading-7 break-keep">
                                실제 유저들의 리뷰와 전문가 상담 시스템을 결합하여 왜곡된 광고가 아닌 진짜 살아있는 정보를 공유합니다.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🚀 Tech Section */}
            <section className="px-6 py-24 md:py-36 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 order-2 md:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 text-center">
                                <h4 className="text-3xl font-black text-orange-500 mb-1">24/7</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monitoring</p>
                            </div>
                            <div className="bg-[#4A403A] p-8 rounded-[2rem] text-center text-white">
                                <h4 className="text-3xl font-black text-white mb-1">50+</h4>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Data Points</p>
                            </div>
                            <div className="col-span-2 bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-center justify-around">
                                <div className="text-center">
                                    <h4 className="text-2xl font-black text-blue-600">100%</h4>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Transparency</p>
                                </div>
                                <div className="w-[1px] h-8 bg-blue-200"></div>
                                <div className="text-center">
                                    <h4 className="text-2xl font-black text-blue-600">Real-time</h4>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Analytics</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2">
                        <h3 className="text-sm font-black text-orange-500 mb-4 flex items-center gap-2 tracking-widest uppercase">
                            <Globe size={16} /> Our Technology
                        </h3>
                        <h2 className="text-3xl md:text-4xl font-black text-[#4A403A] leading-tight mb-6 tracking-tight">
                            아파티는 정보를 넘어 <br />
                            확신을 제공합니다.
                        </h2>
                        <p className="text-gray-500 leading-8 text-[16px] mb-8 font-medium">
                            단순한 텍스트 정보를 넘어, 5주 투자심리 지수, 인근 단지 가격 역전 차트, 실시간 관심도 트래킹 등 고도화된 시각화 엔진을 통해 매물의 가치를 데이터로 증명합니다.
                        </p>
                        <ul className="space-y-4">
                            {['공공 데이터 실시간 동기화 엔진', '사용자 경험 중심의 인터랙티브 차트', '프리미엄 상담사 매칭 시스템'].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#4A403A] font-bold text-[15px]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* 🚀 Closing: 심플하고 강력한 마무리 */}
            <section className="px-6 py-24 md:py-40 bg-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-2xl md:text-4xl font-black text-[#4A403A] leading-tight tracking-tighter">
                        여러분의 가장 똑똑한 <br className="md:hidden" /> 부동산 파트너가 되겠습니다.
                    </h3>
                </div>
            </section>
        </main>
    );
}