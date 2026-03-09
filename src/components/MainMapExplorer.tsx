"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { Property } from "../lib/sheet";
import { MapPin, ChevronLeft, ChevronRight, Building2, Search, Loader2, RefreshCw, Navigation, Maximize, Minimize } from "lucide-react";

interface MainMapExplorerProps {
    properties: Property[];
    searchQuery?: string;
    activeFilter?: string;
    isFullScreen?: boolean;
    onFullScreenChange?: (state: boolean) => void;
}

declare global { interface Window { kakao: any; } }
const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

export default function MainMapExplorer({ properties, searchQuery, activeFilter = "전체", isFullScreen, onFullScreenChange }: MainMapExplorerProps) {
    const mapRef = useRef<any>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [visibleProperties, setVisibleProperties] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [mapItems, setMapItems] = useState<any[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const overlaysRef = useRef<any[]>([]);

    const isFull = isFullScreen !== undefined ? isFullScreen : false;

    const handleFullScreenToggle = () => {
        if (onFullScreenChange) {
            onFullScreenChange(!isFull);
        }
    };

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.relayout();
            const timer = setTimeout(() => {
                mapRef.current.relayout();
                const center = mapRef.current.getCenter();
                mapRef.current.setCenter(center);
            }, 320);
            return () => clearTimeout(timer);
        }
    }, [isSidebarOpen, isFull]);

    useEffect(() => {
        if (isFull) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFull]);

    const drawMarkers = useCallback((map: any, filteredItems: any[]) => {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];

        filteredItems.forEach((item) => {
            const coords = new window.kakao.maps.LatLng(item.lat, item.lng);
            const newIndex = item.displayIndex;
            const baseZIndex = 40 - newIndex;

            const status = item.status && item.status.length > 0 ? item.status[0] : "분양중";
            let bgColor = "#4A403A";
            if (status.includes("줍줍") || status.includes("선착순")) bgColor = "#EF4444";
            else if (status.includes("마감임박")) bgColor = "#F59E0B";
            else if (status.includes("분양예정")) bgColor = "#3B82F6";

            const displayPrice = item.price ? item.price.split('/')[0].replace('분양가', '').trim() : "가격문의";

            // 🚀 [추가됨] id와 data-zindex를 부여하고, .is-hovered 클래스가 붙으면 툴팁이 나오게 CSS 추가!
            const content = `
                <style>
                    .map-marker-container:hover .map-tooltip,
                    .map-marker-container.is-hovered .map-tooltip { display: flex !important; }
                </style>
                <div id="marker-${item.id}" class="map-marker-container" data-zindex="${baseZIndex}"
                     onclick="window.location.href='/property/${item.id}'" 
                     onmouseenter="this.parentNode.style.zIndex=9999;" 
                     onmouseleave="this.parentNode.style.zIndex=${baseZIndex};"
                     style="cursor: pointer; position: relative; display: flex; flex-direction: column; align-items: center; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.2)); transform: translateY(-100%); transition: all 0.2s;">
                  
                  <div class="map-tooltip" style="display: none; flex-direction: column; position: absolute; bottom: 100%; margin-bottom: 6px; width: 130px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 6px 16px rgba(0,0,0,0.25); border: 1px solid #eee; z-index: 9999;">
                     <div style="height: 70px; width: 100%; background-image: url('${item.image || '/house1.jpg'}'); background-size: cover; background-position: center;"></div>
                     <div style="padding: 6px 8px; display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                        <span style="font-size: 7px; font-weight: 800; color: ${bgColor}; margin-bottom: 1px;">${status}</span>
                        <span style="font-size: 10px; font-weight: 900; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; line-height: 1.2;">${item.title}</span>
                        <span style="font-size: 9px; font-weight: 700; color: #666; margin-top: 2px;">${displayPrice}</span>
                     </div>
                  </div>

                  <div style="background: white; border-radius: 30px; display: flex; align-items: center; padding: 2px 8px 2px 2px; gap: 4px; border: 1.5px solid ${bgColor};">
                    <span style="background: ${bgColor}; color: white; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">${newIndex}</span>
                    <div style="display: flex; flex-direction: column;">
                      <span style="color: ${bgColor}; font-size: 7px; font-weight: 800; line-height: 1;">${status}</span>
                      <span style="color: #4A403A; font-size: 9px; font-weight: 900; white-space: nowrap; margin-top: 1px;">${item.title}</span>
                    </div>
                  </div>
                  <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid ${bgColor}; margin-top: -1px;"></div>
                </div>
            `;

            const overlay = new window.kakao.maps.CustomOverlay({
                position: coords,
                content: content,
                map: map,
                zIndex: baseZIndex
            });
            overlaysRef.current.push(overlay);
        });
    }, []);

    const updateVisibleItems = useCallback((map: any, allItems: any[], filter: string) => {
        if (!map || allItems.length === 0) return;
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const filtered = allItems.filter((item) => {
            const inBounds = item.lat >= sw.getLat() && item.lat <= ne.getLat() &&
                item.lng >= sw.getLng() && item.lng <= ne.getLng();
            const statusMatch = filter === "전체" || (item.status && item.status.includes(filter));
            return inBounds && statusMatch;
        }).map((item, idx) => ({ ...item, displayIndex: idx + 1 }));
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
            window.kakao.maps.event.addListener(map, 'idle', () => { setHasMoved(true); });
        });
    };

    useEffect(() => {
        if (isMapLoaded && mapRef.current && mapItems.length > 0) {
            updateVisibleItems(mapRef.current, mapItems, activeFilter);
            setHasMoved(false);
        }
    }, [activeFilter, isMapLoaded, mapItems, updateVisibleItems]);

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
            updateVisibleItems(mapRef.current, validResults, activeFilter);
        };
        prepareData();
    }, [properties, isMapLoaded]);

    useEffect(() => {
        if (!isMapLoaded || !mapRef.current || !searchQuery || mapItems.length === 0) return;
        const matchedItem = mapItems.find(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (matchedItem && matchedItem.lat && matchedItem.lng) {
            const moveLatLon = new window.kakao.maps.LatLng(matchedItem.lat, matchedItem.lng);
            mapRef.current.setLevel(5);
            mapRef.current.panTo(moveLatLon);
            setTimeout(() => { updateVisibleItems(mapRef.current, mapItems, activeFilter); }, 500);
        } else {
            const ps = new window.kakao.maps.services.Places();
            ps.keywordSearch(searchQuery, (data: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    const moveLatLon = new window.kakao.maps.LatLng(data[0].y, data[0].x);
                    mapRef.current.setLevel(6);
                    mapRef.current.panTo(moveLatLon);
                    setTimeout(() => updateVisibleItems(mapRef.current, mapItems, activeFilter), 500);
                }
            });
        }
    }, [searchQuery, isMapLoaded, mapItems]);

    const handleCurrentLocation = () => {
        if (!mapRef.current) return;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const locPosition = new window.kakao.maps.LatLng(lat, lng);
                    mapRef.current.setLevel(6);
                    mapRef.current.panTo(locPosition);
                    setTimeout(() => {
                        updateVisibleItems(mapRef.current, mapItems, activeFilter);
                        setHasMoved(false);
                    }, 500);
                },
                (error) => {
                    console.error("GPS 오류:", error);
                    alert("위치 정보를 가져올 수 없습니다.");
                }
            );
        }
    };

    const handleReSearch = () => {
        if (mapRef.current && mapItems.length > 0) {
            updateVisibleItems(mapRef.current, mapItems, activeFilter);
            setHasMoved(false);
        }
    };

    // 🚀 [호버 기능 1] 리스트에 마우스가 올라가면 해당 마커를 찾아 강제로 활성화
    const handleListItemMouseEnter = (id: string | number) => {
        const markerEl = document.getElementById(`marker-${id}`);
        if (markerEl) {
            markerEl.classList.add('is-hovered'); // 툴팁 띄우기
            if (markerEl.parentNode) {
                (markerEl.parentNode as HTMLElement).style.zIndex = '9999'; // 화면 맨 위로 끌어올리기
            }
        }
    };

    // 🚀 [호버 기능 2] 리스트에서 마우스가 나가면 해당 마커 원래 상태로 복구
    const handleListItemMouseLeave = (id: string | number) => {
        const markerEl = document.getElementById(`marker-${id}`);
        if (markerEl) {
            markerEl.classList.remove('is-hovered'); // 툴팁 숨기기
            const baseZ = markerEl.getAttribute('data-zindex') || '10';
            if (markerEl.parentNode) {
                (markerEl.parentNode as HTMLElement).style.zIndex = baseZ; // 원래 순서로 돌려놓기
            }
        }
    };

    const mobileBottomOffset = isBottomSheetOpen ? "bottom-[calc(60%+20px)]" : "bottom-[96px]";

    return (
        <div className={`transition-all duration-300 flex flex-col md:flex-row bg-white overflow-hidden ${isFullScreen
                ? "fixed top-0 left-0 z-[99999] w-[100vw] h-[100dvh] rounded-none m-0 p-0 shadow-none border-none"
                : "w-full h-full relative"
            }`}>
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`} onLoad={initMap} />

            {/* 🗺️ 지도 영역 */}
            <div className={`transition-all duration-500 relative h-full ${isSidebarOpen ? "w-full md:w-[76%]" : "w-full"}`}>
                <div id="main-map" className="w-full h-full bg-[#f8f9fa] outline-none"></div>

                <button
                    onClick={handleFullScreenToggle}
                    className="absolute top-4 right-4 z-40 bg-white/95 backdrop-blur text-[#4A403A] px-3.5 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 hover:text-[#FF8C42] hover:border-orange-200 transition-all flex items-center gap-1.5 font-bold text-[11px] md:text-[12px]"
                >
                    {isFullScreen ? (
                        <><Minimize size={14} className="md:w-4 md:h-4" /> 원래화면</>
                    ) : (
                        <><Maximize size={14} className="md:w-4 md:h-4" /> 넓게보기</>
                    )}
                </button>

                {hasMoved && (
                    <button
                        onClick={handleReSearch}
                        className={`absolute z-20 left-1/2 -translate-x-1/2 bg-white text-[#FF8C42] px-4 py-2.5 rounded-full shadow-lg border border-orange-200 font-bold text-[11px] flex items-center gap-1.5 hover:bg-orange-50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${mobileBottomOffset} md:bottom-8`}
                    >
                        <RefreshCw size={14} className="md:w-4 md:h-4" /> 이 지역 재검색
                    </button>
                )}

                <button
                    onClick={handleCurrentLocation}
                    className={`absolute z-20 right-4 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#4A403A] hover:text-[#FF8C42] hover:bg-orange-50 transition-all duration-300 ${mobileBottomOffset} md:bottom-8`}
                    title="내 주변 찾기"
                >
                    <Navigation size={18} className="opacity-80" />
                </button>

                {isGeocoding && (
                    <div className="absolute top-4 left-4 z-30 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-orange-100 flex items-center gap-1.5">
                        <Loader2 size={12} className="animate-spin text-[#FF8C42]" />
                        <span className="text-[10px] font-bold text-[#4A403A]">위치 동기화 중...</span>
                    </div>
                )}

                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="hidden md:flex absolute top-1/2 -right-4 md:right-0 z-20 w-8 h-14 bg-white shadow-xl border border-gray-100 rounded-l-xl items-center justify-center text-[#4A403A] hover:bg-[#FF8C42] hover:text-white transition-all"
                    style={{ transform: "translateY(-50%)" }}
                >
                    {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* 📋 1. 모바일 전용: 바텀 시트 */}
            <div
                className={`md:hidden absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 transition-all duration-300 ease-in-out flex flex-col ${isBottomSheetOpen ? "h-[60%]" : "h-[80px]"}`}
            >
                <div
                    onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
                    className="w-full p-4 flex flex-col items-center cursor-pointer border-b border-gray-50 shrink-0"
                >
                    <div className="w-10 h-1.5 bg-gray-200 rounded-full mb-3"></div>
                    <div className="flex items-center justify-between w-full px-2">
                        <div className="flex items-center gap-1.5">
                            <Search size={14} className="text-[#FF8C42]" />
                            <h3 className="text-[13px] font-black text-[#4A403A]">현재 화면 내 매물</h3>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">
                            <span className="text-[#FF8C42]">{visibleProperties.length}곳</span> 발견
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FDFBF7] pb-10">
                    {visibleProperties.map((item: any) => (
                        <a href={`/property/${item.id}`} key={item.id} className="block p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-all">
                            <div className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-lg bg-gray-50 text-[#4A403A] text-[10px] font-black flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                                    {item.displayIndex}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1 mb-1">
                                        <span className="px-1.5 py-0.5 rounded text-[#FF8C42] bg-orange-50 text-[8px] font-black border border-orange-100">
                                            {item.status[0]}
                                        </span>
                                    </div>
                                    <p className="text-[13px] font-black text-[#4A403A] truncate">{item.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold truncate mt-1 leading-tight flex items-center gap-1">
                                        <MapPin size={10} /> {item.location}
                                    </p>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 mt-3" />
                            </div>
                        </a>
                    ))}
                    {visibleProperties.length === 0 && !isGeocoding && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-40">
                            <Building2 size={28} className="text-gray-300 mb-2" />
                            <p className="text-[12px] font-black text-gray-400">검색된 현장이 없습니다</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 📋 2. PC 전용: 우측 사이드바 리스트 */}
            <div className={`hidden md:flex transition-all duration-500 ${isSidebarOpen ? "w-[24%] opacity-100" : "w-0 opacity-0 overflow-hidden"} h-full bg-white flex-col border-l border-gray-100 shrink-0`}>
                <div className="p-5 bg-white border-b border-gray-50 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <Search size={14} className="text-[#FF8C42]" />
                        <h3 className="text-[14px] font-black text-[#4A403A]">현장 실시간 필터</h3>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                        현재 화면 내 <span className="text-[#FF8C42]">{visibleProperties.length}곳</span> 발견
                        {activeFilter !== "전체" && <br />}
                        {activeFilter !== "전체" && <span className="inline-block mt-1 bg-gray-50 px-2 py-0.5 rounded text-gray-500">조건: {activeFilter}</span>}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FDFBF7]">
                    {visibleProperties.map((item: any) => (
                        <a
                            href={`/property/${item.id}`}
                            key={item.id}
                            // 🚀 [호버 기능 3] 여기에 마우스 오버 이벤트를 연결합니다!
                            onMouseEnter={() => handleListItemMouseEnter(item.id)}
                            onMouseLeave={() => handleListItemMouseLeave(item.id)}
                            className="block p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#FF8C42] hover:shadow-md transition-all group animate-in fade-in slide-in-from-right-2"
                        >
                            <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-xl bg-gray-50 text-[#4A403A] text-[11px] font-black flex items-center justify-center shrink-0 group-hover:bg-[#FF8C42] group-hover:text-white transition-all shadow-inner mt-0.5">
                                    {item.displayIndex}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1 mb-1.5">
                                        <span className="px-1.5 py-0.5 rounded text-[#FF8C42] bg-orange-50 text-[8px] font-black border border-orange-100">
                                            {item.status[0]}
                                        </span>
                                    </div>
                                    <p className="text-[13px] font-black text-[#4A403A] group-hover:text-[#FF8C42] transition-colors truncate">{item.title}</p>
                                    <p className="text-[10px] text-gray-400 font-bold truncate mt-1 leading-tight flex items-center gap-1">
                                        <MapPin size={10} /> {item.location}
                                    </p>
                                </div>
                            </div>
                        </a>
                    ))}
                    {visibleProperties.length === 0 && !isGeocoding && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                            <Building2 size={36} className="text-gray-300 mb-3" />
                            <p className="text-[13px] font-black text-gray-400">검색된 현장이 없습니다</p>
                            <p className="text-[10px] text-gray-400 mt-1 font-bold">지도를 이동하고 '재검색'을 눌러보세요!</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}