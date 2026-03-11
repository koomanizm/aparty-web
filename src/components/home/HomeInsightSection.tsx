// src/components/home/HomeInsightSection.tsx
"use client";

import MarketSentimentCard from "./MarketSentimentCard";
import MarketDashboard from "./MarketDashboard";
import RealtimeRankingCard from "./RealtimeRankingCard";
import ToolShortcutGrid from "./ToolShortcutGrid";

interface HomeInsightSectionProps {
    sentimentRegion: string;
    sentiment: any;
    needleRotation: number;
    dashboardTab: "transaction" | "competition" | "calendar" | "population";
    setDashboardTab: (tab: "transaction" | "competition" | "calendar" | "population") => void;
    dashboardRegion: string;
    setDashboardRegion: (region: string) => void;
    regionCodesList: string[];
    apiData: any[];
    isApiLoading: boolean;
    setSelectedItem: (item: any) => void;
    realtimeRankings: { id: string, view_count: number }[];
    properties: any[];
}

export default function HomeInsightSection(props: HomeInsightSectionProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-[23fr_58fr_26fr] gap-4 md:gap-5 w-full max-w-7xl text-left mb-6 md:mb-8 px-4 items-stretch">
            {/* 1. 좌측: 부동산 종합 지표 */}
            <div className="w-full">
                <MarketSentimentCard sentimentRegion={props.sentimentRegion} sentiment={props.sentiment} needleRotation={props.needleRotation} />
            </div>

            {/* 2. 중앙: 대시보드 */}
            <MarketDashboard {...props} />

            {/* 3. 우측: 랭킹 및 툴 */}
            <div className="w-full flex flex-col gap-4 md:gap-5 h-full min-w-0">
                <RealtimeRankingCard realtimeRankings={props.realtimeRankings} properties={props.properties} />
                <ToolShortcutGrid />
            </div>
        </div>
    );
}