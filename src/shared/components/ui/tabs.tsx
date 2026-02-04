
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
            "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
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
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300 dark:data-[state=active]:bg-slate-950 dark:data-[state=active]:text-slate-50",
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
            "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
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
}

const Tabs = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Root>,
    TabsProps
>(({ className, tabs, children, ...props }, ref) => {
    if (tabs && tabs.length > 0) {
        return (
            <TabsRoot ref={ref} className={className} defaultValue={tabs[0]?.id} {...props}>
                <div className="overflow-x-auto pb-2 mb-2">
                    <TabsList className="inline-flex h-auto w-auto justify-start p-1">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                {tabs.map(tab => (
                    <TabsContent key={tab.id} value={tab.id} className="mt-4 focus-visible:ring-0 outline-none">
                        {tab.content}
                    </TabsContent>
                ))}
            </TabsRoot>
        )
    }

    return <TabsRoot ref={ref} className={className} {...props}>{children}</TabsRoot>
})
Tabs.displayName = "Tabs"

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsRoot }
