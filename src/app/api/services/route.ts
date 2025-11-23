import { NextRequest, NextResponse } from "next/server";
import { ServicesService } from "@/server/services/servicesService";

const service = new ServicesService();

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
    return NextResponse.json({ error: err.message ?? "Bad Request" }, { status: 400 });
  }
}