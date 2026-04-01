"use client";

import { useState, useEffect } from "react";
import {
    CalendarDays,
    Phone,
    Building,
    X,
    Loader2,
    FileText,
    ExternalLink,
    Link as LinkIcon,
} from "lucide-react";

// 🚀 모달창 상단 뱃지용 스타일 (대표님이 세팅하신 커스텀 컬러 완벽 유지)
const getTypeStyle = (type: string) => {
    switch (type) {
        case "무순위":
            return { boxClass: "bg-white border border-[#E7C1C1]", textClass: "text-[#C15A5A] font-bold", label: "무순위", solid: false };
        case "임의공급":
            return { boxClass: "bg-white border border-[#E6C7C7]", textClass: "text-[#B46868] font-bold", label: "임의공급", solid: false };
        case "재공급":
            return { boxClass: "bg-white border border-[#E3C6D2]", textClass: "text-[#A45F7A] font-bold", label: "재공급", solid: false };
        case "오피스텔/생숙/도생/민간임대":
            return { boxClass: "bg-white border border-[#D5D9E0]", textClass: "text-[#6B7280] font-bold", label: "오피/도생/임대", solid: false };
        case "공공지원민간임대":
            return { boxClass: "bg-white border border-[#C9D6E8]", textClass: "text-[#4F6B93] font-bold", label: "공공지원임대", solid: false };
        case "특별공급":
            return { boxClass: "bg-[#C97B49] border border-[#C97B49]", textClass: "text-white", label: "특별공급", solid: true };
        case "2순위":
            return { boxClass: "bg-[#5F7D6E] border border-[#5F7D6E]", textClass: "text-white", label: "2순위", solid: true };
        case "1순위":
        default:
            return { boxClass: "bg-[#5B78A6] border border-[#5B78A6]", textClass: "text-white", label: "1순위", solid: true };
    }
};

// 연락처 하이픈 포맷팅 함수
const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === "-") return "-";
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.length < 8 || phone.includes("-")) return phone;
    if (cleaned.length === 8) return cleaned.replace(/(\d{4})(\d{4})/, "$1-$2");
    else if (cleaned.startsWith("02")) {
        if (cleaned.length === 9) return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
        if (cleaned.length === 10) return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
        if (cleaned.length === 10) return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        if (cleaned.length === 11) return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    return phone;
};

export default function CalendarDetailModal({ event, onClose }: { event: any; onClose: () => void }) {
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<any | null>(null);

    // 모달창이 열릴 때 백엔드 API를 호출하여 데이터를 가져옵니다.
    useEffect(() => {
        if (event && event.houseManageNo) {
            setIsDetailLoading(true);

            let sec = "01";
            if (["무순위", "임의공급", "재공급"].includes(event.type)) sec = "04";
            else if (event.type === "오피스텔/생숙/도생/민간임대") sec = "02";
            else if (event.type === "공공지원민간임대") sec = "05";

            fetch(`/api/dashboard/calendar/detail?houseManageNo=${event.houseManageNo}&houseSecd=${sec}`)
                .then(res => res.json())
                .then(data => {
                    setDetailData(data);
                    setIsDetailLoading(false);
                })
                .catch(() => setIsDetailLoading(false));
        }
    }, [event]);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#111827]/55 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 h-[80px] bg-gradient-to-r from-[#24324A] to-[#31435F] flex items-center px-6">
                    <div className="absolute top-4 right-4">
                        <button onClick={onClose} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md shadow-sm bg-white/10 border border-white/20 backdrop-blur-md">
                        <span className="text-[12px] font-black text-white">{getTypeStyle(event.type).label}</span>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <h4 className="text-[22px] md:text-[26px] font-black text-[#101828] leading-tight break-keep mb-6">
                        {event.title}
                    </h4>

                    {isDetailLoading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-24 bg-[#F2F4F7] rounded-2xl w-full"></div>
                            <div className="h-32 bg-[#F2F4F7] rounded-2xl w-full"></div>
                            <div className="flex items-center justify-center gap-2 mt-8 text-[#98A2B3]">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-[13px] font-bold">국가 공공데이터 망에서 실시간 분석 중입니다...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E4E7EC] flex items-center gap-2">
                                    <FileText size={16} className="text-[#24324A]" />
                                    <h5 className="text-[14px] font-black text-[#24324A]">입주자모집공고 주요정보</h5>
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">공급위치</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828] break-keep">
                                            {detailData?.data?.loc && detailData.data.loc !== "-" ? detailData.data.loc : event.fullAddr}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">공급규모</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828] break-keep">
                                            {detailData?.data?.scale && detailData.data.scale !== "-" ? detailData.data.scale : `총 ${event.totHshld} 세대`}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">문의처</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[14px] font-black text-[#B85C5C]">
                                            {(() => {
                                                const rawContact = detailData?.data?.contact && detailData.data.contact !== "-" ? detailData.data.contact : event.contact;
                                                const formattedContact = formatPhoneNumber(rawContact);
                                                const isCallable = /^[0-9-]+$/.test(formattedContact) && formattedContact.length > 5;

                                                return isCallable ? (
                                                    <a href={`tel:${formattedContact.replace(/-/g, "")}`} className="hover:underline flex items-center gap-1.5 active:scale-95 transition-transform">
                                                        <Phone size={13} className="text-[#B85C5C]" />
                                                        {formattedContact}
                                                    </a>
                                                ) : (
                                                    <span>{formattedContact}</span>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">홈페이지</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#4F6B93] truncate">
                                            {detailData?.data?.homepage && detailData.data.homepage !== "-" ? (
                                                <a
                                                    href={detailData.data.homepage.startsWith("http") ? detailData.data.homepage : `http://${detailData.data.homepage}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:underline flex items-center gap-1"
                                                >
                                                    공식 홈페이지 바로가기 <LinkIcon size={12} />
                                                </a>
                                            ) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {detailData?.data?.models && detailData.data.models.length > 0 && (
                                <div className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E4E7EC] flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building size={16} className="text-[#24324A]" />
                                            <h5 className="text-[14px] font-black text-[#24324A]">주택형별 공급 정보</h5>
                                        </div>
                                        <span className="text-[10px] md:text-[11px] font-bold text-[#4F6B93] bg-[#EAF1F8] px-2 py-0.5 rounded-md">
                                            부동산원 검증 데이터
                                        </span>
                                    </div>
                                    <div className="overflow-x-auto scrollbar-hide">
                                        <table className="w-full text-[12px] md:text-[13px] text-center whitespace-nowrap min-w-[400px]">
                                            <thead className="bg-[#FAFBFC] text-[#667085] font-bold border-b border-[#EEF2F6]">
                                                <tr>
                                                    <th className="py-2.5 px-3">주택형</th>
                                                    <th className="py-2.5 px-3">전용면적</th>
                                                    <th className="py-2.5 px-3">일반공급</th>
                                                    <th className="py-2.5 px-3">특별공급</th>
                                                    <th className="py-2.5 px-3 text-[#B85C5C]">최고분양가</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailData.data.models.map((model: any, idx: number) => (
                                                    <tr key={idx} className="border-b border-[#EEF2F6] last:border-0 hover:bg-[#FBFCFE] transition-colors">
                                                        <td className="py-3 px-3">
                                                            <span className="px-2 py-1 bg-[#24324A] text-white text-[11px] md:text-[12px] font-black rounded-md">
                                                                {model.shortType}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-3 text-[#667085] font-bold">{model.area !== "-" ? `${model.area}㎡` : "-"}</td>
                                                        <td className="py-3 px-3 font-bold text-[#344054]">{model.gnUnits !== "-" ? `${model.gnUnits}세대` : "-"}</td>
                                                        <td className="py-3 px-3 font-bold text-[#344054]">{model.spUnits !== "-" ? `${model.spUnits}세대` : "-"}</td>
                                                        <td className="py-3 px-3 font-black text-[#B85C5C]">{model.price}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white border border-[#E4E7EC] rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-[#F3F6FA] px-4 py-3 border-b border-[#E4E7EC] flex items-center gap-2">
                                    <CalendarDays size={16} className="text-[#4F6B93]" />
                                    <h5 className="text-[14px] font-black text-[#31435F]">청약일정</h5>
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">모집공고일</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828]">
                                            {detailData?.data?.noticeDate && detailData.data.noticeDate !== "-" ? detailData.data.noticeDate : "청약홈 확인 요망"}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">특별공급</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828]">
                                            {detailData?.data?.dateSp && detailData.data.dateSp !== "-" ? detailData.data.dateSp : "-"}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">1순위 / 청약접수</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-black text-[#4F6B93]">
                                            {detailData?.data?.date1 && detailData.data.date1 !== "-" ? detailData.data.date1 : event.date}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">2순위</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828]">
                                            {detailData?.data?.date2 && detailData.data.date2 !== "-" ? detailData.data.date2 : "-"}
                                        </div>
                                    </div>

                                    <div className="flex border-b border-[#EEF2F6] bg-[#FCF5F5]">
                                        <div className="w-1/3 sm:w-1/4 bg-[#FAEEEE] p-3 flex items-center text-[12px] font-bold text-[#B85C5C]">당첨자 발표일</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-black text-[#B85C5C]">
                                            {detailData?.data?.winnerDate && detailData.data.winnerDate !== "-" ? detailData.data.winnerDate : "청약홈 확인 요망"}
                                        </div>
                                    </div>

                                    <div className="flex">
                                        <div className="w-1/3 sm:w-1/4 bg-[#F8FAFC] p-3 flex items-center text-[12px] font-bold text-[#667085]">계약체결일</div>
                                        <div className="w-2/3 sm:w-3/4 p-3 flex items-center text-[13px] font-bold text-[#101828]">
                                            {detailData?.data?.contractDate && detailData.data.contractDate !== "-" ? detailData.data.contractDate : "청약홈 확인 요망"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex gap-3">
                        <a
                            href="https://www.applyhome.co.kr"
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-4 bg-[#EEF2F6] hover:bg-[#E6EBF2] text-[#475467] font-bold text-[14px] md:text-[15px] rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            청약홈 원본 보기
                            <ExternalLink size={16} />
                        </a>
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-[#24324A] hover:bg-[#31435F] text-white font-black text-[14px] md:text-[15px] rounded-xl shadow-lg transition-all active:scale-95"
                        >
                            확인 완료
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}