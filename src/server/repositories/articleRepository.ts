import { prisma } from "@/lib/prisma"
import type { Article, Prisma, ArticleStatus } from "@prisma/client"

/**
 * ArticleRepository
 * Database operations for Article model
 * Follows same pattern as PostRepository
 */
export class ArticleRepository {
    /**
     * List articles with optional filters
     */
    async list(filters?: {
        status?: ArticleStatus
        tags?: string[]
        memberId?: string
        limit?: number
        offset?: number
    }): Promise<Article[]> {
        return prisma.article.findMany({
            where: {
                status: filters?.status,
                tags: filters?.tags ? { hasSome: filters.tags } : undefined,
                member_id: filters?.memberId,
            },
            orderBy: { published_at: "desc" },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        designation: true,
                        company_name: true,
                    },
                },
            },
            take: filters?.limit,
            skip: filters?.offset,
        })
    }

    /**
     * Find article by ID
     */
    async findById(id: string) {
        return prisma.article.findUnique({
            where: { id },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        designation: true,
                        company_name: true,
                    },
                },
                versions: {
                    orderBy: { version: 'desc' },
                    take: 10,
                },
            },
        })
    }

    /**
     * Find article by slug
     */
    async findBySlug(slug: string) {
        return prisma.article.findUnique({
            where: { slug },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        designation: true,
                        company_name: true,
                    },
                },
            },
        })
    }

    /**
     * Find articles by member ID
     */
    async findByMemberId(memberId: string): Promise<Article[]> {
        return prisma.article.findMany({
            where: { member_id: memberId },
            orderBy: { created_at: "desc" },
        })
    }

    /**
     * Create new article
     */
    async create(data: Prisma.ArticleCreateInput): Promise<Article> {
        return prisma.article.create({ data })
    }

    /**
     * Update article
     */
    async update(id: string, data: Prisma.ArticleUpdateInput): Promise<Article> {
        return prisma.article.update({ where: { id }, data })
    }

    /**
     * Delete article
     */
    async delete(id: string): Promise<Article> {
        return prisma.article.delete({ where: { id } })
    }

    /**
     * Increment view count
     */
    async incrementViews(id: string): Promise<Article> {
        return prisma.article.update({
            where: { id },
            data: { view_count: { increment: 1 } },
        })
    }

    /**
     * Increment likes count
     */
    async incrementLikes(id: string): Promise<Article> {
        return prisma.article.update({
            where: { id },
            data: { likes_count: { increment: 1 } },
        })
    }

    /**
     * Decrement likes count
     */
    async decrementLikes(id: string): Promise<Article> {
        return prisma.article.update({
            where: { id },
            data: { likes_count: { decrement: 1 } },
        })
    }

    /**
     * Create article version (snapshot)
     */
    async createVersion(articleId: string, memberId: string) {
        const article = await this.findById(articleId)
        if (!article) throw new Error('Article not found')

        const latestVersion = await prisma.articleVersion.findFirst({
            where: { article_id: articleId },
            orderBy: { version: 'desc' },
        })

        return prisma.articleVersion.create({
            data: {
                article_id: articleId,
                version: (latestVersion?.version || 0) + 1,
                title: article.title,
                content: article.content,
                summary: article.summary,
                created_by: memberId,
            },
        })
    }

    /**
     * Get article versions
     */
    async getVersions(articleId: string) {
        return prisma.articleVersion.findMany({
            where: { article_id: articleId },
            orderBy: { version: 'desc' },
        })
    }

    /**
     * Search articles by query
     */
    async search(query: string, tags?: string[], limit = 20) {
        return prisma.article.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { summary: { contains: query, mode: 'insensitive' } },
                    { content: { contains: query, mode: 'insensitive' } },
                ],
                tags: tags ? { hasSome: tags } : undefined,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        designation: true,
                        company_name: true,
                    },
                },
            },
            orderBy: { published_at: 'desc' },
            take: limit,
        })
    }

    /**
     * Check if slug exists for a member (excluding specific article)
     */
    async slugExists(slug: string, memberId: string, excludeId?: string): Promise<boolean> {
        const existing = await prisma.article.findFirst({
            where: {
                slug,
                member_id: memberId,
                id: excludeId ? { not: excludeId } : undefined,
            },
        })
        return !!existing
    }
}
