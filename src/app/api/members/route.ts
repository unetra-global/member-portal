import { NextRequest, NextResponse } from "next/server";
import { MembersService } from "@/server/services/membersService";
import { createClient } from "@/lib/supabase/server";

const service = new MembersService();

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("User data:", user);
    console.log("Auth error:", authError);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Ensure user_id is set to the authenticated user's ID from Supabase Auth
    const memberData = {
      ...body,
      user_id: user.id, // Always use the authenticated user's ID
      email: body.email || user.email, // Fallback to auth email if not provided
    };

    console.log("Member data:", memberData);

    const created = await service.create(memberData);

    // Update Supabase Auth metadata to mark profile as completed
    try {
      await supabase.auth.updateUser({
        data: {
          profile_completed: true,
          profile_completed_at: new Date().toISOString()
        }
      });
    } catch (metadataError) {
      console.error('Failed to update auth metadata:', metadataError);
      // Don't fail the request if metadata update fails
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const msg = err.message ?? "Bad Request";
    const status = msg.includes("already registered") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}