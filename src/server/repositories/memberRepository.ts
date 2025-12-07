import { prisma } from "@/lib/prisma";
import type { Member, Prisma } from "@prisma/client";

export class MemberRepository {
  async list(): Promise<Member[]> {
    return prisma.member.findMany({ orderBy: { last_name: "asc" } });
  }

  async findById(id: string): Promise<Member | null> {
    return prisma.member.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Member | null> {
    return prisma.member.findUnique({ where: { email } });
  }

  async create(data: Omit<Member, "id">): Promise<Member> {
    const createData: Prisma.MemberUncheckedCreateInput = {
      ...data,
      // Cast JSON to InputJsonValue to satisfy Prisma input types
      experience: data.experience as Prisma.InputJsonValue,
      licenses: data.licenses as Prisma.InputJsonValue,
      awards: data.awards as Prisma.InputJsonValue,
    };
    return prisma.member.create({ data: createData });
  }

  async createWithMemberServices(
    data: Omit<Member, "id">,
    pivots: Array<{ service_id: string; is_preferred: boolean; is_active: boolean; relevant_years_experience: number }>
  ): Promise<Member> {
    const createData: Prisma.MemberUncheckedCreateInput = {
      ...data,
      experience: data.experience as Prisma.InputJsonValue,
      licenses: data.licenses as Prisma.InputJsonValue,
      awards: data.awards as Prisma.InputJsonValue,
      services: { create: pivots },
    };
    return prisma.member.create({ data: createData });
  }

  async update(id: string, data: Partial<Omit<Member, "id">>): Promise<Member> {
    const { experience, licenses, awards, ...rest } = data;
    const updateData: Prisma.MemberUncheckedUpdateInput = {
      ...rest,
      ...(experience !== undefined ? { experience: experience as Prisma.InputJsonValue } : {}),
      ...(licenses !== undefined ? { licenses: licenses as Prisma.InputJsonValue } : {}),
      ...(awards !== undefined ? { awards: awards as Prisma.InputJsonValue } : {}),
    } as Prisma.MemberUncheckedUpdateInput;
    return prisma.member.update({ where: { id }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    await prisma.member.delete({ where: { id } });
  }
}