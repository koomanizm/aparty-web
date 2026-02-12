// src/lib/sheet.ts

import Papa from "papaparse";

export interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  moveIn: string;
  households: string;
  size: string;
  parking: string; // ✅ 추가됨
  link: string;
  image: string;
  description: string;
  status: string[];
  type: string;
}

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQA_4wQpvPiAYecKqEj4341PoI8J3fl90UcSGRfBLfqoPl1tqFmYMCqKjYrHq383feN9J6pUeQIp9SQ/pub?gid=1612991842&single=true&output=csv";

export async function getPropertiesFromSheet(): Promise<Property[]> {
  try {
    const response = await fetch(SHEET_URL, { cache: 'no-store' });
    const csvText = await response.text();

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const data = results.data
            .filter((row: any) => row.title && row.title.trim() !== "")
            .map((row: any, index: number) => ({
              id: Number(row.id) || index + 1,
              title: row.title || "",
              price: row.price || "",
              location: row.location || "",
              moveIn: row.moveIn || "",
              households: row.households || "",
              size: row.size || "",
              parking: row.parking || "-", // ✅ 엑셀의 parking 컬럼 읽기
              link: row.link || "#",
              image: row.image || "/prugio-trepark.jpg",
              description: row.description || "",
              status: row.status ? row.status.split("/").map((s: string) => s.trim()) : [],
              type: row.type || "아파트",
            }));
          resolve(data);
        },
      });
    });
  } catch (error) {
    console.error("엑셀 로드 실패:", error);
    return [];
  }
}