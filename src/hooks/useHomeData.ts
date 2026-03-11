// src/hooks/useHomeData.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getPropertiesFromSheet, Property, Notice } from "../lib/sheet";
import { getRealtimeRankings } from "../lib/propertyUtils";
import { useRouter } from "next/navigation";

export function useHomeData() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [notices, setNotices] = useState<Notice[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
    const [realtimeRankings, setRealtimeRankings] = useState<{ id: string, view_count: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("전체");
    const [activeRegion, setActiveRegion] = useState("전국");
    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    // 🚀 초기값 8개로 시작하지만, 아래 useEffect에서 모바일 여부를 즉시 체크합니다.
    const [itemsPerPage, setItemsPerPage] = useState(8);

    // 📱 모바일 대응: 화면 크기에 따라 5개 또는 8개로 조절
    useEffect(() => {
        const updateItemsPerPage = () => {
            // 768px 미만(모바일)이면 5개, 아니면 8개
            setItemsPerPage(window.innerWidth < 768 ? 5 : 8);
        };

        updateItemsPerPage(); // 초기 실행
        window.addEventListener("resize", updateItemsPerPage);
        return () => window.removeEventListener("resize", updateItemsPerPage);
    }, []);

    // 초기 데이터 로딩
    useEffect(() => {
        async function loadInitialData() {
            try {
                const [p, { data: noticeData }] = await Promise.all([
                    getPropertiesFromSheet(),
                    supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(5)
                ]);
                const validProps = p.filter((item: Property) => item?.id !== undefined && item?.title);
                setProperties(validProps);
                setFilteredProperties(validProps);
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

    // 인증 로직
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

    // 필터링 로직
    useEffect(() => {
        let result = properties;
        if (activeFilter !== "전체") result = result.filter(p => p.status?.includes(activeFilter));
        if (activeRegion !== "전국") {
            const regionKeywords: any = { "서울": ["서울"], "경기": ["경기"], "인천": ["인천"], "부산": ["부산"], "대전": ["대전"], "대구": ["대구"], "광주": ["광주"], "세종": ["세종"], "울산": ["울산"], "강원": ["강원"], "충북": ["충북", "충청북도"], "충남": ["충남", "충청남도"], "전북": ["전북", "전라북도"], "전남": ["전남", "전라남도"], "경북": ["경북", "경상북도"], "경남": ["경남", "경상남도"], "제주": ["제주"] };
            const keywords = regionKeywords[activeRegion] || [activeRegion];
            result = result.filter(p => p.location && keywords.some((kw: string) => p.location.includes(kw)));
        }
        if (searchQuery) {
            const terms = searchQuery.trim().toLowerCase().split(/\s+/);
            result = result.filter(p => {
                const text = `${p.title} ${p.location} ${p.status?.join(" ")}`.toLowerCase();
                return terms.every(term => text.includes(term));
            });
        }
        setFilteredProperties(result);
    }, [searchQuery, activeFilter, activeRegion, properties]);

    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const currentProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return {
        properties, notices, filteredProperties, currentProperties, realtimeRankings,
        isLoading, searchQuery, setSearchQuery, activeFilter, setActiveFilter,
        activeRegion, setActiveRegion, isFilterApplied, setIsFilterApplied,
        currentPage, setCurrentPage, totalPages, itemsPerPage, setItemsPerPage
    };
}