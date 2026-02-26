import { Metadata } from "next";
import { getPropertiesFromSheet, Property } from "../../../lib/sheet";

// 🚀 핵심 수정: params의 타입을 Promise로 정의하고 내부에서 await를 사용합니다.
export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {

    // 1. 비동기로 넘어오는 params를 먼저 기다려서 id를 꺼냅니다.
    const { id } = await params;

    // 2. 구글 시트에서 매물 데이터 불러오기
    const allProperties = await getPropertiesFromSheet();

    // 3. await로 꺼낸 id와 시트의 id를 비교합니다.
    const property = allProperties.find((p: Property) => String(p.id) === String(id));

    // 4. 혹시 매물이 삭제되었거나 없을 때의 기본 이름표
    if (!property) {
        return {
            title: "아파티 | 매물 정보를 찾을 수 없습니다",
        };
    }

    // 5. 로봇이 환장할 완벽한 맞춤형 이름표(SEO) 셋업!
    return {
        title: `${property.title} 분양 정보 | 아파티`,
        description: `아파티에서 제공하는 ${property.location} '${property.title}' 분양 및 실거래가 정보. ${property.households}, ${property.size} - 로얄동·로얄층 마감 전 실시간으로 확인하세요!`,
        openGraph: {
            title: `${property.title} - 아파티(Aparty)`,
            description: `${property.location} ${property.title} 핵심 분양 정보 확인하기`,
            images: [property.image || "https://www.aparty.co.kr/default-image.jpg"],
        }
    };
}

// 🚀 기존 page.tsx를 그대로 감싸주는 레이아웃
export default function PropertyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}