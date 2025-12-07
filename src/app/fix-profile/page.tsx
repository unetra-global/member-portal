"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function FixProfilePage() {
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [results, setResults] = useState<any>(null)

    useEffect(() => {
        const runFixes = async () => {
            try {
                // Fix user_id
                const userIdFix = await fetch('/member-portal/api/fix-user-id', { method: 'POST' })
                const userIdResult = await userIdFix.json()

                // Set profile complete flag
                const profileFlagFix = await fetch('/member-portal/api/set-profile-complete', { method: 'POST' })
                const profileFlagResult = await profileFlagFix.json()

                setResults({
                    userIdFix: userIdResult,
                    profileFlagFix: profileFlagResult
                })

                if (userIdResult.success || profileFlagResult.success) {
                    setStatus('success')
                } else {
                    setStatus('error')
                }
            } catch (error) {
                console.error('Error running fixes:', error)
                setStatus('error')
                setResults({ error: (error as Error).message })
            }
        }

        runFixes()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                        {status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                        {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                        Profile Fix
                    </CardTitle>
                    <CardDescription>
                        {status === 'loading' && 'Fixing your profile...'}
                        {status === 'success' && 'Profile fixed successfully!'}
                        {status === 'error' && 'Something went wrong'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-600" />
                            <p className="mt-4 text-sm text-gray-600">Please wait...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h3 className="font-semibold text-green-900 mb-2">✓ Fixes Applied</h3>
                                <ul className="text-sm text-green-800 space-y-1">
                                    {results?.userIdFix?.success && (
                                        <li>• User ID updated to correct Supabase UUID</li>
                                    )}
                                    {results?.profileFlagFix?.success && (
                                        <li>• Profile completion flag set</li>
                                    )}
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={() => router.push('/dashboard')}
                                    className="w-full"
                                >
                                    Go to Dashboard
                                </Button>
                                <Button
                                    onClick={() => router.push('/profile/complete')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Try Profile Page
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="font-semibold text-red-900 mb-2">Error Details</h3>
                                <pre className="text-xs text-red-800 whitespace-pre-wrap">
                                    {JSON.stringify(results, null, 2)}
                                </pre>
                            </div>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                className="w-full"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
