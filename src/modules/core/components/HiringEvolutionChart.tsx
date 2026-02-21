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

    // Calculate scaling
    const maxVal = Math.max(...data.map(d => Math.max(d.hired, d.terminated))) || 5;
    const chartHeight = 150;
    const barWidth = 12;
    const gap = 8;
    const groupGap = 40;

    // SVG Dimensions
    const width = data.length * (barWidth * 2 + gap + groupGap);
    const height = chartHeight + 40; // +labels

    const getY = (val: number) => {
        return chartHeight - (val / maxVal) * chartHeight;
    };

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 dark:text-white">Evolução de Equipe</CardTitle>
                <CardDescription className="dark:text-slate-400">Contratações vs Desligamentos (6 meses)</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="w-full overflow-x-auto">
                    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible font-sans text-xs">
                        {/* Grid Lines */}
                        <line x1="0" y1={chartHeight} x2={width} y2={chartHeight} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" />
                        <line x1="0" y1={0} x2={width} y2={0} className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="1" strokeDasharray="4 4" />

                        {data.map((item, i) => {
                            const xGroup = i * (barWidth * 2 + gap + groupGap) + 20;

                            const hHired = (item.hired / maxVal) * chartHeight;
                            const hTerm = (item.terminated / maxVal) * chartHeight;

                            return (
                                <g key={item.month}>
                                    {/* Hired Bar */}
                                    <rect
                                        x={xGroup}
                                        y={getY(item.hired)}
                                        width={barWidth}
                                        height={hHired}
                                        fill="#10b981"
                                        rx="2"
                                        className="hover:opacity-80 transition-opacity"
                                    />

                                    {/* Terminated Bar */}
                                    <rect
                                        x={xGroup + barWidth + gap}
                                        y={getY(item.terminated)}
                                        width={barWidth}
                                        height={hTerm}
                                        fill="#ef4444"
                                        rx="2"
                                        className="hover:opacity-80 transition-opacity"
                                    />

                                    {/* Label */}
                                    <text
                                        x={xGroup + barWidth}
                                        y={chartHeight + 20}
                                        textAnchor="middle"
                                        className="fill-slate-500 dark:fill-slate-400"
                                        fontSize="10"
                                        fontWeight="500"
                                    >
                                        {item.month}
                                    </text>

                                    {/* Values on top (if not zero) */}
                                    {item.hired > 0 && (
                                        <text x={xGroup + barWidth / 2} y={getY(item.hired) - 5} textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">{item.hired}</text>
                                    )}
                                    {item.terminated > 0 && (
                                        <text x={xGroup + barWidth + gap + barWidth / 2} y={getY(item.terminated) - 5} textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">{item.terminated}</text>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Contratações</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-500"></div>
                        <span className="text-slate-600 dark:text-slate-400">Desligamentos</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
