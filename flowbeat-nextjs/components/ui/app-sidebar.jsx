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
import { useEffect, useState } from "react"
import { SignInButton, useUser, SignUpButton, SignOutButton, UserButton } from "@clerk/nextjs"
import { Separator } from "./separator"

const menuItems = [
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
        disabled: true
    },
    {
        title: "Bantuan",
        url: "#",
        icon: HelpCircle,
        disabled: true,
    },
    {
        title: "Fullscreen",
        icon: Fullscreen,
        action: "fullscreen"
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [isFullscreen, setIsFullscreen] = useState(false)
    const { isSignedIn, user } = useUser()

    // const toggleFullscreen = () => {
    //     if (!document.fullscreenElement) {
    //         document.documentElement.requestFullscreen()
    //         setIsFullscreen(true)
    //     } else {
    //         if (document.exitFullscreen) {
    //             document.exitFullscreen()
    //             setIsFullscreen(false)
    //         }
    //     }
    // }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true)
            }).catch((err) => {
                console.error('Error attempting to enable fullscreen:', err)
            })
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false)
            }).catch((err) => {
                console.error('Error attempting to exit fullscreen:', err)
            })
        }
    }

    useEffect(() => {
        const toggleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', toggleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', toggleFullscreenChange)
        }
    }, [])

    return (
        <Sidebar variant="floating" collapsible="icon" className="border-r-0">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex flex-col items-start w-full">
                                    <div className={`w-full flex flex-row items-start`}>
                                        <SidebarMenuButton>
                                            {<span className="font-semibold text-xl text-blue-500">Flowbeat</span>}
                                        </SidebarMenuButton>
                                        <SidebarTrigger />
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <Separator className="max-w-screen-2xl" />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                item.disabled ? (
                                    <SidebarMenuItem key={item.title}>
                                        <div className="flex h-10 cursor-not-allowed items-center justify-start gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground opacity-50">
                                            <item.icon className="h-4 w-4" />
                                            <span>{item.title}</span>
                                        </div>
                                    </SidebarMenuItem>
                                ) : item.action === "fullscreen" ? (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Button
                                                variant={isFullscreen ? 'default' : 'link'}
                                                className={`${isFullscreen ? 'shadow-lg' : ''} hover:bg-secondary flex items-center justify-start`}
                                                onClick={toggleFullscreen}
                                            >
                                                {isFullscreen ? <Fullscreen className="h-4 w-4" /> : <item.icon className="h-4 w-4" />}
                                                <span>{isFullscreen ? 'Exit Fullscreen' : item.title}</span>
                                            </Button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ) : (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Button
                                                asChild
                                                variant={pathname === item.url ? 'default' : 'link'}
                                                className={`${pathname === item.url ? 'shadow-lg' : ''} hover:bg-secondary flex items-center justify-start`}
                                            >
                                                <Link href={item.url}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </Button>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {isSignedIn && (
                    <SidebarMenuButton>
                        <div>
                            <UserButton userProfileMode="modal" />
                        </div>
                        <div>
                            <p className="font-bold text-md">{user?.fullName}</p>
                            <p className="text-xs text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </SidebarMenuButton>
                )}
            </SidebarFooter>
        </Sidebar>
    )
}
