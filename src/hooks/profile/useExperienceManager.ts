'use client'

import { useState } from 'react'

export function useExperienceManager(member: any, updateMember: (updates: any) => Promise<any>) {
    const [editingExpIndex, setEditingExpIndex] = useState<number | null>(null)
    const [expForm, setExpForm] = useState<any>({
        company_name: '',
        designation: '',
        from_date: '',
        to_date: '',
        firm_size: '',
        number_of_partners: 0
    })
    const [isSaving, setIsSaving] = useState(false)

    // Helper function to check if a date is "Present" (null/empty/1970)
    const isPresent = (date: any) => {
        if (!date || date === null || date === 'null' || date === '' || date === undefined) return true
        const year = new Date(date).getFullYear()
        return year <= 1971
    }

    const startEditExp = (index: number, exp: any) => {
        setEditingExpIndex(index)
        setExpForm({
            company_name: exp.company_name || '',
            designation: exp.designation || '',
            from_date: exp.from_date ? new Date(exp.from_date).toISOString().split('T')[0] : '',
            to_date: exp.to_date && !isPresent(exp.to_date) ? new Date(exp.to_date).toISOString().split('T')[0] : '',
            firm_size: exp.firm_size || '',
            number_of_partners: exp.number_of_partners || 0
        })
    }

    const startAddExp = () => {
        setEditingExpIndex(-1)
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

            const expData = {
                ...expForm,
                to_date: expForm.to_date && expForm.to_date !== '' && expForm.to_date !== 'null' ? expForm.to_date : null,
                firm_size: expForm.firm_size || null,
                number_of_partners: expForm.number_of_partners || null
            }

            if (editingExpIndex === -1) {
                // Adding new - update previous Present entry if needed
                if (isPresent(expData.to_date)) {
                    const previousPresentIndex = updatedExp.findIndex(exp => isPresent(exp.to_date))
                    if (previousPresentIndex !== -1) {
                        updatedExp[previousPresentIndex] = {
                            ...updatedExp[previousPresentIndex],
                            to_date: expData.from_date
                        }
                    }
                }
                updatedExp.push(expData)

                // Sort by end date descending
                updatedExp.sort((a, b) => {
                    const aIsPresent = isPresent(a.to_date)
                    const bIsPresent = isPresent(b.to_date)

                    if (aIsPresent && bIsPresent) {
                        const aFrom = new Date(a.from_date).getTime()
                        const bFrom = new Date(b.from_date).getTime()
                        return bFrom - aFrom
                    }
                    if (aIsPresent) return -1
                    if (bIsPresent) return 1

                    const dateA = new Date(a.to_date)
                    const dateB = new Date(b.to_date)
                    return dateB.getTime() - dateA.getTime()
                })
            } else if (editingExpIndex !== null) {
                updatedExp[editingExpIndex] = expData
            }

            await updateMember({ experience: updatedExp })
            cancelExpEdit()
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
            const updatedExp = member.experience.filter((_: any, i: number) => i !== index)
            await updateMember({ experience: updatedExp })
        } catch (err) {
            console.error('Delete experience error:', err)
            alert('Error deleting experience')
        } finally {
            setIsSaving(false)
        }
    }

    return {
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
    }
}
