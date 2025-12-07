import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MembersService } from "@/server/services/membersService";

const service = new MembersService();

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log('[API /members/me] Auth check:', { hasUser: !!user, authError: authError?.message });

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log('[API /members/me] Querying member by user_id:', user.id);
        const member = await service.getByUserId(user.id);

        console.log('[API /members/me] Member lookup result:', { found: !!member, memberId: member?.id });

        if (!member) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json(member);
    } catch (error: any) {
        console.error("[API /members/me] Error fetching member profile:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
