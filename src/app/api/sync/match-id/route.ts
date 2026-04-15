import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// 일반 키를 쓰더라도 DB에서 VIP 권한을 줬기 때문에 이제 튕기지 않습니다!
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        // 스나이퍼 총 쏘기!
        const { data: count, error } = await supabase.rpc('batch_update_apt_info_id');

        if (error) throw error;

        // 더 이상 쏠 총알이 없으면 완료 화면
        if (count === 0) {
            return new NextResponse(`<h1>🎉 870만개 실거래가 매칭 100% 완료!</h1>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // 1초 뒤에 쿨하게 이어달리기
        const nextUrl = `/api/sync/match-id?t=${Date.now()}`;
        return new NextResponse(`
            <html>
                <head><meta http-equiv="refresh" content="1;url=${nextUrl}"></head>
                <body style="background:#222; color:#fff; text-align:center; padding-top:20vh; font-family: sans-serif;">
                    <h2>🔫 스나이퍼 로봇이 실거래가에 정답 꽂는 중...</h2>
                    <p style="font-size: 20px; color: #4ade80;">이번 턴 완료: ${count}개 단지 전파 완료</p>
                </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}