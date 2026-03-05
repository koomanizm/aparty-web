"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, ChevronDown, Bot, ChevronRight, Loader2, Link as LinkIcon } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../lib/sheet";
import Link from "next/link"; // 🚀 링크 연결을 위해 추가됨

interface Message {
    role: "assistant" | "user";
    text: string;
}

// 🚀 [업그레이드] properties 데이터를 넘겨받아 버튼에 실제 ID를 매칭합니다.
const renderMessageContent = (text: string, role: "assistant" | "user", properties: Property[]) => {
    // 1. 불필요한 마크다운 기호 제거
    const cleanText = text.replace(/## /g, "").replace(/##/g, "");

    // 2. 텍스트, 단지명, 라벨, 중요포인트, 그리고 "버튼"까지 한 번에 순서대로 분리!
    const parts = cleanText.split(/(\*\*.*?\*\*|\^\^.*?\^\^|\[.*?\]\s*:|\[버튼:.*?\])/g);

    const FormattedText = parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            // 🔸 단지명
            const content = part.slice(2, -2);
            return <strong key={index} className={`font-extrabold text-[13px] ${role === 'assistant' ? 'text-[#FF8C42]' : 'text-white'}`}>{content}</strong>;
        }
        else if (part.startsWith('^^') && part.endsWith('^^')) {
            // 🔹 중요 포인트 형광펜
            const content = part.slice(2, -2);
            return <span key={index} className="font-bold text-[#2563EB] bg-blue-50 px-1.5 py-0.5 rounded-md mx-0.5 shadow-sm">{content}</span>;
        }
        else if (part.match(/^\[.*?\]\s*:/)) {
            // 🌿 항목 라벨
            return <strong key={index} className="text-[#059669] mr-1">{part}</strong>;
        }
        else if (part.startsWith('[버튼:') && part.endsWith(']')) {
            // 🚀 [핵심 포인트] 단지 상세페이지로 이동하는 링크 버튼 생성
            const btnName = part.slice(4, -1).trim(); // "버튼:" 글자를 떼어내고 이름만 추출

            if (role === 'assistant') {
                const cleanBtnName = btnName.replace(/\s+/g, '');

                // 🚀 [해결 완료] 구글 시트의 실제 컬럼명인 'title'을 정확하게 찾습니다!
                const matchedProperty = properties.find(p => {
                    const item = p as any;
                    // 대표님이 말씀하신 'title' 속성에서 데이터를 꺼내옵니다.
                    const rawName = item.title || item.Title || "";
                    const dbName = String(rawName).replace(/\s+/g, '');
                    return dbName === cleanBtnName;
                });

                // ID를 찾으면 /property/아이디 로 가고, 못 찾으면 임시로 검색페이지로 이동합니다.
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

        // 나머지 일반 텍스트 (줄바꿈도 자연스럽게 유지됨)
        return <span key={index}>{part}</span>;
    });

    return (
        // 🚀 leading-[1.8] 로 줄 간격을 쾌적하게 늘렸습니다.
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
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-[#FF8C42] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                    <MessageCircle size={26} fill="white" />
                </button>
            )}

            {isOpen && (
                <div className="w-[calc(100vw-2rem)] md:w-[360px] h-[75dvh] max-h-[600px] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-[#4A403A] p-5 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#FF8C42] rounded-xl flex items-center justify-center shadow-inner"><Bot size={18} /></div>
                            <h3 className="text-[15px] font-black tracking-tighter">아파티 AI 상담사</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white p-1"><ChevronDown size={24} /></button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-[#fdfbf7] space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                {/* 🚀 줄 간격 충돌을 막기 위해 leading-relaxed 제거, 텍스트 크기 13px 유지 */}
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] font-medium shadow-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-[#FF8C42] text-white rounded-tr-none" : "bg-white text-[#4A403A] rounded-tl-none border border-gray-100"
                                    }`}>
                                    {/* 🚀 properties 배열을 넘겨주어 단지 ID를 찾을 수 있게 연결! */}
                                    {renderMessageContent(msg.text, msg.role, properties)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start">
                                <div className="p-4 rounded-2xl bg-white text-gray-400 border border-gray-100 flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin text-[#FF8C42]" />
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
                            <button onClick={() => sendMessage(inputValue)} disabled={isLoading} className="bg-[#4A403A] text-white p-2.5 rounded-xl">
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}