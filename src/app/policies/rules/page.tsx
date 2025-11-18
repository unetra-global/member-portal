"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RulesPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rules & Regulations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This is placeholder content for Rules & Regulations. Replace with your actual policy text.
          </p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Members must provide accurate information and keep their profile updated.</li>
            <li>Respect confidentiality and avoid sharing sensitive client data.</li>
            <li>Follow all applicable laws and professional standards.</li>
            <li>Use the platform responsibly; avoid spam or abusive behavior.</li>
            <li>Violations may result in suspension or termination of access.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            These are example rules intended for development preview. Customize as needed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}