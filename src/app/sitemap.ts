import { MetadataRoute } from 'next';
import { getPropertiesFromSheet } from '../lib/sheet';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. 구글 시트에서 모든 매물 정보를 가져옵니다.
    const properties = await getPropertiesFromSheet();
    const baseUrl = 'https://aparty.co.kr'; // 우리 사이트 주소

    // 2. 매물 상세 페이지들의 주소를 만듭니다.
    const propertyUrls = properties.map((property) => ({
        url: `${baseUrl}/property/${property.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const, // "매일 업데이트되니까 자주 와!"
        priority: 0.8,
    }));

    // 3. 메인 페이지와 합쳐서 네이버에 제출합니다.
    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 1,
        },
        ...propertyUrls,
    ];
}