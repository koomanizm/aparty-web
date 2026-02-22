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

// 📍 [자동화] 지역명에 따른 법정동코드 매핑 테이블 (부산/경남 주요 지역)
const LAWD_CD_MAP: { [key: string]: string } = {
  "강서구": "26440",
  "부산진구": "26230",
  "진구": "26230",
  "해운대": "26350",
  "수영구": "26500",
  "동래구": "26260",
  "남구": "26290",
  "연제구": "26470",
  "금정구": "26410",
  "사상구": "26530",
  "사하구": "26380",
  "북구": "26320",
  "기장": "26710",
  "영도": "26200",
  "동구": "26170",
  "서구": "26140",
  "중구": "26110",
  "김해": "48250",
  "양산": "48330",
  "창원": "48120",
  "거제": "48310",
};

// 주소 텍스트를 분석해서 코드를 자동으로 찾아주는 헬퍼 함수
function autoFindLawdCd(location: string): string {
  for (const [district, code] of Object.entries(LAWD_CD_MAP)) {
    if (location.includes(district)) return code;
  }
  return "26440"; // 매칭되는 지역이 없으면 기본값 '강서구'
}

export async function getPropertiesFromSheet(): Promise<Property[]> {
  try {
    const SHEET_ID = '123zREvn17nXffpXx56KXyeMjdoOy0JJHwGw_4wDFuXE';
    const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`);

    if (!response.ok) throw new Error('시트 데이터를 가져오지 못했습니다.');

    const csvData = await response.text();
    const lines = csvData.split('\n').slice(1);

    return lines.map(line => {
      const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.replace(/^"|"$/g, '').trim());

      const title = cols[1] || "";
      const location = cols[2] || "";

      // 🚀 [자동화 1] 시트 M열(lawdCd)이 비어있으면 주소를 보고 코드를 자동 생성
      const lawdCd = cols[12] || autoFindLawdCd(location);

      // 🚀 [자동화 2] 시트 O열(searchKeyword)이 비어있으면 아파트 이름으로 뉴스 키워드 자동 생성
      const searchKeyword = cols[14] || (title ? `${title} 호재` : "");

      return {
        id: cols[0] || "",
        title: title,
        location: location,
        // 🚀 [자동화 3] 쉼표나 슬래시 모두 인식해서 뱃지 쪼개기
        status: cols[3] ? cols[3].split(/[,/]/).map(s => s.trim()).filter(Boolean) : [],
        price: cols[4] || "",
        image: cols[5] || "",
        description: cols[6] || "",
        households: cols[7] || "-",
        size: cols[8] || "-",
        parking: cols[9] || "-",
        moveIn: cols[10] || "-",
        link: cols[11] || "#",
        lawdCd: lawdCd,
        compareApt: cols[13] || "",
        searchKeyword: searchKeyword,
      };
    });
  } catch (error) {
    console.error("구글 시트 연동 에러:", error);
    return [];
  }
}