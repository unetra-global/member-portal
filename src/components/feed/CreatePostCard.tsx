'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Image, FileText, Briefcase, Loader2 } from 'lucide-react'
import { useCreatePost } from '@/hooks/feed/useCreatePost'

interface CreatePostCardProps {
    onPostCreated?: () => void
}

export function CreatePostCard({ onPostCreated }: CreatePostCardProps) {
    const [content, setContent] = useState('')
    const [imageData, setImageData] = useState<string | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('post')

    const { createPost, isSubmitting, error } = useCreatePost(() => {
        // Clear form on success
        setContent('')
        setImageData(null)
        setImagePreview(null)
        onPostCreated?.()
    })

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
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
        if (!content.trim()) {
            alert('Please enter some content')
            return
        }

        try {
            await createPost({
                content: content.trim(),
                image_data: imageData || undefined,
                post_type: 'post'
            })
        } catch (err) {
            // Error is handled by the hook
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create a Post</CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="post">
                            <FileText className="h-4 w-4 mr-2" />
                            Write a Post
                        </TabsTrigger>
                        <TabsTrigger value="article" disabled>
                            <FileText className="h-4 w-4 mr-2" />
                            Write an Article
                        </TabsTrigger>
                        <TabsTrigger value="service" disabled>
                            <Briefcase className="h-4 w-4 mr-2" />
                            Write a Service
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="post" className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                {error}
                            </div>
                        )}

                        <Textarea
                            placeholder="What's on your mind? 💭"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="min-h-[120px] resize-none"
                            disabled={isSubmitting}
                        />

                        {imagePreview && (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-h-64 rounded-lg object-cover w-full"
                                />
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setImageData(null)
                                        setImagePreview(null)
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Remove
                                </Button>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    disabled={isSubmitting}
                                >
                                    <Image className="h-4 w-4 mr-2" />
                                    Add Image
                                </Button>
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !content.trim()}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post'
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="article" className="text-center py-8 text-gray-500">
                        Coming soon...
                    </TabsContent>

                    <TabsContent value="service" className="text-center py-8 text-gray-500">
                        Coming soon...
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
