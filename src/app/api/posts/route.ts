import { NextRequest, NextResponse } from "next/server";
import { PostsService } from "@/server/services/postsService";
import { createClient } from "@/lib/supabase/server";

const service = new PostsService();

export async function GET() {
    const data = await service.list();
    return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
    try {
        // Get authenticated user from Supabase
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Get member_id from user_id
        const memberResponse = await fetch(`${req.nextUrl.origin}/member-portal/api/members/me`, {
            headers: {
                cookie: req.headers.get('cookie') || ''
            }
        });

        if (!memberResponse.ok) {
            return NextResponse.json(
                { error: "Member profile not found" },
                { status: 404 }
            );
        }

        const member = await memberResponse.json();

        // Create post with authenticated member's ID
        const postData = {
            member_id: member.id,
            content: body.content,
            image_data: body.image_data,
            post_type: body.post_type || "post"
        };

        const created = await service.create(postData);

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        console.error("Error creating post:", error);
        return NextResponse.json(
            { error: "Failed to create post" },
            { status: 500 }
        );
    }
}
