import { useState, useEffect } from 'react'
import { postApiService } from '@/services/api'

/**
 * Hook to fetch and manage feed posts
 * Refactored to use PostApiService (Dependency Inversion Principle)
 */
export function useFeed() {
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchPosts = async () => {
        try {
            setLoading(true)
            const data = await postApiService.getPosts()
            setPosts(data as any[])
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch posts')
            console.error('Error fetching posts:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [])

    const refresh = () => {
        fetchPosts()
    }

    return {
        posts,
        loading,
        error,
        refresh,
    }
}
