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
    const aptSize = request.nextUrl.searchParams.get('aptSize') || ""; // 🚀 프론트에서 보낸 평형 받기
    const page = parseInt(request.nextUrl.searchParams.get('page') || "1", 10);
    const limit = 15;
    const offset = (page - 1) * limit;

    try {
        // 🚀 [마법의 3중 필터 쿼리 생성]
        let listQuery = supabase.from('aparty_real_trades')
            .select('*')
            .eq('apt_name', aptName)
            .is('cancel_date', null) // 필터 1: 취소된 거래(허위매물) 완벽 제외
            .neq('req_gbn', '직거래'); // 필터 2: 직거래(증여 등 이상가격) 제외

        // 필터 3: 평형(면적) 일치시키기 (aptSize가 "84㎡" 형태면 숫자만 빼서 매칭)
        if (aptSize) {
            const sizeNum = aptSize.replace(/[^0-9.]/g, '');
            if (sizeNum) {
                // 전용면적이 84.98 이라도 84로 검색될 수 있도록 앞자리 일치 또는 오차범위 검색
                const num = parseInt(sizeNum);
                listQuery = listQuery.gte('exclu_use_ar', num - 1).lte('exclu_use_ar', num + 1);
            }
        }

        // 1. 하단 실거래 내역 리스트 (필터 적용)
        const { data: txData, error: txError } = await listQuery
            .order('trade_date', { ascending: false })
            .range(offset, offset + limit - 1);

        if (txError) throw txError;

        const txList = txData.map((item: any) => ({
            date: item.trade_date,
            type: "매매",
            floor: item.floor,
            price: formatPrice(item.price_eok)
        }));

        let chart: any[] = [];
        let aptInfo: any = null;

        if (page === 1) {
            const tenYearsAgoYY = (new Date().getFullYear() - 10).toString().slice(-2);

            // 2. 상단 차트 데이터 (동일하게 마법의 3중 필터 적용!)
            let chartQuery = supabase.from('aparty_real_trades')
                .select('trade_date, price_eok')
                .eq('apt_name', aptName)
                .is('cancel_date', null)
                .neq('req_gbn', '직거래')
                .gte('trade_date', `${tenYearsAgoYY}.01.01`);

            if (aptSize) {
                const sizeNum = aptSize.replace(/[^0-9.]/g, '');
                if (sizeNum) {
                    const num = parseInt(sizeNum);
                    chartQuery = chartQuery.gte('exclu_use_ar', num - 1).lte('exclu_use_ar', num + 1);
                }
            }

            const { data: chartData } = await chartQuery
                .order('trade_date', { ascending: false })
                .limit(5000);

            if (chartData) {
                chart = chartData.reverse().map((item: any) => ({
                    year: item.trade_date,
                    price: item.price_eok
                }));
            }

            // 단지 마스터 정보 가져오기 (이전 단계 완료분)
            const { data: infoData } = await supabase.from('aparty_apt_info')
                .select('total_households, completion_date, parking_count')
                .eq('apt_name', aptName)
                .limit(1)
                .maybeSingle();

            if (infoData) {
                let formattedDate = "-";
                if (infoData.completion_date) {
                    const dStr = infoData.completion_date.replace(/\D/g, '');
                    formattedDate = dStr.length >= 6 ? `${dStr.substring(0, 4)}.${dStr.substring(4, 6)}` : infoData.completion_date;
                }
                aptInfo = {
                    total_households: infoData.total_households,
                    completion_date: formattedDate,
                    parking_count: infoData.parking_count
                };
            }
        }

        return NextResponse.json({ chart, txList, hasMore: txData.length === limit, aptInfo });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}