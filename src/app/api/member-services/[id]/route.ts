import { NextRequest, NextResponse } from "next/server";
import { MemberServicesService } from "@/server/services/memberServicesService";

const service = new MemberServicesService();

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await service.get(id);
  if (!item) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const { id } = await params;
    const updated = await service.update(id, body);
    return NextResponse.json(updated);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.delete(id);
    return NextResponse.json({ ok: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}