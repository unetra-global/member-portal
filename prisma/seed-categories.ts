import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting to seed categories and services...");

    // Define all categories and their services
    const categoriesData = [
        {
            name: "Direct tax",
            field: "Tax",
            services: [
                "Individual tax",
                "Corporate tax",
                "International tax",
                "M&A Tax",
                "Transfer pricing",
                "Tax Compliances",
                "Tax Litigation",
                "Estate & succession planning",
            ],
        },
        {
            name: "Indirect tax",
            field: "Tax",
            services: [
                "GST advisory",
                "GST compliances",
                "GST litigation",
                "Customs advisory",
                "Customs compliance",
                "Export/ import incentives",
                "GST Refund",
            ],
        },
        {
            name: "Corporate law",
            field: "Legal",
            services: [
                "Corporate law advisory",
                "Secretarial compliances",
                "Statutory mergers / amalgamations",
                "Advisory on exchange control laws",
                "Advisory on stock exchange/ listing regulations",
                "Incorporation / set up",
                "Bank account opening",
            ],
        },
        {
            name: "Accounting",
            field: "Finance",
            services: [
                "Book keeping services",
                "CFO Services",
                "Payroll compliances",
                "Management accounting (budgeting, costing)",
            ],
        },
        {
            name: "Audit & Assurance",
            field: "Finance",
            services: [
                "Statutory audit",
                "Internal audit/ risk management",
                "Accounting advisory",
                "System audit",
                "Due diligence",
                "Valuation services",
                "Forensic audit/ investigation",
            ],
        },
        {
            name: "Others",
            field: "Consulting",
            services: [
                "Strategic business planning & financial consulting",
                "Preparation of sustainability, CSR, ESG integrated reports",
                "Financial forecasting, capital allocation, investment analysis",
            ],
        },
        {
            name: "Legal services",
            field: "Legal",
            services: [
                "Alternative Dispute Resolution",
                "Intellectual property (IP) Laws",
                "Data Protection & IT Laws",
                "Employment / Labour laws / Social Security",
                "Insolvency and bankruptcy",
                "Immigration",
                "Sports, Media and Entertainment laws",
                "Aviation",
                "Capital Markets",
                "Competition Law",
                "Family Laws",
                "Inheritance Law & Succession Planning",
                "International Trade & Customs Law",
                "Mergers & Acquisition",
                "Real Estate",
                "Civil Laws",
                "Contractual Laws",
                "Notary",
                "Environmental / ESG compliance",
                "Exchange control regulations/ Foreign investments",
                "Corporate Laws",
                "Others << _______>> Members to fill",
            ],
        },
        {
            name: "Legal - Industries",
            field: "Legal",
            services: [
                "Aviation",
                "Banking & Finance",
                "Energy/ Mining",
                "Family Office / Wealth Management",
                "Finance & Lending",
                "Healthcare",
                "Government Affairs",
                "Infrastructure & public finance",
                "Maritime",
                "Media & Advertising",
                "Hospitality",
                "Real estate",
                "Securities/ Capital Market",
                "Sports & Entertainment",
                "Telecommunications",
                "Transportation & logistics",
                "Automobile",
                "Non Profit Organisation",
            ],
        },
    ];

    // Seed categories and services
    for (const categoryData of categoriesData) {
        console.log(`Processing category: ${categoryData.name}`);

        // Upsert category
        const category = await prisma.category.upsert({
            where: { name: categoryData.name },
            update: { field: categoryData.field },
            create: {
                name: categoryData.name,
                field: categoryData.field,
            },
        });

        console.log(`  ✓ Category created/updated: ${category.name}`);

        // Upsert services for this category
        for (const serviceName of categoryData.services) {
            await prisma.services.upsert({
                where: { name: serviceName },
                update: { category_id: category.id },
                create: {
                    name: serviceName,
                    category_id: category.id,
                },
            });
        }

        console.log(`  ✓ ${categoryData.services.length} services created/updated`);
    }

    // Count totals
    const totalCategories = await prisma.category.count();
    const totalServices = await prisma.services.count();

    console.log("\n✅ Seeding completed successfully!");
    console.log(`📊 Total categories: ${totalCategories}`);
    console.log(`📊 Total services: ${totalServices}`);
}

main()
    .catch((e) => {
        console.error("❌ Error during seeding:", e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
