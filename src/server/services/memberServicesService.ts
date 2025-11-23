import { MemberServiceRepository } from "@/server/repositories/memberServiceRepository";
import { MemberServiceCreateSchema, MemberServiceUpdateSchema, validate } from "@/server/validation/schemas";
import type { MemberService } from "@prisma/client";

export class MemberServicesService {
  private repo = new MemberServiceRepository();

  list() {
    return this.repo.list();
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(payload: unknown): Promise<MemberService> {
    const data = validate(MemberServiceCreateSchema, payload);
    // Ensure uniqueness of member-service pair
    const composite = await this.repo.findByComposite(data.member_id, data.service_id);
    if (composite) {
      throw new Error("member_id,service_id: relation already exists");
    }
    return this.repo.create(data as Omit<MemberService, "id">);
  }

  async update(id: string, payload: unknown): Promise<MemberService> {
    const obj = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
    const data = validate(MemberServiceUpdateSchema, { ...obj, id });
    return this.repo.update(id, data as Partial<Omit<MemberService, "id">>);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}