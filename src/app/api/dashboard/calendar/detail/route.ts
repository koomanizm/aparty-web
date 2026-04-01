import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';

const API_KEY = "dd35353d775e77d0d73c80313a57ba01602b407a478f7905984bd12be150b59d";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const houseManageNo = searchParams.get('houseManageNo');
        const houseSecd = searchParams.get('houseSecd') || "01";

        if (!houseManageNo || houseManageNo === 'ID' || houseManageNo.includes('Math')) {
            return NextResponse.json({ error: "유효하지 않은 단지 번호입니다." }, { status: 400 });
        }

        let supplyLoc = "-", supplyScale = "-", contactInfo = "-", noticeDate = "-";
        let applyDateSp = "-", applyDate1 = "-", applyDate2 = "-", winnerDate = "-", contractDate = "-", homepage = "-";
        let apiModels: any[] = [];

        let detailEndpoint = "getAPTLttotPblancDetail";
        let mdlEndpoint = "getAPTLttotPblancMdl";

        if (["04", "08", "09", "10", "11"].includes(houseSecd)) {
            detailEndpoint = "getRemndrLttotPblancDetail";
            mdlEndpoint = "getRemndrLttotPblancMdl";
        } else if (["02", "03", "06", "07"].includes(houseSecd)) {
            detailEndpoint = "getUrbtyOfctlLttotPblancDetail";
            mdlEndpoint = "getUrbtyOfctlLttotPblancMdl";
        } else if (houseSecd === "05") {
            detailEndpoint = "getPblsupPrvateRntalLttotPblancDetail";
            mdlEndpoint = "getPblsupPrvateRntalLttotPblancMdl";
        }

        // ==========================================
        // 🚀 PHASE 1: 공공데이터 API 호출
        // ==========================================
        try {
            const detailUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${detailEndpoint}?page=1&perPage=10&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseManageNo}&serviceKey=${API_KEY}`;
            const detailRes = await fetch(detailUrl);
            const detailData = await detailRes.json();

            if (detailData && detailData.data && detailData.data.length > 0) {
                const info = detailData.data[0];

                supplyLoc = info.HSSPLY_ADRES || "-";
                supplyScale = info.TOT_SUPLY_HSHLDCO ? `총 ${info.TOT_SUPLY_HSHLDCO}세대` : "-";
                contactInfo = info.MDHS_TELNO || "-";
                noticeDate = info.RCRIT_PBLANC_DE || "-";
                homepage = info.HMPG_ADRES || "-";
                winnerDate = info.PRZWNER_PRSNTN_DE || "-";

                if (info.CNTRCT_CNCLS_BGNDE && info.CNTRCT_CNCLS_ENDDE) {
                    contractDate = `${info.CNTRCT_CNCLS_BGNDE} ~ ${info.CNTRCT_CNCLS_ENDDE}`;
                }

                if (houseSecd === "01") {
                    applyDateSp = info.SPSPLY_RCEPT_BGNDE || info.SPSPLY_RCPTDE_BGNDE || "-";
                    applyDate1 = info.GNRL_RNK1_CRSPAREA_RCEPT_BGNDE || info.GNRL_RNK1_CRSPAREA_RCPTDE_BGNDE ||
                        info.GNRL_RNK1_ETC_GG_RCPTDE_BGNDE || info.GNRL_RNK1_ETC_AREA_RCPTDE_BGNDE || "-";
                    applyDate2 = info.GNRL_RNK2_CRSPAREA_RCEPT_BGNDE || info.GNRL_RNK2_CRSPAREA_RCPTDE_BGNDE ||
                        info.GNRL_RNK2_ETC_GG_RCPTDE_BGNDE || info.GNRL_RNK2_ETC_AREA_RCPTDE_BGNDE || "-";
                } else {
                    if (info.SUBSCRPT_RCEPT_BGNDE && info.SUBSCRPT_RCEPT_ENDDE) {
                        applyDate1 = `${info.SUBSCRPT_RCEPT_BGNDE} ~ ${info.SUBSCRPT_RCEPT_ENDDE}`;
                    } else if (info.SUBSCRPT_RCEPT_BGNDE || info.SUBSCRPT_RCPTDE_BGNDE) {
                        applyDate1 = info.SUBSCRPT_RCEPT_BGNDE || info.SUBSCRPT_RCPTDE_BGNDE || "-";
                    }
                }
            }

            const mdlUrl = `https://api.odcloud.kr/api/ApplyhomeInfoDetailSvc/v1/${mdlEndpoint}?page=1&perPage=50&cond%5BHOUSE_MANAGE_NO%3A%3AEQ%5D=${houseManageNo}&serviceKey=${API_KEY}`;
            const mdlRes = await fetch(mdlUrl);
            const mdlData = await mdlRes.json();

            if (mdlData && mdlData.data && mdlData.data.length > 0) {
                apiModels = mdlData.data.map((m: any) => {
                    const priceStr = (m.LTTOT_TOP_AMOUNT || m.SUPLY_AMOUNT || "0").toString().replace(/,/g, '');
                    const priceNum = Number(priceStr);
                    const isApt = houseSecd === "01";

                    let spUnits = "-";
                    let gnUnits = "-";
                    let totalUnits = "-";

                    // 🚀 억지 계산 로직 전면 폐기! API 데이터 그대로 정확하게 매핑
                    if (isApt) {
                        const sp = m.SPSPLY_HSHLDCO ? Number(m.SPSPLY_HSHLDCO) : 0;
                        // 아파트의 경우 SUPLY_HSHLDCO는 총 세대수가 아니라 일반공급입니다!
                        const gn = m.GNRL_SUPLY_HSHLDCO ? Number(m.GNRL_SUPLY_HSHLDCO) : (m.SUPLY_HSHLDCO ? Number(m.SUPLY_HSHLDCO) : 0);

                        spUnits = sp.toString();
                        gnUnits = gn.toString();
                        totalUnits = (sp + gn).toString(); // 총 세대수는 특공 + 일반
                    } else {
                        // 비아파트 (무순위, 줍줍 등)는 특공이 아예 없으므로, SUPLY_HSHLDCO가 총 물량이자 일반 물량
                        const tot = m.SUPLY_HSHLDCO ? Number(m.SUPLY_HSHLDCO) : 0;
                        spUnits = "-";
                        gnUnits = tot > 0 ? tot.toString() : "-";
                        totalUnits = tot > 0 ? tot.toString() : "-";
                    }

                    return {
                        type: m.MODEL_NO || "-",
                        shortType: m.MODEL_NO ? (m.MODEL_NO.split('.')[0].replace(/^0+/, '') + (m.MODEL_NO.match(/[A-Z]+$/) || [''])[0]) : "-",
                        area: m.SUPLY_AR || "-",
                        spUnits: spUnits,
                        gnUnits: gnUnits,
                        totalUnits: totalUnits,
                        price: priceNum > 0 ? priceNum.toLocaleString() + "만원" : "미정"
                    };
                });
            }
        } catch (e) {
            console.error("API 연동 에러:", e);
        }

        // ==========================================
        // 🚀 PHASE 2: 무적의 크롤링 백업
        // ==========================================

        if (!applyDate1 || applyDate1 === "-" || winnerDate === "-" || applyDate2 === "-" || apiModels.length === 0 || noticeDate === "-") {
            try {
                let targetUrl = "https://www.applyhome.co.kr/ai/aia/selectAPTLttotPblancDetail.do";
                if (["04", "08", "09", "10", "11"].includes(houseSecd)) targetUrl = "https://www.applyhome.co.kr/ai/aia/selectRemndrLttotPblancDetail.do";
                else if (["02", "03", "06", "07"].includes(houseSecd)) targetUrl = "https://www.applyhome.co.kr/ai/aia/selectUrbtyOfctlLttotPblancDetail.do";
                else if (houseSecd === "05") targetUrl = "https://www.applyhome.co.kr/ai/aia/selectPblsupPrvateRntalLttotPblancDetail.do";

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

                const BAD_WORDS = ["구분", "일정", "해당지역", "기타지역", "지역", "순위", "거주지역", "접수일자", "청약접수일", "신청방법", "장소", "방법"];
                const infoMap: Record<string, string> = {};

                $('table tr').each((_, tr) => {
                    $(tr).find('th').each((_, th) => {
                        const key = $(th).text().replace(/\s+/g, '');
                        let val = "";
                        const isDateKey = key.includes('일') || key.includes('순위') || key.includes('접수') || key.includes('발표');

                        $(th).nextAll('td').each((_, td) => {
                            const tempVal = $(td).text().replace(/\s+/g, ' ').trim();
                            if (tempVal && !BAD_WORDS.includes(tempVal) && val === "") {
                                if (isDateKey) {
                                    if (/\d/.test(tempVal)) val = tempVal;
                                } else {
                                    val = tempVal;
                                }
                            }
                        });
                        if (key && val) infoMap[key] = val;
                    });

                    const firstCell = $(tr).find('th, td').first();
                    const key2 = firstCell.text().replace(/\s+/g, '');
                    let val2 = "";
                    const isDateKey2 = key2.includes('일') || key2.includes('순위') || key2.includes('접수') || key2.includes('발표');

                    firstCell.nextAll('td').each((_, td) => {
                        const tempVal = $(td).text().replace(/\s+/g, ' ').trim();
                        if (tempVal && !BAD_WORDS.includes(tempVal) && val2 === "") {
                            if (isDateKey2) {
                                if (/\d/.test(tempVal)) val2 = tempVal;
                            } else {
                                val2 = tempVal;
                            }
                        }
                    });
                    if (key2 && val2 && key2 !== val2) infoMap[key2] = val2;
                });

                for (const key in infoMap) {
                    const val = infoMap[key];
                    if (winnerDate === "-" && key.includes('당첨자발표') && /\d/.test(val)) winnerDate = val;
                    if (applyDate2 === "-" && key.includes('2순위') && /\d/.test(val)) applyDate2 = val;
                    if (noticeDate === "-" && key.includes('모집공고일') && /\d/.test(val)) noticeDate = val;
                    if ((!applyDate1 || applyDate1 === "-") && (key.includes('1순위') || key.includes('청약접수')) && !key.includes('방법') && /\d/.test(val)) applyDate1 = val;
                    if (supplyLoc === "-" && key.includes('공급위치')) supplyLoc = val;
                }

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
                                        apiModels.push({ type, shortType: shortType || type, price: price !== "" ? price + "만원" : "미정", area: "-", spUnits: "-", gnUnits: "-", totalUnits: "-" });
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
                                    }
                                }
                            });
                        }
                    });
                }
            } catch (err) {
                console.error("크롤러 백업 실패:", err);
            }
        }

        return NextResponse.json({
            success: true,
            data: { loc: supplyLoc, scale: supplyScale, contact: contactInfo, noticeDate: noticeDate, dateSp: applyDateSp, date1: applyDate1, date2: applyDate2, winnerDate: winnerDate, contractDate: contractDate, homepage: homepage, models: apiModels }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "서버 처리 실패" }, { status: 500 });
    }
}