'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Image, FileText, Loader2 } from 'lucide-react'
import { useCreatePost } from '@/hooks/feed/useCreatePost'

interface LinkedInCreatePostProps {
    onPostCreated?: () => void
    userName?: string
    userInitials?: string
}

export function LinkedInCreatePost({ onPostCreated, userName, userInitials }: LinkedInCreatePostProps) {
    const router = useRouter()
    const [isExpanded, setIsExpanded] = useState(false)
    const [content, setContent] = useState('')
    const [imageData, setImageData] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const { createPost, isSubmitting, error } = useCreatePost()

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB')
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string
            setImageData(base64)
            setImagePreview(base64)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!content.trim()) return

        try {
            await createPost({
                content: content.trim(),
                image_data: imageData || undefined,
            })
            // Reset form on success
            setContent('')
            setImageData(null)
            setImagePreview(null)
            setIsExpanded(false)
            onPostCreated?.()
        } catch (err) {
            // Error handled by hook
        }
    }

    const handleArticleClick = () => {
        // Navigate to article creation page
        router.push('/articles/new')
    }

    return (
        <Card className="shadow-[0_0_0_1px_rgba(0,0,0,0.08)] mb-2">
            <CardContent className="p-3">
                {/* Top Row */}
                <div className="flex items-start gap-2">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {userInitials || 'U'}
                    </div>

                    {/* Input */}
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="flex-1 text-left px-4 py-3 border border-gray-400 rounded-full hover:bg-gray-100 transition-colors text-sm text-gray-600 font-semibold"
                    >
                        Start a post
                    </button>
                </div>

                {/* Expanded Form */}
                {isExpanded && (
                    <div className="mt-3 space-y-3">
                        {error && (
                            <div className="p-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                                {error}
                            </div>
                        )}

                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What do you want to talk about?"
                            className="w-full min-h-[120px] p-3 text-sm border-0 focus:outline-none resize-none"
                            disabled={isSubmitting}
                        />

                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-64 rounded-lg object-cover w-full"
                                />
                                <button
                                    onClick={() => {
                                        setImageData(null)
                                        setImagePreview(null)
                                    }}
                                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                                    disabled={isSubmitting}
                                >
                                    ✕
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <div className="flex gap-1">
                                <button
                                    onClick={() => document.getElementById('linkedin-image-upload')?.click()}
                                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                                    disabled={isSubmitting}
                                    title="Add a photo"
                                >
                                    <Image className="h-5 w-5 text-gray-600" />
                                </button>
                                <input
                                    id="linkedin-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting}
                                />

                                <button className="p-2 hover:bg-gray-100 rounded transition-colors" disabled title="Write article">
                                    <FileText className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setIsExpanded(false)
                                        setContent('')
                                        setImageData(null)
                                        setImagePreview(null)
                                    }}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !content.trim()}
                                    className="px-4 py-2 text-sm font-semibold bg-[#0A66C2] text-white rounded-full hover:bg-[#004182] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        'Post'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons (when not expanded) */}
                {!isExpanded && (
                    <div className="flex items-center justify-around mt-2 pt-2">
                        <button
                            onClick={() => {
                                setIsExpanded(true)
                                setTimeout(() => document.getElementById('linkedin-image-upload')?.click(), 100)
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors text-sm font-semibold text-gray-600"
                        >
                            <Image className="h-5 w-5 text-[#378FE9]" />
                            <span>Photo</span>
                        </button>

                        <button
                            onClick={handleArticleClick}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded transition-colors text-sm font-semibold text-gray-600"
                        >
                            <FileText className="h-5 w-5 text-[#E16745]" />
                            <span>Article</span>
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
