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
}

// 🚀 [추가됨] 티커 메시지 인터페이스
export interface TickerMessage {
  id: string;
  text: string;
  type: string;
}

const SHEET_ID = '123zREvn17nXffpXx56KXyeMjdoOy0JJHwGw_4wDFuXE';

// 📍 [자동화] 지역명 매핑 테이블
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

// 1️⃣ 기존 매물 데이터 가져오기
export async function getPropertiesFromSheet(): Promise<Property[]> {
  try {
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`);
    if (!response.ok) throw new Error('매물 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
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
      };
    });
  } catch (error) {
    console.error("구글 시트 연동 에러:", error);
    return [];
  }
}

// 2️⃣ [이게 없어서 에러가 났던 겁니다!] 티커 데이터 가져오기
export async function getTickerMessages(): Promise<TickerMessage[]> {
  try {
    // 💡 sheet=Ticker 파라미터를 통해 구글 시트의 'Ticker' 탭을 콕 집어서 가져옵니다.
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Ticker`);
    if (!response.ok) throw new Error('티커 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());
      return {
        id: cols[0] || "",
        text: cols[1] || "실시간 분양 정보를 확인하세요.",
        type: cols[2] || "HOT",
      };
    });
  } catch (error) {
    console.error("티커 로드 실패:", error);
    return [];
  }
}