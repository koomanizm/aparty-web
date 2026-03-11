"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Script from "next/script";
import { Property } from "../lib/sheet";
import { MapPin, ChevronLeft, ChevronRight, Search, Navigation, Maximize, Minimize, RefreshCw } from "lucide-react";

interface MainMapExplorerProps {
    properties: Property[];
    searchQuery?: string;
    activeFilter?: string;
    isFullScreen?: boolean;
    onFullScreenChange?: (state: boolean) => void;
    // 🚀 1. mapTarget prop 타입 정의 추가
    mapTarget?: { lat: number; lng: number; level: number } | null;
}

declare global { interface Window { kakao: any; } }
const KAKAO_JS_KEY = "8385849bc4b562f952656a171fb9a844";

export default function MainMapExplorer({ properties, searchQuery, activeFilter = "전체", isFullScreen, onFullScreenChange, mapTarget }: MainMapExplorerProps) {
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

    // 🚀 2. mapTarget 변경 시 지도 이동 실행 로직 추가
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
            const baseZIndex = 40 - newIndex;
            const status = (item.status && item.status.length > 0) ? item.status[0] : "분양중";

            let bgColor = "#4A403A";
            if (status.includes("줍줍") || status.includes("선착순")) bgColor = "#EF4444";
            else if (status.includes("마감임박")) bgColor = "#F59E0B";
            else if (status.includes("분양예정")) bgColor = "#3B82F6";

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
                      <div style="position: absolute; left: 0; top: 15%; height: 70%; width: 3px; background: #FF8C42; border-radius: 0 2px 2px 0;"></div>
                      <div style="font-size: 13px; font-weight: 800; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; letter-spacing: -0.04em; line-height: 1.2;">${item.title}</div>
                      <div style="display: flex; align-items: center; gap: 4px;"><span style="font-size: 12px; font-weight: 600; color: #FF8C42; letter-spacing: -0.02em;">${item.price || '가격상담'}</span></div>
                    </div>
                  </div>

                  <div style="background: white; border-radius: 30px; display: flex; align-items: center; padding: 2px 8px 2px 2px; gap: 4px; border: 1.5px solid ${bgColor}; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));">
                    <span style="background: ${bgColor}; color: white; min-width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900;">${newIndex}</span>
                    <div style="display: flex; flex-direction: column;">
                      <span style="color: ${bgColor}; font-size: 7px; font-weight: 800; line-height: 1;">${status}</span>
                      <span style="color: #4A403A; font-size: 9px; font-weight: 900; white-space: nowrap; margin-top: 1px;">${item.title}</span>
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

    const initMap = () => {
        if (!window.kakao || !window.kakao.maps) return;
        window.kakao.maps.load(() => {
            const container = document.getElementById("main-map");
            const options = { center: new window.kakao.maps.LatLng(35.1795543, 129.0756416), level: 8 };
            const map = new window.kakao.maps.Map(container, options);
            mapRef.current = map;
            setIsMapLoaded(true);
            window.kakao.maps.event.addListener(map, 'idle', () => { setHasMoved(true); });
            window.kakao.maps.event.addListener(map, 'zoom_changed', () => { setHasMoved(true); });
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

    const mobileBottomOffset = isBottomSheetOpen ? "bottom-[calc(60%+20px)]" : "bottom-[96px]";

    return (
        <div className={`transition-all duration-300 flex flex-col md:flex-row bg-white overflow-hidden ${isFull ? "fixed top-0 left-0 z-[99999] w-[100vw] h-[100dvh] rounded-none m-0 p-0 shadow-none border-none" : "w-full h-full relative"}`}>
            <style>{`.map-marker-container.force-hover .hover-card { opacity: 1 !important; visibility: visible !important; transform: translateY(0) !important; }`}</style>
            <Script strategy="afterInteractive" src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`} onLoad={initMap} />
            <div className={`transition-all duration-500 relative h-full ${isSidebarOpen ? "w-full md:w-[76%]" : "w-full"}`}>
                <div id="main-map" className="w-full h-full bg-[#f8f9fa] outline-none"></div>
                <button onClick={() => onFullScreenChange && onFullScreenChange(!isFull)} className="absolute top-4 right-4 z-40 bg-white/95 backdrop-blur text-[#4A403A] px-3.5 py-2.5 rounded-xl shadow-lg border border-gray-100 hover:text-[#FF8C42] flex items-center gap-1.5 font-bold text-[11px] md:text-[12px]">{isFull ? <><Minimize size={14} /> 기본보기</> : <><Maximize size={14} /> 넓게보기</>}</button>
                {hasMoved && <button onClick={() => { updateVisibleItems(mapRef.current, mapItems, activeFilter); setHasMoved(false); }} className={`absolute z-20 left-1/2 -translate-x-1/2 bg-white text-[#FF8C42] px-4 py-2.5 rounded-full shadow-lg border border-orange-200 font-bold text-[11px] flex items-center gap-1.5 hover:bg-orange-50 animate-in fade-in slide-in-from-bottom-2 ${mobileBottomOffset} md:bottom-8`}><RefreshCw size={14} /> 이 지역 재검색</button>}
                <button onClick={handleCurrentLocation} className={`absolute z-20 left-4 md:left-6 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-[#4A403A] hover:text-[#FF8C42] transition-all duration-300 ${mobileBottomOffset} md:bottom-8`} title="내 주변 찾기"><Navigation size={18} className="opacity-80" /></button>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex absolute top-1/2 -right-4 md:right-0 z-20 w-8 h-14 bg-white shadow-xl border border-gray-100 rounded-l-xl items-center justify-center text-[#4A403A] hover:bg-[#FF8C42] hover:text-white" style={{ transform: "translateY(-50%)" }}>{isSidebarOpen ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</button>
            </div>
            <div className={`md:hidden absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 transition-all duration-300 flex flex-col ${isBottomSheetOpen ? "h-[60%]" : "h-[80px]"}`}>
                <div onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)} className="w-full p-4 flex flex-col items-center cursor-pointer border-b border-gray-50 shrink-0"><div className="w-10 h-1.5 bg-gray-200 rounded-full mb-3"></div><div className="flex items-center justify-between w-full px-2"><div className="flex items-center gap-1.5"><Search size={14} className="text-[#FF8C42]" /><h3 className="text-[13px] font-black text-[#4A403A]">현재 화면 내 매물</h3></div><p className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md"><span className="text-[#FF8C42]">{visibleProperties.length}곳</span> 발견</p></div></div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FDFBF7] pb-10">{visibleProperties.map((item: any) => (<a href={`/property/${item.id}`} key={item.id} onMouseEnter={() => handleListItemMouseEnter(item.id)} onMouseLeave={() => handleListItemMouseLeave(item.id)} className="block p-3.5 bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98]"><div className="flex items-start gap-3"><span className="w-6 h-6 rounded-lg bg-gray-50 text-[#4A403A] text-[10px] font-bold flex items-center justify-center shrink-0 shadow-inner mt-0.5">{item.displayIndex}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-1 mb-1"><span className="px-1.5 py-0.5 rounded text-[#FF8C42] bg-orange-50 text-[8px] font-black border border-orange-100">{item.status[0]}</span></div><p className="text-[13px] font-bold text-[#4A403A] truncate">{item.title}</p><p className="text-[9px] text-gray-400 font-medium truncate mt-1 leading-tight flex items-center gap-1"><MapPin size={10} /> {item.location}</p></div><ChevronRight size={14} className="text-gray-300 mt-3" /></div></a>))}</div>
            </div>
            <div className={`hidden md:flex transition-all duration-500 ${isSidebarOpen ? "w-[24%] opacity-100" : "w-0 opacity-0 overflow-hidden"} h-full bg-white flex-col border-l border-gray-100 shrink-0`}><div className="p-5 bg-white border-b border-gray-50 shrink-0"><div className="flex items-center gap-2 mb-2"><Search size={14} className="text-[#FF8C42]" /><h3 className="text-[14px] font-black text-[#4A403A]">현장 실시간 필터</h3></div><p className="text-[11px] text-gray-400 font-bold leading-relaxed">현재 화면 내 <span className="text-[#FF8C42]">{visibleProperties.length}곳</span> 발견</p></div><div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#FDFBF7]">{visibleProperties.map((item: any) => (<a href={`/property/${item.id}`} key={item.id} onMouseEnter={() => handleListItemMouseEnter(item.id)} onMouseLeave={() => handleListItemMouseLeave(item.id)} className="block p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-[#FF8C42] hover:shadow-md transition-all group animate-in fade-in slide-in-from-right-2"><div className="flex items-start gap-3"><span className="w-7 h-7 rounded-xl bg-gray-50 text-[#4A403A] text-[11px] font-bold flex items-center justify-center shrink-0 group-hover:bg-[#FF8C42] group-hover:text-white transition-all shadow-inner mt-0.5">{item.displayIndex}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-1 mb-1.5"><span className="px-1.5 py-0.5 rounded text-[#FF8C42] bg-orange-50 text-[8px] font-black border border-orange-100">{item.status[0]}</span></div><p className="text-[13px] font-bold text-[#4A403A] group-hover:text-[#FF8C42] transition-colors truncate">{item.title}</p><p className="text-[9px] text-gray-400 font-medium truncate mt-1 leading-tight flex items-center gap-1"><MapPin size={10} /> {item.location}</p></div></div></a>))}</div></div>
        </div>
    );
}