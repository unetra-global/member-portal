import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// One-time fix to set profile_completed flag for existing users
export async function POST() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update auth metadata
        const { data, error } = await supabase.auth.updateUser({
            data: {
                profile_completed: true,
                profile_completed_at: new Date().toISOString()
            }
        });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Profile completion flag set",
            user: {
                id: user.id,
                email: user.email,
                profile_completed: true
            }
        });
    } catch (error: any) {
        console.error("[API /set-profile-complete] Error:", error);
        return NextResponse.json(
            { error: "Internal server error", details: error.message },
            { status: 500 }
        );
    }
}
