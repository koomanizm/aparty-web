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
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const aptName = request.nextUrl.searchParams.get('aptName') || "";
        const aptSize = request.nextUrl.searchParams.get('aptSize') || "";
        const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);
        const limit = 15;
        const offset = (page - 1) * limit;

        let targetSize: number | null = null;
        if (aptSize) {
            const match = aptSize.match(/([0-9.]+)/);
            if (match && match[1]) {
                targetSize = parseFloat(match[1]);
            }
        }

        let listQuery = supabase.from('aparty_real_trades')
            .select('*')
            .eq('apt_name', aptName)
            .is('cancel_date', null)
            .or('req_gbn.neq.직거래,req_gbn.is.null');

        if (targetSize !== null && !isNaN(targetSize)) {
            listQuery = listQuery.eq('exclu_use_ar', targetSize);
        }

        const { data: txData, error: txError } = await listQuery
            .order('trade_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (txError) throw txError;

        const txList = (txData || []).map((item: any) => ({
            date: item.trade_date,
            type: item.req_gbn || "매매",
            floor: item.floor,
            price: formatPrice(item.price_eok)
        }));

        let chart: any[] = [];
        let aptInfo: any = null;

        if (page === 1) {
            // 🚀 [수정] 10년 전 연도를 'YY' 포맷으로 변경하여 16.xx 데이터 필터링 버그 해결
            const tenYearsAgoYY = (new Date().getFullYear() - 10).toString().slice(-2);

            let chartQuery = supabase.from('aparty_real_trades')
                .select('trade_date, price_eok')
                .eq('apt_name', aptName)
                .is('cancel_date', null)
                .or('req_gbn.neq.직거래,req_gbn.is.null')
                .gte('trade_date', `${tenYearsAgoYY}.01.01`);

            if (targetSize !== null && !isNaN(targetSize)) {
                chartQuery = chartQuery.eq('exclu_use_ar', targetSize);
            }

            const { data: chartData, error: chartError } = await chartQuery
                .order('trade_date', { ascending: false })
                .limit(5000);

            if (chartError) throw chartError;

            if (chartData) {
                chart = [...chartData].reverse().map((item: any) => ({
                    year: item.trade_date,
                    price: item.price_eok
                }));
            }

            let dongName = "";
            if (txData && txData.length > 0) {
                const targetAddress = txData[0].address || txData[0].bjdong || txData[0].dong || "";
                if (targetAddress) {
                    dongName = String(targetAddress).split(' ')[0].trim();
                }
            }

            const cleanTarget = aptName.replace(/아파트$/, '').replace(/\s/g, '');

            let infoQuery = supabase
                .from('aparty_apt_info')
                .select('apt_name, total_households, completion_date, parking_count')
                .ilike('apt_name', `%${cleanTarget}%`);

            if (dongName) {
                infoQuery = infoQuery.or(`bjdong.ilike.%${dongName}%,address.ilike.%${dongName}%`);
            }

            let { data: candidates } = await infoQuery;

            if (dongName && (!candidates || candidates.length === 0)) {
                const { data: retryData } = await supabase
                    .from('aparty_apt_info')
                    .select('apt_name, total_households, completion_date, parking_count')
                    .ilike('apt_name', `%${cleanTarget}%`);
                candidates = retryData;
            }

            if (candidates && candidates.length > 0) {
                let mainInfo = null;

                mainInfo = candidates.find(c => {
                    const cName = String(c.apt_name).replace(/아파트$/, '').replace(/\s/g, '');
                    return cName === cleanTarget;
                });

                if (!mainInfo) {
                    mainInfo = candidates.find(c => {
                        const cName = String(c.apt_name).replace(/아파트$/, '').replace(/\s/g, '');
                        if (cleanTarget.length >= 3 && cName.length >= 3) {
                            return cleanTarget.includes(cName) || cName.includes(cleanTarget);
                        }
                        return false;
                    });
                }

                if (!mainInfo) {
                    mainInfo = candidates[0];
                }

                if (mainInfo) {
                    const hhStr = String(mainInfo.total_households || "0").replace(/[^0-9]/g, '');
                    const hhNum = parseInt(hhStr, 10);

                    let formattedDate = "-";
                    const rawDate = String(mainInfo.completion_date || "").trim();
                    if (rawDate && !["정보없음", "NaN", "null", "-"].includes(rawDate)) {
                        const dStr = rawDate.replace(/\D/g, '');
                        if (dStr.length >= 6) formattedDate = `${dStr.substring(0, 4)}.${dStr.substring(4, 6)}`;
                        else if (dStr.length === 4) formattedDate = dStr;
                    }

                    aptInfo = {
                        total_households: isNaN(hhNum) ? 0 : hhNum,
                        completion_date: formattedDate,
                        parking_count: mainInfo.parking_count || "-"
                    };
                }
            }
        }

        return NextResponse.json({ chart, txList, hasMore: (txData || []).length === limit, aptInfo });

    } catch (error: any) {
        console.error("💥 단지 상세 API 에러:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}