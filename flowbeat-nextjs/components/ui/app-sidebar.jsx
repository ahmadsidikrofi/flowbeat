'use client'
import { ChevronsUpDown, Database, Fullscreen, HelpCircle, Hospital, Inbox, LayoutDashboard, LogIn, LogOut, Newspaper, Settings, User2, UsersRoundIcon } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "./button"
import { useState } from "react"
import { SignInButton, useUser, SignUpButton, SignOutButton, UserButton } from "@clerk/nextjs"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Pasien",
        url: "/patients",
        icon: UsersRoundIcon,
    },
    {
        title: "Catatan",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Master Data",
        url: "#",
        icon: Database,
    },
    {
        title: "Bantuan",
        url: "#",
        icon: HelpCircle,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [fullscreen, setIsFullscreen] = useState(false)
    const { isSignedIn, user } = useUser()

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                setIsFullscreen(false)
            }
        }
    }
    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex flex-col items-center w-full">
                                    <div className={`w-full flex ${Sidebar.isCollapsed ? 'flex-col items-center' : 'flex-row justify-between items-center'}`}>
                                        <SidebarMenuButton>
                                            <Hospital className="w-4 h-4 text-blue-500" />
                                            {!Sidebar.isCollapsed && <span className="font-semibold text-xl text-blue-500">Flowbeat</span>}
                                        </SidebarMenuButton>
                                        {!Sidebar.isCollapsed && <SidebarTrigger />}
                                    </div>
                                    {Sidebar.isCollapsed && (
                                        <div className="mt-2">
                                            <SidebarTrigger />
                                        </div>
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menus</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Button asChild variant={pathname === item.url ? 'default' : 'link'} className={`${pathname === item.url ? 'shadow-lg' : 'null'} hover:bg-secondary flex items-center justify-start`}>
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </Button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                     <Button className="p-0" asChild variant="link" onClick={toggleFullscreen}>
                                        <Link href="#">
                                            <Fullscreen />
                                            Fullscreen
                                        </Link>
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {isSignedIn ? (
                    <SidebarMenuButton>
                        <div>
                            <UserButton userProfileMode="modal"  />
                        </div>
                        <div>
                            <p className="font-bold text-md">{user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </SidebarMenuButton>
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton>
                                        <div className="p-1 bg-primary rounded-[15px]">
                                            <User2 size={14} color="#fff" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-md">Masuk</p>
                                            <p className="text-xs text-muted-foreground">Supaya kita bisa kenal</p>
                                        </div>
                                        <ChevronsUpDown className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width]"
                                >
                                    <DropdownMenuItem>
                                        <SignInButton>
                                            <div className="flex gap-2 items-center">
                                                <LogIn size={14} color="#737373" />
                                                <p>Sign In</p>
                                            </div>
                                        </SignInButton>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <SignUpButton>
                                            <div className="flex gap-2 items-center">
                                                <Newspaper size={14} color="#737373" />
                                                <p>Sign Up</p>
                                            </div>
                                        </SignUpButton>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>            
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
