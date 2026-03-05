"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { Property } from "../lib/sheet";
import { MapPin, ChevronLeft, ChevronRight, Building2, Search, Loader2 } from "lucide-react";

interface MainMapExplorerProps { properties: Property[]; }
declare global { interface Window { kakao: any; } }
const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

export default function MainMapExplorer({ properties }: MainMapExplorerProps) {
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [visibleProperties, setVisibleProperties] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [mapItems, setMapItems] = useState<any[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const overlaysRef = useRef<any[]>([]);

    // 📍 1. 사이드바 접히고 펴질 때 지도 크기 재계산 (회색 화면 방지)
    useEffect(() => {
        if (mapRef.current) {
            // 즉시 실행
            mapRef.current.relayout();

            // 애니메이션(duration-500)이 끝나는 시점에 한 번 더 실행하여 꽉 채움
            const timer = setTimeout(() => {
                mapRef.current.relayout();
                // 지도가 넓어질 때 중심이 틀어지지 않도록 재설정
                const center = mapRef.current.getCenter();
                mapRef.current.setCenter(center);
            }, 520);

            return () => clearTimeout(timer);
        }
    }, [isSidebarOpen]);

    // 📍 2. 마커를 그리는 함수 (현재 화면 내 매물만 번호 매겨서 그림)
    const drawMarkers = useCallback((map: any, filteredItems: any[]) => {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];

        filteredItems.forEach((item) => {
            const coords = new window.kakao.maps.LatLng(item.lat, item.lng);
            const newIndex = item.displayIndex; // 실시간 부여된 번호 사용

            const status = item.status && item.status.length > 0 ? item.status[0] : "분양중";
            let bgColor = "#4A403A";
            if (status.includes("줍줍") || status.includes("선착순")) bgColor = "#EF4444";
            else if (status.includes("마감임박")) bgColor = "#F59E0B";
            else if (status.includes("분양예정")) bgColor = "#3B82F6";

            const content = `
                <div onclick="window.location.href='/property/${item.id}'" style="cursor: pointer; position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25)); transform: translateY(-100%); transition: all 0.2s;">
                  <div style="background: white; border-radius: 50px; display: flex; align-items: center; padding: 4px 12px 4px 4px; gap: 8px; border: 2.5px solid ${bgColor};">
                    <span style="background: ${bgColor}; color: white; min-width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900;">${newIndex}</span>
                    <div style="display: flex; flex-direction: column;">
                      <span style="color: ${bgColor}; font-size: 9px; font-weight: 800; line-height: 1;">${status}</span>
                      <span style="color: #4A403A; font-size: 13px; font-weight: 900; white-space: nowrap; margin-top: 1px;">${item.title}</span>
                    </div>
                  </div>
                  <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid ${bgColor}; margin-top: -1px;"></div>
                </div>
            `;

            const overlay = new window.kakao.maps.CustomOverlay({ position: coords, content: content, map: map });
            overlaysRef.current.push(overlay);
        });
    }, []);

    // 📍 3. 화면 영역 내 매물 필터링 및 번호 재할당
    const updateVisibleItems = useCallback((map: any, allItems: any[]) => {
        if (!map || allItems.length === 0) return;

        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const filtered = allItems.filter((item) => {
            return (
                item.lat >= sw.getLat() && item.lat <= ne.getLat() &&
                item.lng >= sw.getLng() && item.lng <= ne.getLng()
            );
        }).map((item, idx) => ({ ...item, displayIndex: idx + 1 })); // 🚀 실시간 순번 부여 (1번부터 시작)

        setVisibleProperties(filtered);
        drawMarkers(map, filtered);
    }, [drawMarkers]);

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return;
        window.kakao.maps.load(() => {
            const container = document.getElementById("main-map");
            const options = { center: new window.kakao.maps.LatLng(35.1795543, 129.0756416), level: 8 };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;
            setIsMapLoaded(true);

            window.kakao.maps.event.addListener(map, 'idle', () => {
                setMapItems(currentItems => {
                    updateVisibleItems(map, currentItems);
                    return currentItems;
                });
            });
        });
    };

    // 📍 4. 초기 데이터 전처리 (좌표 확보)
    useEffect(() => {
        if (!isMapLoaded || properties.length === 0) return;

        const prepareData = async () => {
            setIsGeocoding(true);
            const geocoder = new window.kakao.maps.services.Geocoder();

            const promises = properties.map((item) => {
                return new Promise((resolve) => {
                    if (item.coordinates && item.coordinates.includes(",")) {
                        const [lat, lng] = item.coordinates.split(",").map(c => parseFloat(c.trim()));
                        resolve({ ...item, lat, lng });
                    } else {
                        geocoder.addressSearch(item.location, (result: any, status: any) => {
                            if (status === window.kakao.maps.services.Status.OK) {
                                resolve({ ...item, lat: parseFloat(result[0].y), lng: parseFloat(result[0].x) });
                            } else resolve({ ...item, lat: null, lng: null });
                        });
                    }
                });
            });

            const results = (await Promise.all(promises)) as any[];
            const validResults = results.filter(r => r.lat !== null);

            setMapItems(validResults);
            setIsGeocoding(false);
            updateVisibleItems(mapRef.current, validResults);
        };

        prepareData();
    }, [properties, isMapLoaded, updateVisibleItems]);

    return (
        <div className="flex flex-col md:flex-row w-full h-[600px] md:h-[750px] bg-white rounded-[40px] overflow-hidden shadow-2xl border border-gray-100 relative">
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`} onLoad={initMap} />

            {/* 🗺️ 지도 영역 */}
            <div className={`transition-all duration-500 relative ${isSidebarOpen ? "w-full md:w-[70%]" : "w-full"} h-full`}>
                <div id="main-map" className="w-full h-full bg-[#f8f9fa]"></div>

                {isGeocoding && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-orange-100 flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-[#FF8C42]" />
                        <span className="text-[12px] font-bold text-[#4A403A]">정밀 위치 동기화 중...</span>
                    </div>
                )}

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-1/2 -right-4 md:right-0 z-20 w-10 h-16 bg-white shadow-2xl border border-gray-100 rounded-l-2xl flex items-center justify-center text-[#4A403A] hover:bg-[#FF8C42] hover:text-white transition-all"
                    style={{ transform: "translateY(-50%)" }}
                >
                    {isSidebarOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                </button>
            </div>

            {/* 📋 리스트 영역 */}
            <div className={`transition-all duration-500 ${isSidebarOpen ? "w-full md:w-[30%] opacity-100" : "w-0 opacity-0 overflow-hidden"} h-full bg-white flex flex-col border-l border-gray-100`}>
                <div className="p-6 bg-white border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Search size={16} className="text-[#FF8C42]" />
                        <h3 className="text-[16px] font-black text-[#4A403A]">현장 실시간 필터</h3>
                    </div>
                    <p className="text-[12px] text-gray-400 font-bold">현재 화면 내 <span className="text-[#FF8C42]">{visibleProperties.length}곳</span> 발견</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7]">
                    {visibleProperties.map((item: any) => (
                        <a href={`/property/${item.id}`} key={item.id} className="block p-5 bg-white rounded-[24px] shadow-sm border border-gray-100 hover:border-[#FF8C42] hover:shadow-lg transition-all group">
                            <div className="flex items-start gap-4">
                                <span className="w-8 h-8 rounded-xl bg-gray-50 text-[#4A403A] text-[13px] font-black flex items-center justify-center shrink-0 group-hover:bg-[#FF8C42] group-hover:text-white transition-all shadow-inner">
                                    {item.displayIndex}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF8C42] text-[9px] font-black border border-orange-100">
                                            {item.status[0]}
                                        </span>
                                    </div>
                                    <p className="text-[15px] font-black text-[#4A403A] group-hover:text-[#FF8C42] transition-colors truncate">{item.title}</p>
                                    <p className="text-[11px] text-gray-400 font-bold truncate mt-1 leading-tight flex items-center gap-1">
                                        <MapPin size={10} /> {item.location}
                                    </p>
                                </div>
                                <ChevronRight size={18} className="text-gray-200 mt-5 group-hover:text-[#FF8C42] group-hover:translate-x-1 transition-all" />
                            </div>
                        </a>
                    ))}
                    {visibleProperties.length === 0 && !isGeocoding && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-32 opacity-40">
                            <Building2 size={48} className="text-gray-300 mb-4" />
                            <p className="text-[14px] font-black text-gray-400">검색된 현장이 없습니다</p>
                            <p className="text-[12px] text-gray-400 mt-1 font-bold">지도를 이동해보세요!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}