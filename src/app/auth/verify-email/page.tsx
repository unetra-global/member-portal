"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Account Created Successfully!
            </CardTitle>
            <CardDescription className="text-gray-600">
              Please check your email to verify your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">
                    Verification email sent
                  </p>
                  <p className="text-blue-700">
                    We&apos;ve sent a verification link to{" "}
                    {email ? (
                      <span className="font-medium">{email}</span>
                    ) : (
                      "your email address"
                    )}
                    . Click the link in the email to activate your account.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-medium">What&apos;s next?</p>
              <ul className="list-disc list-inside space-y-1 text-gray-500">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Return to sign in with your verified account</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </Button>

              <p className="text-xs text-center text-gray-500">
                Didn&apos;t receive the email?{" "}
                <button className="text-blue-600 hover:text-blue-500 font-medium">
                  Resend verification email
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help?{" "}
            <Link href="/support" className="text-blue-600 hover:text-blue-500 font-medium">
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}