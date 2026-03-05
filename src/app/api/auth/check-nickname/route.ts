import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { nickname } = await req.json();

        if (!nickname || nickname.trim() === '') {
            return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
        }

        // 🚀 [중요] 여기에 실제 DB 조회 코드가 들어갑니다.
        // 지금은 테스트를 위해 'admin', '아파티', '부린이' 3개만 이미 가입된 닉네임이라고 가정할게요!
        const existingNicknames = ['admin', '아파티', '부린이'];

        const isDuplicate = existingNicknames.includes(nickname);

        if (isDuplicate) {
            return NextResponse.json({
                available: false,
                message: "앗, 이미 누군가 사용 중인 닉네임입니다. 🥲"
            });
        }

        return NextResponse.json({
            available: true,
            message: "사용 가능한 멋진 닉네임입니다! ✨"
        });

    } catch (error) {
        console.error("닉네임 체크 오류:", error);
        return NextResponse.json({ error: "서버 통신 중 오류가 발생했습니다." }, { status: 500 });
    }
}