'use client'

import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingPage } from "@/components/ui/loading"
import { LogOut, User } from "lucide-react"

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <LoadingPage text="Loading dashboard..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome back!
              </CardTitle>
              <CardDescription>
                You have successfully signed in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">User ID:</span> {user.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Last Sign In:</span>{" "}
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </p>
                {user.user_metadata?.provider && (
                  <p className="text-sm">
                    <span className="font-medium">Sign In Method:</span>{" "}
                    {user.user_metadata.provider === 'linkedin_oidc' ? 'LinkedIn' : user.user_metadata.provider}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Placeholder Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View your account analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total sessions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Configure
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>
                Get help and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}