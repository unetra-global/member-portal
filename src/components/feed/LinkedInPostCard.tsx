'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ThumbsUp, Repeat2, Send, Globe } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { usePostActions } from '@/hooks/api/usePostActions'
import { getLatestDesignation, getUserInitials, getFullName } from '@/utils/memberUtils'

interface LinkedInPostCardProps {
    post: any
}

/**
 * LinkedIn-style post card component
 * Refactored to use hooks and utilities (SRP, DRY principles)
 */
export function LinkedInPostCard({ post }: LinkedInPostCardProps) {
    const [showFullText, setShowFullText] = useState(false)
    const [showImageModal, setShowImageModal] = useState(false)

    // Use custom hook for like/unlike functionality
    const { liked, likesCount, toggleLike } = usePostActions(post.id, post.likes_count)

    // Use utility functions for member data
    const initials = getUserInitials(post.member.first_name, post.member.last_name)
    const fullName = getFullName(post.member.first_name, post.member.last_name)
    const headline = getLatestDesignation(post.member.experience)

    // Format timestamp
    const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

    // Truncate long text
    const shouldTruncate = post.content.length > 210
    const displayContent = shouldTruncate && !showFullText
        ? post.content.slice(0, 210) + '...'
        : post.content

    return (
        <Card className="shadow-[0_0_0_1px_rgba(0,0,0,0.08)] mb-2">
            <CardContent className="p-0">
                {/* Post Header */}
                <div className="p-3 flex items-start justify-between">
                    <div className="flex items-start gap-2">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {initials}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                                <h3 className="font-semibold text-sm hover:text-[#0A66C2] hover:underline cursor-pointer">
                                    {fullName}
                                </h3>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">
                                {headline}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <span>{timeAgo}</span>
                                <span>•</span>
                                <Globe className="h-3 w-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Post Content */}
                <div className="px-3 pb-2">
                    <p className="text-sm whitespace-pre-wrap">
                        {displayContent}
                    </p>
                    {shouldTruncate && (
                        <button
                            onClick={() => setShowFullText(!showFullText)}
                            className="text-gray-600 text-sm font-semibold hover:text-[#0A66C2] mt-1"
                        >
                            {showFullText ? '...see less' : '...see more'}
                        </button>
                    )}
                </div>

                {/* Post Image */}
                {post.image_data && (
                    <div className="w-full cursor-pointer" onClick={() => setShowImageModal(true)}>
                        <img
                            src={post.image_data}
                            alt="Post content"
                            className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity"
                        />
                    </div>
                )}

                {/* Image Modal */}
                {showImageModal && (
                    <div
                        className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                        onClick={() => setShowImageModal(false)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
                            onClick={() => setShowImageModal(false)}
                        >
                            ×
                        </button>
                        <img
                            src={post.image_data}
                            alt="Post content"
                            className="max-w-full max-h-full object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Engagement Bar */}
                {(likesCount > 0 || post.reposts_count > 0) && (
                    <div className="px-3 py-2 flex items-center justify-between text-xs text-gray-600 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            {likesCount > 0 && (
                                <div className="flex items-center gap-1">
                                    <div className="flex -space-x-1">
                                        <div className="w-4 h-4 rounded-full bg-[#0A66C2] flex items-center justify-center">
                                            <ThumbsUp className="h-2.5 w-2.5 text-white fill-white" />
                                        </div>
                                    </div>
                                    <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">
                                        {likesCount}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            {post.reposts_count > 0 && (
                                <span className="hover:text-[#0A66C2] hover:underline cursor-pointer">
                                    {post.reposts_count} {post.reposts_count === 1 ? 'repost' : 'reposts'}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center px-2 py-1">
                    <button
                        onClick={toggleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-gray-100 transition-colors ${liked ? 'text-[#0A66C2]' : 'text-gray-600'
                            }`}
                    >
                        <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                        <span className="text-sm font-semibold">Like</span>
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-gray-100 transition-colors text-gray-600">
                        <Repeat2 className="h-5 w-5" />
                        <span className="text-sm font-semibold">Repost</span>
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded hover:bg-gray-100 transition-colors text-gray-600">
                        <Send className="h-5 w-5" />
                        <span className="text-sm font-semibold">Send</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
