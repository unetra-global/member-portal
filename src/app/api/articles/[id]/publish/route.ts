import { NextRequest, NextResponse } from "next/server"
import { ArticlesService } from "@/server/services/articlesService"
import { createClient } from "@/lib/supabase/server"

const service = new ArticlesService()

/**
 * POST /api/articles/[id]/publish
 * Publish an article
 */
export async function POST(
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

        const updated = await service.publish(id, member.id)

        return NextResponse.json(updated)
    } catch (error: any) {
        console.error("Error publishing article:", error)

        if (error.message?.includes('Unauthorized')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }

        if (error.validation) {
            return NextResponse.json(
                { error: "Article does not meet publishing requirements", details: error.validation },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to publish article" },
            { status: 500 }
        )
    }
}
