'use client'

import { Calendar, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useExperienceManager } from '@/hooks/profile/useExperienceManager'

interface ExperienceSectionProps {
    member: any
    isOwner: boolean
    updateMember: (updates: any) => Promise<any>
}

export function ExperienceSection({ member, isOwner, updateMember }: ExperienceSectionProps) {
    const {
        editingExpIndex,
        expForm,
        setExpForm,
        isSaving,
        isPresent,
        startEditExp,
        startAddExp,
        cancelExpEdit,
        saveExperience,
        deleteExperience
    } = useExperienceManager(member, updateMember)

    // Only hide if not owner AND no experience
    if (!isOwner && (!member.experience || member.experience.length === 0)) {
        return null
    }

    return (
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
    )
}
