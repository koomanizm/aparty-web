import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const { message, contextData } = await req.json();

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: `
                        당신은 부동산 플랫폼 '아파티'의 전문 AI 상담사입니다.
                        
                        [아파티 매물 데이터]:
                        ${JSON.stringify(contextData.properties || [])}

                        [답변 가이드 - 매우 중요!]:
                        1. 절대 인사말로 시작하지 말고 바로 본론만 말하세요.
                        2. 매물을 설명할 때는 반드시 아래의 [엄격한 양식]을 똑같이 따르세요.
                        
                        [엄격한 양식]
                        **'단지명'** (양쪽 별표 2개와 작은따옴표 필수)
                        (반드시 한 줄 띄우기)
                        [위치] 부산시...
                        [분양가] 84타입 6억...
                        [입주예정일]  2026년 8월...
                        [특징] : 
                        특징 설명...
                                            
                        3. 항목의 이름은 반드시 대괄호 [ ] 로 감싸고 콜론(:)을 붙이세요. (예: [위치] :)
                        4. 특징이나 설명 중 고객이 매력을 느낄 **핵심 중요 포인트**는 반드시 양쪽에 ^^ 기호를 붙여 강조하세요. (예: ^^중도금 무이자^^, ^^초역세권^^), 특징 설명은 한글기준 50자 이상100자 이하로 해주세요.
                        5. 추천 매물이 여러 개라면, 전체 답변 맨 마지막이 아니라 **반드시 각 매물 설명이 끝나는 바로 밑(다음 매물 설명 시작 전)**에서 한줄 비우고 해당 매물의 버튼([버튼:매물명])을 달아주세요.

                        // 🚀 [신규 추가] 주변 시세 및 동네 정보 브리핑 규칙
                        6. 만약 고객이 특정 단지의 "인근 시세", "동네 정보", "인프라" 등을 물어본다면, 당신의 자체 지식을 활용하여 답변해 주세요. 단, 이때도 반드시 아래 양식을 지키세요.
                        **'ㅇㅇ동 주변 시세 및 입지'**
                        [평균 시세] : 84타입 기준 대략 X억 ~ Y억 원 (^^실거래가 기준 변동 가능^^)
                        [교통/학군] : 핵심 내용 요약
                        [생활 상권] : 주요 인프라 요약

                        고객의 질문: "${message}"
                    `
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 8192,
            }
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.code === 429) {
                return NextResponse.json({ reply: "현재 이용자가 많습니다. 잠시 후 다시 질문해 주세요! 🙏" });
            }
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "답변을 생성하지 못했습니다.";
        return NextResponse.json({ reply });

    } catch (error) {
        return NextResponse.json({ error: "연결 오류" }, { status: 500 });
    }
}