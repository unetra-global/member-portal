import { prisma } from "@/lib/prisma";
import type { Category } from "@prisma/client";

export class CategoryRepository {
  async list(): Promise<Category[]> {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async create(data: Omit<Category, "id">): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Partial<Omit<Category, "id">>): Promise<Category> {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }
}