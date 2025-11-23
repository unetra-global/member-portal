import { NextRequest, NextResponse } from "next/server";
import { MemberServicesService } from "@/server/services/memberServicesService";

const service = new MemberServicesService();

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await service.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    const msg = err.message ?? "Bad Request";
    const status = msg.includes("relation already exists") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}