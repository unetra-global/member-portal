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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}