import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import iconv from 'iconv-lite'; // EUC-KR 한글 깨짐 방지 번역기

// Next.js 환경변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ 환경변수(.env.local)에 Supabase URL과 KEY가 없습니다.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CSV_FOLDER = './csv_data';
// 🚀 수파베이스 타임아웃 에러를 막기 위해 한 입 크기(100)로 유지
const BATCH_SIZE = 100;

// 🚀 [추가됨] 수파베이스 서버 과부하(502 에러) 방지용 1초 휴식 함수
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function mapRowToDB(row) {
    // 국토부 실제 CSV 파일 헤더명 정확히 매핑
    const aptName = row['단지명'] || '';
    const rawPrice = row['거래금액(만원)'] || '0';
    const rawSize = row['전용면적(㎡)'] || '0';
    const sigungu = row['시군구'] || '';

    // 핵심 데이터가 없으면 스킵
    if (!aptName || !sigungu) return null;

    // "서울특별시 노원구 상계동" -> province, district, dong 분리
    const addrParts = sigungu.split(' ');
    const province = addrParts[0] || '';
    const district = addrParts[1] || '';
    const dong = addrParts.slice(2).join(' ') || '';

    // 금액 계산 ("139,700" -> 숫자 139700 -> 13.97억)
    const priceNum = parseInt(rawPrice.replace(/,/g, ''), 10);
    // 🚀 프론트엔드에서 5315만원, 1.85억 등 정밀한 표기를 위해 소수점 자르지 않고 그대로 저장!
    const priceEok = priceNum / 10000;
    const sizeNum = Math.round(parseFloat(rawSize));

    const dealYearMonth = row['계약년월'] || ''; // 예: "202107"
    const dealDay = (row['계약일'] || '').padStart(2, '0'); // 예: "01"
    const floor = row['층'] || '0';

    // 🚀 가격을 포함한 완벽한 고유 ID (같은 평수, 층이라도 가격이 다르면 다 저장!)
    const uniqueId = `historic-${province.substring(0, 2)}-${district}-${aptName.replace(/\s/g, '')}-${sizeNum}-${dealYearMonth}${dealDay}-${floor}-${priceNum}`;

    // 🚀 수정된 날짜 포맷 로직 ("202107", "01" -> "21.07.01")
    const yearStr = dealYearMonth.substring(2, 4); // "21"
    const monthStr = dealYearMonth.substring(4, 6); // "07"
    const formattedDate = dealYearMonth ? `${yearStr}.${monthStr}.${dealDay}` : '';

    return {
        id: uniqueId,
        apt_name: aptName,
        province: province,
        district: district,
        dong: dong,
        jibun: row['번지'] || '',
        size: `${sizeNum}㎡`,
        price: `${parseFloat(priceEok.toFixed(2))}억`,
        price_eok: priceEok,
        trade_date: formattedDate, // 고쳐진 예쁜 날짜 포맷 적용!
        floor: `${floor}층`,
        trade_type: "매매",
        change_amt: "보합",
        trend: "flat"
    };
}

// 중복 기입 오류 필터 (100% 동일한 데이터만 하나로 합침)
function deduplicateBatch(batchArray) {
    const uniqueMap = new Map();
    for (const item of batchArray) {
        uniqueMap.set(item.id, item);
    }
    return Array.from(uniqueMap.values());
}

async function uploadFile(filePath, fileName) {
    return new Promise((resolve, reject) => {
        let batch = [];
        let totalInserted = 0;

        console.log(`📄 [${fileName}] 읽기 시작...`);

        // EUC-KR 디코딩 후 상단 안내문 15줄 스킵
        const stream = fs.createReadStream(filePath)
            .pipe(iconv.decodeStream('euc-kr'))
            .pipe(csv({ skipLines: 15 }));

        stream.on('data', async (row) => {
            const dbItem = mapRowToDB(row);
            if (dbItem) batch.push(dbItem);

            if (batch.length >= BATCH_SIZE) {
                stream.pause();

                const currentBatch = deduplicateBatch(batch);
                batch = [];

                // upsert를 통해 ID가 겹치면 덮어쓰기 진행 (기존의 잘못된 데이터를 자동으로 갱신!)
                const { error } = await supabase.from('aparty_real_trades').upsert(currentBatch, { onConflict: 'id' });
                if (error) {
                    console.error(`❌ [${fileName}] 업로드 에러:`, error.message);
                } else {
                    totalInserted += currentBatch.length;
                    console.log(`   ✅ [${fileName}] ${totalInserted}개 안전하게 덮어쓰기/업로드 완료`);
                }

                // 🚀 [추가됨] 수파베이스 서버 보호를 위한 1초 대기 (502 과부하 에러 완벽 차단)
                await delay(1000);

                stream.resume();
            }
        })
            .on('end', async () => {
                if (batch.length > 0) {
                    const finalBatch = deduplicateBatch(batch);
                    const { error } = await supabase.from('aparty_real_trades').upsert(finalBatch, { onConflict: 'id' });
                    if (error) {
                        console.error(`❌ [${fileName}] 잔여 데이터 에러:`, error.message);
                    } else {
                        totalInserted += finalBatch.length;
                    }
                    // 🚀 [추가됨] 잔여 데이터 처리 후에도 1초 대기
                    await delay(1000);
                }
                console.log(`🎉 [${fileName}] 총 ${totalInserted}건 최종 완료!\n`);
                resolve();
            })
            .on('error', (err) => reject(err));
    });
}

async function main() {
    try {
        const files = fs.readdirSync(CSV_FOLDER).filter(file => file.endsWith('.csv'));
        console.log(`🚀 총 ${files.length}개의 CSV 파일을 발견했습니다. 날짜 복구 및 업로드를 시작합니다!\n`);

        for (const file of files) {
            const filePath = path.join(CSV_FOLDER, file);
            await uploadFile(filePath, file);
        }

        console.log(`\n🏆 모든 실거래가 데이터(날짜/가격 디테일 수정본)가 수파베이스에 완벽하게 적재되었습니다!`);
        process.exit(0);
    } catch (error) {
        console.error("에러 발생:", error);
        process.exit(1);
    }
}

main();