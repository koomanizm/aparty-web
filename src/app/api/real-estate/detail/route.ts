import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const formatPrice = (priceEok: number) => {
    if (!priceEok) return "-";
    const num = Math.round(priceEok * 10000);
    if (num >= 10000) {
        return `${(num / 10000).toFixed(2).replace(/\.?0+$/, '')}억`;
    }
    return `${num}만원`;
};

export async function GET(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const aptName = request.nextUrl.searchParams.get('aptName') || "";
    const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);
    const limit = 15;
    const offset = (page - 1) * limit;

    try {
        const { data: txData, error: txError } = await supabase.from('aparty_real_trades')
            .select('*').eq('apt_name', aptName).order('trade_date', { ascending: false }).range(offset, offset + limit - 1);

        if (txError) throw txError;

        const txList = txData.map((item: any) => ({
            date: item.trade_date,
            type: "매매",
            floor: item.floor,
            price: formatPrice(item.price_eok) // 🚀 디테일 가격 적용
        }));

        let chart: any[] = [];
        if (page === 1) {
            const tenYearsAgo = new Date().getFullYear() - 10;
            const { data: chartData } = await supabase.from('aparty_real_trades')
                .select('trade_date, price_eok').eq('apt_name', aptName).gte('trade_date', `${tenYearsAgo}.01.01`).order('trade_date', { ascending: true });

            if (chartData) {
                chart = chartData.map((item: any) => {
                    const year = item.trade_date.split('.')[0] || "";
                    return {
                        year: year.length === 2 ? `20${year}` : year, // 🚀 "21"을 "2021"로 완벽 변환
                        price: item.price_eok
                    };
                });
            }
        }

        return NextResponse.json({ chart, txList, hasMore: txData.length === limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}