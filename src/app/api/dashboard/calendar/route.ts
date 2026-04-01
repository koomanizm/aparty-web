import { NextResponse } from "next/server";

export const revalidate = 0; // 캐시 무효화 (달을 넘길 때마다 새로 가져와야 함)

// 🚀 request 매개변수를 추가하여 프론트에서 보낸 년/월을 받습니다.
export async function GET(request: Request) {
    try {
        console.log("🕵️‍♂️ [내부 API 타격]: 청약홈 실시간 달력 데이터 수집 중...");

        // 🚀 프론트엔드에서 보낸 ?year=2026&month=04 값을 뽑아냅니다.
        const { searchParams } = new URL(request.url);
        const queryYear = searchParams.get('year');
        const queryMonth = searchParams.get('month');

        // 프론트에서 값을 안 보내면(첫 로딩 시) 기본값으로 이번 달을 씁니다.
        const now = new Date();
        const year = queryYear || String(now.getFullYear());
        const month = queryMonth || String(now.getMonth() + 1).padStart(2, '0');
        const inqirePd = `${year}${month}`; // 예: "202604"

        const targetUrl = "https://www.applyhome.co.kr/ai/aib/selectSubscrptCalender.do";

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ reqData: { inqirePd: inqirePd } })
        });

        const data = await response.json();
        const list = data.schdulList || [];
        let combinedEvents: any[] = [];

        // 8개 카테고리로 완벽 분리
        const getCustomType = (rcept: string) => {
            const rceptSe = String(rcept || "").trim();

            switch (rceptSe) {
                case "01": return "특별공급";
                case "02": return "1순위";
                case "03": return "2순위";
                case "06": return "무순위";
                case "11": return "임의공급";
                case "07": return "재공급";
                case "05": return "오피스텔/생숙/도생/민간임대";
                case "04": return "공공지원민간임대";
                default: return "1순위";
            }
        };

        if (Array.isArray(list)) {
            list.forEach((item: any) => {
                const rawDate = item.IN_DATE || "";
                let formattedDate = rawDate;
                if (rawDate.length === 8) {
                    formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
                }

                if (formattedDate) {
                    combinedEvents.push({
                        id: `${item.HOUSE_MANAGE_NO || 'ID'}_${item.RCEPT_SE || 'R'}_${Math.random().toString(36).substr(2, 5)}`,
                        RCRIT_PBLANC_DE: formattedDate,
                        HOUSE_NM: item.HOUSE_NM || "단지명 미상",
                        HSSPLY_ADRES: item.SUBSCRPT_AREA_CODE_NM || "전국",
                        CUSTOM_TYPE: getCustomType(item.RCEPT_SE),
                        TOT_SUPLY_HSHLDCO: "-",
                        MDHS_TELNO: "청약홈 확인 요망"
                    });
                }
            });
        }

        if (combinedEvents.length === 0) {
            combinedEvents = [
                { id: 'fb1', HOUSE_NM: "해당 월의 청약 일정이 없습니다.", HSSPLY_ADRES: "전국", RCRIT_PBLANC_DE: `${year}-${month}-01`, CUSTOM_TYPE: "1순위" }
            ];
        }

        return new NextResponse(JSON.stringify([{ data: combinedEvents }]), { status: 200 });

    } catch (error: any) {
        return new NextResponse(JSON.stringify([{ data: [] }]), { status: 200 });
    }
}