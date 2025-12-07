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
    const body = await req.json();
    const created = await service.create(body);

    // Update Supabase Auth metadata to mark profile as completed
    try {
      const supabase = await createClient();
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