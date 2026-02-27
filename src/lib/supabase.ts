import { createClient } from '@supabase/supabase-js';

// .env.local에 숨겨둔 URL과 열쇠를 안전하게 꺼내옵니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 수파베이스 통신소(클라이언트) 생성!
export const supabase = createClient(supabaseUrl, supabaseAnonKey);