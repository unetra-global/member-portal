import { useState, useEffect } from 'react'
import { memberApiService } from '@/services/api'

/**
 * Hook to fetch current member data
 * Single Responsibility: Manage member state
 * Dependency Inversion: Depends on MemberApiService abstraction
 */
export function useMember() {
    const [member, setMember] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true

        const fetchMember = async () => {
            try {
                setLoading(true)
                const data = await memberApiService.getCurrentMember()

                if (isMounted) {
                    setMember(data)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch member')
                    console.error('Error fetching member:', err)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchMember()

        return () => {
            isMounted = false
        }
    }, [])

    return { member, loading, error }
}
