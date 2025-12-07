import { MemberRepository } from "@/server/repositories/memberRepository";
import { ServicesRepository } from "@/server/repositories/servicesRepository";
import { MemberCreateSchema, MemberUpdateSchema, validate } from "@/server/validation/schemas";
import type { Member } from "@prisma/client";

export class MembersService {
  private repo = new MemberRepository();
  private servicesRepo = new ServicesRepository();

  list() {
    return this.repo.list();
  }

  get(id: string) {
    return this.repo.findById(id);
  }

  async create(payload: unknown): Promise<Member> {
    const data = validate(MemberCreateSchema, payload);

    // Check if member already exists by user_id (not email)
    const userId = (data as any).user_id ?? (data as any).email;
    const existing = await this.repo.findByUserId(userId);

    const { member_services, ...memberData } = data as any;
    const ensuredMemberData = {
      ...memberData,
      user_id: userId,
    };

    // If service names provided, resolve to IDs and create pivot rows atomically
    if (Array.isArray(member_services) && member_services.length > 0) {
      const names = member_services.map((s: any) => String(s.service_name).trim());
      const uniqueNames = Array.from(new Set(names));
      const services = await this.servicesRepo.findManyByNames(uniqueNames);

      const availableByName = new Map<string, string>();
      services.forEach((svc) => availableByName.set(svc.name, svc.id));

      const missing = uniqueNames.filter((n) => !availableByName.has(n));
      if (missing.length > 0) {
        // Create missing services on-the-fly to avoid blocking member creation
        const created = await Promise.all(missing.map((n) => this.servicesRepo.upsertByName(n)));
        created.forEach((svc) => availableByName.set(svc.name, svc.id));
      }

      const seenServiceIds = new Set<string>();
      const pivots = member_services
        .map((s: any) => ({
          service_id: availableByName.get(String(s.service_name).trim())!,
          is_preferred: Boolean(s.is_preferred),
          is_active: Boolean(s.is_active),
          relevant_years_experience: Number(s.relevant_years_experience),
        }))
        // Deduplicate repeated service names in the payload
        .filter((p) => {
          if (seenServiceIds.has(p.service_id)) return false;
          seenServiceIds.add(p.service_id);
          return true;
        });

      // If member exists, update it instead of creating
      if (existing) {
        // Update the member
        const updated = await this.repo.update(existing.id, ensuredMemberData as Partial<Omit<Member, "id">>);

        // Delete existing member_services and recreate them
        await this.repo.deleteMemberServices(existing.id);
        await this.repo.createMemberServices(existing.id, pivots);

        return updated;
      }

      return this.repo.createWithMemberServices(ensuredMemberData as Omit<Member, "id">, pivots);
    }

    // If member exists, update instead of create
    if (existing) {
      return this.repo.update(existing.id, ensuredMemberData as Partial<Omit<Member, "id">>);
    }

    // Fallback to simple member create if no services provided
    return this.repo.create(ensuredMemberData as Omit<Member, "id">);
  }

  async update(id: string, payload: unknown): Promise<Member> {
    const obj = typeof payload === "object" && payload !== null ? (payload as Record<string, unknown>) : {};
    const data = validate(MemberUpdateSchema, { ...obj, id });
    return this.repo.update(id, data as Partial<Omit<Member, "id">>);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}