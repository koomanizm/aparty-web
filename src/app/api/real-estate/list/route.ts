import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 3600;

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const getShortAreaName = (name: string | null) => {
    if (!name || name === 'null') return '';
    if (name.includes("경남") || name.includes("경상남도")) return "경남";
    if (name.includes("경북") || name.includes("경상북도")) return "경북";
    if (name.includes("전남") || name.includes("전라남도")) return "전남";
    if (name.includes("전북") || name.includes("전라북도") || name.includes("전북특별")) return "전북";
    if (name.includes("충남") || name.includes("충청남도")) return "충남";
    if (name.includes("충북") || name.includes("충청북도")) return "충북";
    if (name.includes("강원")) return "강원";
    if (name.includes("제주")) return "제주";
    return name.substring(0, 2);
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const province = searchParams.get('province');
    const district = searchParams.get('district');
    const search = searchParams.get('search');

    // 스마트 필터 값 수신
    const isNew = searchParams.get('isNew') === 'true';
    const isGoodParking = searchParams.get('isGoodParking') === 'true';

    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    try {
        const shortProvince = getShortAreaName(province);
        const safeDistrict = (district && district !== 'null') ? district : '';

        let matchedAptIds: string[] = [];
        if (search) {
            const { data: searchApts, error: searchError } = await supabase
                .from('aparty_apt_info')
                .select('id')
                .ilike('apt_name', `%${search}%`);

            if (searchError) throw searchError;
            if (!searchApts || searchApts.length === 0) {
                return NextResponse.json({ aptList: [], hasMore: false });
            }
            matchedAptIds = searchApts.map(a => a.id);
        }

        let query: any = supabase
            .from('aparty_real_trades')
            .select(`
                id, apt_info_id, apt_name, dong, size, trade_date, floor, price, price_eok,
                aparty_apt_info!inner (
                    address, total_households, completion_date, parking_count
                )
            `)
            .eq('is_checked', true)
            .order('trade_date', { ascending: false });

        if (search && matchedAptIds.length > 0) {
            query = query.in('apt_info_id', matchedAptIds);
        }

        if (shortProvince && safeDistrict) {
            query = query.like('aparty_apt_info.address', `${shortProvince}%${safeDistrict}%`);
        } else if (shortProvince) {
            query = query.like('aparty_apt_info.address', `${shortProvince}%`);
        }

        // 필터가 걸려있으면 더 많은 데이터를 긁어와서 거릅니다
        const fetchLimit = (isNew || isGoodParking) ? limit * 10 : limit * 5;
        const from = (page - 1) * fetchLimit;
        const to = from + fetchLimit - 1;

        query = query.range(from, to);

        const { data, error } = await query;
        const rawTrades = data as any[] | null;

        if (error) throw error;
        if (!rawTrades || rawTrades.length === 0) return NextResponse.json({ aptList: [], hasMore: false });

        const uniqueAptsMap = new Map();
        const resultList = [];

        for (const trade of rawTrades) {
            const uniqueKey = `${trade.apt_info_id}_${trade.size}`;

            if (!uniqueAptsMap.has(uniqueKey)) {
                const info = trade.aparty_apt_info || {};

                // 신축 필터 로직
                if (isNew) {
                    let buildYear = parseInt(info.completion_date?.split('.')[0] || '0', 10);
                    if (buildYear > 0 && buildYear < 100) buildYear += 2000;
                    if (buildYear < 2021) continue;
                }

                // 주차 여유 필터 로직
                if (isGoodParking) {
                    const p = parseInt(String(info.parking_count || '0').replace(/[^0-9]/g, ''), 10);
                    const t = parseInt(String(info.total_households || '0').replace(/[^0-9]/g, ''), 10);
                    if (!t || t === 0 || (p / t) < 1.3) continue;
                }

                uniqueAptsMap.set(uniqueKey, true);

                resultList.push({
                    id: trade.id,
                    apt_info_id: trade.apt_info_id,
                    name: trade.apt_name,
                    size: `${trade.size}㎡`,
                    address: info.address || trade.dong,
                    date: trade.trade_date,
                    // 🚀 오류 수정: '층' 이라는 한글 텍스트를 빼고 순수 숫자 데이터만 프론트엔드로 보냅니다.
                    floor: `${trade.floor}`,
                    price: trade.price,
                    price_eok: trade.price_eok,
                    type: 'flat',
                    change: '-',
                    total_households: info.total_households,
                    completion_date: info.completion_date,
                    parking_count: info.parking_count,
                    build_year: info.completion_date?.split('.')[0] || '0',
                    parking_ratio: (info.parking_count && info.total_households)
                        ? (info.parking_count / info.total_households).toFixed(2)
                        : '0'
                });
            }
            if (resultList.length >= limit) break;
        }

        return NextResponse.json({
            aptList: resultList,
            hasMore: rawTrades.length === fetchLimit
        });

    } catch (error: any) {
        console.error("List API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}