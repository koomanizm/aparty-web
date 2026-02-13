import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*', // 모든 검색 로봇 허용
            allow: '/',     // 모든 페이지 접근 허용
        },
        sitemap: 'https://aparty.co.kr/sitemap.xml', // 지도는 여기에 있어!
    };
}