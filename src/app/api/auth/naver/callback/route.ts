import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code) return NextResponse.redirect(new URL('/?error=no_code', request.url));

    try {
        const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID!,
                client_secret: process.env.NAVER_CLIENT_SECRET!,
                code,
                state: state || 'aparty',
            }),
        });
        const tokenData = await tokenResponse.json();

        const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userData = await userResponse.json();
        const naverUser = userData.response;
        const email = naverUser.email;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const syntheticPassword = `naver_${naverUser.id}_${process.env.NAVER_CLIENT_SECRET}`.substring(0, 30);

        // 1. 유저 존재 여부 확인
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            // 이미 있으면 비번만 업데이트
            await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
                password: syntheticPassword
            });
        } else {
            // 없으면 새로 생성 (오타 수정 완료!)
            const { error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email,
                password: syntheticPassword,
                email_confirm: true,
                user_metadata: { name: naverUser.name, provider: 'naver' }
            });
            if (createError) throw createError;
        }

        // 2. 로그인 시도
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseAnonKey);

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: syntheticPassword,
        });

        if (signInError || !signInData.session) throw signInError;

        // 3. 성공! 토큰과 함께 메인으로!
        const session = signInData.session;
        const redirectUrl = new URL('/', request.url);
        redirectUrl.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}&type=oauth`;

        return NextResponse.redirect(redirectUrl);

    } catch (error: any) {
        console.error('서버 에러 발생:', error.message);
        return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, request.url));
    }
}