"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    User, MapPin, Mail, Phone, Briefcase, Award, Calendar,
    LayoutDashboard, BookOpen, Target, Calendar as CalendarIcon,
    Bookmark, Users, CheckCircle2, Trophy, Star, Info, Pencil, Trash2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

interface MemberProfile {
    id: string
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    country: string
    state: string
    city: string
    address: string
    detailed_profile: string
    years_experience: number
    linkedin_url: string
    join_reason: string
    expectations: string
    additional_info: string
    experience: any[]
    licenses: any[]
    awards: any[]
    services: Array<{
        service: {
            name: string
            category: {
                name: string
            }
        }
        relevant_years_experience: number
        is_preferred: boolean
    }>
}

export default function MemberBioPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const [member, setMember] = useState<MemberProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeNav, setActiveNav] = useState('') // Empty so Dashboard isn't highlighted on profile page

    // Inline editing state
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)

    // Experience editing state
    const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
    const [expForm, setExpForm] = useState<any>({
        company_name: '',
        designation: '',
        from_date: '',
        to_date: '',
        firm_size: '',
        number_of_partners: 0
    })

    // Awards editing state
    const [editingAwardIndex, setEditingAwardIndex] = useState<number | null>(null)
    const [awardForm, setAwardForm] = useState<any>({
        name: '',
        year: '',
        description: ''
    })

    // Check if current user is the profile owner - compare auth user ID with member's user_id
    const isOwner = user && member && user.id === member.user_id

    console.log('[Profile Debug] User ID:', user?.id, 'Member user_id:', member?.user_id, 'Is Owner:', isOwner)

    const startEdit = (field: string, currentValue: string) => {
        setEditingField(field)
        setEditValue(currentValue || '')
    }

    const cancelEdit = () => {
        setEditingField(null)
        setEditValue('')
    }

    const saveEdit = async (field: string) => {
        if (!member) return

        setIsSaving(true)
        try {
            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: editValue })
            })

            if (response.ok) {
                const updated = await response.json()
                setMember(updated)
                setEditingField(null)
                setEditValue('')
            } else {
                alert('Failed to update')
            }
        } catch (err) {
            console.error('Update error:', err)
            alert('Error updating')
        } finally {
            setIsSaving(false)
        }
    }

    const startEditExp = (index: number, exp: any) => {
        setEditingExpIndex(index)
        setExpForm({
            company_name: exp.company_name || '',
            designation: exp.designation || '',
            from_date: exp.from_date || '',
            to_date: exp.to_date || '',
            firm_size: exp.firm_size || '',
            number_of_partners: exp.number_of_partners || 0
        })
    }

    const startAddExp = () => {
        setEditingExpIndex(-1) // -1 means adding new
        setExpForm({
            company_name: '',
            designation: '',
            from_date: '',
            to_date: '',
            firm_size: '',
            number_of_partners: 0
        })
    }

    const cancelExpEdit = () => {
        setEditingExpIndex(null)
        setExpForm({
            company_name: '',
            designation: '',
            from_date: '',
            to_date: '',
            firm_size: '',
            number_of_partners: 0
        })
    }

    const saveExperience = async () => {
        if (!member) return

        setIsSaving(true)
        try {
            let updatedExp = [...(member.experience || [])]

            // Helper function to check if a date is "Present" (null/empty/1970)
            const isPresent = (date: any) => {
                if (!date || date === null || date === 'null' || date === '' || date === undefined) return true
                // Also treat 1970 dates as null/Present (epoch date issues)
                const year = new Date(date).getFullYear()
                return year <= 1971
            }

            // Prepare the form data with proper null handling
            const expData = {
                ...expForm,
                to_date: expForm.to_date && expForm.to_date !== '' && expForm.to_date !== 'null' ? expForm.to_date : null,
                firm_size: expForm.firm_size || null,
                number_of_partners: expForm.number_of_partners || null
            }

            if (editingExpIndex === -1) {
                // Adding new experience
                // If new entry has no end date (Present), update previous Present entry
                if (isPresent(expData.to_date)) {
                    console.log('[Experience] New entry is Present, looking for previous Present entry...')
                    const previousPresentIndex = updatedExp.findIndex(exp => isPresent(exp.to_date))
                    if (previousPresentIndex !== -1) {
                        console.log('[Experience] Found previous Present entry at index', previousPresentIndex)
                        console.log('[Experience] Updating its end date to:', expData.from_date)
                        // Set the previous Present entry's end date to the new entry's start date
                        updatedExp[previousPresentIndex] = {
                            ...updatedExp[previousPresentIndex],
                            to_date: expData.from_date
                        }
                    }
                }
                updatedExp.push(expData)

                // Sort by end date descending (Present/null first, then by date) - ONLY when adding
                updatedExp.sort((a, b) => {
                    const aIsPresent = isPresent(a.to_date)
                    const bIsPresent = isPresent(b.to_date)

                    // Present (null) dates should come first
                    if (aIsPresent && bIsPresent) {
                        // Both are Present, sort by from_date descending (newest first)
                        const aFrom = new Date(a.from_date).getTime()
                        const bFrom = new Date(b.from_date).getTime()
                        return bFrom - aFrom
                    }
                    if (aIsPresent) return -1
                    if (bIsPresent) return 1

                    // Compare actual dates
                    const dateA = new Date(a.to_date)
                    const dateB = new Date(b.to_date)
                    return dateB.getTime() - dateA.getTime()
                })
            } else if (editingExpIndex !== null) {
                // Editing existing - just update in place, don't sort
                updatedExp[editingExpIndex] = expData
            }

            console.log('[Experience] Final sorted experiences:', updatedExp)

            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experience: updatedExp })
            })

            if (response.ok) {
                const updated = await response.json()
                setMember(updated)
                cancelExpEdit()
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('[Experience] Save failed:', errorData)
                alert('Failed to save experience: ' + (errorData.error || 'Unknown error'))
            }
        } catch (err) {
            console.error('Save experience error:', err)
            alert('Error saving experience')
        } finally {
            setIsSaving(false)
        }
    }

    const deleteExperience = async (index: number) => {
        if (!member || !confirm('Delete this experience?')) return

        setIsSaving(true)
        try {
            const updatedExp = member.experience.filter((_, i) => i !== index)

            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experience: updatedExp })
            })

            if (response.ok) {
                const updated = await response.json()
                setMember(updated)
            } else {
                alert('Failed to delete experience')
            }
        } catch (err) {
            console.error('Delete experience error:', err)
            alert('Error deleting experience')
        } finally {
            setIsSaving(false)
        }
    }

    // Awards management functions
    const startEditAward = (index: number, award: any) => {
        setEditingAwardIndex(index)
        setAwardForm({
            name: award.name || award.award_name || '',
            year: award.year || '',
            description: award.description || ''
        })
    }

    const startAddAward = () => {
        setEditingAwardIndex(-1)
        setAwardForm({
            name: '',
            year: '',
            description: ''
        })
    }

    const cancelAwardEdit = () => {
        setEditingAwardIndex(null)
        setAwardForm({
            name: '',
            year: '',
            description: ''
        })
    }

    const saveAward = async () => {
        if (!member) return

        setIsSaving(true)
        try {
            let updatedAwards = [...(member.awards || [])]

            if (editingAwardIndex === -1) {
                updatedAwards.push(awardForm)
            } else if (editingAwardIndex !== null) {
                updatedAwards[editingAwardIndex] = awardForm
            }

            // Sort awards by year in descending order (newest first)
            updatedAwards.sort((a, b) => {
                const yearA = parseInt(a.year) || 0
                const yearB = parseInt(b.year) || 0
                return yearB - yearA
            })

            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ awards: updatedAwards })
            })

            if (response.ok) {
                const updated = await response.json()
                setMember(updated)
                cancelAwardEdit()
            } else {
                const errorData = await response.json().catch(() => ({}))
                alert('Failed to save award: ' + (errorData.error || 'Unknown error'))
            }
        } catch (err) {
            console.error('Save award error:', err)
            alert('Error saving award')
        } finally {
            setIsSaving(false)
        }
    }

    const deleteAward = async (index: number) => {
        if (!member || !confirm('Delete this award?')) return

        setIsSaving(true)
        try {
            const updatedAwards = member.awards.filter((_, i) => i !== index)

            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ awards: updatedAwards })
            })

            if (response.ok) {
                const updated = await response.json()
                setMember(updated)
            } else {
                alert('Failed to delete award')
            }
        } catch (err) {
            console.error('Delete award error:', err)
            alert('Error deleting award')
        } finally {
            setIsSaving(false)
        }
    }

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`/member-portal/api/members/${params.id}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch member profile')
                }
                const data = await response.json()
                setMember(data)
            } catch (err) {
                setError((err as Error).message)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchMember()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !member) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Error: {error || 'Profile not found'}</p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const fullName = `${member.first_name} ${member.last_name}`
    const location = `${member.city}, ${member.state}, ${member.country}`
    const initials = `${member.first_name[0]}${member.last_name[0]}`

    // Get current designation from experience (Present job or most recent)
    const getCurrentDesignation = () => {
        if (!member.experience || member.experience.length === 0) return 'Professional'

        // Helper to check if date is Present
        const isPresent = (date: any) => {
            if (!date || date === null || date === 'null' || date === '') return true
            const year = new Date(date).getFullYear()
            return year <= 1971
        }

        // Find current job (Present end date)
        const currentJob = member.experience.find(exp => isPresent(exp.to_date))
        if (currentJob) return currentJob.designation

        // If no current job, return most recent (first in sorted array)
        return member.experience[0]?.designation || 'Professional'
    }

    const currentDesignation = getCurrentDesignation()

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen },
        { id: 'opportunities', label: 'Opportunities', icon: Target },
        { id: 'events', label: 'Events & Webinars', icon: CalendarIcon },
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
        { id: 'followers', label: 'Followers/Following', icon: Users },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Left Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
                <div className="p-6">
                    <div
                        className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push('/dashboard')}
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                            U
                        </div>
                        <span className="font-bold text-lg">Unetra Global</span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveNav(item.id)
                                        if (item.id === 'dashboard') router.push('/dashboard')
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeNav === item.id
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Header with Profile */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-start gap-6">
                            <div className="bg-white rounded-full p-1">
                                <div className="bg-blue-600 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-white">
                                    {initials}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-bold">{fullName}</h1>
                                    <CheckCircle2 className="h-6 w-6 text-blue-300" />
                                </div>
                                <p className="text-blue-100 mb-3">{currentDesignation}</p>
                                <div className="flex items-center gap-2 text-blue-100 mb-4">
                                    <MapPin className="h-4 w-4" />
                                    <span>{location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        {member.years_experience} years experience
                                    </Badge>
                                    {member.linkedin_url && (
                                        <a
                                            href={member.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-100 hover:text-white transition-colors"
                                        >
                                            View LinkedIn Profile →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Center Content (2 columns) */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* About Me */}
                            {member.detailed_profile && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <User className="h-5 w-5" />
                                            About Me
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'detailed_profile' ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveEdit('detailed_profile')}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                {member.detailed_profile}
                                            </p>
                                        )}
                                    </CardContent>
                                    {isOwner && editingField !== 'detailed_profile' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4"
                                            onClick={() => startEdit('detailed_profile', member.detailed_profile)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </Card>
                            )}

                            {/* Service Offerings */}
                            {member.services && member.services.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Briefcase className="h-5 w-5" />
                                            Service Offerings
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {member.services.map((svc, idx) => (
                                            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-gray-900">{svc.service.name}</h3>
                                                        <p className="text-sm text-gray-600 mt-1">{svc.service.category?.name || 'General'}</p>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            {svc.relevant_years_experience} years of relevant experience
                                                        </p>
                                                    </div>
                                                    {svc.is_preferred && (
                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                            Preferred
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Join Reason - Show if has content OR if owner */}
                            {(member.join_reason || isOwner) && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Target className="h-5 w-5" />
                                            Why I Joined
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'join_reason' ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveEdit('join_reason')}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            member.join_reason ? (
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {member.join_reason}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 text-sm italic">No information added yet. Click edit to add.</p>
                                            )
                                        )}
                                    </CardContent>
                                    {isOwner && editingField !== 'join_reason' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4"
                                            onClick={() => startEdit('join_reason', member.join_reason)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </Card>
                            )}

                            {/* Expectations - Show if has content OR if owner */}
                            {(member.expectations || isOwner) && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Star className="h-5 w-5" />
                                            My Expectations
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'expectations' ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveEdit('expectations')}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            member.expectations ? (
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {member.expectations}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 text-sm italic">No information added yet. Click edit to add.</p>
                                            )
                                        )}
                                    </CardContent>
                                    {isOwner && editingField !== 'expectations' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4"
                                            onClick={() => startEdit('expectations', member.expectations)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </Card>
                            )}

                            {/* Additional Info - Show if has content OR if owner */}
                            {(member.additional_info || isOwner) && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Info className="h-5 w-5" />
                                            Additional Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {editingField === 'additional_info' ? (
                                            <div className="space-y-3">
                                                <textarea
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => saveEdit('additional_info')}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            member.additional_info ? (
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {member.additional_info}
                                                </p>
                                            ) : (
                                                <p className="text-gray-400 text-sm italic">No information added yet. Click edit to add.</p>
                                            )
                                        )}
                                    </CardContent>
                                    {isOwner && editingField !== 'additional_info' && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-4 right-4"
                                            onClick={() => startEdit('additional_info', member.additional_info)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </Card>
                            )}


                            {/* Recent Activity / Experience */}
                            {(member.experience && member.experience.length > 0) || isOwner ? (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-lg">
                                                <Calendar className="h-5 w-5" />
                                                Experience
                                            </div>
                                            {isOwner && editingExpIndex === null && (
                                                <Button
                                                    onClick={startAddExp}
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    + Add Experience
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Add/Edit Form */}
                                        {editingExpIndex !== null && (
                                            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 space-y-3">
                                                <h4 className="font-semibold text-blue-900">
                                                    {editingExpIndex === -1 ? 'Add New Experience' : 'Edit Experience'}
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Company Name *</label>
                                                        <input
                                                            type="text"
                                                            value={expForm.company_name}
                                                            onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="Company name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Designation *</label>
                                                        <input
                                                            type="text"
                                                            value={expForm.designation}
                                                            onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="Job title"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">From Date</label>
                                                        <input
                                                            type="month"
                                                            value={expForm.from_date ? expForm.from_date.substring(0, 7) : ''}
                                                            onChange={(e) => setExpForm({ ...expForm, from_date: e.target.value + '-01' })}
                                                            className="w-full p-2 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">To Date (leave empty for Present)</label>
                                                        <input
                                                            type="month"
                                                            value={expForm.to_date && expForm.to_date !== 'null' ? expForm.to_date.substring(0, 7) : ''}
                                                            onChange={(e) => setExpForm({ ...expForm, to_date: e.target.value ? e.target.value + '-01' : '' })}
                                                            className="w-full p-2 border rounded-md"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Firm Size</label>
                                                        <input
                                                            type="text"
                                                            value={expForm.firm_size}
                                                            onChange={(e) => setExpForm({ ...expForm, firm_size: e.target.value })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="e.g., 50-100 employees"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Number of Partners</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={expForm.number_of_partners}
                                                            onChange={(e) => setExpForm({ ...expForm, number_of_partners: parseInt(e.target.value) || 0 })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        onClick={saveExperience}
                                                        disabled={isSaving || !expForm.company_name || !expForm.designation}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelExpEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Experience List */}
                                        {member.experience && member.experience.length > 0 ? (
                                            member.experience.map((exp: any, idx: number) => (
                                                <div key={idx} className="border-b last:border-0 pb-4 last:pb-0 relative group">
                                                    <h3 className="font-semibold text-lg text-gray-900">{exp.designation || 'Position'}</h3>
                                                    <p className="text-blue-600 font-medium mt-1">{exp.company_name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {exp.from_date && exp.from_date !== 'null' ? new Date(exp.from_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'} - {' '}
                                                            {exp.to_date && exp.to_date !== 'null' && new Date(exp.to_date).getFullYear() > 1971 ? new Date(exp.to_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                                        </span>
                                                    </div>
                                                    {exp.firm_size && exp.firm_size !== 'N/A' && (
                                                        <p className="text-sm text-gray-500 mt-1">Firm size: {exp.firm_size}</p>
                                                    )}

                                                    {isOwner && editingExpIndex === null && (
                                                        <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => startEditExp(idx, exp)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteExperience(idx)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">No experience added yet. Click "Add Experience" to add.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : null}

                            {/* Awards */}
                            {(member.awards && member.awards.length > 0) || isOwner ? (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-lg">
                                                <Trophy className="h-5 w-5" />
                                                Awards & Recognition
                                            </div>
                                            {isOwner && editingAwardIndex === null && (
                                                <Button
                                                    onClick={startAddAward}
                                                    size="sm"
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                >
                                                    + Add Award
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Add/Edit Form */}
                                        {editingAwardIndex !== null && (
                                            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 space-y-3">
                                                <h4 className="font-semibold text-blue-900">
                                                    {editingAwardIndex === -1 ? 'Add New Award' : 'Edit Award'}
                                                </h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Award Name *</label>
                                                        <input
                                                            type="text"
                                                            value={awardForm.name}
                                                            onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="e.g., Best Employee Award"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Year *</label>
                                                        <input
                                                            type="number"
                                                            min="1900"
                                                            max="2100"
                                                            value={awardForm.year}
                                                            onChange={(e) => setAwardForm({ ...awardForm, year: e.target.value })}
                                                            className="w-full p-2 border rounded-md"
                                                            placeholder="e.g., 2024"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium block mb-1">Description</label>
                                                        <textarea
                                                            value={awardForm.description}
                                                            onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                                                            className="w-full p-2 border rounded-md min-h-[80px]"
                                                            placeholder="Brief description of the award"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        onClick={saveAward}
                                                        disabled={isSaving || !awardForm.name || !awardForm.year}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {isSaving ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        onClick={cancelAwardEdit}
                                                        disabled={isSaving}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Awards List */}
                                        {member.awards && member.awards.length > 0 ? (
                                            member.awards.map((award: any, idx: number) => (
                                                <div key={idx} className="flex items-start gap-3 border-b last:border-0 pb-3 last:pb-0 relative group">
                                                    <div className="flex-shrink-0 mt-1">
                                                        <Award className="h-5 w-5 text-yellow-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{award.name || award.award_name}</h4>
                                                        {award.year && (
                                                            <p className="text-sm text-gray-600 mt-1">{award.year}</p>
                                                        )}
                                                        {award.description && (
                                                            <p className="text-sm text-gray-500 mt-1">{award.description}</p>
                                                        )}
                                                    </div>

                                                    {isOwner && editingAwardIndex === null && (
                                                        <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => startEditAward(idx, award)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteAward(idx)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm italic">No awards added yet. Click "Add Award" to add.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : null}
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Membership Tier */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Trophy className="h-5 w-5" />
                                        Membership Tier
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-2">
                                        <p className="text-sm text-gray-600 mb-2">Current: <span className="font-semibold text-gray-900">Silver</span></p>
                                        <p className="text-sm text-gray-600">Next: <span className="font-semibold text-gray-900">Gold</span></p>
                                        <div className="mt-4 bg-gray-200 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">65% complete</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Badges Earned */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Star className="h-5 w-5" />
                                        Badges Earned
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-around py-2">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">Verified</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Trophy className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">Author</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Users className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">Speaker</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <User className="h-5 w-5" />
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{member.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{member.phone_number}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-700">{location}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Credentials & Verification */}
                            {((member.licenses && member.licenses.length > 0) || (member.awards && member.awards.length > 0)) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Award className="h-5 w-5" />
                                            Credentials & Verification
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {member.licenses && member.licenses.length > 0 && member.licenses.map((license: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-green-500 pl-3 py-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">{license.title || license.name}</p>
                                                        {license.issuer && (
                                                            <p className="text-xs text-gray-600 mt-1">Issued by {license.issuer}</p>
                                                        )}
                                                        {license.year && (
                                                            <p className="text-xs text-gray-500 mt-1">{license.year}</p>
                                                        )}
                                                    </div>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                </div>
                                            </div>
                                        ))}
                                        {member.awards && member.awards.length > 0 && member.awards.map((award: any, idx: number) => (
                                            <div key={idx} className="border-l-2 border-green-500 pl-3 py-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">{award.title || award.name}</p>
                                                        {award.issuer && (
                                                            <p className="text-xs text-gray-600 mt-1">By {award.issuer}</p>
                                                        )}
                                                        {award.year && (
                                                            <p className="text-xs text-gray-500 mt-1">{award.year}</p>
                                                        )}
                                                    </div>
                                                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
