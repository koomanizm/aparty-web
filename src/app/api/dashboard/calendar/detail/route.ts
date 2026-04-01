import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

// 🚀 대표님이 발급받으신 한국부동산원 마스터 인증키
const API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const houseManageNo = searchParams.get('houseManageNo');
        const houseSecd = searchParams.get('houseSecd') || "01";

        if (!houseManageNo) {
            return NextResponse.json({ error: "유효하지 않은 단지 번호입니다." }, { status: 400 });
        }

        let supplyLoc = "-";
        let supplyScale = "-";
        let contactInfo = "-";
        let noticeDate = "-";
        let applyDateSp = "-";
        let applyDate1 = "-";
        let applyDate2 = "-";
        let winnerDate = "-";
        let contractDate = "-";
        let apiModels: any[] = [];

        // ==========================================
        // 🚀 1. 국가 공식 API 연동 (오차율 0% - 일반 아파트 전용)
        // ==========================================
        if (houseSecd === "01") {
            try {
                // [API 1] 기본 상세 정보 (위치, 규모, 문의처, 일정) 가져오기!
                const detailUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancDetail?page=1&perPage=10&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseManageNo}&serviceKey=${API_KEY}`;
                const detailRes = await fetch(detailUrl);
                const detailData = await detailRes.json();

                if (detailData && detailData.data && detailData.data.length > 0) {
                    const info = detailData.data[0];
                    supplyLoc = info.HSSPLY_ADRES || "-";
                    supplyScale = info.TOT_SUPLY_HSHLDCO ? `총 ${info.TOT_SUPLY_HSHLDCO}세대` : "-";
                    contactInfo = info.MDHS_TELNO || "-";
                    noticeDate = info.RCRIT_PBLANC_DE || "-";
                    applyDateSp = info.SPSPLY_RCEPT_BGNDE ? `${info.SPSPLY_RCEPT_BGNDE}` : "-";
                    applyDate1 = info.GNRL_RNK1_CRSPAREA_RCEPT_BGNDE || info.GNRL_RNK1_ETC_GG_RCPTDE_BGNDE || info.GNRL_RNK1_ETC_AREA_RCPTDE_BGNDE || "-";
                    applyDate2 = info.GNRL_RNK2_CRSPAREA_RCEPT_BGNDE || "-";
                    winnerDate = info.PRZWNER_PRSNTN_DE || "-";
                    contractDate = info.CNTRCT_CNCLS_BGNDE ? `${info.CNTRCT_CNCLS_BGNDE} ~ ${info.CNTRCT_CNCLS_ENDDE}` : "-";
                }

                // [API 2] 주택형별 모델 정보 (분양가, 특공/일반 세대수, 전용면적) 가져오기!
                const mdlUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/getAPTLttotPblancMdl?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseManageNo}&serviceKey=${API_KEY}`;
                const mdlRes = await fetch(mdlUrl);
                const mdlData = await mdlRes.json();

                if (mdlData && mdlData.data && mdlData.data.length > 0) {
                    apiModels = mdlData.data.map((m: any) => {
                        const priceStr = (m.LTTOT_TOP_AMOUNT || "0").toString().replace(/,/g, '');
                        const priceNum = Number(priceStr);
                        return {
                            type: m.MODEL_NO || "-",
                            shortType: m.MODEL_NO ? (m.MODEL_NO.split('.')[0].replace(/^0+/, '') + (m.MODEL_NO.match(/[A-Z]+$/) || [''])[0]) : "-",
                            area: m.SUPLY_AR || "-",
                            spUnits: m.SPSPLY_HSHLDCO || "0",
                            gnUnits: m.GNRL_SUPLY_HSHLDCO || "0",
                            totalUnits: (!isNaN(Number(m.SPSPLY_HSHLDCO)) && !isNaN(Number(m.GNRL_SUPLY_HSHLDCO)))
                                ? (Number(m.SPSPLY_HSHLDCO) + Number(m.GNRL_SUPLY_HSHLDCO)).toString()
                                : "-",
                            price: priceNum > 0 ? priceNum.toLocaleString() + "만원" : "미정"
                        };
                    });
                }
            } catch (e) {
                console.error("공공데이터 API 연결 실패", e);
            }
        }

        // ==========================================
        // 🚀 2. 크롤링 백업 엔진 (무순위, 오피스텔 등 비아파트 전용)
        // 표 구조가 꼬여있어도 강제로 옆 칸(next)을 읽어오는 방어 로직 적용
        // ==========================================
        if (supplyLoc === "-" || apiModels.length === 0) {
            let targetUrl = "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do";
            if (["04", "08", "09", "10", "11"].includes(houseSecd)) {
                targetUrl = "https://www.applyhome.co.kr/ai/aia/selectRemndrLttotPblancDetail.do";
            } else if (["02", "03", "06", "07"].includes(houseSecd)) {
                targetUrl = "https://www.applyhome.co.kr/ai/aia/selectUrbtyOfctlLttotPblancDetail.do";
            } else if (houseSecd === "05") {
                targetUrl = "https://www.applyhome.co.kr/ai/aia/selectPblsupPrvateRntalLttotPblancDetail.do";
            }

            const formData = new URLSearchParams();
            formData.append('houseManageNo', houseManageNo);
            formData.append('pblancNo', houseManageNo);
            formData.append('houseSecd', houseSecd);
            formData.append('gvPgmId', "AIB01M01");

            const response = await fetch(targetUrl, {
                method: 'POST',
                headers: { 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            });

            const htmlText = await response.text();
            const $ = cheerio.load(htmlText);

            // 칸(Cell) 병합 무시하고 무조건 옆에 있는 데이터 강제 징발
            const infoMap: Record<string, string> = {};
            $('table tr').each((_, tr) => {
                const ths = $(tr).find('th');
                ths.each((_, th) => {
                    const key = $(th).text().replace(/\s+/g, '');
                    let val = $(th).next('td').text().replace(/\s+/g, ' ').trim();
                    if (key && val) infoMap[key] = val;
                });
            });

            if (supplyLoc === "-") supplyLoc = infoMap['공급위치'] || "-";
            if (supplyScale === "-") supplyScale = infoMap['공급규모'] || infoMap['공급대상'] || "-";
            if (contactInfo === "-") contactInfo = infoMap['문의처'] || infoMap['전화번호'] || "-";
            if (noticeDate === "-") noticeDate = infoMap['모집공고일'] || "-";
            if (applyDateSp === "-") applyDateSp = infoMap['특별공급'] || infoMap['특별공급접수일자'] || "-";
            if (applyDate1 === "-") applyDate1 = infoMap['1순위'] || infoMap['1순위접수일자'] || infoMap['청약접수'] || infoMap['접수일자'] || "-";
            if (applyDate2 === "-") applyDate2 = infoMap['2순위'] || infoMap['2순위접수일자'] || "-";
            if (winnerDate === "-") winnerDate = infoMap['당첨자발표일'] || infoMap['당첨자발표일자'] || "-";
            if (contractDate === "-") contractDate = infoMap['계약일'] || infoMap['계약체결일'] || "-";

            if (apiModels.length === 0) {
                $('table').each((i, table) => {
                    const thText = $(table).find('th').text().replace(/\s+/g, '');
                    if (thText.includes('공급금액') || thText.includes('분양가')) {
                        $(table).find('tbody tr').each((j, tr) => {
                            const tds = $(tr).find('td');
                            if (tds.length >= 2) {
                                const type = $(tds[0]).text().trim();
                                const price = $(tds[1]).text().trim();
                                if (type && price) {
                                    const shortType = type.split('.')[0].replace(/^0+/, '') + (type.match(/[A-Z]+$/) || [''])[0];
                                    apiModels.push({
                                        type, shortType: shortType || type, price: price !== "" ? price + "만원" : "미정",
                                        area: "-", spUnits: "-", gnUnits: "-", totalUnits: "-"
                                    });
                                }
                            }
                        });
                    }
                });

                $('table').each((i, table) => {
                    const thText = $(table).find('th').text().replace(/\s+/g, '');
                    if (thText.includes('세대수') || thText.includes('공급호수')) {
                        $(table).find('tbody tr').each((j, tr) => {
                            const tds = $(tr).find('td');
                            if (tds.length >= 2) {
                                const type = $(tds[0]).text().trim();
                                let totalUnits = tds.length >= 4 ? $(tds[3]).text().trim() : $(tds[tds.length - 1]).text().trim();
                                if (type) {
                                    const modelIndex = apiModels.findIndex(m => m.type === type);
                                    if (modelIndex > -1) apiModels[modelIndex].totalUnits = totalUnits;
                                    else {
                                        const shortType = type.split('.')[0].replace(/^0+/, '') + (type.match(/[A-Z]+$/) || [''])[0];
                                        apiModels.push({ type, shortType: shortType || type, price: "미정", area: "-", spUnits: "-", gnUnits: "-", totalUnits });
                                    }
                                }
                            }
                        });
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                loc: supplyLoc,
                scale: supplyScale,
                contact: contactInfo,
                noticeDate: noticeDate,
                dateSp: applyDateSp,
                date1: applyDate1,
                date2: applyDate2,
                winnerDate: winnerDate,
                contractDate: contractDate,
                models: apiModels
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "데이터 수집 실패" }, { status: 500 });
    }
}