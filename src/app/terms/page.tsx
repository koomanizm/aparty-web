"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white pb-20">
            <nav className="sticky top-0 z-50 flex items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="ml-4 text-lg font-black text-[#2d2d2d]">이용약관</h1>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-10 text-[14px] leading-7 text-gray-600">
                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">제 1 조 (목적)</h2>
                    <p>이 약관은 아파티(이하 "회사")가 운영하는 웹사이트 및 모바일 앱(이하 "서비스")에서 제공하는 부동산 정보 및 제반 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">제 2 조 (정보의 정확성 및 면책)</h2>
                    <ul className="list-disc ml-5 space-y-2">
                        <li>회사가 제공하는 분양가, 평형, 실거래가 등 모든 부동산 정보는 공공 API 및 각 현장 제공 자료를 바탕으로 구성됩니다.</li>
                        <li><strong>정보의 정확성:</strong> 정보는 현장 사정 및 법령 변경에 따라 실제와 다를 수 있으며, 회사는 정보의 완전성이나 정확성을 보증하지 않습니다.</li>
                        <li><strong>투자 결정:</strong> 모든 투자 및 계약에 대한 책임은 이용자 본인에게 있으며, 이용자는 반드시 견본주택 또는 공식 홈페이지를 통해 확정된 내용을 직접 확인해야 합니다.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">제 3 조 (포인트 및 리워드)</h2>
                    <ul className="list-disc ml-5 space-y-2">
                        <li>포인트는 서비스 내 활동(퀴즈, 출석체크 등)을 통해 무상으로 지급되는 사이버 머니입니다.</li>
                        <li>포인트는 어떠한 경우에도 현금으로 환불되거나 타인에게 양도될 수 없습니다.</li>
                        <li>부정한 방법으로 획득한 포인트는 사전 통보 없이 회수될 수 있으며, 해당 계정은 정지될 수 있습니다.</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">제 4 조 (서비스 중단)</h2>
                    <p>회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
                </section>

                <p className="mt-12 text-gray-400 text-[12px]">최종 수정일: 2026년 3월 3일</p>
            </div>
        </main>
    );
}