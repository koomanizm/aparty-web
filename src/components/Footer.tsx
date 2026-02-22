import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
    return (
        // 🚀 py-12 였던 상하 여백을 py-8 로 줄여서 높이를 확 낮췄습니다.
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
                </div>

                {/* Info Block */}
                {/* 🚀 간격(space-y)과 글자 크기를 살짝 줄여 오밀조밀하게 배치했습니다. */}
                <div className="flex flex-col items-center md:items-end space-y-3 text-[12px] text-white/50 mt-2 md:mt-0">
                    <div className="flex flex-col items-center md:items-end gap-1 font-medium leading-relaxed text-center md:text-right">
                        <p>대표: 정규인 | 사업자등록번호: 545-74-00483</p>
                        {/* 🚀 세 줄이던 정보를 두 줄로 합쳐서 세로 공간을 절약했습니다. */}
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