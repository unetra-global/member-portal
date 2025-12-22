'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User, UserCircle } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface TopNavProps {
    onProfileClick?: () => void
    onLogout?: () => void
    userName?: string
}

export function TopNav({ onProfileClick, onLogout, userName }: TopNavProps) {
    const router = useRouter()

    return (
        <nav className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1128px] mx-auto px-4">
                <div className="flex items-center justify-between h-[52px]">
                    {/* Left: Logo */}
                    <div
                        className="flex items-center justify-center w-[34px] h-[34px] bg-[#0A66C2] rounded cursor-pointer"
                        onClick={() => router.push('/dashboard')}
                    >
                        <span className="text-white font-bold text-lg">U</span>
                    </div>

                    {/* Right: Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <UserCircle className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onProfileClick}>
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={onLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
