import { NextRequest, NextResponse } from "next/server"
import { ArticlesService } from "@/server/services/articlesService"

const service = new ArticlesService()

/**
 * GET /api/articles/search
 * Search articles by query and tags
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl
        const query = searchParams.get('q') || ''
        const tags = searchParams.get('tags')?.split(',').filter(Boolean)

        if (!query && !tags?.length) {
            return NextResponse.json(
                { error: "Query or tags required" },
                { status: 400 }
            )
        }

        const articles = await service.search(query, tags)

        return NextResponse.json(articles)
    } catch (error) {
        console.error("Error searching articles:", error)
        return NextResponse.json(
            { error: "Failed to search articles" },
            { status: 500 }
        )
    }
}
