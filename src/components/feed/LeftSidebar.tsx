'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface LeftSidebarProps {
    userName?: string
    userHeadline?: string
    profilePicture?: string
    memberId?: string
}

export function LeftSidebar({ userName, userHeadline, profilePicture, memberId }: LeftSidebarProps) {
    const router = useRouter()

    const initials = userName
        ? userName.split(' ').map(n => n[0]).join('').toUpperCase()
        : 'U'

    return (
        <div className="w-[225px] hidden lg:block">
            <div className="sticky top-[68px]">
                {/* Profile Card */}
                <Card className="overflow-hidden mb-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                    {/* Background Banner */}
                    <div className="h-[54px] bg-gradient-to-r from-blue-500 to-blue-600" />

                    <CardContent className="p-0 relative">
                        {/* Profile Picture */}
                        <div className="absolute -top-[38px] left-1/2 -translate-x-1/2">
                            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold border-2 border-white">
                                {initials}
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="pt-[42px] pb-3 px-3 text-center border-b border-gray-200">
                            <h3
                                className="font-semibold text-sm text-gray-900 hover:underline cursor-pointer"
                                onClick={() => memberId && router.push(`/profile/${memberId}`)}
                            >
                                {userName || 'User'}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {userHeadline || 'Professional'}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="py-3 px-3 border-b border-gray-200">
                            <div className="flex justify-between items-center text-xs hover:bg-gray-50 -mx-3 px-3 py-1 cursor-pointer">
                                <span className="text-gray-600">Profile viewers</span>
                                <span className="text-[#0A66C2] font-semibold">0</span>
                            </div>
                            <div className="flex justify-between items-center text-xs hover:bg-gray-50 -mx-3 px-3 py-1 cursor-pointer mt-1">
                                <span className="text-gray-600">Post impressions</span>
                                <span className="text-[#0A66C2] font-semibold">0</span>
                            </div>
                        </div>

                        {/* Premium CTA */}
                        <div className="py-3 px-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-xs text-gray-600">
                                Access exclusive tools & insights
                            </p>
                            <p className="text-xs font-semibold mt-1 flex items-center gap-1">
                                <span className="text-[#7F3FBF]">■</span>
                                <span>Try Premium for free</span>
                            </p>
                        </div>

                        {/* Saved Items */}
                        <div className="py-3 px-3 border-t border-gray-200 hover:bg-gray-50 cursor-pointer">
                            <p className="text-xs font-semibold flex items-center gap-2">
                                <span>📑</span>
                                <span>My items</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent/Groups Card */}
                <Card className="shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                    <CardContent className="p-3">
                        <div className="space-y-2">
                            <p className="text-xs text-[#0A66C2] font-semibold hover:underline cursor-pointer">
                                Groups
                            </p>
                            <p className="text-xs text-[#0A66C2] font-semibold hover:underline cursor-pointer">
                                Events
                            </p>
                            <p className="text-xs text-[#0A66C2] font-semibold hover:underline cursor-pointer">
                                Followed Hashtags
                            </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-600 font-semibold hover:bg-gray-100 py-1 rounded cursor-pointer">
                                Discover more
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
