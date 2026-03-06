'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

interface HiringStats {
    month: string;
    hired: number;
    terminated: number;
}

interface HiringEvolutionChartProps {
    data: HiringStats[];
}

export function HiringEvolutionChart({ data }: HiringEvolutionChartProps) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => Math.max(d.hired, d.terminated))) || 5;
    const chartHeight = 200;
    const padding = 40;
    const chartWidth = 600;

    const getX = (i: number) => (i / (data.length - 1)) * chartWidth;
    const getY = (val: number) => chartHeight - (val / (maxVal * 1.2)) * chartHeight;

    // Create SVGs paths for smooth area chart
    const hiredPoints = data.map((d, i) => `${getX(i)},${getY(d.hired)}`).join(' ');
    const termPoints = data.map((d, i) => `${getX(i)},${getY(d.terminated)}`).join(' ');

    return (
        <div className="relative group overflow-hidden h-full flex flex-col">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Fluxo de Talentos</h3>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Evolução do <span className="text-emerald-400">Capital</span></h2>
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden">
                <svg width="100%" height="100%" viewBox={`0 -20 ${chartWidth} ${chartHeight + 40}`} className="overflow-visible font-sans">
                    <defs>
                        <linearGradient id="hiredGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="termGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-white/5" strokeWidth="1" />
                    {[0.25, 0.5, 0.75, 1].map(p => (
                        <line key={p} x1="0" y1={chartHeight * (1 - p)} x2={chartWidth} y2={chartHeight * (1 - p)} className="stroke-white/5" strokeWidth="1" strokeDasharray="4 4" />
                    ))}

                    {/* Area Hired */}
                    <path
                        d={`M 0,${chartHeight} ${data.map((d, i) => `L ${getX(i)},${getY(d.hired)}`).join(' ')} L ${chartWidth},${chartHeight} Z`}
                        fill="url(#hiredGrad)"
                        className="transition-all duration-1000"
                    />

                    {/* Line Hired */}
                    <path
                        d={`M 0,${getY(data[0].hired)} ${data.map((d, i) => `L ${getX(i)},${getY(d.hired)}`).join(' ')}`}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Area Terminated */}
                    <path
                        d={`M 0,${chartHeight} ${data.map((d, i) => `L ${getX(i)},${getY(d.terminated)}`).join(' ')} L ${chartWidth},${chartHeight} Z`}
                        fill="url(#termGrad)"
                        className="transition-all duration-1000"
                    />

                    {/* Line Terminated */}
                    <path
                        d={`M 0,${getY(data[0].terminated)} ${data.map((d, i) => `L ${getX(i)},${getY(d.terminated)}`).join(' ')}`}
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="8 8"
                        opacity="0.6"
                    />

                    {/* Data Points */}
                    {data.map((item, i) => (
                        <g key={item.month} className="group/point">
                            <circle cx={getX(i)} cy={getY(item.hired)} r="4" fill="#10b981" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer" />
                            <text x={getX(i)} y={chartHeight + 25} textAnchor="middle" className="fill-slate-500 font-black text-[9px] uppercase tracking-tighter">{item.month}</text>

                            {/* Hover info */}
                            <text x={getX(i)} y={getY(item.hired) - 10} textAnchor="middle" className="fill-white font-black text-[10px] opacity-0 group-hover/point:opacity-100 transition-opacity bg-black">{item.hired}</text>
                        </g>
                    ))}
                </svg>
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/5 font-black text-[10px] uppercase tracking-widest uppercase">
                <div className="flex items-center gap-2 text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    Contratações
                </div>
                <div className="flex items-center gap-2 text-rose-400 opacity-60">
                    <div className="w-2 h-2 rounded-full border border-rose-500" />
                    Desligamentos
                </div>
            </div>
        </div>
    );
}
