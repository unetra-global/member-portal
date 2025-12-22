import { ArticleRepository } from "@/server/repositories/articleRepository"
import {
    ArticleCreateSchema,
    ArticleUpdateSchema,
    ArticlePublishSchema,
    calculateReadingTime,
    calculateWordCount,
    generateSlug,
    validate
} from "@/server/validation/articleSchemas"
import type { ArticleStatus } from "@prisma/client"

/**
 * ArticlesService
 * Business logic for Article feature
 * Follows same pattern as PostsService
 */
export class ArticlesService {
    private repo = new ArticleRepository()

    // Rate limiting cache (in production, use Redis)
    private rateLimitCache = new Map<string, number[]>()

    /**
     * List articles with filters
     */
    async list(filters?: {
        status?: ArticleStatus
        tags?: string[]
        memberId?: string
        limit?: number
        offset?: number
    }) {
        return this.repo.list(filters)
    }

    /**
     * Get article by ID (increments view count)
     */
    async get(id: string) {
        const article = await this.repo.findById(id)
        if (article && article.status === 'PUBLISHED') {
            // Increment view count asynchronously
            this.repo.incrementViews(id).catch(console.error)
        }
        return article
    }

    /**
     * Get article by slug
     */
    async getBySlug(slug: string) {
        const article = await this.repo.findBySlug(slug)
        if (article && article.status === 'PUBLISHED') {
            // Increment view count asynchronously
            this.repo.incrementViews(article.id).catch(console.error)
        }
        return article
    }

    /**
     * Get articles by member ID
     */
    async getByMemberId(memberId: string) {
        return this.repo.findByMemberId(memberId)
    }

    /**
     * Create new article
     */
    async create(payload: {
        member_id: string
        title: string
        subtitle?: string
        summary: string
        content: string
        cover_image?: string
        tags: string[]
        status?: 'DRAFT' | 'PUBLISHED'
    }) {
        // Rate limiting check
        this.checkRateLimit(payload.member_id)

        // Validate input
        const validated = validate(ArticleCreateSchema, payload)

        // Calculate metadata
        const wordCount = calculateWordCount(validated.content)
        const readingTime = calculateReadingTime(validated.content)
        let slug = generateSlug(validated.title)

        // Ensure slug is unique for this member
        let slugSuffix = 0
        while (await this.repo.slugExists(slug, payload.member_id)) {
            slugSuffix++
            slug = `${generateSlug(validated.title)}-${slugSuffix}`
        }

        // Create article
        return this.repo.create({
            member: { connect: { id: payload.member_id } },
            title: validated.title,
            slug,
            subtitle: validated.subtitle || null,
            summary: validated.summary,
            content: validated.content,
            cover_image: payload.cover_image || null,
            tags: validated.tags,
            status: validated.status || 'DRAFT',
            word_count: wordCount,
            reading_time: readingTime,
            published_at: validated.status === 'PUBLISHED' ? new Date() : null,
        })
    }

    /**
     * Update article
     */
    async update(id: string, memberId: string, payload: any) {
        // Check ownership
        const article = await this.repo.findById(id)
        if (!article) throw new Error('Article not found')
        if (article.member_id !== memberId) {
            throw new Error('Unauthorized: You can only edit your own articles')
        }

        // Validate input
        const validated = validate(ArticleUpdateSchema, payload)

        // Create version before updating (if published)
        if (article.status === 'PUBLISHED') {
            await this.repo.createVersion(id, memberId)
        }

        // Recalculate metadata if content changed
        const updates: any = { ...validated }
        if (validated.content) {
            updates.word_count = calculateWordCount(validated.content)
            updates.reading_time = calculateReadingTime(validated.content)
        }
        if (validated.title && validated.title !== article.title) {
            let newSlug = generateSlug(validated.title)
            // Ensure slug is unique
            let slugSuffix = 0
            while (await this.repo.slugExists(newSlug, memberId, id)) {
                slugSuffix++
                newSlug = `${generateSlug(validated.title)}-${slugSuffix}`
            }
            updates.slug = newSlug
        }

        return this.repo.update(id, updates)
    }

    /**
     * Publish article
     */
    async publish(id: string, memberId: string) {
        const article = await this.repo.findById(id)
        if (!article) throw new Error('Article not found')
        if (article.member_id !== memberId) {
            throw new Error('Unauthorized')
        }

        // Validate article is ready for publishing
        validate(ArticlePublishSchema, {
            title: article.title,
            summary: article.summary,
            content: article.content,
            tags: article.tags,
        })

        return this.repo.update(id, {
            status: 'PUBLISHED',
            published_at: new Date(),
        })
    }

    /**
     * Unpublish article
     */
    async unpublish(id: string, memberId: string) {
        const article = await this.repo.findById(id)
        if (!article) throw new Error('Article not found')
        if (article.member_id !== memberId) {
            throw new Error('Unauthorized')
        }

        return this.repo.update(id, {
            status: 'DRAFT',
        })
    }

    /**
     * Delete article
     */
    async delete(id: string, memberId: string, isAdmin = false) {
        const article = await this.repo.findById(id)
        if (!article) throw new Error('Article not found')

        // Only author or admin can delete
        if (!isAdmin && article.member_id !== memberId) {
            throw new Error('Unauthorized')
        }

        return this.repo.delete(id)
    }

    /**
     * Increment likes
     */
    async incrementLikes(id: string) {
        return this.repo.incrementLikes(id)
    }

    /**
     * Decrement likes
     */
    async decrementLikes(id: string) {
        return this.repo.decrementLikes(id)
    }

    /**
     * Search articles
     */
    async search(query: string, tags?: string[]) {
        return this.repo.search(query, tags)
    }

    /**
     * Get article versions
     */
    async getVersions(id: string, memberId: string) {
        const article = await this.repo.findById(id)
        if (!article) throw new Error('Article not found')
        if (article.member_id !== memberId) {
            throw new Error('Unauthorized')
        }

        return this.repo.getVersions(id)
    }

    /**
     * Rate limiting: max 5 articles per day
     */
    private checkRateLimit(memberId: string) {
        const now = Date.now()
        const dayAgo = now - 24 * 60 * 60 * 1000

        const timestamps = this.rateLimitCache.get(memberId) || []
        const recentCreations = timestamps.filter(t => t > dayAgo)

        if (recentCreations.length >= 5) {
            throw new Error('Rate limit exceeded: Maximum 5 articles per day')
        }

        recentCreations.push(now)
        this.rateLimitCache.set(memberId, recentCreations)
    }
}
