'use client'

import { User, Mail, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ContactInfoCardProps {
    member: {
        email: string
        phone_number: string
        city: string
        state: string
        country: string
    }
}

export function ContactInfoCard({ member }: ContactInfoCardProps) {
    const location = `${member.city}, ${member.state}, ${member.country}`

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />
                    Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{member.phone_number}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{location}</span>
                </div>
            </CardContent>
        </Card>
    )
}
