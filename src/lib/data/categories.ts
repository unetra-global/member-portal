export type SubCategory = {
  name: string
}

export type CategoryMap = Record<string, SubCategory[]>

// Seed categories and related subcategories. Adjust as needed for your domain.
export const categories: CategoryMap = {
  "Litigation": [
    { name: "Civil Litigation" },
    { name: "Criminal Litigation" },
    { name: "Arbitration" },
    { name: "Consumer Disputes" },
    { name: "Labour & Employment" }
  ],
  "Corporate": [
    { name: "M&A" },
    { name: "Private Equity" },
    { name: "General Corporate" },
    { name: "Contracts" },
    { name: "Compliance" }
  ],
  "Tax": [
    { name: "Direct Tax" },
    { name: "Indirect Tax (GST)" },
    { name: "Transfer Pricing" },
    { name: "Tax Litigation" }
  ],
  "Intellectual Property": [
    { name: "Trademarks" },
    { name: "Patents" },
    { name: "Copyright" },
    { name: "Designs" }
  ],
  "Real Estate": [
    { name: "Property Due Diligence" },
    { name: "Title Verification" },
    { name: "Leases & Licenses" },
    { name: "RERA" }
  ],
}