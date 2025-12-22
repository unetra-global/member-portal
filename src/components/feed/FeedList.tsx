'use client'

import { PostCard } from './PostCard'

interface Post {
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

interface FeedListProps {
    posts: Post[]
    loading?: boolean
    onRefresh?: () => void
}

export function FeedList({ posts, loading, onRefresh }: FeedListProps) {
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading posts...</p>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No posts yet</p>
                <p className="text-gray-400 text-sm mt-2">Be the first to share something!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                />
            ))}
        </div>
    )
}
