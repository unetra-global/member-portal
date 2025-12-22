/**
 * Base HTTP client for API calls
 * Implements DRY principle by centralizing fetch logic
 */
export class ApiClient {
    private baseUrl = '/member-portal/api'

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`API Error ${response.status}: ${error}`)
        }

        return response.json()
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`API Error ${response.status}: ${error}`)
        }

        return response.json()
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`API Error ${response.status}: ${error}`)
        }

        return response.json()
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            credentials: 'include',
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`API Error ${response.status}: ${error}`)
        }

        return response.json()
    }
}

// Singleton instance
export const apiClient = new ApiClient()
