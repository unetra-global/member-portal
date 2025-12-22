import { useState } from 'react'
import { postApiService } from '@/services/api'

/**
 * Hook to create new posts
 * Refactored to use PostApiService (Dependency Inversion Principle)
 */
export function useCreatePost() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createPost = async (data: { content: string; image_data?: string }) => {
        try {
            setIsSubmitting(true)
            setError(null)

            const newPost = await postApiService.createPost(data)

            return newPost
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create post'
            setError(errorMessage)
            console.error('Error creating post:', err)
            throw err
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        createPost,
        isSubmitting,
        error,
    }
}
