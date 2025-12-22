/**
 * API endpoint constants
 * Follows DRY principle - centralized endpoint definitions
 */

export const API_ENDPOINTS = {
    MEMBERS: {
        ME: '/members/me',
        BY_ID: (id: string) => `/members/${id}`,
    },
    POSTS: {
        LIST: '/posts',
        BY_ID: (id: string) => `/posts/${id}`,
        CREATE: '/posts',
    },
} as const

/**
 * Post action types
 */
export const POST_ACTIONS = {
    LIKE: 'like',
    UNLIKE: 'unlike',
    REPOST: 'repost',
} as const
