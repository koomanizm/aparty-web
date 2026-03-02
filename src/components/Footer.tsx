import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="bg-[#4A403A] py-8 border-t border-[#3A322D]">
            <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-4">

                {/* Brand Block */}
                <div className="flex flex-col items-center md:items-start space-y-2">
                    <div className="flex items-center gap-2.5">
                        <Image
                            src="/aparty_white.png.png"
                            alt="Aparty White Logo"
                            width={120}
                            height={32}
                            className="h-6 w-auto object-contain opacity-90"
                        />
                        <span className="text-lg font-black text-white tracking-wider">APARTY</span>
                    </div>
                    <p className="text-white/60 text-[12px] text-center md:text-left font-medium">
                        No.1 부동산 분양 정보 플랫폼, 아파티
                    </p>

                    {/* 🚀 [추가] 면책 공고 (법적 방어막) */}
                    <p className="hidden md:block text-white/30 text-[10px] leading-relaxed max-w-xs mt-2">
                        아파티는 부동산 정보 제공자로서 거래의 당사자가 아니며, 모든 정보는 현장 사정에 따라 변경될 수 있으므로 반드시 견본주택을 통해 확인하시기 바랍니다.
                    </p>
                </div>

                {/* Info Block */}
                <div className="flex flex-col items-center md:items-end space-y-3 text-[12px] text-white/50 mt-2 md:mt-0">

                    {/* 🚀 [신규 추가] 법적 필수 링크 영역 */}
                    <div className="flex items-center gap-4 text-white/70 mb-1 text-[13px]">
                        <Link href="/about" className="hover:text-white transition-colors">회사소개</Link>
                        <span className="text-white/20">|</span>
                        <Link href="/terms" className="hover:text-white transition-colors">이용약관</Link>
                        <span className="text-white/20">|</span>
                        <Link href="/privacy" className="hover:text-white transition-colors font-bold text-white/90">개인정보처리방침</Link>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 font-medium leading-relaxed text-center md:text-right">
                        <p>대표: 정규인 | 사업자등록번호: 545-74-00483</p>
                        <p>주소: 부산광역시 영도구 상리로1 | 고객센터: 1688-5946</p>
                        <p>이메일: koomani.job@gmail.com</p>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                        <Link
                            href="http://pf.kakao.com/_EbnAX"
                            target="_blank"
                            className="inline-flex items-center gap-1.5 bg-[#FF8C42] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] hover:bg-[#ff7a28] hover:scale-105 transition-all shadow-sm"
                        >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 3C6.47715 3 2 6.35786 2 10.5C2 13.2664 3.76357 15.7143 6.46429 17.0714L5.35714 21L9.64286 18.1429C10.4046 18.3025 11.1917 18.3857 12 18.3857C17.5228 18.3857 22 15.0279 22 10.8857C22 6.74357 17.5228 3.38571 12 3V3Z" fill="white" />
                            </svg>
                            카카오톡 상담
                        </Link>
                        <p className="text-white/30 font-medium text-[11px]">
                            © 2026 APARTY.
                        </p>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;