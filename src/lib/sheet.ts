"use server"; // 🚀 마법의 한 줄! (반드시 맨 꼭대기에 있어야 합니다)

import { google } from "googleapis";

export interface Property {
  id: string;
  title: string;
  location: string;
  status: string[];
  price: string;
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
  coordinates?: string; // 🚀 [추가됨] 강제 좌표 (Q열)
}

// 🚀 [수정됨] TickerMessage 인터페이스에 link 추가
export interface TickerMessage {
  id: string;
  text: string;
  type: string;
  link?: string; // 💡 링크가 있을수도, 없을수도 있게 설정
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
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`);
    if (!response.ok) throw new Error('매물 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    const properties = lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      const title = cols[1] || "";
      const location = cols[2] || "";
      const lawdCd = cols[12] || autoFindLawdCd(location);
      const searchKeyword = cols[14] || (title ? `${title} 호재` : "");

      return {
        id: cols[0] || "",
        title,
        location,
        status: cols[3] ? cols[3].split(/[,/]/).map(s => s.trim()).filter(Boolean) : [],
        price: cols[4] || "",
        image: cols[5] || "",
        description: cols[6] || "",
        households: cols[7] || "-",
        size: cols[8] || "-",
        parking: cols[9] || "-",
        moveIn: cols[10] || "-",
        link: cols[11] || "#",
        lawdCd,
        compareApt: cols[13] || "",
        searchKeyword,
        mapAddress: cols[15] || "",
        coordinates: cols[16] || "",
      };
    });

    return properties.reverse();

  } catch (error) {
    console.error("구글 시트 연동 에러:", error);
    return [];
  }
}

// 🚀 [수정됨] 티커 메시지에서 링크 데이터도 함께 가져옵니다.
export async function getTickerMessages(): Promise<TickerMessage[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ticker`);
    if (!response.ok) throw new Error('티커 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        id: cols[0] || "",
        text: cols[1] || "",
        type: cols[2] || "",
        link: cols[3] || "", // 🚀 [추가] 시트의 4번째 열(D열)에서 링크를 가져옵니다.
      };
    });
  } catch (error) {
    console.error("티커 로드 실패:", error);
    return [];
  }
}

export interface Review {
  propertyId: string;
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export async function getReviewsFromSheet(propertyId: string): Promise<Review[]> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Reviews&t=${timestamp}`, {
      cache: 'no-store'
    });

    if (!response.ok) throw new Error('리뷰 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    const allReviews = lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        propertyId: cols[0] || "",
        id: cols[1] || "",
        name: cols[2] || "방문객",
        rating: parseInt(cols[3]) || 5,
        text: cols[4] || "",
        date: cols[5] || "",
      };
    });

    return allReviews
      .filter(review => review.propertyId.trim() === String(propertyId).trim())
      .reverse();

  } catch (error) {
    console.error("리뷰 로드 실패:", error);
    return [];
  }
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
}

export async function getNoticesFromSheet(): Promise<Notice[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Notice`);
    if (!response.ok) throw new Error('공지사항을 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        id: cols[0] || "",
        title: cols[1] || "",
        content: cols[2] || "",
        date: cols[3] || "",
      };
    }).reverse(); // 최신글이 위로 오게 역순 정렬
  } catch (error) {
    console.error("공지사항 로드 실패:", error);
    return [];
  }
}

// 🚀 lib/sheet.ts 파일 맨 아래에 추가해 주세요!

// 1. 커뮤니티 게시글 타입 정의
export interface Post {
  id: string;
  category: string;
  title: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
}

// 2. 글 불러오기 함수


// 3. 새 글 저장하기 함수


// 🚀 lib/sheet.ts 파일 맨 아래에 추가해 주세요!

// 🚀 lib/sheet.ts 파일 맨 아래쪽 (기존 커뮤니티 코드 덮어쓰기)

// 1. 커뮤니티 게시글 타입 (좋아요 추가됨!)
export interface Post {
  id: string;
  category: string;
  title: string;
  content: string;
  author: string;
  authorImage: string;
  date: string;
  likes: number; // 🚀 H열 하트 개수
}

// 2. 댓글 타입 정의 (신규!)
export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorImage: string;
  content: string;
  date: string;
}

// 3. 커뮤니티 글 불러오기
export async function getPostsFromSheet(): Promise<Post[]> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SHEET_ID || '123zREvn17nXffpXx56KXyeMjdoOy0JJHwGw_4wDFuXE'}/gviz/tq?tqx=out:csv&sheet=Community&t=${timestamp}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('커뮤니티 가져오기 실패');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        id: cols[0] || "",
        category: cols[1] || "자유게시판",
        title: cols[2] || "",
        content: cols[3] || "",
        author: cols[4] || "익명",
        authorImage: cols[5] || "",
        date: cols[6] || "",
        likes: parseInt(cols[7]) || 0, // H열 파싱
      };
    }).reverse();
  } catch (error) { return []; }
}

// 4. 특정 글의 댓글만 불러오기 (신규!)
export async function getCommentsFromSheet(postId: string): Promise<Comment[]> {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SHEET_ID || '123zREvn17nXffpXx56KXyeMjdoOy0JJHwGw_4wDFuXE'}/gviz/tq?tqx=out:csv&sheet=Comments&t=${timestamp}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('댓글 가져오기 실패');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    const allComments = lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        id: cols[0] || "",
        postId: cols[1] || "",
        author: cols[2] || "익명",
        authorImage: cols[3] || "",
        content: cols[4] || "",
        date: cols[5] || "",
      };
    });

    // 🚀 전체 댓글 중 현재 보고 있는 글(postId)의 댓글만 필터링!
    return allComments.filter(comment => comment.postId === postId);
  } catch (error) { return []; }
}