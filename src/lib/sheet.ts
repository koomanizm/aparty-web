"use server";

import { google } from "googleapis";

export interface Property {
  id: string;
  title: string;
  location: string;
  status: string[];
  signals: string[];
  propertyType: string;
  category?: string;
  price: string;
  pyeongPrice?: string;
  views?: number;
  deadlineOrder?: number;
  image: string;
  description: string;
  households: string;
  size: string;
  parking: string;
  moveIn: string;
  link: string;
  lawdCd: string;
  compareApt: string;
  searchKeyword: string;
  mapAddress?: string;
  coordinates?: string;
  deposit_pct?: string;
  initial_deposit?: string;
  loan_condition?: string;
  financial_note?: string;
  adGrade?: string; // 🚀 영문 프리미엄 등급 속성 추가!
}

export interface TickerMessage {
  id: string;
  text: string;
  type: string;
  link?: string;
}

const SHEET_ID = '123zREvn17nXffpXx56KXyeMjdoOy0JJHwGw_4wDFuXE';

const LAWD_CD_MAP: { [key: string]: string } = {
  "강서구": "26440", "부산진구": "26230", "진구": "26230", "해운대": "26350",
  "수영구": "26500", "동래구": "26260", "남구": "26290", "연제구": "26470",
  "금정구": "26410", "사상구": "26530", "사하구": "26380", "북구": "26320",
  "기장": "26710", "영도": "26200", "동구": "26170", "서구": "26140",
  "중구": "26110", "김해": "48250", "양산": "48330", "창원": "48120", "거제": "48310",
};

function autoFindLawdCd(location: string): string {
  for (const [district, code] of Object.entries(LAWD_CD_MAP)) {
    if (location.includes(district)) return code;
  }
  return "26440";
}

export async function getPropertiesFromSheet(): Promise<Property[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`, { cache: 'no-store' });
    if (!response.ok) throw new Error('매물 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/^"|"$/g, '').trim());

    const getVal = (cols: string[], name: string) => {
      const idx = headers.indexOf(name);
      return (idx > -1 && cols[idx]) ? cols[idx] : "";
    };

    const properties = lines.slice(1).map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());

      const title = getVal(cols, 'title');
      const location = getVal(cols, 'location');

      const rawStatus = getVal(cols, 'status');
      const rawSignals = getVal(cols, 'signals') || getVal(cols, 'badges');
      const rawType = getVal(cols, 'propertyType') || getVal(cols, 'category');

      return {
        id: getVal(cols, 'id'),
        title: title,
        location: location,
        status: rawStatus ? rawStatus.split(/[,/]/).map(s => s.trim()).filter(Boolean) : [],
        signals: rawSignals ? rawSignals.split(/[,/]/).map(s => s.trim()).filter(Boolean) : [],
        propertyType: rawType || "아파트",
        category: rawType || "아파트",
        price: getVal(cols, 'price'),
        pyeongPrice: getVal(cols, 'pyeongPrice') || getVal(cols, 'pyeong_price'),
        views: parseInt(getVal(cols, 'views')) || 0,
        deadlineOrder: parseInt(getVal(cols, 'deadlineOrder')) || 999,
        image: getVal(cols, 'image'),
        description: getVal(cols, 'description'),
        households: getVal(cols, 'households') || "-",
        size: getVal(cols, 'size') || "-",
        parking: getVal(cols, 'parking') || "-",
        moveIn: getVal(cols, 'moveIn') || "-",
        link: getVal(cols, 'link') || "#",
        lawdCd: getVal(cols, 'lawdCd') || autoFindLawdCd(location),
        compareApt: getVal(cols, 'compareApt'),
        searchKeyword: getVal(cols, 'searchKeyword') || (title ? `${title} 호재` : ""),
        mapAddress: getVal(cols, 'mapAddress'),
        coordinates: getVal(cols, 'coordinates'),
        deposit_pct: getVal(cols, 'deposit_pct'),
        initial_deposit: getVal(cols, 'initial_deposit'),
        loan_condition: getVal(cols, 'loan_condition'),
        financial_note: getVal(cols, 'financial_note'),
        adGrade: getVal(cols, 'adGrade'), // 🚀 완벽하게 영문 헤더 'adGrade'를 읽어옵니다!
      } as Property;
    });

    return properties.reverse();
  } catch (error) {
    console.error("구글 시트 연동 에러:", error);
    return [];
  }
}

export async function getTickerMessages(): Promise<TickerMessage[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ticker`);
    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);
    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return { id: cols[0] || "", text: cols[1] || "", type: cols[2] || "", link: cols[3] || "" };
    });
  } catch (error) { return []; }
}

export interface Review { propertyId: string; id: string; name: string; rating: number; text: string; date: string; }

export async function getReviewsFromSheet(propertyId: string): Promise<Review[]> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Reviews&t=${timestamp}`, { cache: 'no-store' });
    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);
    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return { propertyId: cols[0] || "", id: cols[1] || "", name: cols[2] || "방문객", rating: parseInt(cols[3]) || 5, text: cols[4] || "", date: cols[5] || "" };
    }).filter(review => review.propertyId.trim() === String(propertyId).trim()).reverse();
  } catch (error) { return []; }
}

export interface Notice { id: string; title: string; content: string; date: string; }

export async function getNoticesFromSheet(): Promise<Notice[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Notice`);
    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);
    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return { id: cols[0] || "", title: cols[1] || "", content: cols[2] || "", date: cols[3] || "" };
    }).reverse();
  } catch (error) { return []; }
}

export interface Post { id: string; category: string; title: string; content: string; author: string; authorImage: string; date: string; likes: number; postImage?: string; }
export interface Comment { id: string; postId: string; author: string; authorImage: string; content: string; date: string; likes: number; }

export async function getPostsFromSheet(): Promise<Post[]> {
  try {
    const timestamp = new Date().getTime();
    const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || SHEET_ID;
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Community&t=${timestamp}`, { cache: 'no-store' });
    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);
    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return { id: cols[0] || "", category: cols[1] || "", title: cols[2] || "", content: cols[3] || "", author: cols[4] || "", authorImage: cols[5] || "", date: cols[6] || "", likes: parseInt(cols[7]) || 0, postImage: cols[8] || "" };
    }).reverse();
  } catch (error) { return []; }
}

export async function getCommentsFromSheet(postId: string): Promise<Comment[]> {
  try {
    const timestamp = new Date().getTime();
    const sheetId = process.env.NEXT_PUBLIC_SHEET_ID || SHEET_ID;
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Comments&t=${timestamp}`, { cache: 'no-store' });
    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);
    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return { id: cols[0] || "", postId: cols[1] || "", author: cols[2] || "익명", authorImage: cols[3] || "", content: cols[4] || "", date: cols[5] || "", likes: parseInt(cols[6]) || 0 };
    }).filter(comment => comment.postId === postId);
  } catch (error) { return []; }
}