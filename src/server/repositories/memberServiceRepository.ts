import { prisma } from "@/lib/prisma";
import type { MemberService } from "@prisma/client";

export class MemberServiceRepository {
  async list(): Promise<MemberService[]> {
    return prisma.memberService.findMany({ include: { member: true, service: true } });
  }

  async findById(id: string): Promise<MemberService | null> {
    return prisma.memberService.findUnique({ where: { id }, include: { member: true, service: true } });
  }

  async findByComposite(member_id: string, service_id: string): Promise<MemberService | null> {
    return prisma.memberService.findUnique({
      where: { member_id_service_id: { member_id, service_id } },
    });
  }

  async create(data: Omit<MemberService, "id">): Promise<MemberService> {
    return prisma.memberService.create({ data });
  }

  async update(id: string, data: Partial<Omit<MemberService, "id">>): Promise<MemberService> {
    return prisma.memberService.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.memberService.delete({ where: { id } });
  }
}