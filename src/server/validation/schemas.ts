import { z } from "zod";

// Shared enums
export const MemberStatusEnum = z.enum(["active", "blocked"]);
export const TierEnum = z.enum(["user", "member", "admin", "ops"]);

// Member experience item within JSONB array
export const MemberExperienceItemSchema = z.object({
  company_name: z.string().min(1),
  company_linkedin_id: z.string().optional(),
  designation: z.string().min(1),
  firm_size: z.string().nullable().optional(),
  number_of_partners: z.number().int().min(0).nullable().optional(),
  from_date: z.coerce.date(),
  to_date: z.coerce.date().nullable().optional(),
});

export const MemberExperienceSchema = z.array(MemberExperienceItemSchema);

// Category
export const CategoryBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  field: z.string().min(1),
});

export const CategoryCreateSchema = CategoryBaseSchema.omit({ id: true });
export const CategoryUpdateSchema = CategoryBaseSchema.partial().extend({ id: z.string().uuid() });

// Services
export const ServicesBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  category_id: z.string().uuid().nullable().optional(),
});

export const ServicesCreateSchema = ServicesBaseSchema.omit({ id: true });
export const ServicesUpdateSchema = ServicesBaseSchema.partial().extend({ id: z.string().uuid() });

// Member
export const MemberBaseSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  phone_number: z.string().min(5),
  country: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  experience: MemberExperienceSchema,
  years_experience: z.number().int().min(0),
  join_reason: z.string().min(1),
  expectations: z.string().min(1),
  additional_info: z.string().min(1),
  detailed_profile: z.string().min(1),
  licenses: z.any().optional(),
  awards: z.any().optional(),
  uploaded_documents: z.array(z.string().min(1)),
  terms_accepted: z.boolean(),
  privacy_accepted: z.boolean(),
  linkedin_url: z.string().url().or(z.string().min(1)),
  extracted_from_linkedin: z.boolean(),
  member_status: MemberStatusEnum,
  tier: TierEnum,
  start_date: z.coerce.date(),
  end_date: z.coerce.date().nullable().optional(),
});

// Optional pivot payload when creating member by service name
export const MemberServiceByNameSchema = z.object({
  service_name: z.string().min(1),
  is_preferred: z.boolean(),
  is_active: z.boolean(),
  relevant_years_experience: z.number().int().min(0),
});

export const MemberCreateSchema = MemberBaseSchema.omit({ id: true }).extend({
  // Make user_id optional for POST requests from UI; server derives fallback
  user_id: z.string().min(1).optional(),
  member_services: z.array(MemberServiceByNameSchema).optional(),
});
export const MemberUpdateSchema = MemberBaseSchema.partial().extend({ id: z.string().uuid() });

// Member Service (pivot)
export const MemberServiceBaseSchema = z.object({
  id: z.string().uuid().optional(),
  member_id: z.string().uuid(),
  service_id: z.string().uuid(),
  is_preferred: z.boolean(),
  is_active: z.boolean(),
  relevant_years_experience: z.number().int().min(0),
});

export const MemberServiceCreateSchema = MemberServiceBaseSchema.omit({ id: true });
export const MemberServiceUpdateSchema = MemberServiceBaseSchema.partial().extend({ id: z.string().uuid() });

// Utility to parse and validate with standardized error messages
export function validate<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    const error = new Error(message);
    // Attach validation details for structured logging if needed
    (error as any).validation = parsed.error;
    throw error;
  }
  return parsed.data as z.infer<T>;
}