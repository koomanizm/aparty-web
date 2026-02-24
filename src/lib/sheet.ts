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

export interface TickerMessage {
  id: string;
  text: string;
  type: string;
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

    // 🚀 1. 일단 return을 지우고, properties 라는 상자에 목록을 다 담습니다.
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

    // 🚀 2. 다 담은 상자(properties)의 순서를 뒤집어서(.reverse()) 최종적으로 내보냅니다!
    return properties.reverse();

  } catch (error) {
    console.error("구글 시트 연동 에러:", error);
    return [];
  }
}

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
        text: cols[1] || "", // 🚀 빈칸이면 기본 텍스트 대신 아예 비워두도록 수정
        type: cols[2] || "", // 🚀 빈칸이면 'HOT' 대신 아예 비워두도록 수정!
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

// 🚀 특정 매물(propertyId)의 리뷰만 쏙쏙 골라오는 함수 (강력한 캐시 방지 및 안전장치 적용)
export async function getReviewsFromSheet(propertyId: string): Promise<Review[]> {
  try {
    // 1. 브라우저가 옛날 데이터를 기억하지 못하도록 매번 새로운 시간(난수)을 주소에 붙입니다.
    const timestamp = new Date().getTime();

    // 2. 브라우저 캐시를 무시하고 항상 최신 데이터를 가져옵니다.
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

    // 3. 띄어쓰기 공백 때문에 필터링에 실패하지 않도록 양쪽 공백을 잘라내고(.trim()) 비교합니다!
    return allReviews
      .filter(review => review.propertyId.trim() === String(propertyId).trim())
      .reverse();

  } catch (error) {
    console.error("리뷰 로드 실패:", error);
    return [];
  }
}