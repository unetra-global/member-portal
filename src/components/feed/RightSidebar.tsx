'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TrendingUp, Plus } from 'lucide-react'

export function RightSidebar() {
    const newsItems = [
        { title: 'Tech industry updates', readers: '1,234', time: '2h ago' },
        { title: 'Market trends 2024', readers: '2,456', time: '4h ago' },
        { title: 'Career development tips', readers: '3,789', time: '1d ago' },
        { title: 'Networking strategies', readers: '1,567', time: '2d ago' },
        { title: 'Remote work insights', readers: '4,123', time: '3d ago' },
    ]

    const suggestions = [
        { name: 'Tech Professionals Network', type: 'Group', members: '12K' },
        { name: 'Career Growth Hub', type: 'Page', followers: '8K' },
        { name: 'Industry Leaders', type: 'Group', members: '15K' },
    ]

    return (
        <div className="w-[300px] hidden xl:block">
            <div className="sticky top-[68px]">
                {/* LinkedIn News */}
                <Card className="mb-2 shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <h3 className="font-semibold text-sm">LinkedIn News</h3>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ul className="space-y-3">
                            {newsItems.map((item, index) => (
                                <li key={index} className="hover:bg-gray-50 -mx-4 px-4 py-1 cursor-pointer">
                                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {item.time} • {item.readers} readers
                                    </p>
                                </li>
                            ))}
                        </ul>
                        <button className="text-xs text-gray-600 font-semibold hover:bg-gray-100 w-full text-left px-4 -mx-4 py-2 mt-2 rounded">
                            Show more →
                        </button>
                    </CardContent>
                </Card>

                {/* Add to Feed */}
                <Card className="shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                    <CardHeader className="pb-2">
                        <h3 className="font-semibold text-sm">Add to your feed</h3>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <ul className="space-y-3">
                            {suggestions.map((item, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-600">
                                            {item.type} • {item.members || item.followers} {item.members ? 'members' : 'followers'}
                                        </p>
                                        <button className="mt-1 flex items-center gap-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full border border-gray-600 text-xs font-semibold">
                                            <Plus className="h-3 w-3" />
                                            Follow
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button className="text-xs text-gray-600 font-semibold hover:bg-gray-100 w-full text-left px-4 -mx-4 py-2 mt-3 rounded">
                            View all recommendations →
                        </button>
                    </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="mt-4 px-4">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">About</a>
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">Accessibility</a>
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">Help Center</a>
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">Privacy & Terms</a>
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">Ad Choices</a>
                        <a href="#" className="hover:text-[#0A66C2] hover:underline">Advertising</a>
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                        <span className="font-semibold">Unetra Global</span> Corporation © 2024
                    </p>
                </div>
            </div>
        </div>
    )
}
