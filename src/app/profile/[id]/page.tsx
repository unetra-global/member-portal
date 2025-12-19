"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { User, Info, Pencil, Briefcase, Target, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useProfileData } from "@/hooks/profile/useProfileData"
import { useInlineEditor } from "@/hooks/profile/useInlineEditor"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfileSidebar } from "@/components/profile/ProfileSidebar"
import { ContactInfoCard } from "@/components/profile/cards/ContactInfoCard"
import { ExperienceSection } from "@/components/profile/sections/ExperienceSection"
import { AwardsSection } from "@/components/profile/sections/AwardsSection"

export default function MemberBioPage() {
    const params = useParams()
    const { user } = useAuth()
    const [activeNav, setActiveNav] = useState('')

    // Use custom hooks
    const { member, loading, error, updateMember } = useProfileData(params.id as string)

    const handleFieldSave = async (field: string, value: string) => {
        await updateMember({ [field]: value })
    }

    const { editingField, editValue, setEditValue, isSaving, startEdit, cancelEdit, saveEdit } = useInlineEditor(handleFieldSave)

    // Loading and error states
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error || !member) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600">Error loading profile: {error}</p>
                </div>
            </div>
        )
    }

    const isOwner = user && member && user.id === member.user_id

    // Calculate current designation from experience
    const getCurrentDesignation = () => {
        if (!member.experience || member.experience.length === 0) return "Professional"

        const isPresent = (date: any) => {
            if (!date || date === null || date === 'null' || date === '' || date === undefined) return true
            const year = new Date(date).getFullYear()
            return year <= 1971
        }

        const presentJob = member.experience.find(exp => isPresent(exp.to_date))
        if (presentJob) return presentJob.designation || "Professional"

        const sortedExperience = [...member.experience].sort((a, b) => {
            const dateA = new Date(a.to_date || a.from_date)
            const dateB = new Date(b.to_date || b.from_date)
            return dateB.getTime() - dateA.getTime()
        })

        return sortedExperience[0]?.designation || "Professional"
    }

    const currentDesignation = getCurrentDesignation()

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <ProfileSidebar activeNav={activeNav} onNavChange={setActiveNav} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <ProfileHeader member={member} currentDesignation={currentDesignation} />

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
                                                    className="w-full min-h-[150px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                    <CardContent>
                                        <div className="space-y-3">
                                            {member.services.map((svc: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{svc.service.name}</p>
                                                        <p className="text-sm text-gray-600">{svc.service.category.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-gray-600">
                                                            {svc.relevant_years_experience} years exp
                                                        </span>
                                                        {svc.is_preferred && (
                                                            <Badge className="bg-blue-100 text-blue-700">Preferred</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Why Joined */}
                            {(member.join_reason || isOwner) && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Info className="h-5 w-5" />
                                            Why I Joined Unetra Global
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

                            {/* Expectations */}
                            {(member.expectations || isOwner) && (
                                <Card className="relative">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Target className="h-5 w-5" />
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

                            {/* Additional Info */}
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

                            {/* Experience Section */}
                            <ExperienceSection member={member} isOwner={isOwner} updateMember={updateMember} />

                            {/* Awards Section */}
                            <AwardsSection member={member} isOwner={isOwner} updateMember={updateMember} />
                        </div>

                        {/* Right Sidebar */}
                        <div className="space-y-6">
                            {/* Membership Tier */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Membership Tier</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl mb-3">
                                            {member.tier || 'B'}
                                        </div>
                                        <p className="font-semibold text-gray-900">
                                            {member.tier === 'Gold' ? 'Gold Member' : member.tier === 'Silver' ? 'Silver Member' : 'Bronze Member'}
                                        </p>
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-2">60% to next tier</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Badges */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Badges Earned</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-1">
                                                <Star className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">Expert</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <ContactInfoCard member={member} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
