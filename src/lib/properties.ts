export interface Property {
    id: number;
    title: string;
    location: string;
    status: string;
    statusColor: string;
    price: string;
    type: string;
    image: string;
    imageColor: string; // Internal for placeholder
    description: string;
    siteUrl: string;
    moveIn: string;
    households: string;
    parking: string;
    pyung: string;
}

export const properties: Property[] = [
    {
        id: 1,
        title: "드파인 광안 (DE'FINE)",
        location: "부산 수영구 광안동",
        status: "마감임박",
        statusColor: "bg-red-100 text-red-600",
        price: "11억 5천~",
        type: "84㎡",
        image: "/define-gw.jpg",
        imageColor: "bg-blue-100",
        description: "광안역 초역세권. SK에코플랜트의 프리미엄 브랜드 '드파인' 최초 적용 단지. 광안대교 조망과 커뮤니티 특화 설계를 누리세요.",
        siteUrl: "https://www.skecoplant.com",
        moveIn: "2026년 6월",
        households: "1,233세대",
        parking: "1.3대",
        pyung: "59㎡, 78㎡, 84㎡"
    },
    {
        id: 2,
        title: "블랑 써밋 74",
        location: "부산 동구 범일동",
        status: "선착순지정",
        statusColor: "bg-purple-100 text-purple-600",
        price: "12억~",
        type: "114㎡",
        image: "/house2.jpg",
        imageColor: "bg-green-100",
        description: "북항 재개발의 랜드마크. 지상 69층 오션뷰 하이엔드 주거공간. 호텔급 컨시어지 서비스와 스카이 라운지를 제공합니다.",
        siteUrl: "https://www.prugio.com",
        moveIn: "2028년 11월",
        households: "998세대",
        parking: "1.9대",
        pyung: "94㎡, 114㎡, 138㎡"
    },
    {
        id: 3,
        title: "에코델타시티 푸르지오 트레파크",
        location: "부산 강서구 강동동",
        status: "분양중",
        statusColor: "bg-blue-100 text-blue-600",
        price: "5억 후반",
        type: "59㎡, 84㎡",
        image: "/trepark.jpg",
        imageColor: "bg-yellow-100",
        description: "에코델타시티의 중심. 분양가 상한제 적용으로 확실한 시세 차익 기대. 공원과 학교를 품은 대단지 프리미엄.",
        siteUrl: "https://www.prugio-trepark.co.kr",
        moveIn: "2028년 9월",
        households: "1,370세대",
        parking: "1.45대",
        pyung: "59㎡, 84㎡"
    },
    {
        id: 4,
        title: "김해 더샵 신문그리니티 2차",
        location: "경남 김해시 신문동",
        status: "줍줍(조건변경)",
        statusColor: "bg-orange-100 text-orange-600",
        price: "4억 7천",
        type: "84㎡",
        image: "/house1.jpg",
        imageColor: "bg-indigo-100",
        description: "계약금 5% 파격 조건! 김해 롯데워터파크 옆 대단지 브랜드 타운. 중도금 무이자 혜택으로 부담을 확 줄였습니다.",
        siteUrl: "https://www.thesharp.co.kr",
        moveIn: "2026년 2월",
        households: "1,146세대",
        parking: "1.5대",
        pyung: "84㎡, 102㎡"
    },
    {
        id: 5,
        title: "창원 롯데캐슬 시그니처",
        location: "경남 창원시 사파동",
        status: "분양예정",
        statusColor: "bg-gray-100 text-gray-600",
        price: "6억 중반",
        type: "84㎡",
        image: "/house2.jpg",
        imageColor: "bg-pink-100",
        description: "창원의 강남, 성산구 생활권. 숲세권과 명문 학군을 모두 갖춘 프리미엄 단지. 사파동의 마지막 대장주 기회.",
        siteUrl: "https://www.lottecastle.co.kr",
        moveIn: "2027년 12월",
        households: "917세대",
        parking: "1.35대",
        pyung: "59㎡, 84㎡"
    },
    {
        id: 6,
        title: "양산 자이 파크팰리체",
        location: "경남 양산시 동면",
        status: "줍줍(특별혜택)",
        statusColor: "bg-green-100 text-green-600",
        price: "4억 초반",
        type: "84㎡",
        image: "/house3.jpg",
        imageColor: "bg-teal-100",
        description: "계약 축하금 지원! 양산 사송신도시의 완성된 인프라를 누리는 자이 브랜드 파워. 숲세권 힐링 라이프를 시작하세요.",
        siteUrl: "https://www.xi.co.kr",
        moveIn: "2026년 8월",
        households: "1,862세대",
        parking: "1.32대",
        pyung: "59㎡, 84㎡, 101㎡"
    }
];
