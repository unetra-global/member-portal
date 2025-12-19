'use client'

import { useState } from 'react'

export function useAwardsManager(member: any, updateMember: (updates: any) => Promise<any>) {
    const [editingAwardIndex, setEditingAwardIndex] = useState<number | null>(null)
    const [awardForm, setAwardForm] = useState<any>({
        name: '',
        year: '',
        description: ''
    })
    const [isSaving, setIsSaving] = useState(false)

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

            // Sort by year descending
            updatedAwards.sort((a, b) => {
                const yearA = parseInt(a.year) || 0
                const yearB = parseInt(b.year) || 0
                return yearB - yearA
            })

            await updateMember({ awards: updatedAwards })
            cancelAwardEdit()
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
            const updatedAwards = member.awards.filter((_: any, i: number) => i !== index)
            await updateMember({ awards: updatedAwards })
        } catch (err) {
            console.error('Delete award error:', err)
            alert('Error deleting award')
        } finally {
            setIsSaving(false)
        }
    }

    return {
        editingAwardIndex,
        awardForm,
        setAwardForm,
        isSaving,
        startEditAward,
        startAddAward,
        cancelAwardEdit,
        saveAward,
        deleteAward
    }
}
