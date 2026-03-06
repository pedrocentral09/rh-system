'use client';

import { useRef, useEffect, useCallback } from 'react';

export function useHorizontalScroll() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scrollInterval = useRef<NodeJS.Timeout | null>(null);

    const stopScrolling = useCallback(() => {
        if (scrollInterval.current) {
            clearInterval(scrollInterval.current);
            scrollInterval.current = null;
        }
    }, []);

    const startScrolling = useCallback((direction: 'left' | 'right', intensity: number) => {
        stopScrolling();
        scrollInterval.current = setInterval(() => {
            if (scrollRef.current) {
                const maxStep = 20; // Max pixels to scroll
                const step = maxStep * intensity;
                scrollRef.current.scrollLeft += direction === 'right' ? step : -step;
            }
        }, 16);
    }, [stopScrolling]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const threshold = 150; // Increased threshold for better feel

        if (x < threshold && x > 0) {
            const intensity = (threshold - x) / threshold;
            startScrolling('left', intensity);
        } else if (x > width - threshold && x < width) {
            const intensity = (x - (width - threshold)) / threshold;
            startScrolling('right', intensity);
        } else {
            stopScrolling();
        }
    }, [startScrolling, stopScrolling]);

    useEffect(() => {
        return () => stopScrolling();
    }, [stopScrolling]);

    return {
        scrollRef,
        onMouseMove: handleMouseMove,
        onMouseLeave: stopScrolling
    };
}
