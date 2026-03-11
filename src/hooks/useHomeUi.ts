// src/hooks/useHomeUi.ts
import { useState, useEffect, useCallback } from "react";

export function useHomeUi(noticesCount: number) {
    const [viewMode, setViewMode] = useState<'gallery' | 'map'>('gallery');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [bottomOffset, setBottomOffset] = useState(0);
    const [tickerIndex, setTickerIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [needleRotation, setNeedleRotation] = useState(-90);
    const [isMapReady, setIsMapReady] = useState(false);

    // 모달 관련 상태
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // 스크롤 핸들러
    useEffect(() => {
        const handleScroll = () => {
            const scrollBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
            setBottomOffset(scrollBottom < 200 ? 200 - scrollBottom : 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 공지 티커 로직
    useEffect(() => {
        if (noticesCount === 0) return;
        const interval = setInterval(() => {
            setIsTransitioning(true);
            setTickerIndex(prev => prev + 1);
        }, 3000);
        return () => clearInterval(interval);
    }, [noticesCount]);

    useEffect(() => {
        if (tickerIndex === noticesCount && noticesCount > 0) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
                setTickerIndex(0);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [tickerIndex, noticesCount]);

    // 실거래 히스토리 fetch (모달용)
    const fetchApartmentHistory = useCallback(async (aptName: string, lawdCd: string) => {
        setIsHistoryLoading(true); setHistoryData([]); setActiveIndex(null);
        try {
            const now = new Date();
            const requests = [];
            for (let i = 0; i < 12; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
                requests.push(fetch(`/api/molit?lawdCd=${lawdCd}&dealYmd=${monthStr}`).then(res => res.text()));
            }
            const results = await Promise.all(requests);
            const allItems: any[] = [];
            const searchKey = aptName.split('(')[0].trim();

            results.forEach(xml => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xml, "text/xml");
                const items = xmlDoc.getElementsByTagName("item");
                Array.from(items).forEach((item: any) => {
                    if (item.getElementsByTagName("aptNm")[0]?.textContent?.includes(searchKey)) {
                        allItems.push({
                            price: parseInt((item.getElementsByTagName("dealAmount")[0]?.textContent || "0").replace(/,/g, "")),
                            date: `${item.getElementsByTagName("dealYear")[0]?.textContent}.${item.getElementsByTagName("dealMonth")[0]?.textContent.padStart(2, '0')}`
                        });
                    }
                });
            });

            const monthlyAvg: any = {};
            allItems.forEach(it => {
                if (!monthlyAvg[it.date]) monthlyAvg[it.date] = { sum: 0, count: 0 };
                monthlyAvg[it.date].sum += it.price; monthlyAvg[it.date].count += 1;
            });
            setHistoryData(Object.keys(monthlyAvg).sort().map(date => ({ date: date.substring(2), price: Math.round(monthlyAvg[date].sum / monthlyAvg[date].count) })));
        } catch (e) { console.error(e); } finally { setIsHistoryLoading(false); }
    }, []);

    useEffect(() => {
        if (selectedItem?.type === "transaction" && selectedItem.lawdCd) {
            fetchApartmentHistory(selectedItem.title, selectedItem.lawdCd);
        }
    }, [selectedItem, fetchApartmentHistory]);

    return {
        viewMode, setViewMode, isFullScreen, setIsFullScreen, bottomOffset,
        tickerIndex, isTransitioning, needleRotation, setNeedleRotation,
        isMapReady, setIsMapReady, selectedItem, setSelectedItem,
        historyData, isHistoryLoading, activeIndex, setActiveIndex
    };
}