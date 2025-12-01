import { MemberRepository } from "@/server/repositories/memberRepository";
import { ServicesRepository } from "@/server/repositories/servicesRepository";
import { MemberCreateSchema, MemberUpdateSchema, validate } from "@/server/validation/schemas";
import { Member } from "@prisma/client";

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
    // Optional check to provide friendly error if email exists
    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new Error("email: already registered");
    }

    const { member_services, ...memberData } = data;

    // Transform Date objects in experience to strings for Prisma JSON compatibility
    const experience = memberData.experience?.map(exp => ({
      ...exp,
      from_date: exp.from_date.toISOString(),
      to_date: exp.to_date?.toISOString(),
    }));

    // user_id is optional in schema but required in DB. Fallback to email if not provided.
    const ensuredMemberData = {
      ...memberData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      experience: experience as any, // Cast to any to satisfy the strict JsonValue type expected by MemberRepository
      user_id: memberData.user_id ?? memberData.email,
      end_date: memberData.end_date ?? null,
    };

    // If service names provided, resolve to IDs and create pivot rows atomically
    if (member_services && member_services.length > 0) {
      const names = member_services.map((s) => s.service_name.trim());
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
        .map((s) => ({
          service_id: availableByName.get(s.service_name.trim())!,
          is_preferred: s.is_preferred,
          is_active: s.is_active,
          relevant_years_experience: s.relevant_years_experience,
        }))
        // Deduplicate repeated service names in the payload
        .filter((p) => {
          if (seenServiceIds.has(p.service_id)) return false;
          seenServiceIds.add(p.service_id);
          return true;
        });

      return this.repo.createWithMemberServices(ensuredMemberData, pivots);
    }

    // Fallback to simple member create if no services provided
    return this.repo.create(ensuredMemberData);
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