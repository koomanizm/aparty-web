export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        // 🔥 1. 공공데이터 호출? 그런 거 없습니다. 바로 우리 DB에서 긁어옵니다.
        const { data, error } = await supabase
            .from('aparty_competitions')
            .select('*')
            .order('sort_date', { ascending: false }); // 최신순 정렬

        if (error) throw error;

        // 🚀 2. 프론트엔드가 수정 없이 그대로 쓸 수 있도록 이름만 맞춰서 내려줍니다.
        const formattedData = data.map(item => ({
            id: item.id,
            name: item.name,
            addr: item.addr,
            date: item.announce_date,
            sortDate: item.sort_date,
            avgRate: item.avg_rate,
            maxRate: item.max_rate,
            models: item.models
        }));

        console.log(`⚡ Supabase 초고속 로드 완료: ${formattedData.length}개 단지`);
        return NextResponse.json({ success: true, data: formattedData });

    } catch (error: any) {
        console.error("🔥 DB 로드 에러:", error);
        return NextResponse.json({ error: "DB 데이터를 불러오지 못했습니다." }, { status: 500 });
    }
}