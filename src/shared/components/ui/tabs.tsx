'use client';

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"


import { useHorizontalScroll } from "@/shared/hooks/use-horizontal-scroll"

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
    const { scrollRef, onMouseMove, onMouseLeave } = useHorizontalScroll();

    if (tabs && tabs.length > 0) {
        return (
            <TabsRoot ref={ref} className={className} defaultValue={tabs[0]?.id} {...props}>
                <div className="relative group/tabs">
                    {/* Shadow indicators for scroll */}
                    <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity duration-500" />
                    <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none opacity-0 group-hover/tabs:opacity-100 transition-opacity duration-500" />

                    <div
                        className="flex justify-start pb-4 overflow-x-auto scroll-smooth no-scrollbar relative z-0 cursor-ew-resize"
                        ref={scrollRef}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                    >
                        <TabsList className="inline-flex h-14 w-auto justify-start p-1.5 bg-surface/40 backdrop-blur-3xl border border-white/5 rounded-2xl shadow-xl">
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
