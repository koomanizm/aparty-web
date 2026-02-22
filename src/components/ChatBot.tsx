"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle, ChevronDown, Bot, Building2 } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../lib/sheet";

interface Message {
    role: "assistant" | "user";
    text: string;
    options?: string[];
    propertyOptions?: Property[];
    selectedProperty?: Property;
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);

    const initialMessage: Message = {
        role: "assistant",
        text: "반가워요! 아파티(APARTY) AI 상담사입니다. ✨ \n찾으시는 아파트 이름을 말씀해 주시면 제가 꼼꼼하게 찾아드릴게요!"
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadData() {
            const data = await getPropertiesFromSheet();
            setProperties(data);
        }
        loadData();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSearch = (query: string) => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) {
            setMessages(prev => [...prev, { role: "assistant", text: "검색어는 2글자 이상 입력해 주세요! 그래야 제가 더 잘 찾을 수 있어요. 😊" }]);
            return;
        }

        const filtered = properties.filter(p => p.title.toLowerCase().includes(q));

        if (filtered.length > 0) {
            setMessages(prev => [...prev, {
                role: "assistant",
                text: `와우! 말씀하신 단지를 ${filtered.length}건 찾았습니다. 어떤 단지가 궁금하신가요?`,
                propertyOptions: filtered
            }]);
        } else {
            setMessages(prev => [...prev, { role: "assistant", text: "앗, 아쉽게도 일치하는 단지를 못 찾았어요. 😅 이름을 다시 한번 확인해 주시겠어요?" }]);
        }
    };

    const selectProperty = (prop: Property) => {
        setMessages(prev => [...prev,
        { role: "user", text: prop.title },
        {
            role: "assistant",
            text: `[${prop.title}] 현장에 대해 무엇을 알려드릴까요? 아래 메뉴에서 골라보세요! ✨`,
            options: ["분양가 확인", "위치 정보", "세대수/규모", "현장 상세분석"],
            selectedProperty: prop
        }
        ]);
    };

    const showDetailInfo = (type: string, prop: Property) => {
        let responseText = "";
        switch (type) {
            case "분양가 확인": responseText = `${prop.title}의 분양가는 [${prop.price}]입니다! 예산에 잘 맞으시는지 확인해 보세요.`; break;
            case "위치 정보": responseText = `${prop.title}는 [${prop.location}]에 위치해 있어요. 지도로 보시면 더 정확하답니다!`; break;
            case "세대수/규모": responseText = `${prop.title}는 총 [${prop.households}] 규모로 지어지며, 면적은 [${prop.size}]입니다. 쾌적한 단지네요!`; break;
            // 🚀 엑셀(시트)의 내용을 자르지 않고 전체 그대로 출력하도록 수정했습니다!
            case "현장 상세분석": responseText = `아파티 전문가들이 분석한 이 현장의 핵심 포인트입니다!\n\n${prop.description}`; break;
        }

        setMessages(prev => [...prev,
        { role: "user", text: type },
        {
            role: "assistant",
            text: responseText,
            options: ["다른 정보 더보기", "처음으로"],
            selectedProperty: prop
        }
        ]);
    };

    const handleOptionClick = (opt: string, prop?: Property) => {
        if (opt === "처음으로") {
            setMessages([initialMessage]);
        } else if (opt === "다른 정보 더보기" && prop) {
            setMessages(prev => [...prev,
            {
                role: "assistant",
                text: `알겠습니다! [${prop.title}]의 다른 정보들도 준비했어요. 무엇을 더 볼까요?`,
                options: ["분양가 확인", "위치 정보", "세대수/규모", "현장 상세분석"],
                selectedProperty: prop
            }
            ]);
        } else if (prop) {
            showDetailInfo(opt, prop);
        }
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;
        setMessages(prev => [...prev, { role: "user", text: inputValue }]);
        handleSearch(inputValue);
        setInputValue("");
    };

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            {!isOpen && (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-[#FF8C42] text-white rounded-full shadow-[0_15px_30px_-10px_rgba(255,140,66,0.6)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all border-2 border-white">
                    <MessageCircle size={26} fill="white" />
                </button>
            )}

            {isOpen && (
                <div className="w-[360px] h-[550px] bg-white rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-5">
                    {/* Header */}
                    <div className="bg-[#4A403A] p-6 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#FF8C42] rounded-xl flex items-center justify-center shadow-inner"><Bot size={20} strokeWidth={2.5} /></div>
                            <h3 className="text-[15px] font-black tracking-tighter">아파티 AI 상담사</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors"><ChevronDown size={24} /></button>
                    </div>

                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 bg-[#fdfbf7] space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed font-bold shadow-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-[#FF8C42] text-white rounded-tr-none" : "bg-white text-[#4A403A] rounded-tl-none border border-gray-100"
                                    }`}>
                                    {msg.text}
                                </div>

                                {msg.propertyOptions && (
                                    <div className="flex flex-wrap gap-2 mt-3 justify-start">
                                        {msg.propertyOptions.map((p, idx) => (
                                            <button key={idx} onClick={() => selectProperty(p)} className="px-4 py-2.5 bg-white border border-orange-200 text-[#FF8C42] rounded-full text-[13px] font-black hover:bg-orange-50 transition-all flex items-center gap-1.5 shadow-sm">
                                                <Building2 size={13} /> {p.title}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {msg.options && (
                                    <div className="grid grid-cols-2 gap-2 mt-3 w-full max-w-[280px]">
                                        {msg.options.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleOptionClick(opt, msg.selectedProperty)}
                                                className={`px-3 py-3 rounded-xl text-[12px] font-black transition-all shadow-sm ${opt === "처음으로" || opt === "다른 정보 더보기"
                                                        ? "bg-white text-gray-400 border border-gray-200 hover:border-gray-400"
                                                        : "bg-[#4A403A] text-white hover:bg-black"
                                                    }`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-5 bg-white border-t border-gray-50">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="단지명을 검색해 보세요..." className="flex-1 bg-transparent border-none outline-none px-3 text-[14px] font-bold" />
                            <button onClick={handleSend} className="bg-[#4A403A] text-white p-2.5 rounded-xl hover:bg-black transition-colors"><Send size={14} /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}