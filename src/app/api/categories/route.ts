import { NextRequest, NextResponse } from "next/server";
import { CategoryService } from "@/server/services/categoryService";

const service = new CategoryService();

export async function GET() {
  const data = await service.list();
  return NextResponse.json(data); // test commit 
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