import { apiClient } from './ApiClient'

/**
 * Article API Service
 * Frontend service for Article operations
 * Follows same pattern as PostApiService
 */
export class ArticleApiService {
    /**
     * Get all articles (published by default)
     */
    async getArticles(filters?: {
        status?: string
        tags?: string[]
        memberId?: string
        limit?: number
        offset?: number
    }) {
        const params = new URLSearchParams()
        if (filters?.status) params.append('status', filters.status)
        if (filters?.tags) params.append('tags', filters.tags.join(','))
        if (filters?.memberId) params.append('memberId', filters.memberId)
        if (filters?.limit) params.append('limit', filters.limit.toString())
        if (filters?.offset) params.append('offset', filters.offset.toString())

        const query = params.toString()
        return apiClient.get(`/articles${query ? `?${query}` : ''}`)
    }

    /**
     * Get article by ID
     */
    async getArticleById(id: string) {
        return apiClient.get(`/articles/${id}`)
    }

    /**
     * Get article by slug
     */
    async getArticleBySlug(slug: string) {
        // Note: This would require a separate endpoint or search
        const articles = await this.searchArticles(slug)
        return articles.find((a: any) => a.slug === slug)
    }

    /**
     * Create new article
     */
    async createArticle(data: {
        title: string
        subtitle?: string
        summary: string
        content: string
        cover_image?: string
        tags: string[]
        status?: 'DRAFT' | 'PUBLISHED'
    }) {
        return apiClient.post('/articles', data)
    }

    /**
     * Update article
     */
    async updateArticle(id: string, data: any) {
        return apiClient.put(`/articles/${id}`, data)
    }

    /**
     * Delete article
     */
    async deleteArticle(id: string) {
        return apiClient.delete(`/articles/${id}`)
    }

    /**
     * Publish article
     */
    async publishArticle(id: string) {
        return apiClient.post(`/articles/${id}/publish`, {})
    }

    /**
     * Like article
     */
    async likeArticle(id: string) {
        return apiClient.put(`/articles/${id}`, { action: 'like' })
    }

    /**
     * Unlike article
     */
    async unlikeArticle(id: string) {
        return apiClient.put(`/articles/${id}`, { action: 'unlike' })
    }

    /**
     * Get article versions
     */
    async getArticleVersions(id: string) {
        return apiClient.get(`/articles/${id}/versions`)
    }

    /**
     * Search articles
     */
    async searchArticles(query: string, tags?: string[]) {
        const params = new URLSearchParams()
        if (query) params.append('q', query)
        if (tags) params.append('tags', tags.join(','))

        return apiClient.get(`/articles/search?${params.toString()}`)
    }
}

// Singleton instance
export const articleApiService = new ArticleApiService()
