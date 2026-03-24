"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { Property } from "../lib/sheet";
import { MapPin, ChevronLeft, ChevronRight, Search, Navigation, Maximize, Minimize, RefreshCw, Flame } from "lucide-react";

interface MainMapExplorerProps {
    properties: Property[];
    searchQuery?: string;
    activeFilter?: string;
    isFullScreen?: boolean;
    onFullScreenChange?: (state: boolean) => void;
    mapTarget?: { lat: number; lng: number; level: number } | null;
}

declare global { interface Window { kakao: any; } }
const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

export default function MainMapExplorer({ properties, searchQuery, activeFilter = "전체", isFullScreen, onFullScreenChange, mapTarget }: MainMapExplorerProps) {
    const mapRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [visibleProperties, setVisibleProperties] = useState<any[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [mapItems, setMapItems] = useState<any[]>([]);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const overlaysRef = useRef<any[]>([]);

    const isFull = isFullScreen !== undefined ? isFullScreen : false;

    // 🚀 프리미엄 판별 공통 함수 (상태 상관없이 오직 구글 시트 adGrade만 확인)
    const isPremiumItem = (item: any) => item.adGrade === "프리미엄" || item.adGrade === "Premium" || item.adGrade === "premium";

    const initMap = useCallback(() => {
        if (typeof window === "undefined" || !window.kakao || !window.kakao.maps) return;

        window.kakao.maps.load(() => {
            if (!mapContainerRef.current) return;
            if (mapRef.current) return;

            mapContainerRef.current.innerHTML = "";

            const options = { center: new window.kakao.maps.LatLng(35.1795543, 129.0756416), level: 8 };
            const map = new window.kakao.maps.Map(mapContainerRef.current, options);
            mapRef.current = map;
            setIsMapLoaded(true);

            window.kakao.maps.event.addListener(map, 'idle', () => setHasMoved(true));
            window.kakao.maps.event.addListener(map, 'zoom_changed', () => setHasMoved(true));
        });
    }, []);

    useEffect(() => {
        if (window.kakao && window.kakao.maps) {
            initMap();
        }
    }, [initMap]);

    useEffect(() => {
        if (isMapLoaded && mapRef.current && mapTarget) {
            const moveLatLon = new window.kakao.maps.LatLng(mapTarget.lat, mapTarget.lng);
            mapRef.current.setLevel(mapTarget.level);
            mapRef.current.panTo(moveLatLon);
        }
    }, [mapTarget, isMapLoaded]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.relayout();
            const timer = setTimeout(() => {
                mapRef.current.relayout();
                const center = mapRef.current.getCenter();
                mapRef.current.setCenter(center);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isSidebarOpen, isFull]);

    useEffect(() => {
        if (isFull) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isFull]);

    const drawMarkers = useCallback((map: any, filteredItems: any[]) => {
        overlaysRef.current.forEach(o => o.setMap(null));
        overlaysRef.current = [];

        filteredItems.forEach((item) => {
            const coords = new window.kakao.maps.LatLng(item.lat, item.lng);
            const newIndex = item.displayIndex;
            const status = (item.status && item.status.length > 0) ? item.status[0] : "분양중";

            // 🚀 오직 isPremiumItem 판별식에 의해서만 컬러를 부여합니다!
            const isPremium = isPremiumItem(item);
            const bgColor = isPremium ? "#FF7A2F" : "#334155";
            const baseZIndex = isPremium ? 100 - newIndex : 40 - newIndex;

            const targetImage = item.image || item.imageUrl || (item.images && item.images[0]) || "";

            const content = `
                <div id="marker-${item.id}" class="map-marker-container" data-zindex="${baseZIndex}"
                     onclick="window.location.href='/property/${item.id}'" 
                     onmouseenter="this.classList.add('force-hover'); this.parentNode.style.zIndex=99999;" 
                     onmouseleave="this.classList.remove('force-hover'); this.parentNode.style.zIndex=${baseZIndex};"
                     style="cursor: pointer; position: relative; display: flex; flex-direction: column; align-items: center; transform: translateY(-100%);">
                  
                  <div class="hover-card" style="position: absolute; bottom: 100%; margin-bottom: 12px; width: 185px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25); opacity: 0; visibility: hidden; transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1); pointer-events: none; z-index: 100000; transform: translateY(15px); border: 1px solid rgba(0,0,0,0.05);">
                    ${targetImage ? `
                      <div style="width: 100%; height: 115px; position: relative; overflow: hidden;">
                        <img src="${targetImage}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'"/>
                        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 30%; background: linear-gradient(to top, rgba(0,0,0,0.1), transparent);"></div>
                      </div>
                    ` : ''}
                    
                    <div style="position: relative; padding: 12px 14px; background: #fff;">
                      <div style="position: absolute; left: 0; top: 15%; height: 70%; width: 3px; background: ${bgColor}; border-radius: 0 2px 2px 0;"></div>
                      <div style="font-size: 13px; font-weight: 800; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; letter-spacing: -0.04em; line-height: 1.2;">${item.title}</div>
                      <div style="display: flex; align-items: center; gap: 4px;"><span style="font-size: 12px; font-weight: 600; color: ${bgColor}; letter-spacing: -0.02em;">${item.price || '가격상담'}</span></div>
                    </div>
                  </div>

                  <div style="background: white; border-radius: 30px; display: flex; align-items: center; padding: 2px 8px 2px 2px; gap: 4px; border: 1.5px solid ${bgColor}; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">
                    <span style="background: ${bgColor}; color: white; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">${newIndex}</span>
                    <div style="display: flex; flex-direction: column;">
                      <span style="color: ${bgColor}; font-size: 7px; font-weight: 800; line-height: 1;">${status}</span>
                      <span style="color: #1E293B; font-size: 9px; font-weight: 900; white-space: nowrap; margin-top: 1px;">${item.title}</span>
                    </div>
                  </div>
                  <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid ${bgColor}; margin-top: -1px;"></div>
                </div>
            `;
            const overlay = new window.kakao.maps.CustomOverlay({ position: coords, content: content, map: map, zIndex: baseZIndex });
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
                    setTimeout(() => { updateVisibleItems(mapRef.current, mapItems, activeFilter); setHasMoved(false); }, 500);
                },
                () => alert("위치 정보를 가져올 수 없습니다.")
            );
        }
    };

    const handleListItemMouseEnter = (id: string | number) => {
        const markerEl = document.getElementById(`marker-${id}`);
        if (markerEl) {
            markerEl.classList.add('force-hover');
            if (markerEl.parentNode) (markerEl.parentNode as HTMLElement).style.zIndex = '99999';
        }
    };

    const handleListItemMouseLeave = (id: string | number) => {
        const markerEl = document.getElementById(`marker-${id}`);
        if (markerEl) {
            markerEl.classList.remove('force-hover');
            const baseZ = markerEl.getAttribute('data-zindex') || '10';
            if (markerEl.parentNode) (markerEl.parentNode as HTMLElement).style.zIndex = baseZ;
        }
    };

    const handleToggleFullScreen = () => {
        if (!isFull) {
            const feedElement = containerRef.current?.closest('#property-feed');
            if (feedElement) {
                const targetY = feedElement.getBoundingClientRect().top + window.scrollY - 10;
                window.scrollTo({ top: targetY, behavior: "smooth" });
            }
            setTimeout(() => {
                if (onFullScreenChange) onFullScreenChange(true);
            }, 400);
        } else {
            if (onFullScreenChange) onFullScreenChange(false);
        }
    };

    const mobileBottomOffset = isBottomSheetOpen ? "bottom-[calc(60%+20px)]" : "bottom-[96px]";

    // 🚀 리스트도 오직 isPremiumItem 판별식에 의해서만 나눕니다.
    const premiumItems = visibleProperties.filter(isPremiumItem).slice(0, 2);
    const normalItems = visibleProperties.filter(item => !isPremiumItem(item));

    return (
        <div ref={containerRef} className={`transition-all duration-300 flex flex-col md:flex-row bg-white overflow-hidden ${isFull ? "fixed top-0 left-0 z-[99990] w-full h-[100dvh] rounded-none m-0 p-0 shadow-none border-none" : "w-full h-full relative"}`}>
            <style>{`.map-marker-container.force-hover .hover-card { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }`}</style>

            <Script
                strategy="afterInteractive"
                src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer&autoload=false`}
                onLoad={initMap}
            />

            <div className="transition-all duration-500 relative h-full flex-1 min-w-0">
                <div ref={mapContainerRef} className="w-full h-full bg-[#E9EBEF] outline-none"></div>

                <button
                    onClick={handleToggleFullScreen}
                    className={`absolute ${isFull ? "top-6 right-6" : "top-4 right-4"} z-[100000] bg-white/95 backdrop-blur text-[#1E293B] px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:text-[#FF7A2F] flex items-center gap-1.5 font-bold text-[11px] md:text-[12px]`}
                >
                    {isFull ? <><Minimize size={14} /> 기본보기</> : <><Maximize size={14} /> 넓게보기</>}
                </button>

                {hasMoved && <button onClick={() => { updateVisibleItems(mapRef.current, mapItems, activeFilter); setHasMoved(false); }} className={`absolute z-20 left-1/2 -translate-x-1/2 bg-white text-[#FF7A2F] px-4 py-2.5 rounded-full shadow-lg border border-orange-100 font-bold text-[11px] flex items-center gap-1.5 hover:bg-orange-50 animate-in fade-in slide-in-from-bottom-2 ${mobileBottomOffset} md:bottom-8`}><RefreshCw size={14} /> 이 지역 재검색</button>}
                <button onClick={handleCurrentLocation} className={`absolute z-20 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#1E293B] hover:text-[#FF7A2F] transition-all duration-300 ${mobileBottomOffset} md:bottom-8`} title="내 주변 찾기"><Navigation size={18} className="opacity-80" /></button>

                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute top-1/2 -right-4 md:right-0 z-[50] w-8 h-14 bg-white shadow-xl border border-gray-100 rounded-l-xl items-center justify-center text-[#1E293B] hover:bg-[#FF7A2F] hover:text-white" style={{ transform: "translateY(-50%)" }}>
                    {isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <div className={`md:hidden absolute bottom-0 left-0 w-full bg-white rounded-t-[24px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-30 transition-all duration-300 flex flex-col ${isBottomSheetOpen ? "h-[60%]" : "h-[80px]"}`}>
                <div onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)} className="w-full p-4 flex flex-col items-center cursor-pointer bg-white shrink-0 rounded-t-[24px]"><div className="w-10 h-1.5 bg-gray-200 rounded-full mb-3"></div><div className="flex items-center justify-between w-full px-2"><div className="flex items-center gap-1.5"><Search size={14} className="text-[#FF7A2F]" /><h3 className="text-[13px] font-black text-[#1E293B]">현재 화면 내 매물</h3></div><p className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-1 rounded-md"><span className="text-[#FF7A2F]">{visibleProperties.length}곳</span> 발견</p></div></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8F9FA] pb-10">
                    {visibleProperties.map((item: any) => {
                        const isMobilePremium = isPremiumItem(item);
                        return (
                            <a href={`/property/${item.id}`} key={item.id} className={`block p-4 bg-white rounded-[16px] shadow-sm active:scale-[0.98] border ${isMobilePremium ? 'border-[#FF7A2F]' : 'border-transparent'}`}>
                                <div className="flex items-start gap-3">
                                    <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${isMobilePremium ? "bg-[#FF7A2F] text-white" : "bg-gray-100 text-gray-500"}`}>{item.displayIndex}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1 mb-1.5"><span className="px-1.5 py-0.5 rounded-full text-gray-500 bg-gray-100 text-[9px] font-bold">{item.status[0]}</span></div>
                                        <p className="text-[14px] font-extrabold text-[#1E293B] truncate">{item.title}</p>
                                        <p className="text-[10px] text-gray-400 font-medium truncate mt-1 leading-tight flex items-center gap-1"><MapPin size={10} /> {item.location}</p>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>

            <div
                className={`hidden md:flex transition-all duration-500 bg-[#F8F9FA] flex-col h-full overflow-hidden ${isSidebarOpen
                        ? "w-[340px] xl:w-[380px] min-w-[340px] xl:min-w-[380px] opacity-100 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10"
                        : "w-0 min-w-0 max-w-0 opacity-0 p-0 m-0"
                    }`}
            >
                <div className="p-5 bg-white shrink-0 rounded-b-[20px] shadow-sm z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[15px] font-black text-[#1E293B]">현장 실시간 필터</h3>
                    </div>
                    <p className="text-[12px] text-gray-500 font-medium">현재 화면 내 <span className="text-[#FF7A2F] font-bold">{visibleProperties.length}곳</span> 발견</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
                    {premiumItems.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-1.5 px-1">
                                <Flame size={14} className="text-[#FF7A2F]" />
                                <span className="text-[11px] font-black text-[#FF7A2F]">프리미엄 추천 현장</span>
                            </div>
                            {premiumItems.map((item: any) => (
                                <a href={`/property/${item.id}`} key={item.id} onMouseEnter={() => handleListItemMouseEnter(item.id)} onMouseLeave={() => handleListItemMouseLeave(item.id)}
                                    className="block p-4 bg-white rounded-[20px] shadow-[0_4px_20px_rgba(255,122,47,0.08)] border border-orange-50 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(255,122,47,0.15)] transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FF7A2F]"></div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-7 h-7 rounded-[10px] bg-[#FF7A2F] text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-inner mt-0.5">{item.displayIndex}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1 mb-1.5">
                                                <span className="px-2 py-0.5 rounded-full text-[#FF7A2F] bg-orange-50 text-[9px] font-extrabold">{item.status[0]}</span>
                                                <span className="text-[10px] font-bold text-gray-400">{item.propertyType}</span>
                                            </div>
                                            <p className="text-[14px] font-extrabold text-[#1E293B] group-hover:text-[#FF7A2F] transition-colors truncate">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 font-medium truncate mt-1.5 flex items-center gap-1"><MapPin size={10} /> {item.location}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}

                    {normalItems.length > 0 && (
                        <div className="space-y-3">
                            <div className="px-1 pt-2">
                                <span className="text-[11px] font-bold text-gray-400">일반 매물</span>
                            </div>
                            {normalItems.map((item: any) => (
                                <a href={`/property/${item.id}`} key={item.id} onMouseEnter={() => handleListItemMouseEnter(item.id)} onMouseLeave={() => handleListItemMouseLeave(item.id)}
                                    className="block p-4 bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all group">
                                    <div className="flex items-start gap-3">
                                        <span className="w-7 h-7 rounded-[10px] bg-gray-50 text-gray-500 text-[11px] font-bold flex items-center justify-center shrink-0 group-hover:bg-gray-100 transition-colors mt-0.5">{item.displayIndex}</span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1 mb-1.5">
                                                <span className="px-2 py-0.5 rounded-full text-gray-500 bg-gray-100 text-[9px] font-bold">{item.status[0]}</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-[#1E293B] group-hover:text-[#4A403A] transition-colors truncate">{item.title}</p>
                                            <p className="text-[11px] text-gray-400 font-medium truncate mt-1 flex items-center gap-1"><MapPin size={10} /> {item.location}</p>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}