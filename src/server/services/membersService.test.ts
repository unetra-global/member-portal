import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MembersService } from './membersService'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
    prisma: {
        member: {
            create: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}))

describe('MembersService', () => {
    let service: MembersService

    beforeEach(() => {
        vi.clearAllMocks()
        service = new MembersService()
    })

    describe('create', () => {
        it('should create a member successfully', async () => {
            const mockMemberData = {
                user_id: 'user-123',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone_number: '1234567890',
                country: 'USA',
                state: 'NY',
                city: 'New York',
                address: '123 St',
                experience: [],
                years_experience: 5,
                join_reason: 'Networking',
                expectations: 'Growth',
                additional_info: 'None',
                detailed_profile: 'Profile details',
                uploaded_documents: [],
                terms_accepted: true,
                privacy_accepted: true,
                linkedin_url: 'https://linkedin.com/in/johndoe',
                extracted_from_linkedin: false,
                member_status: 'active',
                tier: 'user',
                start_date: new Date(),
                // Add other required fields if any
            }

            const mockCreatedMember = { ...mockMemberData, id: 'member-123' }

            vi.mocked(prisma.member.findUnique).mockResolvedValue(null) // email check
            vi.mocked(prisma.member.create).mockResolvedValue(mockCreatedMember as any)

            const result = await service.create(mockMemberData)

            expect(prisma.member.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    email: 'john@example.com',
                }),
            })
            expect(result).toEqual(mockCreatedMember)
        })
    })
})
