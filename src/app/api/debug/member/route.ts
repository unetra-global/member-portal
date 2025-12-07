import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Diagnostic endpoint to check member records
export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all members and check user_id matching
        const allMembers = await prisma.member.findMany({
            select: {
                id: true,
                user_id: true,
                email: true,
                first_name: true,
                last_name: true
            }
        });

        const currentUserId = user.id;
        const matchingMember = allMembers.find(m => m.user_id === currentUserId);

        return NextResponse.json({
            currentUserId,
            currentUserEmail: user.email,
            totalMembers: allMembers.length,
            matchingMember: matchingMember ? {
                id: matchingMember.id,
                user_id: matchingMember.user_id,
                email: matchingMember.email,
                name: `${matchingMember.first_name} ${matchingMember.last_name}`
            } : null,
            allMemberUserIds: allMembers.map(m => ({
                id: m.id,
                user_id: m.user_id,
                email: m.email
            }))
        });
    } catch (error: any) {
        console.error("[API /debug/member] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
