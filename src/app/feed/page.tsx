'use client'

import { useAuth } from '@/hooks/use-auth'
import { LoadingPage } from '@/components/ui/loading'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFeed } from '@/hooks/feed/useFeed'
import { useMember } from '@/hooks/api/useMember'
import { ProfileSidebar } from '@/components/profile/ProfileSidebar'
import { ContactInfoCard } from '@/components/profile/cards/ContactInfoCard'
import { LinkedInCreatePost } from '@/components/feed/LinkedInCreatePost'
import { LinkedInPostCard } from '@/components/feed/LinkedInPostCard'
import { Button } from '@/components/ui/button'
import { LogOut, User, UserCircle } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getFullName, getUserInitials } from '@/utils/memberUtils'

/**
 * Feed page component
 * Refactored to use custom hooks (SRP, DIP principles)
 */
export default function FeedPage() {
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useRouter()
    const { posts, loading: postsLoading, refresh } = useFeed()
    const { member } = useMember() // Use custom hook instead of duplicate fetch
    const [activeNav, setActiveNav] = useState('feed')

    const handleLogout = async () => {
        await signOut()
        router.push('/member-portal/login')
    }

    const handleViewProfile = () => {
        if (member?.id) {
            router.push(`/profile/${member.id}`)
        }
    }

    if (authLoading) {
        return <LoadingPage text="Loading feed..." />
    }

    if (!user) {
        return null
    }

    // Use utility functions
    const userName = member ? getFullName(member.first_name, member.last_name) : undefined
    const userInitials = member ? getUserInitials(member.first_name, member.last_name) : undefined

    return (
        <div className="h-screen bg-[#F3F2EF] flex overflow-hidden">
            {/* Left Sidebar - FIXED */}
            <div className="flex-shrink-0 h-screen overflow-y-auto">
                <ProfileSidebar activeNav={activeNav} onNavChange={setActiveNav} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Middle Content - SCROLLABLE */}
                <div className="flex-1 flex flex-col h-screen overflow-hidden">
                    {/* Account Button - Top Right - FIXED */}
                    <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-end z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <UserCircle className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleViewProfile}>
                                    <User className="h-4 w-4 mr-2" />
                                    View Profile
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Scrollable Feed Content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
                            {/* Create Post */}
                            <LinkedInCreatePost
                                onPostCreated={refresh}
                                userName={userName}
                                userInitials={userInitials}
                            />

                            {/* Sort Options */}
                            <div className="flex items-center gap-1">
                                <div className="h-px flex-1 bg-gray-300" />
                                <span className="text-xs text-gray-600 px-2">Sort by: <strong>Top</strong></span>
                                <div className="h-px flex-1 bg-gray-300" />
                            </div>

                            {/* Posts List */}
                            {postsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A66C2] mx-auto" />
                                    <p className="mt-4 text-gray-600">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                                    <p className="text-gray-500 text-lg">No posts yet</p>
                                    <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {posts.map((post) => (
                                        <LinkedInPostCard key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - FIXED */}
                <div className="w-[300px] flex-shrink-0 h-screen overflow-y-auto border-l border-gray-200 bg-white">
                    <div className="sticky top-0 p-6">
                        {member && <ContactInfoCard member={member} />}
                    </div>
                </div>
            </div>
        </div>
    )
}
