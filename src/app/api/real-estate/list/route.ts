import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    try {
        const province = request.nextUrl.searchParams.get('province') || "서울특별시";
        const district = request.nextUrl.searchParams.get('district') || "";
        const targetDong = request.nextUrl.searchParams.get('dong') || "";
        const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);

        const limit = 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('aparty_real_trades')
            .select('*')
            .eq('province', province);

        if (district) {
            query = query.eq('district', district);
        }
        if (targetDong) {
            query = query.like('dong', `%${targetDong}%`);
        }

        const { data, error } = await query
            .order('trade_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        const formattedData = data.map((item: any) => ({
            id: item.id,
            name: item.apt_name,
            size: item.size,
            price: item.price,
            date: item.trade_date,
            floor: item.floor,
            type: item.trade_type,
            change: item.change_amt,
            dong: item.dong,
            address: `${item.province} ${item.district} ${item.dong} ${item.jibun}`
        }));

        const hasMore = data.length === limit;

        return NextResponse.json({ aptList: formattedData, hasMore });

    } catch (error: any) {
        return NextResponse.json({ error: "DB Load Error" }, { status: 500 });
    }
}