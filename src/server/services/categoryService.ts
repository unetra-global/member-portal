import { CategoryRepository } from "@/server/repositories/categoryRepository";
import { CategoryCreateSchema, CategoryUpdateSchema, validate } from "@/server/validation/schemas";
import type { Category } from "@prisma/client";

export class CategoryService {
  private repo = new CategoryRepository();

  list() {
    return this.repo.list();
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(payload: unknown): Promise<Category> {
    const data = validate(CategoryCreateSchema, payload);
    return this.repo.create(data as Omit<Category, "id">);
  }

  async update(id: string, payload: unknown): Promise<Category> {
    const obj = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
    const data = validate(CategoryUpdateSchema, { ...obj, id });
    return this.repo.update(id, data as Partial<Omit<Category, "id">>);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}