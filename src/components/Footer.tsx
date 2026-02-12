import React from 'react';
import Image from 'next/image';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-400 py-8 text-sm border-t border-gray-800">
            <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4">

                {/* Brand Block */}
                <div className="flex flex-col items-center md:items-start space-y-3">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/aparty_white.png.png"
                            alt="Aparty White Logo"
                            width={150}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                        <span className="text-xl font-bold text-white tracking-wider">APARTY</span>
                    </div>
                    <p className="text-gray-500 text-xs text-center md:text-left">
                        No.1 부동산 분양 정보 플랫폼
                    </p>
                </div>

                {/* Info Block */}
                <div className="flex flex-col items-center md:items-end space-y-1.5 text-xs text-gray-400">
                    <div className="flex flex-col md:items-end gap-1">
                        <p>대표: 정규인 | 사업자등록번호: 545-74-00483</p>
                        <p>주소: 부산광역시 영도구 상리로1</p>
                        <p>고객센터: 1688-5946 | koomani.job@gmail.com</p>
                    </div>
                    <p className="mt-3 text-gray-600 font-medium">© 2026 APARTY. All rights reserved.</p>
                </div>

            </div>
        </footer >
    );
};

export default Footer;
