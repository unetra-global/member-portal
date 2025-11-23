import { ServicesRepository } from "@/server/repositories/servicesRepository";
import { ServicesCreateSchema, ServicesUpdateSchema, validate } from "@/server/validation/schemas";
import type { Services } from "@prisma/client";

export class ServicesService {
  private repo = new ServicesRepository();

  list() {
    return this.repo.list();
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(payload: unknown): Promise<Services> {
    const data = validate(ServicesCreateSchema, payload);
    return this.repo.create(data as Omit<Services, "id">);
  }

  async update(id: string, payload: unknown): Promise<Services> {
    const obj = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
    const data = validate(ServicesUpdateSchema, { ...obj, id });
    return this.repo.update(id, data as Partial<Omit<Services, "id">>);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}