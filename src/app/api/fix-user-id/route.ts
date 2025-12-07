import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Fix user_id for members that have email instead of UUID
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Find member by email where user_id is the email (not a UUID)
        const member = await prisma.member.findFirst({
            where: {
                email: user.email!,
                user_id: user.email! // Old incorrect value
            }
        });

        if (!member) {
            return NextResponse.json({
                error: "No member found with email as user_id",
                hint: "Your member record might already be correct"
            }, { status: 404 });
        }

        // Update user_id to the correct Supabase UUID
        const updated = await prisma.member.update({
            where: { id: member.id },
            data: { user_id: user.id }
        });

        return NextResponse.json({
            success: true,
            message: "Fixed user_id",
            before: { user_id: member.user_id },
            after: { user_id: updated.user_id },
            memberId: updated.id
        });
    } catch (error: any) {
        console.error("[API /fix-user-id] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
