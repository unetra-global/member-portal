'use client'

import { Trophy, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAwardsManager } from '@/hooks/profile/useAwardsManager'

interface AwardsSectionProps {
    member: any
    isOwner: boolean
    updateMember: (updates: any) => Promise<any>
}

export function AwardsSection({ member, isOwner, updateMember }: AwardsSectionProps) {
    const {
        editingAwardIndex,
        awardForm,
        setAwardForm,
        isSaving,
        startEditAward,
        startAddAward,
        cancelAwardEdit,
        saveAward,
        deleteAward
    } = useAwardsManager(member, updateMember)

    // Only hide if not owner AND no awards
    if (!isOwner && (!member.awards || member.awards.length === 0)) {
        return null
    }

    return (
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
            <CardContent className="space-y-4">
                {/* Add/Edit Form */}
                {editingAwardIndex !== null && (
                    <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 space-y-3">
                        <h4 className="font-semibold text-blue-900">
                            {editingAwardIndex === -1 ? 'Add New Award' : 'Edit Award'}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm font-medium block mb-1">Award Name *</label>
                                <input
                                    type="text"
                                    value={awardForm.name}
                                    onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Award name"
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
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium block mb-1">Description</label>
                                <textarea
                                    value={awardForm.description}
                                    onChange={(e) => setAwardForm({ ...awardForm, description: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
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
                        <div key={idx} className="border-b last:border-0 pb-4 last:pb-0 relative group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{award.name || award.award_name}</h3>
                                    {award.year && (
                                        <p className="text-blue-600 font-medium mt-1">{award.year}</p>
                                    )}
                                    {award.description && (
                                        <p className="text-gray-600 text-sm mt-2">{award.description}</p>
                                    )}
                                </div>
                                <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0 ml-4" />
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
    )
}
