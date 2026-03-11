"use client";
import { TrendingUp, BarChart3, Info } from "lucide-react";

interface Props {
    sentimentRegion: string;
    sentiment: any;
    needleRotation: number;
}

export default function MarketSentimentCard({ sentimentRegion, sentiment, needleRotation }: Props) {
    return (
        <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 md:p-5 border-b border-gray-50 flex items-center gap-2 shrink-0">
                <TrendingUp size={16} className="text-[#FF8C42]" strokeWidth={2.5} />
                <h3 className="text-[12px] md:text-[13px] font-black text-[#4A403A]">부동산 종합 지표</h3>
            </div>
            <div className="p-4 flex flex-col flex-1 gap-1 overflow-hidden relative justify-between">
                <div className="animate-in fade-in slide-in-from-right-full duration-700 w-full text-center flex flex-col flex-1 justify-between" key={sentimentRegion}>
                    <div className="relative w-36 h-18 md:w-48 md:h-24 mx-auto overflow-hidden mb-2 mt-2">
                        <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#F3F4F6" strokeWidth="10" strokeLinecap="round" />
                            <defs><linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="50%" stopColor="#10B981" /><stop offset="100%" stopColor="#EF4444" /></linearGradient></defs>
                            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#gaugeGradient)" strokeWidth="10" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * Math.min(sentiment.score, 150) / 150)} className="transition-all duration-1000 ease-out" />
                            {[0, 25, 50, 75, 100, 125, 150].map((tick) => {
                                const angle = (tick / 150) * 180 - 180; const rad = (angle * Math.PI) / 180;
                                const x1 = 50 + 32 * Math.cos(rad); const y1 = 50 + 32 * Math.sin(rad); const x2 = 50 + 37 * Math.cos(rad); const y2 = 50 + 37 * Math.sin(rad);
                                return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#9CA3AF" strokeWidth="1" />;
                            })}
                        </svg>
                        <div className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out flex flex-col items-center justify-end z-20" style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)`, height: '85%', width: '20px' }}>
                            <div className="w-1.5 h-[80%] bg-gradient-to-t from-[#4A403A] to-gray-400 rounded-t-full shadow-sm relative z-10"></div>
                            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-3.5 h-3.5 md:w-4 md:h-4 bg-[#4A403A] rounded-full border-[2.5px] border-white shadow-md z-20"></div>
                        </div>
                    </div>
                    <div className="mb-2"><span className="text-xl md:text-2xl font-black text-[#4A403A]">{sentiment.score}</span><p className={`text-[9px] md:text-[10px] font-black mt-0.5 ${sentiment.score > 100 ? 'text-red-500' : 'text-blue-500'}`}>{sentiment.status}</p></div>
                    <div className="bg-gray-50 py-1.5 mx-8 md:mx-4 rounded-xl mb-3"><p className="text-[11px] md:text-[13px] font-black text-[#4A403A]">{sentimentRegion}</p></div>
                    <div className="w-full pt-1 flex-1 flex flex-col border-t border-gray-100">
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black text-gray-600 px-1 mb-1 mt-2"><span className="flex items-center gap-1"><Info size={11} /> 5주 투자심리 추이</span><span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">기준: 100</span></div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[80px] md:min-h-[100px] flex items-center justify-center mt-1">
                            {(() => {
                                const trendData = sentiment.trend; const PADDING_X = 15; const PADDING_Y_TOP = 25; const PADDING_Y_BOTTOM = 20; const W = 200; const H = 100;
                                const innerW = W - PADDING_X * 2; const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;
                                const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW; const getY = (val: number) => PADDING_Y_TOP + innerH - (val / 150) * innerH;
                                const pathData = trendData.map((v: number, i: number) => `${getX(i)},${getY(v)}`).join(" L ");
                                return (
                                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                        <defs><linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#FF8C42" stopOpacity="0.3" /><stop offset="100%" stopColor="#FF8C42" stopOpacity="0.0" /></linearGradient></defs>
                                        <line x1={0} y1={getY(100)} x2={W} y2={getY(100)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3,3" />
                                        <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#areaGradient)" />
                                        <path d={`M ${pathData}`} fill="none" stroke="#FF8C42" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                        {trendData.map((v: number, i: number) => (
                                            <g key={i}>
                                                <circle cx={getX(i)} cy={getY(v)} r={i === trendData.length - 1 ? "3.5" : "2.5"} fill={i === trendData.length - 1 ? "#FF8C42" : "white"} stroke={i === trendData.length - 1 ? "white" : "#FF8C42"} strokeWidth="1.5" />
                                                <text x={getX(i)} y={getY(v) - 8} textAnchor="middle" fontSize={i === trendData.length - 1 ? "11" : "9"} fontWeight="bold" fill={i === trendData.length - 1 ? "#EF4444" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke">{v}</text>
                                                <text x={getX(i)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">{sentiment.labels[i].replace("'", "")}</text>
                                            </g>
                                        ))}
                                    </svg>
                                );
                            })()}
                        </div>
                    </div>
                    <div className="w-full pt-3 mt-4 border-t border-gray-100 flex-1 flex flex-col">
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black text-gray-600 px-1 mb-1 mt-1"><span className="flex items-center gap-1"><BarChart3 size={11} /> 월별 미분양 증가 지수</span><span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-gray-50 px-1.5 py-0.5 rounded">단위: Pt</span></div>
                        <div className="relative w-full max-w-[260px] mx-auto flex-1 min-h-[80px] md:min-h-[100px] flex items-center justify-center mt-1">
                            {(() => {
                                const trendData = sentiment.unsoldTrend; const PADDING_X = 15; const PADDING_Y_TOP = 25; const PADDING_Y_BOTTOM = 20; const W = 200; const H = 100;
                                const innerW = W - PADDING_X * 2; const innerH = H - PADDING_Y_TOP - PADDING_Y_BOTTOM;
                                const maxVal = Math.max(...trendData, 50) * 1.2;
                                const getX = (i: number) => PADDING_X + (i / (trendData.length - 1)) * innerW; const getY = (val: number) => PADDING_Y_TOP + innerH - (val / maxVal) * innerH;
                                const pathData = trendData.map((v: number, i: number) => `${getX(i)},${getY(v)}`).join(" L ");
                                return (
                                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible">
                                        <defs><linearGradient id="unsoldAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" /></linearGradient></defs>
                                        <path d={`M ${pathData} L ${getX(trendData.length - 1)},${H - PADDING_Y_BOTTOM} L ${getX(0)},${H - PADDING_Y_BOTTOM} Z`} fill="url(#unsoldAreaGradient)" />
                                        <path d={`M ${pathData}`} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000" />
                                        {trendData.map((v: number, i: number) => (
                                            <g key={i}>
                                                <circle cx={getX(i)} cy={getY(v)} r={i === trendData.length - 1 ? "3.5" : "2.5"} fill={i === trendData.length - 1 ? "#3B82F6" : "white"} stroke={i === trendData.length - 1 ? "white" : "#3B82F6"} strokeWidth="1.5" />
                                                <text x={getX(i)} y={getY(v) - 8} textAnchor="middle" fontSize={i === trendData.length - 1 ? "11" : "9"} fontWeight="bold" fill={i === trendData.length - 1 ? "#1D4ED8" : "#6B7280"} stroke="white" strokeWidth="2" paintOrder="stroke">{v}</text>
                                                <text x={getX(i)} y={H - 5} textAnchor="middle" fontSize="8" fill="#9CA3AF" fontWeight="bold">{sentiment.labels[i].replace("'", "")}</text>
                                            </g>
                                        ))}
                                    </svg>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}