import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getPropertiesFromSheet, Property, Notice } from "../lib/sheet";
import { getRealtimeRankings } from "../lib/propertyUtils";
import { useRouter } from "next/navigation";

export function useHomeData() {
    const router = useRouter();

    // 1. 순수 원본 데이터 State
    const [properties, setProperties] = useState<Property[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [realtimeRankings, setRealtimeRankings] = useState<{ id: string, view_count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. UI 컨트롤 상태 (UI 컴포넌트로 넘겨주는 용도)
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("전체");
    const [activeRegion, setActiveRegion] = useState("전국");
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [viewMode, setViewMode] = useState<'gallery' | 'map'>('gallery'); // 뷰 모드 상태 추가

    // 📱 모바일 대응: 화면 크기에 따라 5개 또는 8개로 조절
    useEffect(() => {
        const updateItemsPerPage = () => {
            setItemsPerPage(window.innerWidth < 768 ? 5 : 8);
        };

        updateItemsPerPage();
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    // 🚀 초기 데이터 로딩 (구글 시트 & Supabase)
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [p, { data: noticeData }] = await Promise.all([
                    getPropertiesFromSheet(),
                    supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5)
                ]);

                const validProps = p.filter((item: Property) => item?.id !== undefined && item?.title);
                setProperties(validProps);

                if (noticeData) setNotices(noticeData as Notice[]);

                const rankings = await getRealtimeRankings();
                setRealtimeRankings(rankings);
            } catch (error) {
                console.error("데이터 로딩 실패:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadInitialData();
    }, []);

    // 🔒 인증 로직 (Guest 체크)
    useEffect(() => {
        const processAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase.from('profiles').select('nickname').eq('id', session.user.id).single();
                if (profile && profile.nickname === 'Guest') {
                    router.push('/welcome');
                }
            }
        };
        processAuth();
    }, [router]);

    // 🚀 기존에 이중으로 연산되던 무거운 필터/페이지네이션 로직을 제거했습니다.
    // 이제 데이터 필터링과 페이지네이션의 '주도권'은 PropertyFeedSection 컴포넌트가 온전히 갖습니다.
    // 기존 코드와의 호환성을 위해 이름(filteredProperties, currentProperties)은 유지하되, 원본을 그대로 넘겨줍니다.

    return {
        // 데이터
        properties,
        notices,
        realtimeRankings,
        isLoading,

        // 하위 호환성 유지용 (PropertyFeedSection이 알아서 가공함)
        filteredProperties: properties,
        currentProperties: properties,

        // 상태 제어
        searchQuery, setSearchQuery,
        activeFilter, setActiveFilter,
        activeRegion, setActiveRegion,
        isFilterApplied, setIsFilterApplied,
        currentPage, setCurrentPage,
        totalPages: 1, // PropertyFeedSection에서 덮어씀
        itemsPerPage, setItemsPerPage,
        viewMode, setViewMode
    };
}