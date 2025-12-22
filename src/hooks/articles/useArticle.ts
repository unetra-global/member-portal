import { useState, useEffect } from 'react'
import { articleApiService } from '@/services/api'

/**
 * Hook to fetch single article by ID
 */
export function useArticle(id: string) {
    const [article, setArticle] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchArticle = async () => {
            try {
                setLoading(true)
                const data = await articleApiService.getArticleById(id)

                if (isMounted) {
                    setArticle(data)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch article')
                    console.error('Error fetching article:', err)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        if (id) {
            fetchArticle()
        }

        return () => {
            isMounted = false
        }
    }, [id])

    return { article, loading, error }
}
