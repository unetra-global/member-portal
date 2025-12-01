"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LinkedInButton } from "@/components/auth/linkedin-button"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("signin")
  const [showEmailAuth, setShowEmailAuth] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router, supabase.auth])

  const handleAuthSuccess = async () => {
    setError(null)
    setSuccess("Authentication successful! Redirecting...")

    // Check if user has completed their profile
    const { data: { user } } = await supabase.auth.getUser()
    const redirectPath = user?.user_metadata?.profile_completed ? '/dashboard' : '/profile/complete'

    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)
  }

  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage)
    setSuccess(null)
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {activeTab === "signin" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "signin"
                ? "Choose your preferred sign-in method"
                : "Choose how you'd like to create your account"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {success}
              </div>
            )}

            {/* Tab Selection */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 mt-4">
                {/* LinkedIn Sign In */}
                <LinkedInButton />

                {/* Email Auth Toggle */}
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowEmailAuth(!showEmailAuth)}
                >
                  Continue with Email
                  {showEmailAuth ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Email Sign In Form */}
                {showEmailAuth && (
                  <SignInForm
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                  />
                )}
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-4">
                {/* LinkedIn Sign Up */}
                <LinkedInButton />

                {/* Email Auth Toggle */}
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setShowEmailAuth(!showEmailAuth)}
                >
                  Create with Email
                  {showEmailAuth ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>

                {/* Email Sign Up Form */}
                {showEmailAuth && (
                  <SignUpForm
                    onSuccess={handleAuthSuccess}
                    onError={handleAuthError}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <a href="#" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}