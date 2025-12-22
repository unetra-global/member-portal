import { NextRequest, NextResponse } from "next/server"
import { ArticlesService } from "@/server/services/articlesService"
import { createClient } from "@/lib/supabase/server"

const service = new ArticlesService()

/**
 * GET /api/articles/[id]/versions
 * Get article version history
 */
export async function GET(
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

        const versions = await service.getVersions(id, member.id)

        return NextResponse.json(versions)
    } catch (error: any) {
        console.error("Error fetching versions:", error)

        if (error.message?.includes('Unauthorized')) {
            return NextResponse.json(
                { error: error.message },
                { status: 403 }
            )
        }

        return NextResponse.json(
            { error: error.message || "Failed to fetch versions" },
            { status: 500 }
        )
    }
}
