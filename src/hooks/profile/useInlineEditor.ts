'use client'

import { useState } from 'react'

export function useInlineEditor(onSave: (field: string, value: string) => Promise<void>) {
    const [editingField, setEditingField] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string>('')
    const [isSaving, setIsSaving] = useState(false)

    const startEdit = (field: string, currentValue: string) => {
        setEditingField(field)
        setEditValue(currentValue || '')
    }

    const cancelEdit = () => {
        setEditingField(null)
        setEditValue('')
    }

    const saveEdit = async (field: string) => {
        setIsSaving(true)
        try {
            await onSave(field, editValue)
            cancelEdit()
        } catch (err) {
            console.error('Save error:', err)
            alert('Error saving changes')
        } finally {
            setIsSaving(false)
        }
    }

    return {
        editingField,
        editValue,
        setEditValue,
        isSaving,
        startEdit,
        cancelEdit,
        saveEdit
    }
}
