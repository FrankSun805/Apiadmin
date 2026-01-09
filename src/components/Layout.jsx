import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet" // We'll need to make sure Sheet is installed
import { Separator } from "@/components/ui/separator"
import {
    Menu,
    LayoutDashboard,
    Image as ImageIcon,
    Settings,
    ShieldCheck,
    MessageSquare
} from "lucide-react"

export function Layout({ children, activeTab, onTabChange, token, onTokenChange }) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const NavContent = () => (
        <div className="flex flex-col h-full py-4">
            <div className="px-6 pb-6 pt-2">
                <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    AdminPanel
                </h2>
                <p className="text-xs text-muted-foreground">API Management</p>
            </div>
            <Separator />
            <div className="flex-1 py-4 px-3 space-y-1">
                <Button
                    variant={activeTab === 'usage' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                        onTabChange('usage')
                        setSidebarOpen(false)
                    }}
                >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Usage Check
                </Button>
                <Button
                    variant={activeTab === 'imggen' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                        onTabChange('imggen')
                        setSidebarOpen(false)
                    }}
                >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Image Gen Test
                </Button>
                <Button
                    variant={activeTab === 'chatusage' ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                        onTabChange('chatusage')
                        setSidebarOpen(false)
                    }}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat API Usage
                </Button>
            </div>
            <div className="px-4 py-2">
                <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
            </div>
        </div>
    )

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 backdrop-blur-sm">
                <NavContent />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur top-0 z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                <NavContent />
                            </SheetContent>
                        </Sheet>
                        <div className="md:hidden font-semibold">AdminPanel</div>
                    </div>

                    <div className="flex items-center gap-4 w-full max-w-md justify-end md:justify-end">
                        <div className="relative w-full max-w-sm">
                            <Input
                                placeholder="sk-..."
                                value={token}
                                onChange={(e) => onTokenChange(e.target.value)}
                                className="bg-card w-full"
                                type="password"
                            />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6 bg-muted/20">
                    <div className="max-w-6xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
