'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Repeat2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PostCardProps {
    post: {
        id: string
        content: string
        image_data?: string
        likes_count: number
        reposts_count: number
        created_at: string
        member: {
            id: string
            first_name: string
            last_name: string
            designation?: string
            company_name?: string
        }
    }
    onLike?: (postId: string) => void
    onRepost?: (postId: string) => void
}

export function PostCard({ post, onLike, onRepost }: PostCardProps) {
    const [liked, setLiked] = useState(false)
    const [reposted, setReposted] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes_count)
    const [repostsCount, setRepostsCount] = useState(post.reposts_count)

    const handleLike = async () => {
        if (liked) return // Prevent double-liking

        setLiked(true)
        setLikesCount(prev => prev + 1)

        try {
            const response = await fetch(`/member-portal/api/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'like' })
            })

            if (!response.ok) {
                // Revert on error
                setLiked(false)
                setLikesCount(prev => prev - 1)
            }
        } catch (error) {
            console.error('Error liking post:', error)
            setLiked(false)
            setLikesCount(prev => prev - 1)
        }
    }

    const handleRepost = async () => {
        if (reposted) return // Prevent double-reposting

        setReposted(true)
        setRepostsCount(prev => prev + 1)

        try {
            const response = await fetch(`/member-portal/api/posts/${post.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'repost' })
            })

            if (!response.ok) {
                // Revert on error
                setReposted(false)
                setRepostsCount(prev => prev - 1)
            }
        } catch (error) {
            console.error('Error reposting:', error)
            setReposted(false)
            setRepostsCount(prev => prev - 1)
        }
    }

    // Generate initials for profile picture
    const initials = `${post.member.first_name[0]}${post.member.last_name[0]}`.toUpperCase()

    // Get designation or company
    const designation = post.member.designation || post.member.company_name || 'Member'

    return (
        <Card>
            <CardContent className="pt-6">
                {/* Header with profile info */}
                <div className="flex items-start gap-3 mb-4">
                    {/* Profile Picture */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {initials}
                    </div>

                    {/* Name and designation */}
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                            {post.member.first_name} {post.member.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{designation}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {/* Post content */}
                <div className="mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post image */}
                {post.image_data && (
                    <div className="mb-4">
                        <img
                            src={post.image_data}
                            alt="Post image"
                            className="rounded-lg w-full object-cover max-h-96"
                        />
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-4 pt-4 border-t">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`flex items-center gap-2 ${liked ? 'text-red-600' : 'text-gray-600'}`}
                        disabled={liked}
                    >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                        <span>{likesCount}</span>
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRepost}
                        className={`flex items-center gap-2 ${reposted ? 'text-green-600' : 'text-gray-600'}`}
                        disabled={reposted}
                    >
                        <Repeat2 className="h-5 w-5" />
                        <span>{repostsCount}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
