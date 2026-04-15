import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// 🚨 여기에 카카오 디벨로퍼스에서 복사한 REST API 키를 넣으세요!
const KAKAO_REST_API_KEY = "62f997750611c66f2209af8019e090de";

export async function GET(request: NextRequest) {
    const startTime = Date.now();
    let processedCount = 0;

    try {
        // 1. 아직 '법정동(bjdong)'이 안 채워진 아파트 100개씩 가져오기
        const { data: apts, error: fetchError } = await supabase
            .from('aparty_apt_info')
            .select('id, address')
            .is('bjdong', null)
            .limit(100);

        if (fetchError) throw fetchError;

        if (!apts || apts.length === 0) {
            return new NextResponse(`<h1>🎉 법정동 변환 100% 완료!</h1>`, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        }

        // 2. 100개의 주소를 카카오 API에 물어보고 법정동 알아내기
        for (const apt of apts) {
            // 주소에 괄호나 쓸데없는 글자가 있으면 카카오가 헷갈려 하니 정리
            const cleanAddress = apt.address.split('(')[0].trim();

            const response = await fetch(`https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(cleanAddress)}`, {
                headers: { 'Authorization': `KakaoAK ${KAKAO_REST_API_KEY}` }
            });
            const data = await response.json();

            // 카카오가 주소를 찾았다면 법정동(region_3depth_name)을 추출!
            if (data.documents && data.documents.length > 0) {
                const bjdong = data.documents[0].address.region_3depth_name; // 예: '미아동'

                // 수파베이스에 법정동 업데이트
                await supabase
                    .from('aparty_apt_info')
                    .update({ bjdong: bjdong })
                    .eq('id', apt.id);
            } else {
                // 못 찾은 주소는 일단 '확인불가'로 처리해서 로봇이 무한루프 안 돌게 방지
                await supabase.from('aparty_apt_info').update({ bjdong: '확인불가' }).eq('id', apt.id);
            }
            processedCount++;
        }

        // 3. 1초 뒤 자동 새로고침하며 이어달리기
        const nextUrl = `/api/sync/get-dong?t=${Date.now()}`;
        return new NextResponse(`
            <html>
                <head><meta http-equiv="refresh" content="1;url=${nextUrl}"></head>
                <body style="background:#222; color:#fff; font-family:sans-serif; text-align:center; padding-top:20vh;">
                    <h2>📍 카카오 API로 도로명 ➡️ 법정동 변환 중...</h2>
                    <p>이번 턴 완료: ${processedCount}개</p>
                </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}