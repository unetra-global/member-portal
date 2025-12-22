import { NextRequest, NextResponse } from "next/server"
import { ArticlesService } from "@/server/services/articlesService"
import { createClient } from "@/lib/supabase/server"

const service = new ArticlesService()

/**
 * GET /api/articles/[id]
 * Get article by ID
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const article = await service.get(id)

        if (!article) {
            return NextResponse.json(
                { error: "Article not found" },
                { status: 404 }
            )
        }

        return NextResponse.json(article)
    } catch (error) {
        console.error("Error fetching article:", error)
        return NextResponse.json(
            { error: "Failed to fetch article" },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/articles/[id]
 * Update article
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get member_id
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
        const body = await req.json()

        // Handle special actions
        if (body.action === 'like') {
            const updated = await service.incrementLikes(id)
            return NextResponse.json(updated)
        }

        if (body.action === 'unlike') {
            const updated = await service.decrementLikes(id)
            return NextResponse.json(updated)
        }

        // Regular update
        const updated = await service.update(id, member.id, body)
        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("Error updating article:", error)

        if (error.message?.includes('Unauthorized')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }

        if (error.validation) {
            return NextResponse.json(
                { error: "Validation failed", details: error.validation },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to update article" },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/articles/[id]
 * Delete article
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        // Get authenticated user
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        // Get member_id
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

        // Check if admin (tier === 'admin')
        const isAdmin = member.tier === 'admin'

        await service.delete(id, member.id, isAdmin)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error deleting article:", error)

        if (error.message?.includes('Unauthorized')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to delete article" },
            { status: 500 }
        )
    }
}
