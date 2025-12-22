import { apiClient } from './ApiClient'

/**
 * Post API Service
 * Single Responsibility: Handle all post-related API calls
 */
export class PostApiService {
    async getPosts() {
        return apiClient.get('/posts')
    }

    async getPostById(id: string) {
        return apiClient.get(`/posts/${id}`)
    }

    async createPost(data: { content: string; image_data?: string }) {
        return apiClient.post('/posts', data)
    }

    async likePost(postId: string) {
        return apiClient.put(`/posts/${postId}`, { action: 'like' })
    }

    async unlikePost(postId: string) {
        return apiClient.put(`/posts/${postId}`, { action: 'unlike' })
    }

    async deletePost(postId: string) {
        return apiClient.delete(`/posts/${postId}`)
    }
}

// Singleton instance
export const postApiService = new PostApiService()
