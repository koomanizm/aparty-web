import { MetadataRoute } from 'next';
import { getPropertiesFromSheet } from '../lib/sheet';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. 구글 시트에서 모든 매물 정보를 가져옵니다.
    const properties = await getPropertiesFromSheet();
    const baseUrl = 'https://aparty.co.kr'; // 대표님 설정 그대로!

    // 2. 매물 상세 페이지들의 주소를 만듭니다. (기존 코드 완벽)
    const propertyUrls = properties.map((property) => ({
        url: `${baseUrl}/property/${property.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const, // "매일 업데이트되니까 자주 와!"
        priority: 0.8,
    }));

    // 🚀 3. [째미의 보강 포인트] 누락되었던 아파티의 서브 페이지들을 지도에 추가합니다!
    const staticRoutes = [
        '/notice',         // 공지사항
        '/community',      // 라운지
        '/point',          // 포인트
        '/tools/tax',      // 취득세 계산기
        '/tools/loan',     // 대출이자 계산기
        '/tools/yield',    // 수익률 계산기
        '/tools/score',    // 청약가점 계산기
        '/tools/convert',  // 평형 변환기
        '/tools/checklist' // 체크리스트
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const, // 도구들은 자주 안 바뀌니 주간으로 세팅!
        priority: 0.7, // 매물보단 살짝 낮게 중요도 배정
    }));

    // 4. 메인 대문 + 서브 페이지 + 매물 페이지를 모두 합쳐서 완벽한 지도로 제출합니다!
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1, // 메인 페이지는 1순위!
        },
        ...staticRoutes,
        ...propertyUrls,
    ];
}