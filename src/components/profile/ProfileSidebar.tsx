'use client'

import { LayoutDashboard, BookOpen, Target, Calendar, Bookmark, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileSidebarProps {
    activeNav: string
    onNavChange: (nav: string) => void
}

export function ProfileSidebar({ activeNav, onNavChange }: ProfileSidebarProps) {
    const router = useRouter()

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
        { id: 'opportunities', label: 'Opportunities', icon: Target },
        { id: 'events', label: 'Events & Webinars', icon: Calendar },
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        { id: 'followers', label: 'Followers/Following', icon: Users },
    ]

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
            <div className="p-6">
                <div
                    className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => router.push('/dashboard')}
                >
                    <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                        U
                    </div>
                    <span className="font-bold text-lg">Unetra Global</span>
                </div>

                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavChange(item.id)
                                    if (item.id === 'dashboard') router.push('/dashboard')
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === item.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>
        </aside>
    )
}
