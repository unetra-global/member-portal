import { useState } from 'react'
import { postApiService } from '@/services/api'

/**
 * Hook to manage post interactions (like/unlike)
 * Single Responsibility: Manage post interaction state
 * Dependency Inversion: Depends on PostApiService abstraction
 */
export function usePostActions(postId: string, initialLikesCount: number = 0) {
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(initialLikesCount)
    const [isLoading, setIsLoading] = useState(false)

    const toggleLike = async () => {
        if (isLoading) return

        // Optimistic update
        const previousLiked = liked
        const previousCount = likesCount
        const newLiked = !liked
        const newCount = newLiked ? likesCount + 1 : likesCount - 1

        setLiked(newLiked)
        setLikesCount(newCount)
        setIsLoading(true)

        try {
            if (newLiked) {
                await postApiService.likePost(postId)
            } else {
                await postApiService.unlikePost(postId)
            }
        } catch (error) {
            // Revert on error
            console.error('Error toggling like:', error)
            setLiked(previousLiked)
            setLikesCount(previousCount)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        liked,
        likesCount,
        toggleLike,
        isLoading,
    }
}
