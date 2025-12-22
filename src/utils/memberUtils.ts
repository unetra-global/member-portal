/**
 * Extract latest designation from member's work experience
 * Follows DRY principle - used across multiple components
 */

interface Experience {
    designation?: string
    company_name?: string
    to_date?: string | null
    from_date?: string
}

export function getLatestDesignation(experience?: Experience[]): string {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
        return 'Professional'
    }

    // Sort by to_date (most recent first), treating 'Present' or null as current
    const sortedExp = [...experience].sort((a, b) => {
        const isAPresent = !a.to_date || a.to_date === 'Present' || a.to_date === 'null' || a.to_date === ''
        const isBPresent = !b.to_date || b.to_date === 'Present' || b.to_date === 'null' || b.to_date === ''

        if (isAPresent) return -1
        if (isBPresent) return 1

        const dateA = a.to_date ? new Date(a.to_date) : new Date()
        const dateB = b.to_date ? new Date(b.to_date) : new Date()
        return dateB.getTime() - dateA.getTime()
    })

    const latestExp = sortedExp[0]

    if (!latestExp?.designation) {
        return 'Professional'
    }

    let designation = latestExp.designation

    if (latestExp.company_name) {
        designation += ` at ${latestExp.company_name}`
    }

    return designation
}

/**
 * Get user initials from first and last name
 */
export function getUserInitials(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return 'U'
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

/**
 * Get full name from first and last name
 */
export function getFullName(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return 'User'
    return `${firstName} ${lastName}`
}
