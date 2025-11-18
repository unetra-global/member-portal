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
import { LoadingPage } from "@/components/ui/loading"
import { Loader2, User, Building, MapPin, Phone, Globe, Linkedin, FileText, Award, BadgeCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Country, State, City } from "country-state-city"
import { categories } from "@/lib/data/categories"
import { fallbackPhoneCodes } from "@/lib/data/phoneCodes"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const countryCodesList: any = require("country-codes-list")

interface ExperienceItem {
  title: string
  company: string
  startDate?: string
  endDate?: string
  description?: string
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

  // Subcategory selection
  const [selectedSubCategories, setSelectedSubCategories] = useState<Array<{ name: string; years: string; mandatory: boolean }>>([])

  // File inputs refs for custom buttons
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const docsInputRef = useRef<HTMLInputElement>(null)

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
    } catch {}

    try {
      // Build complete list of phone country codes using country-codes-list
      const nameToDial = countryCodesList?.customList?.('countryNameEn', 'countryCallingCode')
      const nameToIso2 = countryCodesList?.customList?.('countryNameEn', 'countryCode')
      if (nameToDial && nameToIso2) {
        const codes = Object.keys(nameToDial)
          .map((name: string) => ({
            code: nameToIso2[name],
            dial: `+${nameToDial[name]}`,
            label: `${name} (+${nameToDial[name]})`
          }))
          .sort((a: any, b: any) => a.label.localeCompare(b.label))
        setPhoneCodes(codes)
      } else {
        setPhoneCodes(fallbackPhoneCodes)
      }
    } catch {
      setPhoneCodes(fallbackPhoneCodes)
    }
  }, [])

  const handleInputChange = (field: keyof ProfileData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    } catch {}
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
    } catch {}
  }

  const handleCitySelect = (value: string) => {
    handleInputChange('city', value)
  }

  // Subcategory selection logic
  const availableSubCategories = useMemo(() => {
    return categories[formData.category] || []
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
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.emailComm.trim()) newErrors.emailComm = "Email for communications is required"
    if (!formData.phoneWhatsapp.trim()) newErrors.phoneWhatsapp = "WhatsApp phone is required"
    if (!formData.city.trim()) newErrors.city = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.country.trim()) newErrors.country = "Country is required"
    if (!formData.category.trim()) newErrors.category = "Category is required"
    if (!selectedSubCategories.length) newErrors.category = "Select at least one sub-category"
    if (!formData.yearsExperience.trim()) newErrors.yearsExperience = "Years of experience is required"
    // Years of Relevant Experience no longer required
    if (!formData.linkedinUrl && !formData.detailedProfileText && !formData.resumeUrl) {
      newErrors.linkedinUrl = "Provide LinkedIn profile or detailed profile or resume"
    }
    if (!formData.acceptedRules || !formData.acceptedPrivacy) {
      newErrors.acceptedRules = "Please accept rules & privacy"
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
        body: JSON.stringify({
          ...formData,
          subCategories: selectedSubCategories.map(sc => ({ name: sc.name, years: Number(sc.years || 0), mandatory: !!sc.mandatory })),
          yearsExperience: Number(formData.yearsExperience || 0),
          yearsRelevantExperience: Number(formData.yearsRelevantExperience || 0),
          numPartners: Number(formData.numPartners || 0),
        })
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

  // Storage upload helpers
  const uploadFileToStorage = async (file: File, prefix: string) => {
    const bucket = 'user-documents'
    const path = `${user?.id}/${prefix}-${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files[0]) return
    setIsLoading(true)
    try {
      const url = await uploadFileToStorage(files[0], 'resume')
      handleInputChange('resumeUrl', url)
    } catch (err) {
      console.error('Resume upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsLoading(true)
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadFileToStorage(file, 'doc')
        urls.push(url)
      }
      handleInputChange('documents', [...formData.documents, ...urls])
    } catch (err) {
      console.error('Documents upload error:', err)
    } finally {
      setIsLoading(false)
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

            {/* LinkedIn - placed first field below tile */}
            <div className="space-y-2">
              <label htmlFor="linkedinUrl" className="text-sm font-medium flex items-center gap-2"><Linkedin className="h-4 w-4"/> LinkedIn Profile URL</label>
              <Input id="linkedinUrl" type="url" placeholder="https://linkedin.com/in/yourprofile" value={formData.linkedinUrl} onChange={(e)=>handleInputChange('linkedinUrl', e.target.value)} className={errors.linkedinUrl ? 'border-destructive' : ''} />
              {errors.linkedinUrl && (<p className="text-sm text-destructive">{errors.linkedinUrl}</p>)}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name - editable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                  <Input id="firstName" value={formData.firstName} onChange={(e)=>handleInputChange('firstName', e.target.value)} />
                  {errors.firstName && (<p className="text-sm text-destructive">{errors.firstName}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                  <Input id="lastName" value={formData.lastName} onChange={(e)=>handleInputChange('lastName', e.target.value)} />
                  {errors.lastName && (<p className="text-sm text-destructive">{errors.lastName}</p>)}
                </div>
              </div>

              {/* Communications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="emailComm" className="text-sm font-medium">Email for Communications *</label>
                  <Input id="emailComm" type="email" placeholder="you@example.com" value={formData.emailComm} onChange={(e)=>handleInputChange('emailComm', e.target.value)} className={errors.emailComm ? 'border-destructive' : ''} />
                  {errors.emailComm && (<p className="text-sm text-destructive">{errors.emailComm}</p>)}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><Phone className="h-4 w-4"/> WhatsApp Number *</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select id="whatsappCountryCode" value={formData.whatsappCountryCode} onChange={(e)=>handleInputChange('whatsappCountryCode', (e.target as HTMLSelectElement).value)}>
                      <option value="">Pin Code</option>
                      {phoneCodes.map(pc => (
                        <option key={pc.code} value={pc.dial}>{pc.label}</option>
                      ))}
                    </Select>
                    <div className="col-span-2">
                      <Input id="phoneWhatsapp" type="tel" placeholder="Phone number" value={formData.phoneWhatsapp} onChange={(e)=>handleInputChange('phoneWhatsapp', e.target.value)} className={errors.phoneWhatsapp ? 'border-destructive' : ''} />
                    </div>
                  </div>
                  {errors.phoneWhatsapp && (<p className="text-sm text-destructive">{errors.phoneWhatsapp}</p>)}
                </div>
              </div>

              {/* Location of Work - order: country, state, city, address with dependent dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">Country *</label>
                  <Select id="country" value={selectedCountryCode} onChange={(e)=>handleCountrySelect((e.target as HTMLSelectElement).value)} className={errors.country ? 'border-destructive' : ''}>
                    <option value="">Select a country</option>
                    {countries.map(c => (<option key={c.isoCode} value={c.isoCode}>{c.name}</option>))}
                  </Select>
                  {errors.country && (<p className="text-sm text-destructive">{errors.country}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">State *</label>
                  <Select id="state" value={selectedStateCode} onChange={(e)=>handleStateSelect((e.target as HTMLSelectElement).value)} className={errors.state ? 'border-destructive' : ''}>
                    <option value="">Select a state</option>
                    {states.map(s => (<option key={s.isoCode} value={s.isoCode}>{s.name}</option>))}
                  </Select>
                  {errors.state && (<p className="text-sm text-destructive">{errors.state}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">City *</label>
                  <Select id="city" value={formData.city} onChange={(e)=>handleCitySelect((e.target as HTMLSelectElement).value)} className={errors.city ? 'border-destructive' : ''}>
                    <option value="">Select a city</option>
                    {cities.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                  </Select>
                  {errors.city && (<p className="text-sm text-destructive">{errors.city}</p>)}
                </div>
                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">Address</label>
                  <Input id="address" placeholder="Street and area" value={formData.address} onChange={(e)=>handleInputChange('address', e.target.value)} />
                </div>
              </div>

              {/* Category & Sub-Category with linkage and multi-select */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Category of Registration *</label>
                  <Select id="category" value={formData.category} onChange={(e)=>{
                    const value = (e.target as HTMLSelectElement).value
                    handleInputChange('category', value)
                    setSelectedSubCategories([])
                  }} className={errors.category ? 'border-destructive' : ''}>
                    <option value="">Select a category</option>
                    {Object.keys(categories).map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                  </Select>
                  {errors.category && (<p className="text-sm text-destructive">{errors.category}</p>)}
                </div>

                {!!availableSubCategories.length && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Select up to 3 sub-categories (1 mandatory)</label>
                      <span className="text-xs text-muted-foreground">Selected: {selectedSubCategories.length}/3</span>
                    </div>
                    <div className="space-y-2">
                      {availableSubCategories.map(sc => {
                        const isSelected = selectedSubCategories.some(s => s.name === sc.name)
                        return (
                          <div key={sc.name} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center border rounded p-2">
                            <div className="flex items-center gap-2">
                              <Checkbox checked={isSelected} onChange={() => toggleSubCategory(sc.name)} />
                              <span className="text-sm">{sc.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs">Relevant Years</label>
                              <Input
                                type="number"
                                min={0}
                                value={selectedSubCategories.find(s => s.name === sc.name)?.years || ''}
                                onChange={(e)=>setSubCategoryYears(sc.name, e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-xs">Mandatory</label>
                              <input
                                type="radio"
                                name="mandatory-subcategory"
                                checked={selectedSubCategories.find(s => s.name === sc.name)?.mandatory || false}
                                onChange={()=>setMandatorySubCategory(sc.name)}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="yearsExperience" className="text-sm font-medium">Years of Experience (Overall) *</label>
                  <Input id="yearsExperience" type="number" min={0} value={formData.yearsExperience} onChange={(e)=>handleInputChange('yearsExperience', e.target.value)} className={errors.yearsExperience ? 'border-destructive' : ''} />
                  {errors.yearsExperience && (<p className="text-sm text-destructive">{errors.yearsExperience}</p>)}
                </div>
                {/* Years of Relevant Experience removed as per requirements */}
              </div>

              

              {/* Detailed Profile + Resume Upload (custom button) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="detailedProfileText" className="text-sm font-medium">Detailed Profile</label>
                  <Textarea id="detailedProfileText" rows={5} placeholder="Provide details if LinkedIn URL is missing" value={formData.detailedProfileText} onChange={(e)=>handleInputChange('detailedProfileText', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4"/> Upload Resume</label>
                  <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" onClick={triggerResumePicker}>Upload Resume</Button>
                    {formData.resumeUrl && (
                      <>
                        <span className="text-sm truncate max-w-[200px]">Uploaded</span>
                        <Button type="button" variant="outline" onClick={handleRemoveResume}>Remove</Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-populated sections */}
              <div className="space-y-4">
                {!!formData.experiences?.length && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2"><Building className="h-4 w-4" /> Previous Work Experiences</h4>
                    <div className="space-y-2">
                      {formData.experiences.map((exp, idx) => (
                        <div key={`exp-${idx}`} className="rounded border p-3 text-sm">
                          <div className="font-medium">{exp.title} @ {exp.company}</div>
                          <div className="text-muted-foreground">{exp.startDate || ''} {exp.endDate ? `- ${exp.endDate}` : ''}</div>
                          {exp.description && <div>{exp.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

              {/* Current Organisation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="organisationName" className="text-sm font-medium">Organisation Name</label>
                  <Input id="organisationName" value={formData.organisationName} onChange={(e)=>handleInputChange('organisationName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="designation" className="text-sm font-medium">Designation</label>
                  <Input id="designation" value={formData.designation} onChange={(e)=>handleInputChange('designation', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="firmSize" className="text-sm font-medium">Firm Size</label>
                  <Input id="firmSize" value={formData.firmSize} onChange={(e)=>handleInputChange('firmSize', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="numPartners" className="text-sm font-medium">Number of Partners</label>
                  <Input id="numPartners" type="number" min={0} value={formData.numPartners} onChange={(e)=>handleInputChange('numPartners', e.target.value)} />
                </div>
              </div>

              {/* Why join / Expectations / Anything else */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="whyJoin" className="text-sm font-medium">Why do you want to join the network?</label>
                  <Textarea id="whyJoin" rows={4} value={formData.whyJoin} onChange={(e)=>handleInputChange('whyJoin', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="expectations" className="text-sm font-medium">What do you expect from this professional network?</label>
                  <Textarea id="expectations" rows={4} value={formData.expectations} onChange={(e)=>handleInputChange('expectations', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="anythingElse" className="text-sm font-medium">Anything else you want to share?</label>
                  <Textarea id="anythingElse" rows={4} value={formData.anythingElse} onChange={(e)=>handleInputChange('anythingElse', e.target.value)} />
                </div>
              </div>

              {/* Supporting documents upload (custom button with remove) */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2"><FileText className="h-4 w-4"/> Upload supporting documents</label>
                <input ref={docsInputRef} type="file" multiple className="hidden" onChange={handleDocumentsUpload} />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" onClick={triggerDocsPicker}>Upload Documents</Button>
                </div>
                {!!formData.documents.length && (
                  <div className="space-y-2">
                    {formData.documents.map((url) => (
                      <div key={url} className="flex items-center justify-between gap-2 border rounded p-2">
                        <span className="text-sm truncate max-w-[280px]">{url}</span>
                        <Button type="button" variant="outline" onClick={()=>handleRemoveDocument(url)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Accept rules & privacy with links */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Agreements *</label>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.acceptedRules} onChange={(e)=>handleInputChange('acceptedRules', (e.target as HTMLInputElement).checked)} />
                  <span className="text-sm">I accept the
                    {' '}
                    <a href="/policies/rules" target="_blank" rel="noopener noreferrer" className="underline">Rules & Regulations</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={formData.acceptedPrivacy} onChange={(e)=>handleInputChange('acceptedPrivacy', (e.target as HTMLInputElement).checked)} />
                  <span className="text-sm">I accept the
                    {' '}
                    <a href="/policies/privacy" target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
                  </span>
                </div>
                {(errors.acceptedRules || errors.acceptedPrivacy) && (
                  <p className="text-sm text-destructive">Please accept both to proceed</p>
                )}
              </div>

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