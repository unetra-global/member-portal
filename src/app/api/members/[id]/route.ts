import { NextRequest, NextResponse } from "next/server";
import { MembersService } from "@/server/services/membersService";

const service = new MembersService();

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const item = await service.get(params.id);
  if (!item) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await service.update(params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await service.delete(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}