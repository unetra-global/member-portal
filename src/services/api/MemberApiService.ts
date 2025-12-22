import { apiClient } from './ApiClient'

/**
 * Member API Service
 * Single Responsibility: Handle all member-related API calls
 */
export class MemberApiService {
    async getCurrentMember() {
        return apiClient.get('/members/me')
    }

    async getMemberById(id: string) {
        return apiClient.get(`/members/${id}`)
    }

    async updateMember(id: string, data: any) {
        return apiClient.put(`/members/${id}`, data)
    }
}

// Singleton instance
export const memberApiService = new MemberApiService()
