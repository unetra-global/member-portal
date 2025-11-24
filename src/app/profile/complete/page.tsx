"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SearchableSelect, type Option } from "@/components/ui/searchable-select"
import { LoadingPage } from "@/components/ui/loading"
import { Loader2, User, Building, MapPin, Phone, Globe, Linkedin, FileText, Award, BadgeCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Country, State, City } from "country-state-city"
import { fallbackPhoneCodes } from "@/lib/data/phoneCodes"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const countryCodesList: any = require("country-codes-list")

// Frontend/Backend integration via environment base URL (optional for same-origin dev)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

interface ExperienceItem {
  title: string
  company: string
  startDate?: string
  endDate?: string
  description?: string
  firmSize?: string
  numPartners?: number
}

interface LicenseItem {
  name: string
  issuer?: string
  issueDate?: string
  credentialId?: string
}

interface AwardItem {
  title: string
  date?: string
  description?: string
}

interface ProfileData {
  firstName: string
  lastName: string
  emailComm: string
  phoneWhatsapp: string
  whatsappCountryCode?: string
  address: string
  city: string
  state: string
  country: string
  category: string
  subCategory: string
  subCategories?: { name: string; years: string; mandatory: boolean }[]
  yearsExperience: string
  yearsRelevantExperience: string
  linkedinUrl: string
  detailedProfileText: string
  resumeUrl: string
  experiences: ExperienceItem[]
  licenses: LicenseItem[]
  awards: AwardItem[]
  organisationName: string
  designation: string
  firmSize: string
  numPartners: string
  currentOrgFromDate?: string
  currentOrgToDate?: string
  whyJoin: string
  expectations: string
  anythingElse: string
  documents: string[]
  acceptedRules: boolean
  acceptedPrivacy: boolean
}

export default function CompleteProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    emailComm: "",
    phoneWhatsapp: "",
    whatsappCountryCode: "",
    address: "",
    city: "",
    state: "",
    country: "",
    category: "",
    subCategory: "",
    subCategories: [],
    yearsExperience: "",
    yearsRelevantExperience: "",
    linkedinUrl: "",
    detailedProfileText: "",
    resumeUrl: "",
    experiences: [],
    licenses: [],
    awards: [],
    organisationName: "",
    designation: "",
    firmSize: "",
    numPartners: "",
    currentOrgFromDate: "",
    currentOrgToDate: "",
    whyJoin: "",
    expectations: "",
    anythingElse: "",
    documents: [],
    acceptedRules: false,
    acceptedPrivacy: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const supabase = createClient()

  // Location dropdown data
  const [countries, setCountries] = useState<Array<{ name: string; isoCode: string }>>([])
  const [states, setStates] = useState<Array<{ name: string; isoCode: string }>>([])
  const [cities, setCities] = useState<Array<{ name: string }>>([])
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("")
  const [selectedStateCode, setSelectedStateCode] = useState<string>("")

  // Phone codes
  const [phoneCodes, setPhoneCodes] = useState<Array<{ code: string; dial: string; label: string }>>([])
  const [isLinkedInConsent, setIsLinkedInConsent] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Dynamic categories and sub-categories from API
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([])
  const [availableSubCategories, setAvailableSubCategories] = useState<Array<{ name: string }>>([])

  // Subcategory selection
  const [selectedSubCategories, setSelectedSubCategories] = useState<Array<{ name: string; years: string; mandatory: boolean }>>([])

  // File inputs refs for custom buttons
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const docsInputRef = useRef<HTMLInputElement>(null)

  // Draft previous organization entry for Save flow
  const [newExperience, setNewExperience] = useState<ExperienceItem>({
    title: "",
    company: "",
    startDate: "",
    endDate: "",
    description: "",
    firmSize: "",
    numPartners: 0,
  })
  const [showNewExperienceForm, setShowNewExperienceForm] = useState<boolean>(false)

  // Ensure draft form is visible when there are no previous organizations
  useEffect(() => {
    if (formData.experiences.length === 0 && !showNewExperienceForm) {
      setShowNewExperienceForm(true)
    }
  }, [formData.experiences.length, showNewExperienceForm])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Initialize countries and phone codes
  useEffect(() => {
    try {
      const csCountries = Country.getAllCountries() || []
      setCountries(csCountries.map((c: any) => ({ name: c.name, isoCode: c.isoCode })))

      // Prefer phone codes from country-state-city dataset for reliability
      const codes = csCountries
        .map((c: any) => ({ code: c.isoCode, dial: c.phonecode ? `+${c.phonecode}` : '', label: c.phonecode ? `${c.name} (+${c.phonecode})` : c.name }))
        .filter((pc: any) => pc.dial && pc.dial !== '+')
        .sort((a: any, b: any) => a.label.localeCompare(b.label))
      if (codes.length) {
        setPhoneCodes(codes)
      } else {
        // Fallback to bundled minimal list
        setPhoneCodes(fallbackPhoneCodes)
      }
    } catch {
      // Final fallback
      setPhoneCodes(fallbackPhoneCodes)
    }
  }, [])

  // Helper: convert ISO country code to emoji flag
  const codeToFlagEmoji = (iso2?: string) => {
    if (!iso2) return ""
    const code = iso2.toUpperCase()
    if (code.length !== 2) return ""
    const points = Array.from(code).map(c => 127397 + c.charCodeAt(0))
    try {
      return String.fromCodePoint(...points)
    } catch {
      return ""
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    // Special rule: allow only ONE "Present" across current org and experiences
    if (field === 'currentOrgToDate' && value === 'Present') {
      setFormData(prev => ({
        ...prev,
        currentOrgToDate: 'Present',
        experiences: (prev.experiences || []).map(exp => exp.endDate === 'Present' ? { ...exp, endDate: '' } : exp),
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  // Country/State/City handlers
  const handleCountrySelect = (value: string) => {
    const country = countries.find(c => c.isoCode === value)
    setSelectedCountryCode(value)
    handleInputChange('country', country?.name || '')
    // Load states
    try {
      const csStates = State.getStatesOfCountry(value) || []
      setStates(csStates.map((s: any) => ({ name: s.name, isoCode: s.isoCode })))
      setSelectedStateCode("")
      setCities([])
      handleInputChange('state', '')
      handleInputChange('city', '')
    } catch { }
  }

  const handleStateSelect = (value: string) => {
    const state = states.find(s => s.isoCode === value)
    setSelectedStateCode(value)
    handleInputChange('state', state?.name || '')
    // Load cities
    try {
      const csCities = City.getCitiesOfState(selectedCountryCode, value) || []
      setCities(csCities.map((c: any) => ({ name: c.name })))
      handleInputChange('city', '')
    } catch { }
  }

  // Experiences controls (Previous organization details)
  const addExperienceRow = () => {
    setFormData(prev => ({
      ...prev,
      experiences: [
        ...(prev.experiences || []),
        { title: "", company: "", startDate: "", endDate: "", description: "" },
      ],
    }))
  }

  const updateExperienceField = (index: number, field: keyof ExperienceItem, value: any) => {
    const v = field === 'numPartners' ? Number(value || 0) : value
    if (field === 'endDate' && v === 'Present') {
      setFormData(prev => ({
        ...prev,
        // set only the targeted experience to Present and clear others
        experiences: prev.experiences.map((exp, i) => {
          if (i === index) return { ...exp, endDate: 'Present' }
          return exp.endDate === 'Present' ? { ...exp, endDate: '' } : exp
        }),
        // clear current org 'Present' if any
        currentOrgToDate: prev.currentOrgToDate === 'Present' ? '' : prev.currentOrgToDate,
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        experiences: prev.experiences.map((exp, i) => (i === index ? { ...exp, [field]: v } : exp)),
      }))
    }
  }

  const removeExperienceRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }))
  }

  // New experience Save flow
  const updateNewExperienceField = (field: keyof ExperienceItem, value: any) => {
    const v = field === 'numPartners' ? Number(value || 0) : value
    if (field === 'endDate' && v === 'Present') {
      setNewExperience(prev => ({ ...prev, endDate: 'Present' }))
      // Clear current org 'Present' state if any
      setFormData(prev => ({ ...prev, currentOrgToDate: prev.currentOrgToDate === 'Present' ? '' : prev.currentOrgToDate }))
    } else {
      setNewExperience(prev => ({ ...prev, [field]: v }))
    }
  }

  const clearNewExperience = () => {
    setNewExperience({ title: "", company: "", startDate: "", endDate: "", description: "", firmSize: "", numPartners: 0 })
    setShowNewExperienceForm(false)
  }

  const saveNewExperience = () => {
    if (!newExperience.company || !newExperience.title) return
    setFormData(prev => {
      const next = { ...prev, experiences: [...prev.experiences, newExperience] }
      // sort by start date only within previous org details
      next.experiences = [...next.experiences].sort((a, b) => {
        const ad = a.startDate ? new Date(a.startDate).getTime() : 0
        const bd = b.startDate ? new Date(b.startDate).getTime() : 0
        return ad - bd
      })
      return next
    })
    clearNewExperience()
    setShowNewExperienceForm(false)
  }

  const handleCitySelect = (value: string) => {
    handleInputChange('city', value)
  }

  // Load categories from API once
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch(`/api/categories`)
        const data = await res.json()
        const opts: Option[] = (Array.isArray(data) ? data : []).map((c: any) => ({ value: c.name, label: c.name }))
        setCategoryOptions(opts)
      } catch (e) {
        setCategoryOptions([])
      }
    }
    loadCategories()
  }, [])

  // Load sub-categories (services) filtered by selected category name
  useEffect(() => {
    const loadServices = async () => {
      if (!formData.category) {
        setAvailableSubCategories([])
        return
      }
      try {
        const res = await fetch(`/api/services`)
        const data = await res.json()
        const filtered = (Array.isArray(data) ? data : []).filter((s: any) => s?.category?.name === formData.category)
        setAvailableSubCategories(filtered.map((s: any) => ({ name: s.name })))
      } catch (e) {
        setAvailableSubCategories([])
      }
    }
    loadServices()
  }, [formData.category])

  const toggleSubCategory = (name: string) => {
    const exists = selectedSubCategories.find(sc => sc.name === name)
    if (exists) {
      const updated = selectedSubCategories.filter(sc => sc.name !== name)
      setSelectedSubCategories(updated)
    } else {
      if (selectedSubCategories.length >= 3) return // limit 3
      setSelectedSubCategories([...selectedSubCategories, { name, years: '', mandatory: selectedSubCategories.length === 0 }])
    }
  }

  const setSubCategoryYears = (name: string, years: string) => {
    setSelectedSubCategories(prev => prev.map(sc => sc.name === name ? { ...sc, years } : sc))
  }

  const setMandatorySubCategory = (name: string) => {
    setSelectedSubCategories(prev => prev.map(sc => ({ ...sc, mandatory: sc.name === name })))
  }

  // Resume/documents custom UI handlers
  const triggerResumePicker = () => resumeInputRef.current?.click()
  const triggerDocsPicker = () => docsInputRef.current?.click()
  const handleRemoveResume = () => handleInputChange('resumeUrl', '')
  const handleRemoveDocument = (url: string) => {
    const next = (formData.documents || []).filter((u) => u !== url)
    handleInputChange('documents', next)
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
        setFormData(prev => ({
          ...prev,
          firstName: prev.firstName || linkedinData.firstName || '',
          lastName: prev.lastName || linkedinData.lastName || '',
          linkedinUrl: prev.linkedinUrl || linkedinData.linkedinUrl || '',
          organisationName: prev.organisationName || linkedinData.organisationName || linkedinData.company || '',
          designation: prev.designation || linkedinData.designation || linkedinData.jobTitle || '',
          experiences: prev.experiences.length ? prev.experiences : (linkedinData.experiences || []),
          licenses: prev.licenses.length ? prev.licenses : (linkedinData.licenses || []),
          awards: prev.awards.length ? prev.awards : (linkedinData.awards || [])
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.emailComm.trim()) {
      newErrors.emailComm = "Email for communications is required"
    } else if (!emailRegex.test(formData.emailComm.trim())) {
      newErrors.emailComm = "Enter a valid email address"
    }
    if (!formData.whatsappCountryCode) newErrors.whatsappCountryCode = "Country code is required"
    if (!formData.phoneWhatsapp.trim()) newErrors.phoneWhatsapp = "WhatsApp phone is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!selectedSubCategories.length) newErrors.subCategories = "Select at least one sub-category"
    if (selectedSubCategories.length > 3) newErrors.subCategories = "You can select a maximum of 3 sub-categories."
    if (!formData.yearsExperience.trim()) newErrors.yearsExperience = "Years of experience is required"
    // Years of Relevant Experience no longer required
    if (!formData.linkedinUrl && !formData.detailedProfileText && !formData.resumeUrl) {
      const msg = "Provide LinkedIn profile or detailed profile or resume"
      newErrors.linkedinUrl = msg
      newErrors.detailedProfileText = msg
    }
    if (!formData.acceptedRules) newErrors.acceptedRules = "Please accept rules"
    if (!formData.acceptedPrivacy) newErrors.acceptedPrivacy = "Please accept privacy"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setSubmitError('Please fix the above errors.')
      return
    }

    setIsLoading(true)
    setSubmitError(null)

    try {
      // Build payload mapped to backend member schema
      const phoneNumber = formData.whatsappCountryCode && formData.phoneWhatsapp
        ? `${formData.whatsappCountryCode}${formData.phoneWhatsapp}`
        : formData.phoneWhatsapp

      const experienceItems = [] as Array<{
        company_name: string
        company_linkedin_id?: string
        designation: string
        firm_size: string
        number_of_partners: number
        from_date: string
        to_date?: string | null
      }>

      // Current organization as primary experience (optional)
      if (formData.organisationName || formData.designation || formData.firmSize || formData.currentOrgFromDate) {
        experienceItems.push({
          company_name: formData.organisationName || "",
          company_linkedin_id: undefined,
          designation: formData.designation || "",
          firm_size: formData.firmSize || "",
          number_of_partners: Number(formData.numPartners || 0),
          from_date: formData.currentOrgFromDate || new Date().toISOString(),
          to_date: formData.currentOrgToDate && formData.currentOrgToDate !== "Present" ? formData.currentOrgToDate : null,
        })
      }

      // Previous experiences
      (formData.experiences || []).forEach((exp) => {
        experienceItems.push({
          company_name: exp.company || "",
          company_linkedin_id: undefined,
          designation: exp.title || "",
          firm_size: exp.firmSize || "",
          number_of_partners: Number(exp.numPartners || 0),
          from_date: exp.startDate || new Date().toISOString(),
          to_date: exp.endDate && exp.endDate !== "Present" ? exp.endDate : null,
        })
      })

      const memberServices = (selectedSubCategories || []).map(sc => ({
        service_name: sc.name,
        is_preferred: !!sc.mandatory,
        is_active: true,
        relevant_years_experience: Number(sc.years || 0),
      }))

      const payload = {
        // user_id intentionally omitted; backend derives fallback
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.emailComm,
        phone_number: phoneNumber,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        address: formData.address || "N/A",
        experience: experienceItems,
        years_experience: Number(formData.yearsExperience || 0),
        join_reason: formData.whyJoin || "N/A",
        expectations: formData.expectations || "N/A",
        additional_info: formData.anythingElse || "N/A",
        detailed_profile: formData.detailedProfileText || "N/A",
        uploaded_documents: [...(formData.documents || []), ...(formData.resumeUrl ? [formData.resumeUrl] : [])],
        terms_accepted: !!formData.acceptedRules,
        privacy_accepted: !!formData.acceptedPrivacy,
        linkedin_url: formData.linkedinUrl || "N/A",
        extracted_from_linkedin: !!isLinkedInConsent,
        member_status: "active",
        tier: "member",
        start_date: new Date().toISOString(),
        end_date: null,
        member_services: memberServices,
      }

      const response = await fetch(`/api/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const result = await response.json()
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.error || 'Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setSubmitError((error as Error)?.message || 'Unexpected error while saving')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  // Storage upload helpers
  const uploadFileToStorage = async (file: File, prefix: string) => {
    // Demo mode: skip backend upload. Return a local object URL.
    // const bucket = 'user-documents'
    // const path = `${user?.id}/${prefix}-${Date.now()}-${file.name}`
    // const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    // if (uploadError) throw uploadError
    // const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    // return data.publicUrl
    return URL.createObjectURL(file)
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files[0]) return
    try {
      const url = await uploadFileToStorage(files[0], 'resume')
      handleInputChange('resumeUrl', url)
    } catch (err) {
      // Swallow errors in demo mode
    } finally {
      // no-op
    }
  }

  const handleDocumentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadFileToStorage(file, 'doc')
        urls.push(url)
      }
      handleInputChange('documents', [...formData.documents, ...urls])
    } catch (err) {
      // Swallow errors in demo mode
    } finally {
      // no-op
    }
  }

  if (loading) {
    return <LoadingPage text="Loading profile setup..." />
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
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
            {submitError && (
              <div className="rounded-md border border-destructive bg-red-50 p-3 text-sm text-destructive">
                {submitError}
              </div>
            )}
            {/* LinkedIn Auto-fill Section */}
            <div className="p-4 rounded-lg space-y-3" style={{ backgroundColor: '#0966c2' }}>
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-white" />
                <div>
                  <h3 className="font-medium text-white">Auto-fill from LinkedIn</h3>
                  <p className="text-sm text-blue-100">We can fetch your professional information from LinkedIn</p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  id="linkedinUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedinUrl}
                  onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                  className={errors.linkedinUrl ? 'border-destructive' : ''}
                />
                {errors.linkedinUrl && (<p className="text-sm text-white/80">{errors.linkedinUrl}</p>)}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={isLinkedInConsent}
                  onChange={(e) => setIsLinkedInConsent((e.target as HTMLInputElement).checked)}
                />
                <span className="text-sm text-white">By selecting this, all your data in LinkedIn will be auto filled here.</span>
              </div>
              <div>
                <Button
                  onClick={handleLinkedInAutoFill}
                  disabled={isLinkedInLoading || !isLinkedInConsent || !formData.linkedinUrl}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name - editable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                  <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} />
                  {errors.firstName && (<p className="text-sm text-destructive">{errors.firstName}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                  <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} />
                  {errors.lastName && (<p className="text-sm text-destructive">{errors.lastName}</p>)}
                </div>
              </div>

              {/* Communications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/60 rounded-lg p-4">
                <div className="space-y-2">
                  <label htmlFor="emailComm" className="text-sm font-medium">Email for Communications *</label>
                  <Input id="emailComm" type="email" placeholder="you@example.com" value={formData.emailComm} onChange={(e) => handleInputChange('emailComm', e.target.value)} className={errors.emailComm ? 'border-destructive' : ''} />
                  {errors.emailComm && (<p className="text-sm text-destructive">{errors.emailComm}</p>)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp Number *</label>
                  <div className="flex gap-2">
                    <div className="w-2/5">
                      <SearchableSelect
                        id="whatsappCountryCode"
                        value={formData.whatsappCountryCode || ''}
                        options={phoneCodes.map(pc => ({
                          value: pc.dial,
                          label: pc.label,
                          icon: <span className="text-lg">{codeToFlagEmoji(pc.code)}</span>,
                          keywords: [pc.dial, pc.dial.replace('+', ''), pc.code, pc.label.split(' (+')[0]]
                        }))}
                        placeholder="Country code"
                        searchPlaceholder="Search by country or code..."
                        displayField="value"
                        inlineSearch
                        onChange={(val) => handleInputChange('whatsappCountryCode', val)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input id="phoneWhatsapp" type="tel" placeholder="Phone number" value={formData.phoneWhatsapp} onChange={(e) => handleInputChange('phoneWhatsapp', e.target.value)} className={errors.phoneWhatsapp ? 'border-destructive' : ''} />
                    </div>
                  </div>
                  {errors.whatsappCountryCode && (
                    <p className="text-sm text-destructive">{errors.whatsappCountryCode}</p>
                  )}
                  {errors.phoneWhatsapp && (<p className="text-sm text-destructive">{errors.phoneWhatsapp}</p>)}
                </div>
              </div>

              {/* Location of Work - order: country, state, city, address with dependent dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/60 rounded-lg p-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">Country *</label>
                  <SearchableSelect
                    id="country"
                    value={selectedCountryCode || ''}
                    options={countries.map(c => ({ value: c.isoCode, label: c.name, icon: <span className="text-lg">{codeToFlagEmoji(c.isoCode)}</span> }))}
                    placeholder="Select a country"
                    inlineSearch
                    onChange={(val) => handleCountrySelect(val)}
                  />
                  {errors.country && (<p className="text-sm text-destructive">{errors.country}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">State *</label>
                  <SearchableSelect
                    id="state"
                    value={selectedStateCode || ''}
                    options={states.map(s => ({ value: s.isoCode, label: s.name }))}
                    placeholder="Select a state"
                    inlineSearch
                    onChange={(val) => handleStateSelect(val)}
                  />
                  {errors.state && (<p className="text-sm text-destructive">{errors.state}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City *</label>
                  <SearchableSelect
                    id="city"
                    value={formData.city || ''}
                    options={cities.map(c => ({ value: c.name, label: c.name }))}
                    placeholder="Select a city"
                    inlineSearch
                    onChange={(val) => handleCitySelect(val)}
                  />
                  {errors.city && (<p className="text-sm text-destructive">{errors.city}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input id="address" placeholder="Street and area" value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
                </div>
              </div>

              {/* Category & Sub-Category with linkage and multi-select */}
              <div className="space-y-4 bg-blue-50/60 rounded-lg p-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category of Registration *</label>
                  <SearchableSelect
                    id="category"
                    value={formData.category || ''}
                    options={categoryOptions}
                    placeholder="Select a category"
                    inlineSearch
                    onChange={(val) => { handleInputChange('category', val); setSelectedSubCategories([]) }}
                  />
                  {errors.category && (<p className="text-sm text-destructive">{errors.category}</p>)}
                </div>
                {!!availableSubCategories.length && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Select up to 3 sub-categories (1 mandatory)</label>
                      <span className="text-xs text-muted-foreground">Selected: {selectedSubCategories.length}/3</span>
                    </div>
                    <SearchableSelect
                      id="subCategory"
                      value=""
                      options={availableSubCategories.map(sc => ({ value: sc.name, label: sc.name }))}
                      placeholder="Select a sub-category"
                      inlineSearch
                      onChange={(val) => {
                        if (!val) return
                        const exists = selectedSubCategories.find(sc => sc.name === val)
                        if (exists) return
                        if (selectedSubCategories.length >= 3) {
                          setErrors(prev => ({ ...prev, subCategories: 'You can select a maximum of 3 sub-categories.' }))
                          return
                        }
                        setSelectedSubCategories([...selectedSubCategories, { name: val, years: '', mandatory: selectedSubCategories.length === 0 }])
                        setErrors(prev => ({ ...prev, subCategories: '' }))
                      }}
                    />
                    {errors.subCategories && (<p className="text-sm text-destructive">{errors.subCategories}</p>)}
                    {!!selectedSubCategories.length && (
                      <div className="space-y-2">
                        {selectedSubCategories.map((sc, idx) => (
                          <div key={`${sc.name}-${idx}`} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center border border-blue-100 bg-white rounded p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-700">{sc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Relevant Years</label>
                              <Input type="number" min={0} value={sc.years} onChange={(e) => setSubCategoryYears(sc.name, e.target.value)} />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs text-muted-foreground">Mandatory</label>
                              <input type="radio" name="mandatory-subcategory" checked={sc.mandatory} onChange={() => setMandatorySubCategory(sc.name)} />
                            </div>
                            <div className="flex items-center justify-end">
                              <Button type="button" variant="outline" size="sm" onClick={() => { const next = selectedSubCategories.filter(s => s.name !== sc.name); setSelectedSubCategories(next); if (next.length <= 3) setErrors(prev => ({ ...prev, subCategories: '' })) }}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="yearsExperience" className="text-sm font-medium">Years of Experience (Overall) *</label>
                  <Input id="yearsExperience" type="number" min={0} value={formData.yearsExperience} onChange={(e) => handleInputChange('yearsExperience', e.target.value)} className={errors.yearsExperience ? 'border-destructive' : ''} />
                  {errors.yearsExperience && (<p className="text-sm text-destructive">{errors.yearsExperience}</p>)}
                </div>
                {/* Years of Relevant Experience removed as per requirements */}
              </div>



              {/* Detailed Profile */}
              <div className="space-y-2">
                <label htmlFor="detailedProfileText" className="text-sm font-medium">Detailed Profile</label>
                <Textarea id="detailedProfileText" rows={5} placeholder="Provide details if LinkedIn URL is missing" value={formData.detailedProfileText} onChange={(e) => handleInputChange('detailedProfileText', e.target.value)} className={errors.detailedProfileText ? 'border-destructive' : ''} />
                {errors.detailedProfileText && (<p className="text-sm text-destructive">{errors.detailedProfileText}</p>)}
              </div>

              {/* Upload Resume UI removed per requirements */}

              {/* Auto-populated sections (experiences moved to expandable window only) */}
              <div className="space-y-4">
                {!!formData.licenses?.length && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><BadgeCheck className="h-4 w-4" /> Licenses / Certifications / Memberships</h4>
                    <div className="space-y-2">
                      {formData.licenses.map((lic, idx) => (
                        <div key={`lic-${idx}`} className="rounded border p-3 text-sm">
                          <div className="font-medium">{lic.name}</div>
                          <div className="text-muted-foreground">{lic.issuer || ''} {lic.issueDate ? `• ${lic.issueDate}` : ''}</div>
                          {lic.credentialId && <div>Credential: {lic.credentialId}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!!formData.awards?.length && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><Award className="h-4 w-4" /> Awards / Publications / Talks / Recognitions</h4>
                    <div className="space-y-2">
                      {formData.awards.map((aw, idx) => (
                        <div key={`aw-${idx}`} className="rounded border p-3 text-sm">
                          <div className="font-medium">{aw.title}</div>
                          <div className="text-muted-foreground">{aw.date || ''}</div>
                          {aw.description && <div>{aw.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current Organization Details */}
              <h3 className="text-base font-medium">Current Organization Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/60 rounded-lg p-4">
                <div className="space-y-2">
                  <label htmlFor="organisationName" className="text-sm font-medium">Organisation Name</label>
                  <Input id="organisationName" value={formData.organisationName} onChange={(e) => handleInputChange('organisationName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium">Designation</label>
                  <Input id="designation" value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="firmSize" className="text-sm font-medium">Firm Size</label>
                  <Input id="firmSize" value={formData.firmSize} onChange={(e) => handleInputChange('firmSize', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="numPartners" className="text-sm font-medium">Number of Partners</label>
                  <Input id="numPartners" type="number" min={0} value={formData.numPartners} onChange={(e) => handleInputChange('numPartners', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="currentOrgFromDate" className="text-sm font-medium">From date</label>
                  <Input id="currentOrgFromDate" type="date" value={formData.currentOrgFromDate} onChange={(e) => handleInputChange('currentOrgFromDate', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="currentOrgToDate" className="text-sm font-medium">To date</label>
                  <div className="flex items-center gap-2">
                    <Input id="currentOrgToDate" type="date" value={formData.currentOrgToDate === 'Present' ? '' : (formData.currentOrgToDate || '')} onChange={(e) => handleInputChange('currentOrgToDate', e.target.value)} disabled={formData.currentOrgToDate === 'Present'} />
                    <Button type="button" size="sm" variant={formData.currentOrgToDate === 'Present' ? 'secondary' : 'outline'} onClick={() => handleInputChange('currentOrgToDate', formData.currentOrgToDate === 'Present' ? '' : 'Present')}>Present</Button>
                  </div>
                </div>
              </div>

              {/* Previous Organization Details (expandable) */}
              <div className="space-y-2">
                <details>
                  <summary className="cursor-pointer select-none p-3 rounded bg-violet-100 text-sm font-medium">Previous organization details</summary>
                  <div className="mt-3 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4">
                    {/* Add new row button visible only when at least one previous organization exists */}
                    {!!formData.experiences.length && (
                      <div>
                        <Button type="button" variant="secondary" onClick={() => setShowNewExperienceForm(true)}>Add new row</Button>
                      </div>
                    )}
                    {/* New organization draft entry with Save (shown when toggled or when none exist) */}
                    {showNewExperienceForm && (
                      <div className="rounded-lg border border-violet-200 bg-white p-3 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm border-l-4 border-l-violet-400">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organisation Name</label>
                          <Input value={newExperience.company} onChange={(e) => updateNewExperienceField('company', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Designation</label>
                          <Input value={newExperience.title} onChange={(e) => updateNewExperienceField('title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Firm Size</label>
                          <Input value={newExperience.firmSize || ''} onChange={(e) => updateNewExperienceField('firmSize', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Number of Partners</label>
                          <Input type="number" min={0} value={newExperience.numPartners?.toString() || ''} onChange={(e) => updateNewExperienceField('numPartners', e.target.value)} />
                        </div>
                        {/* Partition line before dates */}
                        <div className="md:col-span-2 h-px bg-violet-200" />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">From date</label>
                          <Input type="date" value={newExperience.startDate || ''} onChange={(e) => updateNewExperienceField('startDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">To date</label>
                          <div className="flex items-center gap-2">
                            <Input type="date" value={newExperience.endDate === 'Present' ? '' : (newExperience.endDate || '')} onChange={(e) => updateNewExperienceField('endDate', e.target.value)} disabled={newExperience.endDate === 'Present'} />
                            <Button type="button" size="sm" variant={newExperience.endDate === 'Present' ? 'secondary' : 'outline'} onClick={() => updateNewExperienceField('endDate', newExperience.endDate === 'Present' ? '' : 'Present')}>Present</Button>
                          </div>
                        </div>
                        {/* Partition line before actions */}
                        <div className="md:col-span-2 h-px bg-violet-200" />
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="secondary" onClick={saveNewExperience} disabled={!newExperience.company || !newExperience.title}>Save</Button>
                          <Button type="button" variant="outline" onClick={clearNewExperience}>Clear</Button>
                        </div>
                      </div>
                    )}
                    {([...formData.experiences].sort((a, b) => {
                      const ad = a.startDate ? new Date(a.startDate).getTime() : 0
                      const bd = b.startDate ? new Date(b.startDate).getTime() : 0
                      return ad - bd
                    })).map((exp, idx) => (
                      <div key={`prev-exp-${idx}`} className="rounded-lg border border-violet-200 bg-white p-3 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-sm border-l-4 border-l-violet-400">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organisation Name</label>
                          <Input value={exp.company} onChange={(e) => updateExperienceField(idx, 'company', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Designation</label>
                          <Input value={exp.title} onChange={(e) => updateExperienceField(idx, 'title', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Firm Size</label>
                          <Input value={exp.firmSize || ''} onChange={(e) => updateExperienceField(idx, 'firmSize', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Number of Partners</label>
                          <Input type="number" min={0} value={exp.numPartners?.toString() || ''} onChange={(e) => updateExperienceField(idx, 'numPartners', e.target.value)} />
                        </div>
                        {/* Partition line before dates */}
                        <div className="md:col-span-2 h-px bg-violet-200" />
                        <div className="space-y-2">
                          <label className="text-sm font-medium">From date</label>
                          <Input type="date" value={exp.startDate || ''} onChange={(e) => updateExperienceField(idx, 'startDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">To date</label>
                          <div className="flex items-center gap-2">
                            <Input type="date" value={exp.endDate === 'Present' ? '' : (exp.endDate || '')} onChange={(e) => updateExperienceField(idx, 'endDate', e.target.value)} disabled={exp.endDate === 'Present'} />
                            <Button type="button" size="sm" variant={exp.endDate === 'Present' ? 'secondary' : 'outline'} onClick={() => updateExperienceField(idx, 'endDate', exp.endDate === 'Present' ? '' : 'Present')}>Present</Button>
                          </div>
                        </div>
                        {/* Partition line before actions */}
                        <div className="md:col-span-2 h-px bg-violet-200" />
                        <div>
                          <Button type="button" variant="outline" onClick={() => removeExperienceRow(idx)}>Remove row</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              </div>

              {/* Why join / Expectations / Anything else */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="whyJoin" className="text-sm font-medium">Why do you want to join the network?</label>
                  <Textarea id="whyJoin" rows={4} value={formData.whyJoin} onChange={(e) => handleInputChange('whyJoin', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="expectations" className="text-sm font-medium">What do you expect from this professional network?</label>
                  <Textarea id="expectations" rows={4} value={formData.expectations} onChange={(e) => handleInputChange('expectations', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="anythingElse" className="text-sm font-medium">Anything else you want to share?</label>
                  <Textarea id="anythingElse" rows={4} value={formData.anythingElse} onChange={(e) => handleInputChange('anythingElse', e.target.value)} />
                </div>
              </div>

              {/* Supporting documents upload (custom button with remove) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4" /> Upload supporting documents (resume, certifications, etc.,)</label>
                <input ref={docsInputRef} type="file" multiple className="hidden" onChange={handleDocumentsUpload} />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={triggerDocsPicker}>Upload Documents</Button>
                </div>
                {!!formData.documents.length && (
                  <div className="space-y-2">
                    {formData.documents.map((url) => (
                      <div key={url} className="flex items-center justify-between gap-2 border rounded p-2">
                        <span className="text-sm truncate max-w-[280px]">{url}</span>
                        <Button type="button" variant="outline" onClick={() => handleRemoveDocument(url)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accept rules & privacy with links */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Agreements *</label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.acceptedRules} onChange={(e) => handleInputChange('acceptedRules', (e.target as HTMLInputElement).checked)} />
                  <span className="text-sm">I accept the
                    {' '}
                    <a href="/policies/rules" target="_blank" rel="noopener noreferrer" className="underline">Rules & Regulations</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.acceptedPrivacy} onChange={(e) => handleInputChange('acceptedPrivacy', (e.target as HTMLInputElement).checked)} />
                  <span className="text-sm">I accept the
                    {' '}
                    <a href="/policies/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
                  </span>
                </div>
                {(errors.acceptedRules || errors.acceptedPrivacy) && (
                  <p className="text-sm text-destructive">Please accept both to proceed</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md border border-destructive bg-red-50 p-3 text-sm text-destructive">
                  {submitError}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800 font-medium" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Profile...</>) : ('Complete Profile')}
                </Button>
                <Button type="button" variant="outline" onClick={handleSkip} disabled={isLoading} className="flex-1">Skip for Now</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}