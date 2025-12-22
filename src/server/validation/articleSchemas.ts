/**
 * Article Validation Schemas
 * Validation rules for Article feature using Zod
 */

import { z } from 'zod'

// Predefined tags for finance/tax domain
export const ARTICLE_TAGS = [
    'GST',
    'Income Tax',
    'Corporate Tax',
    'Audit',
    'Compliance',
    'Financial Planning',
    'Investment',
    'Accounting',
    'IFRS',
    'Tax Planning',
    'Direct Tax',
    'Indirect Tax',
    'TDS',
    'TCS',
    'Budget',
    'Finance Act',
    'Case Law',
    'Regulatory Updates',
    'Taxation',
    'Financial Reporting',
] as const

export const ArticleStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW'])

export type ArticleStatus = z.infer<typeof ArticleStatusEnum>

// Utility: Calculate reading time (avg 200 words/min)
export function calculateReadingTime(content: string): number {
    const wordCount = calculateWordCount(content)
    return Math.max(1, Math.ceil(wordCount / 200))
}

// Utility: Calculate word count
export function calculateWordCount(content: string): number {
    if (!content || typeof content !== 'string') return 0
    return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Utility: Generate slug from title
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 200)
}

// Create Article Schema
export const ArticleCreateSchema = z.object({
    title: z.string()
        .min(10, 'Title must be at least 10 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),

    subtitle: z.string()
        .max(300, 'Subtitle must not exceed 300 characters')
        .optional()
        .nullable(),

    summary: z.string()
        .min(50, 'Summary must be at least 50 characters')
        .max(500, 'Summary must not exceed 500 characters')
        .trim(),

    content: z.string()
        .min(100, 'Content is required')
        .refine(
            (content) => calculateWordCount(content) >= 800,
            'Article must contain at least 800 words'
        ),

    cover_image: z.string().optional().nullable(),

    tags: z.array(z.string())
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum 5 tags allowed')
        .refine(
            (tags) => tags.every(tag => ARTICLE_TAGS.includes(tag as any)),
            'Invalid tag selected'
        ),

    status: ArticleStatusEnum.default('DRAFT'),
})

// Update Article Schema (all fields optional)
export const ArticleUpdateSchema = z.object({
    title: z.string()
        .min(10, 'Title must be at least 10 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim()
        .optional(),

    subtitle: z.string()
        .max(300, 'Subtitle must not exceed 300 characters')
        .optional()
        .nullable(),

    summary: z.string()
        .min(50, 'Summary must be at least 50 characters')
        .max(500, 'Summary must not exceed 500 characters')
        .trim()
        .optional(),

    content: z.string()
        .min(100, 'Content is required')
        .refine(
            (content) => calculateWordCount(content) >= 800,
            'Article must contain at least 800 words'
        )
        .optional(),

    cover_image: z.string().optional().nullable(),

    tags: z.array(z.string())
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum 5 tags allowed')
        .optional(),

    status: ArticleStatusEnum.optional(),
})

// Publish Article Schema (strict validation)
export const ArticlePublishSchema = z.object({
    title: z.string().min(10).max(200),
    summary: z.string().min(50).max(500),
    content: z.string().refine(
        (content) => calculateWordCount(content) >= 800,
        'Published articles must contain at least 800 words'
    ),
    tags: z.array(z.string()).min(1),
})

// Validation helper (reuse existing pattern)
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const parsed = schema.safeParse(data)
    if (!parsed.success) {
        const error = new Error('Validation failed')
            ; (error as any).validation = parsed.error
        throw error
    }
    return parsed.data
}

// Export types
export type ArticleCreateInput = z.infer<typeof ArticleCreateSchema>
export type ArticleUpdateInput = z.infer<typeof ArticleUpdateSchema>
