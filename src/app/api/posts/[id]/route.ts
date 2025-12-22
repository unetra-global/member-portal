import { NextRequest, NextResponse } from "next/server";
import { PostsService } from "@/server/services/postsService";
import { createClient } from "@/lib/supabase/server";

const service = new PostsService();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const post = await service.get(id);

    if (!post) {
        return NextResponse.json(
            { error: "Post not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(post);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Handle like/repost actions
        if (body.action === "like") {
            try {
                const updated = await service.incrementLikes(id);
                return NextResponse.json(updated);
            } catch (error) {
                console.error("Error incrementing likes:", error);
                console.error("Post ID:", id);
                console.error("Error details:", JSON.stringify(error, null, 2));
                return NextResponse.json(
                    { error: "Failed to increment likes", details: error instanceof Error ? error.message : String(error) },
                    { status: 500 }
                );
            }
        }

        if (body.action === "unlike") {
            try {
                const updated = await service.decrementLikes(id);
                return NextResponse.json(updated);
            } catch (error) {
                console.error("Error decrementing likes:", error);
                return NextResponse.json(
                    { error: "Failed to decrement likes", details: error instanceof Error ? error.message : String(error) },
                    { status: 500 }
                );
            }
        }

        if (body.action === "repost") {
            const updated = await service.incrementReposts(id);
            return NextResponse.json(updated);
        }

        // Regular update
        const updated = await service.update(id, body);
        return NextResponse.json(updated);
    } catch (error) {
        console.error("Error updating post:", error);
        return NextResponse.json(
            { error: "Failed to update post" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // TODO: Check if user owns the post before deleting
        await service.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting post:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
}
