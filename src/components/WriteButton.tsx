"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

export default function WriteButton() {
    // 🚀 탐지기 작동! 현재 로그인한 사람의 정보를 가져옵니다.
    const { data: session } = useSession();
    const router = useRouter();

    const handleWriteClick = () => {
        // 🔴 1. 로그인을 안 했다면? (session이 없다면)
        if (!session) {
            alert("로그인이 필요한 서비스입니다. 먼저 로그인해 주세요! 🔒");
            // 확인을 누르면 친절하게 카카오 로그인 창을 띄워줄 수도 있습니다. (선택사항)
            // signIn("kakao"); 
            return; // 튕겨냅니다! (아래 코드가 실행되지 않음)
        }

        // 🟢 2. 로그인을 했다면? (무사 통과)
        // 실제 글쓰기 페이지 경로로 이동시킵니다. (예: /community/write)
        router.push("/community/write");
    };

    return (
        <button
            onClick={handleWriteClick}
            className="flex items-center gap-2 bg-[#FF8C42] hover:bg-[#E67A35] text-white px-5 py-2.5 rounded-full font-black text-[14px] transition-all shadow-md hover:shadow-lg"
        >
            <Pencil size={16} />
            새 글 쓰기
        </button>
    );
}