"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Home, Info, HelpCircle } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../lib/sheet";

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "안녕하세요! 아파티(APARTY)입니다. 무엇을 도와드릴까요?", sender: "bot" }
    ]);
    const [input, setInput] = useState("");
    const [properties, setProperties] = useState<Property[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 시트 데이터 로드
    useEffect(() => {
        async function loadProperties() {
            const data = await getPropertiesFromSheet();
            setProperties(data);
        }
        loadProperties();
    }, []);

    // 메시지 스크롤 자동 하단 이동
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: Date.now(), text, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        // 봇 응답 로직 (간단한 예시)
        setTimeout(() => {
            let botText = "문의하신 내용을 담당자에게 전달해 드릴까요? '관심고객 등록' 버튼을 누르시면 더 자세한 상담이 가능합니다.";

            if (text.includes("분양")) {
                botText = "현재 부산/경남 지역의 핫한 분양 단지들을 분석해 드릴 수 있습니다. 어떤 단지가 궁금하신가요?";
            }

            const botMsg: Message = { id: Date.now() + 1, text: botText, sender: "bot" };
            setMessages((prev) => [...prev, botMsg]);
        }, 1000);
    };

    // 🚀 [문제 해결] 매물 선택 시 ID 타입 충돌 방지 로직
    const handlePropertySelect = (propertyId: string | number, propertyTitle: string) => {
        const userMsg: Message = { id: Date.now(), text: `[${propertyTitle}] 정보가 궁금해!`, sender: "user" };
        setMessages((prev) => [...prev, userMsg]);

        // 📍 String()을 사용하여 모든 타입을 문자열로 통일해 비교합니다.
        const target = properties.find(p => String(p.id) === String(propertyId));

        setTimeout(() => {
            const botText = target
                ? `${target.title}의 분양가는 약 ${target.price}입니다. 상세페이지에서 실거래가와 뉴스를 확인해 보세요!`
                : "해당 매물 정보를 찾고 있습니다. 잠시만 기다려 주세요.";

            const botMsg: Message = { id: Date.now() + 1, text: botText, sender: "bot" };
            setMessages((prev) => [...prev, botMsg]);
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999]">
            {/* 챗봇 아이콘 버튼 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#ff6f42] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all active:scale-95"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>

            {/* 채팅창 */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">

                    {/* 헤더 */}
                    <div className="bg-[#ff6f42] p-5 text-white">
                        <h3 className="font-black text-lg flex items-center gap-2">
                            <span className="text-2xl">🤖</span> APARTY AI 봇
                        </h3>
                        <p className="text-[11px] opacity-80 font-medium">실시간 분양 정보 및 시세를 답변해 드립니다.</p>
                    </div>

                    {/* 메시지 영역 */}
                    <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto bg-[#fdfbf7] space-y-4">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm font-medium shadow-sm ${msg.sender === "user"
                                    ? "bg-[#4a403a] text-white rounded-br-none"
                                    : "bg-white text-[#4a403a] rounded-bl-none border border-gray-100"
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* 추천 단지 퀵 버튼 (데이터 연동) */}
                        {properties.length > 0 && (
                            <div className="flex flex-col gap-2 pt-2">
                                <p className="text-[10px] text-gray-400 font-bold px-1">🔥 인기 단지 바로보기</p>
                                <div className="flex flex-wrap gap-2">
                                    {properties.slice(0, 3).map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => handlePropertySelect(p.id, p.title)}
                                            className="bg-white border border-orange-100 text-orange-600 text-[11px] font-bold px-3 py-1.5 rounded-full hover:bg-orange-50 transition-colors shadow-sm"
                                        >
                                            {p.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 입력 영역 */}
                    <div className="p-4 bg-white border-t border-gray-50 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSend(input)}
                            placeholder="궁금한 단지 이름을 입력하세요..."
                            className="flex-grow bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                        />
                        <button
                            onClick={() => handleSend(input)}
                            className="bg-[#ff6f42] text-white p-2.5 rounded-xl hover:bg-[#ff5a28] transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}