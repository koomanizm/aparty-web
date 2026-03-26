"use client";

import { Search, Bell, MapPin, ChevronRight, Sparkles, Building2 } from "lucide-react";

export default function SpinoffPlayground() {
    return (
        <div className="min-h-screen bg-bg-base font-sans flex justify-center pb-20">

            <div className="w-full max-w-[480px] bg-bg-base shadow-2xl relative border-x border-border-light">

                {/* 🏛️ 1. 헤더 (답답함이 사라진 프리미엄 네이비 #1C2D6D 적용) */}
                <header className="sticky top-0 bg-surface/90 backdrop-blur-xl z-40 border-b border-border-light px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm shadow-sm">
                            A
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-primary">APARTY</h1>
                    </div>
                    <div className="flex items-center gap-4 text-text-sub">
                        <Search size={22} className="cursor-pointer hover:text-primary transition-colors" />
                        <Bell size={22} className="cursor-pointer hover:text-primary transition-colors" />
                    </div>
                </header>

                {/* 🚀 2. 메인 히어로 배너 */}
                <section className="px-5 py-10 bg-surface border-b border-border-light relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#EEF2FF] rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EEF2FF] text-accent-action text-[12px] font-black mb-4">
                            <Sparkles size={14} /> AI 맞춤 추천
                        </div>

                        <h2 className="text-3xl font-black text-primary leading-tight mb-3 tracking-tight">
                            😉🏠 대표님을 위한<br />
                            <span className="text-accent-action">1순위 청약 현장</span>
                        </h2>

                        <p className="text-[14px] text-text-sub font-medium mb-8 leading-relaxed">
                            보유 자금과 가점을 분석하여<br />당첨 확률이 가장 높은 곳을 찾았습니다.
                        </p>

                        {/* 🏛️ 핵심 CTA 버튼: 아주 살짝 밝아져서 클릭하기 훨씬 편안해진 네이비! */}
                        <button className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-[15px] font-black shadow-[0_8px_24px_rgba(28,45,109,0.2)] transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2">
                            내 맞춤 리포트 확인하기 <ChevronRight size={18} />
                        </button>
                    </div>
                </section>

                {/* 🏢 3. 카드 리스트 섹션 */}
                <section className="p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[16px] font-black text-primary">신규 분양 랭킹</h3>
                        <span className="text-[12px] font-bold text-text-sub cursor-pointer hover:text-primary">전체보기</span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {[1, 2].map((item) => (
                            <div key={item} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border-light shadow-sm hover:border-[#C9D5F3] hover:shadow-[0_10px_24px_rgba(28,45,109,0.06)] transition-all cursor-pointer group">
                                <div className="w-24 h-24 bg-bg-base rounded-xl border border-border-light flex-shrink-0 flex items-center justify-center text-[10px] text-text-sub">
                                    <Building2 size={24} className="opacity-20 mb-1" />
                                </div>
                                <div className="flex flex-col justify-center flex-1">
                                    <div className="inline-block w-fit px-2 py-0.5 rounded bg-[#EAF7FF] text-accent-info text-[10px] font-black mb-1.5">
                                        경쟁률 상승
                                    </div>
                                    <h4 className="text-[15px] font-black text-primary group-hover:text-accent-action transition-colors mb-1">센텀 스카이 뷰</h4>
                                    <p className="text-[12px] text-text-sub flex items-center gap-0.5 mb-2"><MapPin size={11} /> 부산 해운대구</p>

                                    <button className="self-start text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#F5F7FB] text-primary border border-[#D9E2EE] hover:bg-[#EDF2F8] transition-colors">
                                        관심 등록
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}