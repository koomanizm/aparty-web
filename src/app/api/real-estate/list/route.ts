import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

// 🚀 금액 변환 마법사: 1억 넘으면 1.85억, 안 넘으면 5315만원
const formatPrice = (priceEok: number) => {
    if (!priceEok) return "-";
    const num = Math.round(priceEok * 10000);
    if (num >= 10000) {
        return `${(num / 10000).toFixed(2).replace(/\.?0+$/, '')}억`; // 끝자리 0 제거
    }
    return `${num}만원`;
};

// 🚀 평형 변환 마법사: 84㎡ -> 84㎡(25평)
const formatSize = (sizeStr: string) => {
    const num = parseInt(sizeStr.replace(/[^0-9]/g, ''));
    if (!num) return sizeStr;
    const pyeong = Math.round(num * 0.3025);
    return `${num}㎡(${pyeong}평)`;
};

export async function GET(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const province = request.nextUrl.searchParams.get('province') || "";
    const district = request.nextUrl.searchParams.get('district') || "";
    const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);
    const limit = 30;
    const offset = (page - 1) * limit;

    try {
        let query = supabase.from('aparty_real_trades').select('*')
            .order('trade_date', { ascending: false }).range(offset, offset + limit - 1);

        if (province) query = query.like('province', `%${province.substring(0, 2)}%`);
        if (district) query = query.eq('district', district);

        const { data, error } = await query;
        if (error) throw error;

        const aptList = data.map((item: any) => ({
            id: item.id,
            name: item.apt_name,
            size: formatSize(item.size), // 🚀 평형 적용
            address: `${item.province} ${item.district} ${item.dong} ${item.jibun}`,
            date: item.trade_date,
            floor: item.floor,
            price: formatPrice(item.price_eok), // 🚀 디테일 가격 적용
            type: item.trend || "flat",
            change: item.change_amt || "-"
        }));

        return NextResponse.json({ aptList, hasMore: data.length === limit });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}