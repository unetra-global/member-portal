import { NextRequest, NextResponse } from "next/server"
import { ArticlesService } from "@/server/services/articlesService"
import { createClient } from "@/lib/supabase/server"

const service = new ArticlesService()

/**
 * GET /api/articles
 * List all published articles (or filtered)
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const status = searchParams.get('status') as any
        const tags = searchParams.get('tags')?.split(',')
        const memberId = searchParams.get('memberId')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

        const articles = await service.list({
            status: status || 'PUBLISHED',
            tags,
            memberId: memberId || undefined,
            limit,
            offset,
        })

        return NextResponse.json(articles)
    } catch (error) {
        console.error('Error listing articles:', error)
        return NextResponse.json(
            { error: 'Failed to fetch articles' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/articles
 * Create new article
 */
export async function POST(req: NextRequest) {
    try {
        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            )
        }

        const body = await req.json()

        // Get member_id from user_id
        const memberResponse = await fetch(`${req.nextUrl.origin}/member-portal/api/members/me`, {
            headers: {
                cookie: req.headers.get('cookie') || ''
            }
        })

        if (!memberResponse.ok) {
            return NextResponse.json(
                { error: "Member profile not found" },
                { status: 404 }
            )
        }

        const member = await memberResponse.json()

        // Create article
        const articleData = {
            member_id: member.id,
            title: body.title,
            subtitle: body.subtitle,
            summary: body.summary,
            content: body.content,
            cover_image: body.cover_image,
            tags: body.tags,
            status: body.status || 'DRAFT',
        }

        const created = await service.create(articleData)

        return NextResponse.json(created, { status: 201 })
    } catch (error: any) {
        console.error("Error creating article:", error)

        // Handle validation errors
        if (error.validation) {
            return NextResponse.json(
                { error: "Validation failed", details: error.validation },
                { status: 400 }
            )
        }

        // Handle rate limit errors
        if (error.message?.includes('Rate limit')) {
            return NextResponse.json(
                { error: error.message },
                { status: 429 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to create article" },
            { status: 500 }
        )
    }
}
