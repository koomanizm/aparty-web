import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
    try {
        const aptName = request.nextUrl.searchParams.get('aptName') || "";
        const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);

        const limit = 8;
        const offset = (page - 1) * limit;

        const { data: txData, error: txError } = await supabase
            .from('aparty_real_trades')
            .select('*')
            .eq('apt_name', aptName)
            .order('trade_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (txError) throw txError;

        const formattedTxList = txData.map((item: any) => ({
            id: item.id,
            date: item.trade_date,
            price: item.price,
            floor: item.floor,
            type: item.trade_type,
            trend: item.trend
        }));

        let chartData: any[] = [];

        if (page === 1) {
            const { data: chartRaw, error: chartError } = await supabase
                .from('aparty_real_trades')
                .select('trade_date, price_eok')
                .eq('apt_name', aptName)
                .order('trade_date', { ascending: true });

            if (!chartError && chartRaw && chartRaw.length > 0) {
                const yearlyAvg = chartRaw.reduce((acc: any, curr: any) => {
                    const year = curr.trade_date.substring(0, 4);
                    if (!acc[year]) {
                        acc[year] = { sum: 0, count: 0 };
                    }
                    acc[year].sum += parseFloat(curr.price_eok);
                    acc[year].count += 1;
                    return acc;
                }, {});

                chartData = Object.keys(yearlyAvg).map(year => ({
                    year: `${year.slice(-2)}년`,
                    price: Number((yearlyAvg[year].sum / yearlyAvg[year].count).toFixed(1))
                }));
            }
        }

        const hasMore = txData.length === limit;

        return NextResponse.json({
            chart: chartData,
            txList: formattedTxList,
            hasMore
        });

    } catch (error: any) {
        return NextResponse.json({ error: "DB Load Error" }, { status: 500 });
    }
}