'use client';

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"



const TabsRoot = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-surface-secondary p-1 text-text-muted",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface data-[state=active]:text-text-primary data-[state=active]:shadow-sm",
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

// --- High Level Wrapper ---
interface TabItem {
    id: string;
    label: string | React.ReactNode;
    content: React.ReactNode;
}

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
    tabs?: TabItem[];
    fullContent?: boolean;
}

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    TabsProps
>(({ className, tabs, fullContent = false, children, ...props }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(true);

    const checkScroll = React.useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    }, []);

    React.useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        // Initial check after render
        setTimeout(checkScroll, 100);
        return () => window.removeEventListener('resize', checkScroll);
    }, [checkScroll, tabs]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = scrollRef.current.clientWidth / 2;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            setTimeout(checkScroll, 350);
        }
    };

    if (tabs && tabs.length > 0) {
        return (
            <TabsRoot ref={ref} className={className} defaultValue={tabs[0]?.id} {...props}>
                <div className="relative group/tabs flex items-center w-full">
                    <div className={cn("absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-background via-background/90 to-transparent z-10 flex items-center justify-start transition-opacity duration-300 pl-1", canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none")}>
                        <button onClick={() => scroll('left')} className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted hover:text-text-primary shadow-sm hover:shadow active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-blue/50">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                    </div>

                    <div className={cn("absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-background via-background/90 to-transparent z-10 flex items-center justify-end transition-opacity duration-300 pr-1", canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none")}>
                        <button onClick={() => scroll('right')} className="h-8 w-8 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-muted hover:text-text-primary shadow-sm hover:shadow active:scale-95 transition-all outline-none focus:ring-2 focus:ring-brand-blue/50">
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.56492 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        </button>
                    </div>

                    <div
                        className="flex justify-start pb-4 overflow-x-auto scroll-smooth no-scrollbar relative z-0 w-full"
                        ref={scrollRef}
                        onScroll={checkScroll}
                    >
                        <TabsList className="inline-flex h-14 w-max justify-start p-1.5 bg-surface/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-xl min-w-min">
                            {tabs.map(tab => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="data-[state=active]:bg-brand-orange data-[state=active]:text-white data-[state=active]:shadow-[0_8px_20px_-6px_rgba(249,115,22,0.6)] data-[state=active]:scale-105 text-text-muted hover:text-text-primary rounded-xl px-6 py-2 transition-all whitespace-nowrap text-[10px] font-black uppercase tracking-widest leading-none border border-transparent data-[state=active]:border-white/10 relative group/trigger overflow-hidden"
                                >
                                    <span className="relative z-10">{tab.label}</span>
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/trigger:opacity-100 transition-opacity" />
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </div>
                {tabs.map(tab => (
                    <TabsContent
                        key={tab.id}
                        value={tab.id}
                        forceMount
                        className="mt-6 focus-visible:ring-0 outline-none data-[state=inactive]:hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
                    >
                        <div className={cn("mx-auto w-full", fullContent ? "max-w-none" : "max-w-full")}>
                            {tab.content}
                        </div>
                    </TabsContent>
                ))}
            </TabsRoot>
        )
    }

    return <TabsRoot ref={ref} className={className} {...props}>{children}</TabsRoot>
})
Tabs.displayName = "Tabs"

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsRoot }
