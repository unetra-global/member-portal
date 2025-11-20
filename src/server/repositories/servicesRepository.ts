import { prisma } from "@/lib/prisma";
import type { Services } from "@prisma/client";

export class ServicesRepository {
  async list(): Promise<Services[]> {
    return prisma.services.findMany({ orderBy: { name: "asc" }, include: { category: true } });
  }

  async findById(id: string): Promise<Services | null> {
    return prisma.services.findUnique({ where: { id }, include: { category: true } });
  }

  async findByName(name: string): Promise<Services | null> {
    return prisma.services.findUnique({ where: { name } });
  }

  async findManyByNames(names: string[]): Promise<Services[]> {
    return prisma.services.findMany({ where: { name: { in: names } } });
  }

  async create(data: Omit<Services, "id">): Promise<Services> {
    return prisma.services.create({ data });
  }

  async update(id: string, data: Partial<Omit<Services, "id">>): Promise<Services> {
    return prisma.services.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.services.delete({ where: { id } });
  }
}