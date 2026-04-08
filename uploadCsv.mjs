import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import iconv from 'iconv-lite';

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
const DONE_FOLDER = './csv_data_done'; // ✅ 완료된 파일이 자동으로 이동할 폴더

// ✅ 1000개는 무리였으니 300개로 타협! (기존 100개보단 3배 빠름)
const BATCH_SIZE = 300;

// ✅ 0.2초 대기는 너무 짧았으니 0.5초(500ms)로 숨통 트여주기!
const delay = (ms) => new Promise(resolve => setTimeout(resolve, 500));

// 완료 폴더가 없으면 미리 만들어둡니다.
if (!fs.existsSync(DONE_FOLDER)) {
    fs.mkdirSync(DONE_FOLDER);
}

function mapRowToDB(row) {
    const aptName = row['단지명'] || '';
    const rawPrice = row['거래금액(만원)'] || '0';
    const rawSize = row['전용면적(㎡)'] || '0';
    const sigungu = row['시군구'] || '';

    if (!aptName || !sigungu) return null;

    const addrParts = sigungu.split(' ');
    const province = addrParts[0] || '';
    const district = addrParts[1] || '';
    const dong = addrParts.slice(2).join(' ') || '';

    const priceNum = parseInt(rawPrice.replace(/,/g, ''), 10);
    const priceEok = priceNum / 10000;
    const sizeNum = Math.round(parseFloat(rawSize));

    const dealYearMonth = row['계약년월'] || '';
    const dealDay = (row['계약일'] || '').padStart(2, '0');
    const floor = row['층'] || '0';

    const uniqueId = `historic-${province.substring(0, 2)}-${district}-${aptName.replace(/\s/g, '')}-${sizeNum}-${dealYearMonth}${dealDay}-${floor}-${priceNum}`;

    const yearStr = dealYearMonth.substring(2, 4);
    const monthStr = dealYearMonth.substring(4, 6);
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
        trade_date: formattedDate,
        floor: `${floor}층`,
        trade_type: "매매",
        change_amt: "보합",
        trend: "flat"
    };
}

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

        console.log(`\n📄 [${fileName}] 고속 업로드 시작...`);

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

                const { error } = await supabase.from('aparty_real_trades').upsert(currentBatch, { onConflict: 'id' });
                if (error) {
                    console.error(`❌ [${fileName}] 업로드 에러:`, error.message);
                } else {
                    totalInserted += currentBatch.length;
                    process.stdout.write(`\r🚀 [${fileName}] ${totalInserted}개 쾌속 적재 중...`); // 로그를 한 줄로 깔끔하게!
                }

                await delay(200); // 0.2초 대기
                stream.resume();
            }
        })
            .on('end', async () => {
                if (batch.length > 0) {
                    const finalBatch = deduplicateBatch(batch);
                    const { error } = await supabase.from('aparty_real_trades').upsert(finalBatch, { onConflict: 'id' });
                    if (error) {
                        console.error(`\n❌ [${fileName}] 잔여 데이터 에러:`, error.message);
                    } else {
                        totalInserted += finalBatch.length;
                        process.stdout.write(`\r🚀 [${fileName}] ${totalInserted}개 쾌속 적재 중...`);
                    }
                    await delay(200);
                }
                console.log(`\n🎉 [${fileName}] 총 ${totalInserted}건 최종 완료!`);
                resolve();
            })
            .on('error', (err) => reject(err));
    });
}

async function main() {
    try {
        const files = fs.readdirSync(CSV_FOLDER).filter(file => file.endsWith('.csv'));
        console.log(`🚀 총 ${files.length}개의 대기 중인 CSV 파일을 발견했습니다. 고속 업로드를 시작합니다!\n`);

        for (const file of files) {
            const filePath = path.join(CSV_FOLDER, file);
            await uploadFile(filePath, file);

            // ✅ 3. 파일 업로드가 끝나면 자동으로 'csv_data_done' 폴더로 이동! (안전장치)
            const doneFilePath = path.join(DONE_FOLDER, file);
            fs.renameSync(filePath, doneFilePath);
            console.log(`🚚 [${file}] 완료 폴더로 이동 완료!`);
        }

        console.log(`\n🏆 모든 실거래가 데이터가 수파베이스에 초고속으로 적재되었습니다!`);
        process.exit(0);
    } catch (error) {
        console.error("에러 발생:", error);
        process.exit(1);
    }
}

main();