import { useState, useEffect } from 'react'
import { articleApiService } from '@/services/api'

/**
 * Hook to fetch articles
 * Similar to useFeed hook
 */
export function useArticles(filters?: {
    status?: string
    tags?: string[]
    memberId?: string
    limit?: number
}) {
    const [articles, setArticles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchArticles = async () => {
        try {
            setLoading(true)
            const data = await articleApiService.getArticles(filters)
            setArticles(data as any[])
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch articles')
            console.error('Error fetching articles:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchArticles()
    }, [filters?.status, filters?.memberId, filters?.limit])

    const refresh = () => {
        fetchArticles()
    }

    return {
        articles,
        loading,
        error,
        refresh,
    }
}
