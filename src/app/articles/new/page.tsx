'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, Eye } from 'lucide-react'
import { useCreateArticle } from '@/hooks/articles/useCreateArticle'
import { ARTICLE_TAGS } from '@/server/validation/articleSchemas'

export default function NewArticlePage() {
    const router = useRouter()
    const { createArticle, isSubmitting, error } = useCreateArticle()

    const [title, setTitle] = useState('')
    const [subtitle, setSubtitle] = useState('')
    const [summary, setSummary] = useState('')
    const [content, setContent] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [wordCount, setWordCount] = useState(0)

    // Calculate word count
    const handleContentChange = (value: string) => {
        setContent(value)
        if (!value || value.trim().length === 0) {
            setWordCount(0)
        } else {
            const words = value.trim().split(/\s+/).filter(w => w.length > 0).length
            setWordCount(words)
        }
    }

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else if (selectedTags.length < 5) {
            setSelectedTags([...selectedTags, tag])
        }
    }

    const handleSaveDraft = async () => {
        try {
            await createArticle({
                title,
                subtitle,
                summary,
                content,
                tags: selectedTags,
                status: 'DRAFT',
            })
            router.push('/feed')
        } catch (err) {
            // Error handled by hook
        }
    }

    const handlePublish = async () => {
        try {
            await createArticle({
                title,
                subtitle,
                summary,
                content,
                tags: selectedTags,
                status: 'PUBLISHED',
            })
            router.push('/feed')
        } catch (err) {
            // Error handled by hook
        }
    }

    // Button enable conditions
    const canSaveDraft = title.trim().length >= 10 && summary.trim().length >= 50 && content.trim().length >= 100
    const canPublish = canSaveDraft && wordCount >= 800 && selectedTags.length > 0

    console.log('Button states:', {
        titleLength: title.trim().length,
        summaryLength: summary.trim().length,
        contentLength: content.trim().length,
        wordCount,
        tagsCount: selectedTags.length,
        canSaveDraft,
        canPublish
    })


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-xl font-semibold">Write an Article</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                            {wordCount} / 800 words
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!canSaveDraft || isSubmitting}
                            onClick={handleSaveDraft}
                        >
                            Save Draft
                        </Button>
                        <Button
                            size="sm"
                            disabled={!canPublish || isSubmitting}
                            onClick={handlePublish}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                'Publish'
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <Card>
                    <CardContent className="p-6 space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                placeholder="Enter article title (10-200 characters)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={200}
                                className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {title.length}/200 characters
                            </p>
                        </div>

                        {/* Subtitle */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Subtitle (Optional)
                            </label>
                            <Input
                                placeholder="Add a subtitle"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                maxLength={300}
                            />
                        </div>

                        {/* Summary */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Summary <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="Write a brief summary (50-500 characters)"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                maxLength={500}
                                rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {summary.length}/500 characters
                            </p>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                placeholder="Write your article content here... (minimum 800 words)"
                                value={content}
                                onChange={(e) => handleContentChange(e.target.value)}
                                rows={20}
                                className="font-serif text-lg"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {wordCount} words {wordCount < 800 && `(${800 - wordCount} more needed)`}
                            </p>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Tags <span className="text-red-500">*</span> (Select 1-5)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ARTICLE_TAGS.map((tag) => (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagToggle(tag)}
                                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedTags.includes(tag)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {selectedTags.length}/5 tags selected
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
