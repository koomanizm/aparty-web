"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, ChevronDown, Bot, ChevronRight, Loader2, Link as LinkIcon } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../lib/sheet";
import Link from "next/link";
import Image from "next/image";

interface Message {
    role: "assistant" | "user";
    text: string;
}

// ========================================================
// 💡 기존 로직 완벽 보존 (답변 렌더링 & 링크 연결 부분)
// ========================================================
const renderMessageContent = (text: string, role: "assistant" | "user", properties: Property[]) => {
    const cleanText = text.replace(/## /g, "").replace(/##/g, "");
    const parts = cleanText.split(/(\*\*.*?\*\*|\^\^.*?\^\^|\[.*?\]\s*:|\[버튼:.*?\])/g);

    const FormattedText = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            return <strong key={index} className={`font-extrabold text-[13px] ${role === 'assistant' ? 'text-[#FF8C42]' : 'text-white'}`}>{content}</strong>;
        }
        else if (part.startsWith('^^') && part.endsWith('^^')) {
            const content = part.slice(2, -2);
            return <span key={index} className="font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded-md mx-0.5 shadow-sm">{content}</span>;
        }
        else if (part.match(/^\[.*?\]\s*:/)) {
            return <strong key={index} className="text-[#059669] mr-1">{part}</strong>;
        }
        else if (part.startsWith('[버튼:') && part.endsWith(']')) {
            const btnName = part.slice(4, -1).trim();

            if (role === 'assistant') {
                const cleanBtnName = btnName.replace(/\s+/g, '');
                const matchedProperty = properties.find(p => {
                    const item = p as any;
                    const rawName = item.title || item.Title || "";
                    const dbName = String(rawName).replace(/\s+/g, '');
                    return dbName === cleanBtnName;
                });

                const targetUrl = matchedProperty ? `/property/${matchedProperty.id}` : `/search?q=${encodeURIComponent(btnName)}`;

                return (
                    <div key={index} className="block mt-2 mb-4">
                        <Link
                            href={targetUrl}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-300 text-gray-600 rounded-md text-[12px] font-bold hover:border-[#FF8C42] hover:text-[#FF8C42] hover:bg-orange-50 transition-colors shadow-sm group"
                        >
                            <span>🏢 {btnName} 보러가기</span>
                            <ChevronRight size={12} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                );
            }
            return null;
        }
        return <span key={index}>{part}</span>;
    });

    return (
        <div className="whitespace-pre-wrap leading-[1.8] text-[12px] tracking-tight">
            {FormattedText}
        </div>
    );
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", text: "반가워요! 아파티(APARTY) AI 상담사입니다.✨\n찾으시는 아파트나 지역을 말씀해 주시면 제가 꼼꼼하게 찾아드릴게요!" }
    ]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [bottomOffset, setBottomOffset] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // ========================================================
    // 💡 기존 로직 완벽 보존 (데이터 패칭 & API 호출 부분)
    // ========================================================
    useEffect(() => {
        async function loadData() {
            setProperties(await getPropertiesFromSheet());
        }
        loadData();

        const handleScroll = () => {
            const scrollBottom = document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
            setBottomOffset(scrollBottom < 200 ? 200 - scrollBottom : 0);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, isLoading]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        setMessages(prev => [...prev, { role: "user", text }]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, contextData: { properties: properties.slice(0, 50) } })
            });
            const data = await response.json();
            if (response.ok) {
                setMessages(prev => [...prev, { role: "assistant", text: data.reply }]);
            } else throw new Error(data.error);
        } catch (error: any) {
            setMessages(prev => [...prev, { role: "assistant", text: `연결이 원활하지 않아요. 🥲` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-5 right-4 md:bottom-10 md:right-10 z-[100] transition-transform" style={{ transform: `translateY(-${bottomOffset}px)` }}>

            {/* 🚀 SVG 애니메이션 스타일 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .chatbot-base-circle {
                    stroke: #E5E7EB; /* 평소 얇은 회색 선 */
                    stroke-width: 2.5;
                    fill: white;
                }
                
                .chatbot-draw-circle {
                    stroke: url(#aurora-spinning-gradient); /* 그라데이션 선 적용 */
                    stroke-width: 2.5;
                    fill: transparent;
                    stroke-dasharray: 180; 
                    stroke-dashoffset: 180; /* 숨김 상태 */
                    transition: stroke-dashoffset 0.6s ease-in-out; /* 원 그리기 속도 */
                    stroke-linecap: round; 
                }

                .chatbot-btn-wrapper:hover .chatbot-draw-circle {
                    stroke-dashoffset: 0; /* 마우스 올리면 그려짐 */
                }

                .chatbot-btn-wrapper:hover {
                    transform: scale(1.05); /* 버튼 커짐 */
                    box-shadow: 0 10px 25px rgba(168, 85, 247, 0.25); /* 오로라 그림자 */
                }
                
                .chatbot-btn-wrapper:active {
                    transform: scale(0.95);
                }
                `
            }} />

            {/* 🚀 로봇 아이콘 버튼 */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="chatbot-btn-wrapper relative w-[60px] h-[60px] rounded-full shadow-lg outline-none transition-all duration-300 group flex items-center justify-center bg-white"
                    aria-label="챗봇 열기"
                >
                    <svg width="60" height="60" viewBox="0 0 60 60" className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none">
                        <defs>
                            {/* 🚀 빙글빙글 도는 오로라 그라데이션 */}
                            <linearGradient id="aurora-spinning-gradient" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="60" y2="60">
                                <animateTransform
                                    attributeName="gradientTransform"
                                    type="rotate"
                                    from="0 30 30"
                                    to="360 30 30"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                                <stop offset="0%" stopColor="#A855F7" />
                                <stop offset="50%" stopColor="#EC4899" />
                                <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                        </defs>
                        <circle cx="30" cy="30" r="28" className="chatbot-base-circle" />
                        <circle cx="30" cy="30" r="28" className="chatbot-draw-circle" />
                    </svg>

                    {/* ✅ 🚀 [복구] 버튼 아이콘 크기는 딱 좋다고 하셔서 원상복구 (38px) */}
                    <div className="relative z-10 w-[38px] h-[38px] flex items-center justify-center">
                        <Image
                            src="/roboticon.png"
                            alt="AI 챗봇"
                            width={38}
                            height={38}
                            className={`object-contain transition-transform duration-300 ${isHovered ? 'scale-110 drop-shadow-md' : 'drop-shadow-sm'}`}
                        />
                    </div>
                </button>
            )}

            {isOpen && (
                <div className="w-[calc(100vw-2rem)] md:w-[360px] h-[75dvh] max-h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-[#172554] p-5 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                {/* ✅ 🚀 [핵심 포인트] 챗봇 창 내 상단 아이콘 크기 더 키움 (20px -> 28px) */}
                                <Image src="/roboticon.png" alt="로봇" width={28} height={28} className="object-contain" />
                            </div>
                            <h3 className="text-[15px] font-bold tracking-tighter">아파티 AI 상담사</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white p-1"><ChevronDown size={24} /></button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-[#fdfbf7] space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] font-medium shadow-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-[#172554] text-white rounded-tr-none" : "bg-white text-[#4A403A] rounded-tl-none border border-gray-100"}`}>
                                    {renderMessageContent(msg.text, msg.role, properties)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="p-4 rounded-2xl bg-white text-gray-400 border border-gray-100 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-[#172554]" />
                                    <span className="text-[13px] font-medium">아파티 데이터를 분석 중...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t shrink-0">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
                                placeholder="단지나 인근 시세를 물어보세요!"
                                className="flex-1 bg-transparent border-none outline-none px-3 text-[13px] font-medium"
                                disabled={isLoading}
                            />
                            <button onClick={() => sendMessage(inputValue)} disabled={isLoading} className="bg-[#172554] text-white p-2.5 rounded-xl transition-transform active:scale-95">
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}