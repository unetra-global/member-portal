'use client'

import { useState, useEffect } from 'react'

export interface MemberProfile {
    id: string
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone_number: string
    country: string
    state: string
    city: string
    address: string
    experience: any[]
    years_experience: number
    join_reason: string
    expectations: string
    additional_info: string
    detailed_profile: string
    company_name?: string
    designation?: string
    licenses: any[] | null
    awards: any[] | null
    uploaded_documents: string[]
    terms_accepted: boolean
    privacy_accepted: boolean
    linkedin_url: string
    extracted_from_linkedin: boolean
    member_status: string
    tier: string
    start_date: Date | string
    end_date?: Date | string | null
    services?: any[]
    [key: string]: any
}

export function useProfileData(memberId: string) {
    const [member, setMember] = useState<MemberProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`/member-portal/api/members/${memberId}`)
                if (!response.ok) {
                    throw new Error('Failed to fetch member profile')
                }
                const data = await response.json()
                setMember(data)
            } catch (err) {
                console.error('Error fetching member:', err)
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }

        if (memberId) {
            fetchMember()
        }
    }, [memberId])

    const updateMember = async (updates: Partial<MemberProfile>) => {
        if (!member) return

        try {
            const response = await fetch(`/member-portal/api/members/${member.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })

            if (!response.ok) {
                throw new Error('Failed to update profile')
            }

            const updated = await response.json()
            setMember(updated)
            return updated
        } catch (err) {
            console.error('Error updating profile:', err)
            throw err
        }
    }

    return { member, setMember, loading, error, updateMember }
}
