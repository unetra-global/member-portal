'use client'

import { CheckCircle2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProfileHeaderProps {
    member: {
        first_name: string
        last_name: string
        city: string
        state: string
        country: string
        years_experience: number
        linkedin_url?: string
    }
    currentDesignation: string
}

export function ProfileHeader({ member, currentDesignation }: ProfileHeaderProps) {
    const fullName = `${member.first_name} ${member.last_name}`
    const location = `${member.city}, ${member.state}, ${member.country}`
    const initials = `${member.first_name[0]}${member.last_name[0]}`

    return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex items-start gap-6">
                    <div className="bg-white rounded-full p-1">
                        <div className="bg-blue-600 rounded-full w-24 h-24 flex items-center justify-center text-3xl font-bold text-white">
                            {initials}
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <h1 className="text-3xl font-bold">{fullName}</h1>
                            <CheckCircle2 className="h-6 w-6 text-blue-300" />
                        </div>
                        <p className="text-blue-100 mb-3">{currentDesignation}</p>
                        <div className="flex items-center gap-2 text-blue-100 mb-4">
                            <MapPin className="h-4 w-4" />
                            <span>{location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white border-white/30">
                                {member.years_experience} years experience
                            </Badge>
                            {member.linkedin_url && (
                                <a
                                    href={member.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-100 hover:text-white transition-colors"
                                >
                                    View LinkedIn Profile →
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
