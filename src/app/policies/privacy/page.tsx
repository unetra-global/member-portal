"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            This is placeholder content for the Privacy Policy. Replace with your actual policy text.
          </p>
          <p>
            We collect information you provide in your profile to enable professional networking and matching. We do not sell your personal data.
          </p>
          <ul className="list-disc ml-5 space-y-2">
            <li>Data is processed to provide platform features and improve services.</li>
            <li>You may request access, correction, or deletion of your data.</li>
            <li>We use reasonable security measures to protect your information.</li>
            <li>Cookies may be used for authentication and session management.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            This example policy is for development preview purposes only.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}