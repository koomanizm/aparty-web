"use client";

import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ShieldCheck,
    Database,
    UserCheck,
    Bell,
    Lock,
} from "lucide-react";

export default function PrivacyPage() {
    const router = useRouter();

    const sections = [
        {
            title: "1. 개인정보의 처리 목적",
            icon: <UserCheck size={18} />,
            content: (
                <>
                    <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
                    <ul className="list-disc ml-5 mt-3 space-y-1.5">
                        <li>회원 가입 및 관리</li>
                        <li>간편로그인 연동 및 본인 식별</li>
                        <li>포인트 서비스 운영</li>
                        <li>관심 단지 저장 및 알림 제공</li>
                        <li>서비스 이용 통계 분석 및 부정 이용 방지</li>
                        <li>고객 문의 대응 및 고충 처리</li>
                        <li>이벤트 및 마케팅 정보 제공(별도 동의한 경우)</li>
                    </ul>
                </>
            ),
        },
        {
            title: "2. 처리하는 개인정보 항목",
            icon: <Database size={18} />,
            content: (
                <>
                    <p>회사는 서비스 제공을 위하여 다음의 개인정보를 처리할 수 있습니다.</p>
                    <ul className="list-disc ml-5 mt-3 space-y-3">
                        <li>
                            <span className="font-bold text-gray-800">회원가입/간편로그인</span>
                            <br />
                            이메일, 닉네임, 프로필 사진, SNS 계정 식별정보
                        </li>
                        <li>
                            <span className="font-bold text-gray-800">서비스 이용 과정</span>
                            <br />
                            포인트 적립/사용 기록, 관심 단지 정보, 접속 로그, IP주소, 쿠키,
                            기기정보, 불량 이용 기록
                        </li>
                        <li>
                            <span className="font-bold text-gray-800">고객 문의 과정</span>
                            <br />
                            이름, 연락처, 문의 내용(문의 기능 이용 시)
                        </li>
                    </ul>
                </>
            ),
        },
        {
            title: "3. 개인정보의 보유 및 이용기간",
            icon: <Bell size={18} />,
            content: (
                <>
                    <p>
                        회사는 원칙적으로 개인정보 처리 목적이 달성되거나 회원 탈퇴 시 지체 없이
                        개인정보를 파기합니다.
                    </p>
                    <p className="mt-2">
                        다만, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
                    </p>
                    <ul className="list-disc ml-5 mt-3 space-y-1.5">
                        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                        <li>부정 이용 방지 기록: 1년</li>
                    </ul>
                </>
            ),
        },
        {
            title: "4. 개인정보의 제3자 제공",
            icon: <ShieldCheck size={18} />,
            content: (
                <>
                    <p>회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
                    <p className="mt-2">
                        다만, 이용자의 별도 동의가 있거나 관련 법령에 특별한 규정이 있는 경우에는
                        예외로 합니다.
                    </p>
                </>
            ),
        },
        {
            title: "5. 개인정보 처리업무의 위탁",
            icon: <Lock size={18} />,
            content: (
                <p>
                    회사는 원활한 서비스 제공을 위하여 일부 업무를 외부 업체에 위탁할 수 있으며,
                    위탁 시 관련 법령에 따라 필요한 사항을 공개하고 관리·감독합니다.
                </p>
            ),
        },
        {
            title: "6. 개인정보의 파기절차 및 방법",
            icon: <Database size={18} />,
            content: (
                <>
                    <p>
                        회사는 개인정보 보유기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게
                        되었을 때 지체 없이 파기합니다.
                    </p>
                    <p className="mt-2">
                        전자적 파일은 복구 불가능한 방법으로 삭제하고, 종이 문서는 분쇄 또는
                        소각합니다.
                    </p>
                </>
            ),
        },
        {
            title: "7. 개인정보 자동 수집 장치의 설치·운영 및 거부",
            icon: <Bell size={18} />,
            content: (
                <>
                    <p>회사는 이용자 맞춤 서비스 제공 및 접속 분석을 위해 쿠키를 사용할 수 있습니다.</p>
                    <p className="mt-2">
                        이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다.
                    </p>
                </>
            ),
        },
        {
            title: "8. 이용자의 권리 및 행사방법",
            icon: <UserCheck size={18} />,
            content: (
                <p>
                    이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리정지, 동의
                    철회를 요청할 수 있습니다.
                </p>
            ),
        },
        {
            title: "9. 개인정보의 안전성 확보조치",
            icon: <ShieldCheck size={18} />,
            content: (
                <p>
                    회사는 개인정보의 안전성 확보를 위해 관리적, 기술적, 물리적 보호조치를
                    시행합니다.
                </p>
            ),
        },
    ];

    return (
        <main className="min-h-screen bg-[#faf8f5] pb-16 sm:pb-20">
            <nav className="sticky top-0 z-50 flex items-center px-4 sm:px-6 py-3.5 sm:py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
                <button
                    onClick={() => router.back()}
                    className="w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all shrink-0"
                    aria-label="뒤로가기"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="ml-3 sm:ml-4 text-[17px] sm:text-lg font-black text-[#2d2d2d] tracking-[-0.02em] break-keep">
                    개인정보 처리방침
                </h1>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-10">
                <div className="rounded-[24px] sm:rounded-[28px] bg-gradient-to-br from-[#FFF5EC] via-white to-[#FFF9F4] border border-[#F3E4D8] shadow-sm p-5 sm:p-7 md:p-8 mb-5 sm:mb-8">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#FF8C42]/10 text-[#FF8C42] flex items-center justify-center shrink-0">
                            <ShieldCheck size={22} className="sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[12px] font-bold tracking-[0.18em] sm:tracking-[0.2em] text-[#FF8C42] uppercase mb-2">
                                Privacy Policy
                            </p>
                            <h2 className="text-[22px] sm:text-2xl md:text-3xl font-black text-[#4A403A] leading-[1.25] break-keep">
                                아파티 개인정보 처리방침
                            </h2>
                            <p className="mt-3 sm:mt-4 text-[13px] sm:text-[14px] leading-6 sm:leading-7 text-gray-600 break-keep">
                                아파티(이하 &quot;회사&quot;)는 「개인정보 보호법」 등 관련 법령에 따라 이용자의
                                개인정보를 보호하고 관련 고충을 신속하고 원활하게 처리하기 위하여 다음과 같이
                                개인정보처리방침을 수립·공개합니다.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 sm:py-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-1">핵심 원칙</p>
                            <p className="text-[13px] sm:text-[14px] font-bold text-[#4A403A] break-keep">
                                최소 수집 · 목적 내 이용
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 sm:py-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-1">이용자 권리</p>
                            <p className="text-[13px] sm:text-[14px] font-bold text-[#4A403A] break-keep">
                                열람 · 정정 · 삭제 · 철회
                            </p>
                        </div>
                        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 sm:py-4">
                            <p className="text-[11px] font-bold text-gray-400 mb-1">시행일</p>
                            <p className="text-[13px] sm:text-[14px] font-bold text-[#4A403A] break-keep">
                                2026년 3월 3일
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 sm:space-y-5">
                    {sections.map((section) => (
                        <section
                            key={section.title}
                            className="rounded-[20px] sm:rounded-[24px] bg-white border border-gray-100 shadow-sm px-4 sm:px-6 py-5 sm:py-6"
                        >
                            <div className="flex items-start gap-3 mb-3.5 sm:mb-4">
                                <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] text-[#FF8C42] flex items-center justify-center shrink-0 mt-0.5">
                                    {section.icon}
                                </div>
                                <h3 className="text-[16px] sm:text-[18px] font-black text-[#4A403A] leading-6 sm:leading-7 break-keep">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="text-[13px] sm:text-[14px] leading-6 sm:leading-7 text-gray-600 break-keep">
                                {section.content}
                            </div>
                        </section>
                    ))}

                    <section className="rounded-[20px] sm:rounded-[24px] bg-white border border-gray-100 shadow-sm px-4 sm:px-6 py-5 sm:py-6">
                        <div className="flex items-start gap-3 mb-3.5 sm:mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] text-[#FF8C42] flex items-center justify-center shrink-0 mt-0.5">
                                <UserCheck size={18} />
                            </div>
                            <h3 className="text-[16px] sm:text-[18px] font-black text-[#4A403A] leading-6 sm:leading-7 break-keep">
                                10. 개인정보 보호책임자
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-5 text-[13px] sm:text-[14px] leading-6 sm:leading-7 text-gray-600">
                            <p>
                                <span className="font-bold text-gray-800">성명:</span> 정규인
                            </p>
                            <p className="break-all sm:break-normal">
                                <span className="font-bold text-gray-800">이메일:</span>{" "}
                                <a
                                    href="mailto:koomani.job@gmail.com"
                                    className="underline underline-offset-2 hover:text-[#4A403A] transition-colors"
                                >
                                    koomani.job@gmail.com
                                </a>
                            </p>
                            <p>
                                <span className="font-bold text-gray-800">연락처:</span> 1688-5946
                            </p>
                        </div>
                    </section>

                    <section className="rounded-[20px] sm:rounded-[24px] bg-white border border-gray-100 shadow-sm px-4 sm:px-6 py-5 sm:py-6">
                        <div className="flex items-start gap-3 mb-3.5 sm:mb-4">
                            <div className="w-9 h-9 rounded-xl bg-[#FFF3E8] text-[#FF8C42] flex items-center justify-center shrink-0 mt-0.5">
                                <Bell size={18} />
                            </div>
                            <h3 className="text-[16px] sm:text-[18px] font-black text-[#4A403A] leading-6 sm:leading-7 break-keep">
                                11. 개인정보처리방침의 변경
                            </h3>
                        </div>
                        <div className="text-[13px] sm:text-[14px] leading-6 sm:leading-7 text-gray-600 break-keep">
                            <p>본 방침은 2026년 3월 3일부터 시행합니다.</p>
                            <p className="mt-2">
                                회사가 본 방침을 변경하는 경우 홈페이지를 통해 공지합니다.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-5 sm:mt-8 rounded-[20px] sm:rounded-[24px] bg-[#4A403A] text-white px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
                    <p className="text-[11px] sm:text-[12px] text-white/60 mb-1">공고 및 시행일자</p>
                    <p className="text-[13px] sm:text-[14px] font-bold leading-6 break-keep">
                        공고일자: 2026년 3월 3일 | 시행일자: 2026년 3월 3일
                    </p>
                </div>
            </div>
        </main>
    );
}
