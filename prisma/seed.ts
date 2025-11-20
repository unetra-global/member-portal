import { PrismaClient } from "@prisma/client";
import type { Category, Services } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed categories
  const categories: Category[] = await Promise.all([
    prisma.category.upsert({
      where: { name: "Tax Advisory" },
      update: {},
      create: { name: "Tax Advisory", field: "Professional Services" },
    }),
    prisma.category.upsert({
      where: { name: "Audit" },
      update: {},
      create: { name: "Audit", field: "Professional Services" },
    }),
    prisma.category.upsert({
      where: { name: "Legal" },
      update: {},
      create: { name: "Legal", field: "Professional Services" },
    }),
  ]);

  // Seed services linked to categories
  const taxAdvisory = categories.find((c: Category) => c.name === "Tax Advisory");
  const audit = categories.find((c: Category) => c.name === "Audit");
  const legal = categories.find((c: Category) => c.name === "Legal");

  const services: Services[] = await Promise.all([
    prisma.services.upsert({
      where: { name: "Corporate Tax" },
      update: {},
      create: { name: "Corporate Tax", category_id: taxAdvisory?.id ?? null },
    }),
    prisma.services.upsert({
      where: { name: "Indirect Tax" },
      update: {},
      create: { name: "Indirect Tax", category_id: taxAdvisory?.id ?? null },
    }),
    prisma.services.upsert({
      where: { name: "Financial Audit" },
      update: {},
      create: { name: "Financial Audit", category_id: audit?.id ?? null },
    }),
    prisma.services.upsert({
      where: { name: "M&A Legal" },
      update: {},
      create: { name: "M&A Legal", category_id: legal?.id ?? null },
    }),
  ]);

  // Seed a demo member
  const demoMember = await prisma.member.upsert({
    where: { email: "demo.member@unetra.global" },
    update: {},
    create: {
      user_id: "demo_user_1",
      first_name: "Demo",
      last_name: "Member",
      email: "demo.member@unetra.global",
      phone_number: "+1-555-0100",
      country: "USA",
      state: "CA",
      city: "San Francisco",
      address: "123 Market St",
      experience: [
        {
          company_name: "Acme Corp",
          company_linkedin_id: "acme-corp",
          designation: "Senior Consultant",
          firm_size: "500+",
          number_of_partners: 12,
          from_date: new Date("2019-01-01"),
          to_date: new Date("2022-12-31"),
        },
        {
          company_name: "Globex",
          company_linkedin_id: "globex",
          designation: "Manager",
          firm_size: "200+",
          number_of_partners: 6,
          from_date: new Date("2023-01-01"),
          to_date: null,
        },
      ],
      years_experience: 6,
      join_reason: "Networking and growth",
      expectations: "Collaborate on global projects",
      additional_info: "Available for part-time consulting",
      detailed_profile: "Experienced in tax advisory and audit.",
      uploaded_documents: ["resume.pdf", "cover_letter.pdf"],
      terms_accepted: true,
      privacy_accepted: true,
      linkedin_url: "https://www.linkedin.com/in/demo-member",
      extracted_from_linkedin: true,
      member_status: "active",
      tier: "member",
      start_date: new Date(),
      end_date: null,
    },
  });

  // Link demo member to a service
  const auditService = services.find((s: Services) => s.name === "Financial Audit");
  if (auditService) {
    await prisma.memberService.upsert({
      where: {
        member_id_service_id: { member_id: demoMember.id, service_id: auditService.id },
      },
      update: {},
      create: {
        member_id: demoMember.id,
        service_id: auditService.id,
        is_preferred: true,
        is_active: true,
        relevant_years_experience: 3,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });