"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-white pb-20">
            <nav className="sticky top-0 z-50 flex items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="ml-4 text-lg font-black text-[#2d2d2d]">개인정보 처리방침</h1>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-10 text-[14px] leading-7 text-gray-600">
                <p className="mb-8 font-bold text-gray-800">아파티('https://aparty.co.kr' 이하 '아파티')는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.</p>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">1. 수집하는 개인정보 항목</h2>
                    <p>아파티는 SNS 로그인(구글, 카카오 등) 및 서비스 이용 과정에서 다음과 같은 정보를 수집합니다.</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>필수항목: 이메일, 닉네임, 프로필 사진</li>
                        <li>서비스 이용 시 생성 정보: 포인트 적립/사용 기록, 접속 로그, 쿠키, 불량 이용 기록</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">2. 개인정보의 처리 목적</h2>
                    <ul className="list-disc ml-5 space-y-1">
                        <li>회원 관리: 서비스 이용에 따른 본인확인, 개인 식별, 부정 이용 방지</li>
                        <li>서비스 제공: 포인트 시스템 운영, 관심 단지 정보 알림, 맞춤형 정보 추천</li>
                        <li>마케팅 및 광고: 신규 서비스 홍보 및 이벤트 정보 제공 (동의 시)</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">3. 개인정보의 보유 및 이용기간</h2>
                    <p>이용자의 개인정보는 원칙적으로 회원 탈퇴 시 지체 없이 파기합니다. 단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 아래와 같이 보관합니다.</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                        <li>포인트 부정 사용 방지를 위한 기록: 1년</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">4. 개인정보의 파기절차</h2>
                    <p>아파티는 목적이 달성된 개인정보를 재생이 불가능한 방법으로 즉시 파기합니다. 전자적 파일 형태는 기술적 방법으로 삭제하며, 종이 문서의 경우 분쇄합니다.</p>
                </section>

                <section className="mb-10">
                    <h2 className="text-lg font-bold text-[#4A403A] mb-4">5. 이용자의 권리</h2>
                    <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며 회원 탈퇴를 통해 개인정보 이용에 대한 동의를 철회할 수 있습니다.</p>
                </section>

                <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="font-bold text-[#4A403A] mb-2">개인정보 보호책임자</p>
                    <p>성명: 정규인 | 이메일: koomani.job@gmail.com</p>
                    <p className="text-[12px] mt-2 text-gray-400">공고일자: 2026년 3월 3일 | 시행일자: 2026년 3월 3일</p>
                </div>
            </div>
        </main>
    );
}