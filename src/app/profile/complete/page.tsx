"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingPage } from "@/components/ui/loading"
import { Loader2, User, Building, MapPin, Phone, Globe, Linkedin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileData {
  firstName: string
  lastName: string
  company: string
  jobTitle: string
  location: string
  phone: string
  website: string
  bio: string
  linkedinUrl: string
}

export default function CompleteProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    company: "",
    jobTitle: "",
    location: "",
    phone: "",
    website: "",
    bio: "",
    linkedinUrl: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleLinkedInAutoFill = async () => {
    if (!user?.email || !user?.id) {
      return
    }

    setIsLinkedInLoading(true)
    try {
      const response = await fetch('/api/linkedin/fetch-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id
        })
      })

      if (response.ok) {
        const linkedinData = await response.json()
        
        // Only update fields that are not already filled
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || linkedinData.firstName || '',
          lastName: prev.lastName || linkedinData.lastName || '',
          company: prev.company || linkedinData.company || '',
          jobTitle: prev.jobTitle || linkedinData.jobTitle || '',
          location: prev.location || linkedinData.location || '',
          bio: prev.bio || linkedinData.bio || '',
          linkedinUrl: prev.linkedinUrl || linkedinData.linkedinUrl || ''
        }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch LinkedIn data')
      }
    } catch (error) {
      console.error('LinkedIn auto-fill error:', error)
    } finally {
      setIsLinkedInLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return <LoadingPage text="Loading profile setup..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
              <User className="h-6 w-6" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              Help us personalize your experience by completing your profile information
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* LinkedIn Auto-fill Section */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#0966c2' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Linkedin className="h-5 w-5 text-white" />
                  <div>
                    <h3 className="font-medium text-white">
                      Auto-fill from LinkedIn
                    </h3>
                    <p className="text-sm text-blue-100">
                      We can fetch your professional information from LinkedIn
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleLinkedInAutoFill}
                  disabled={isLinkedInLoading}
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-[#0966c2] bg-transparent"
                >
                  {isLinkedInLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Import from LinkedIn'
                  )}
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="jobTitle" className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Job Title *
                  </label>
                  <Input
                    id="jobTitle"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    className={errors.jobTitle ? "border-destructive" : ""}
                    disabled={isLoading}
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-destructive">{errors.jobTitle}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">
                    Company
                  </label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Enter your company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="linkedinUrl" className="text-sm font-medium flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </label>
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("bio", e.target.value)}
                  disabled={isLoading}
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-black text-white hover:bg-gray-800 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    'Complete Profile'
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}