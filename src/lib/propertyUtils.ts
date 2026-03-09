import { supabase } from "./supabase";

/**
 * 🚀 한국 시간(KST) 기준 날짜 생성 (YYYY-MM-DD)
 */
const getKSTDate = () => {
    const now = new Date();
    const kst = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC -> KST 보정
    return kst.toISOString().split('T')[0]; // "2024-05-22" 형식
};

/**
 * 🚀 1. 실시간 조회수 증가 (누적 + 오늘 동시 처리)
 */
export const incrementView = async (id: string) => {
    const kstDate = getKSTDate();

    // rpc 이름이 DB의 함수 이름과 정확히 일치해야 합니다.
    const { error } = await supabase.rpc('increment_view_smart', {
        target_id: String(id), // ID는 무조건 문자열로!
        kst_date: kstDate
    });

    if (error) {
        console.error("조회수 증가 실패 상세 내역:", error);
    }
};

/**
 * 🚀 2. 메인 페이지용: [누적] 조회수 기준 TOP 10
 */
export const getRealtimeRankings = async () => {
    const { data, error } = await supabase
        .from('property_stats')
        .select('id, view_count')
        .order('view_count', { ascending: false })
        .limit(10);

    if (error) return [];
    return data;
};

/**
 * 🚀 3. 상세페이지용: [당일] 조회수 가져오기
 */
export const fetchPropertyViews = async (id: string) => {
    const { data, error } = await supabase
        .from('property_stats')
        .select('today_view_count')
        .eq('id', String(id))
        .maybeSingle();

    if (error || !data) return 0;
    return Number(data.today_view_count);
};

/**
 * 🚀 4. 통계 계산기 (상세페이지용)
 */
export const getPropertyStats = (todayViews: number) => {
    const watching = Math.floor(todayViews / 3) + 8;
    return { views: todayViews, watching };
};