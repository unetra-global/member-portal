import { useState } from 'react'
import { articleApiService } from '@/services/api'

/**
 * Hook to create new article
 * Similar to useCreatePost hook
 */
export function useCreateArticle() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createArticle = async (data: {
        title: string
        subtitle?: string
        summary: string
        content: string
        cover_image?: string
        tags: string[]
        status?: 'DRAFT' | 'PUBLISHED'
    }) => {
        try {
            setIsSubmitting(true)
            setError(null)

            const newArticle = await articleApiService.createArticle(data)

            return newArticle
        } catch (err: any) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create article'
            setError(errorMessage)
            console.error('Error creating article:', err)
            throw err
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        createArticle,
        isSubmitting,
        error,
    }
}
