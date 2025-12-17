"use client"

import { useState, ReactNode } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2, Calendar } from "lucide-react"

// Generic field editor for simple text/textarea fields
interface FieldEditorProps {
    title: string
    value: string
    onSave: (value: string) => Promise<void>
    multiline?: boolean
    trigger?: ReactNode
}

export function FieldEditor({ title, value, onSave, multiline = true, trigger }: FieldEditorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [localValue, setLocalValue] = useState(value)
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave(localValue)
            setIsOpen(false)
        } finally {
            setIsSaving(false)
        }
    }

    const handleOpen = () => {
        setLocalValue(value)
        setIsOpen(true)
    }

    return (
        <>
            {trigger ? (
                <div onClick={handleOpen}>{trigger}</div>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpen}
                    className="absolute top-4 right-4"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            )}

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit {title}</DialogTitle>
                    </DialogHeader>

                    <div>
                        {multiline ? (
                            <Textarea
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                rows={8}
                                className="w-full"
                                placeholder={`Enter ${title.toLowerCase()}...`}
                            />
                        ) : (
                            <Input
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                placeholder={`Enter ${title.toLowerCase()}...`}
                            />
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

// List editor for arrays (experience, awards, etc.)
interface ListItem {
    [key: string]: any
}

interface ListEditorProps<T extends ListItem> {
    items: T[]
    onSave: (items: T[]) => Promise<void>
    renderItem: (item: T, index: number, onEdit: () => void, onDelete: () => void) => ReactNode
    renderForm: (item: T, onChange: (item: T) => void) => ReactNode
    createEmpty: () => T
    addButtonText: string
    editTitle: string
    validate?: (item: T) => boolean
}

export function ListEditor<T extends ListItem>({
    items,
    onSave,
    renderItem,
    renderForm,
    createEmpty,
    addButtonText,
    editTitle,
    validate
}: ListEditorProps<T>) {
    const [isOpen, setIsOpen] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [localItems, setLocalItems] = useState<T[]>(items)
    const [currentItem, setCurrentItem] = useState<T>(createEmpty())
    const [isSaving, setIsSaving] = useState(false)

    const handleAdd = () => {
        setEditingIndex(null)
        setCurrentItem(createEmpty())
        setIsOpen(true)
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setCurrentItem({ ...localItems[index] })
        setIsOpen(true)
    }

    const handleDelete = async (index: number) => {
        const updated = localItems.filter((_, i) => i !== index)
        setLocalItems(updated)
        await onSave(updated)
    }

    const handleSaveItem = async () => {
        if (validate && !validate(currentItem)) return

        let updated: T[]
        if (editingIndex !== null) {
            updated = localItems.map((item, i) => i === editingIndex ? currentItem : item)
        } else {
            updated = [...localItems, currentItem]
        }

        setIsSaving(true)
        try {
            await onSave(updated)
            setLocalItems(updated)
            setIsOpen(false)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-4">
            {localItems.map((item, idx) => (
                <div key={idx}>
                    {renderItem(item, idx, () => handleEdit(idx), () => handleDelete(idx))}
                </div>
            ))}

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                {addButtonText}
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingIndex !== null ? 'Edit' : 'Add'} {editTitle}</DialogTitle>
                    </DialogHeader>

                    {renderForm(currentItem, setCurrentItem)}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveItem}
                            disabled={validate ? !validate(currentItem) : false || isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
