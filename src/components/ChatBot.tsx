"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X, MapPin, Calendar, DollarSign, ArrowLeft, Building2, Coins, Phone, Send } from "lucide-react";
import { getPropertiesFromSheet, Property } from "../lib/sheet";

type Message = {
    id: number;
    text: string;
    sender: "bot" | "user";
    type?: "text" | "options";
    options?: any[];
};

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [properties, setProperties] = useState<Property[]>([]);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "안녕하세요! 아파티(APARTY) AI입니다. 🤖\n데이터를 불러오고 있어요...",
            sender: "bot",
        }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadSheetData() {
            const data = await getPropertiesFromSheet();
            setProperties(data);

            setMessages([
                {
                    id: 1,
                    text: "안녕하세요? 저는 아파티 AI 매니저입니다! 😊\n관심 있는 현장을 선택해주시면 자세히 알려줄게요.",
                    sender: "bot",
                    type: "options",
                    options: data.map(p => ({ label: p.title, value: p.id }))
                }
            ]);
        }
        loadSheetData();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handlePropertySelect = (propertyId: number, propertyTitle: string) => {
        const userMsg: Message = { id: Date.now(), text: propertyTitle, sender: "user" };
        const target = properties.find(p => p.id === propertyId);
        setSelectedPropertyId(propertyId);

        const botMsg: Message = {
            id: Date.now() + 1,
            text: `[${target?.title}]\n이 단지에 대해 무엇이 궁금하신가요?`,
            sender: "bot"
        };

        setMessages(prev => [...prev, userMsg, botMsg]);
    };

    const handleDetailQuestion = (type: "price" | "location" | "moveIn" | "reset") => {
        if (type === "reset") {
            setSelectedPropertyId(null);
            setMessages(prev => [...prev,
            { id: Date.now(), text: "다른 현장 보기", sender: "user" },
            {
                id: Date.now() + 1,
                text: "다른 현장을 선택해주세요.",
                sender: "bot",
                type: "options",
                options: properties.map(p => ({ label: p.title, value: p.id }))
            }
            ]);
            return;
        }

        const target = properties.find(p => p.id === selectedPropertyId);
        if (!target) return;

        let questionText = "";
        let answerText = "";

        switch (type) {
            case "price":
                questionText = "💰 분양가 문의";
                answerText = `${target.title}의 분양가는\n[${target.price}] 수준입니다.`;
                break;
            case "location":
                questionText = "📍 위치 확인";
                answerText = `현장 위치는\n[${target.location}]입니다..`;
                break;
            case "moveIn":
                questionText = "📅 입주시기";
                answerText = `입주 예정일은\n[${target.moveIn}]입니다.`;
                break;
        }

        setMessages(prev => [...prev,
        { id: Date.now(), text: questionText, sender: "user" },
        { id: Date.now() + 1, text: answerText, sender: "bot" }
        ]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="bg-white w-[90vw] sm:w-[350px] h-[550px] rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">

                    {/* ✅ 헤더: 아파티 다크 브라운 적용 */}
                    <div className="bg-[#4a403a] p-5 text-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center shadow-inner">
                                <MessageCircle size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight">아파티 AI 매니저</p>
                                <p className="text-[10px] text-orange-200 font-bold uppercase tracking-wider">Online Now</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition hover:rotate-90 duration-200">
                            <X size={20} />
                        </button>
                    </div>

                    {/* ✅ 대화창 배경: 베이지색 적용 */}
                    <div className="flex-1 p-4 overflow-y-auto bg-[#fdfbf7] space-y-4 custom-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm whitespace-pre-line shadow-sm mb-1 ${msg.sender === "user"
                                    ? "bg-orange-400 text-white rounded-tr-none" // ✅ 사용자 말풍선: 오렌지
                                    : "bg-white text-[#4a403a] border border-gray-100 rounded-tl-none font-medium" // ✅ 봇 말풍선: 화이트/브라운
                                    }`}>
                                    {msg.text}
                                </div>

                                {msg.type === "options" && msg.options && (
                                    <div className="flex flex-col gap-2 w-full mt-2">
                                        {msg.options.map((opt: any) => (
                                            <button
                                                key={opt.value}
                                                onClick={() => handlePropertySelect(opt.value, opt.label)}
                                                className="text-xs bg-white border border-orange-100 text-[#4a403a] hover:bg-orange-50 hover:border-orange-200 py-3 px-4 rounded-xl transition-all text-left shadow-sm font-bold flex items-center justify-between group"
                                            >
                                                <span>🏠 {opt.label}</span>
                                                <span className="text-orange-300 group-hover:text-orange-500">→</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ✅ 하단 버튼 영역 */}
                    {selectedPropertyId ? (
                        <div className="p-4 bg-white border-t border-gray-50">
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <button onClick={() => handleDetailQuestion("price")} className="flex flex-col items-center justify-center py-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors text-[11px] font-bold text-gray-500 gap-1 border border-gray-100">
                                    <Coins size={16} className="text-orange-400" /> 분양가
                                </button>
                                <button onClick={() => handleDetailQuestion("location")} className="flex flex-col items-center justify-center py-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors text-[11px] font-bold text-gray-500 gap-1 border border-gray-100">
                                    <MapPin size={16} className="text-orange-400" /> 위치
                                </button>
                                <button onClick={() => handleDetailQuestion("moveIn")} className="flex flex-col items-center justify-center py-2.5 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors text-[11px] font-bold text-gray-500 gap-1 border border-gray-100">
                                    <Building2 size={16} className="text-orange-400" /> 입주시기
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDetailQuestion("reset")}
                                    className="w-12 flex items-center justify-center bg-gray-100 text-gray-400 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <Link
                                    href="http://pf.kakao.com/_EbnAX"
                                    target="_blank"
                                    className="flex-1 bg-[#FEE500] hover:bg-yellow-400 text-slate-900 text-sm font-black py-3.5 rounded-xl flex justify-center items-center gap-2 transition shadow-md active:scale-95"
                                >
                                    <MessageCircle size={18} />
                                    전문 상담원 연결
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white border-t border-gray-50">
                            <Link
                                href="http://pf.kakao.com/_EbnAX"
                                target="_blank"
                                className="w-full bg-[#FEE500] hover:bg-yellow-400 text-slate-900 text-sm font-black py-3.5 rounded-xl flex justify-center items-center gap-2 transition shadow-md active:scale-95"
                            >
                                <MessageCircle size={18} />
                                무엇이든 물어보세요
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* ✅ 플로팅 버튼: 오렌지색 + 2xl 사각형 스타일 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-orange-400 hover:bg-orange-500 text-white rounded-2xl  transition-all hover:scale-110 active:scale-95 flex items-center justify-center w-14 h-14 relative group"
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <MessageCircle size={26} className="group-hover:rotate-12 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-orange-400 rounded-full"></span>
                    </>
                )}
            </button>
        </div>
    );
}