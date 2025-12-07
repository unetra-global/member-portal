import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    // Validate required fields
    const required = [
      'firstName',
      'lastName',
      'emailComm',
      'phoneWhatsapp',
      'city',
      'state',
      'country',
      'category',
      'subCategories',
      'yearsExperience',
      'acceptedRules',
      'acceptedPrivacy'
    ]

    for (const key of required) {
      if (profileData[key] === undefined || profileData[key] === null || profileData[key] === '') {
        return NextResponse.json(
          { error: `Missing required field: ${key}` },
          { status: 400 }
        )
      }
    }

    // LinkedIn URL specific check
    if (!profileData.linkedinUrl && !profileData.detailedProfileText && !profileData.resumeUrl) {
      return NextResponse.json(
        { error: 'Provide LinkedIn URL or detailed profile or upload resume' },
        { status: 400 }
      )
    }

    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate subcategories
    const subCategories = Array.isArray(profileData.subCategories) ? profileData.subCategories : []
    const mandatoryCount = subCategories.filter((sc: any) => !!sc.mandatory).length
    if (subCategories.length < 1 || subCategories.length > 3 || mandatoryCount < 1) {
      return NextResponse.json(
        { error: 'Select 1-3 subcategories with at least 1 mandatory' },
        { status: 400 }
      )
    }

    // Data Transformation
    const phoneWhatsapp = profileData.whatsappCountryCode
      ? `${profileData.whatsappCountryCode}${profileData.phoneWhatsapp}`
      : profileData.phoneWhatsapp

    const sanitizedExperiences = (profileData.experiences || []).map((exp: any) => {
      const firmSize = exp.firmSize && exp.firmSize.trim() ? exp.firmSize : 'N/A';
      return { ...exp, firmSize };
    });

    // Transaction: Upsert Member -> Update Services
    await prisma.$transaction(async (tx) => {
      // 1. Check if member exists by user_id
      const existingMember = await tx.member.findFirst({
        where: { user_id: user.id }
      })

      const memberData = {
        user_id: user.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.emailComm,
        phone_number: phoneWhatsapp,
        country: profileData.country,
        state: profileData.state,
        city: profileData.city,
        address: profileData.address || '',
        experience: sanitizedExperiences, // Json
        years_experience: Number(profileData.yearsExperience) || 0,
        join_reason: profileData.whyJoin || '',
        expectations: profileData.expectations || '',
        additional_info: profileData.anythingElse || '',
        detailed_profile: profileData.detailedProfileText || '',
        company_name: profileData.organisationName || null,
        designation: profileData.designation || null,
        licenses: profileData.licenses || [], // Json
        awards: profileData.awards || [], // Json
        uploaded_documents: profileData.documents || [],
        terms_accepted: !!profileData.acceptedRules,
        privacy_accepted: !!profileData.acceptedPrivacy,
        linkedin_url: profileData.linkedinUrl || '',
        extracted_from_linkedin: false, // Default or logic
        member_status: 'active' as const,
        tier: 'user' as const,
        start_date: existingMember?.start_date || new Date(),
        // end_date: null // Optional
      }

      let member;
      if (existingMember) {
        member = await tx.member.update({
          where: { id: existingMember.id },
          data: memberData
        })
      } else {
        member = await tx.member.create({
          data: {
            ...memberData,
            start_date: new Date()
          }
        })
      }

      // 2. Handle Member Services (Categories)
      // Remove existing services for this member to reset
      await tx.memberService.deleteMany({
        where: { member_id: member.id }
      })

      // Insert new services
      for (const sc of subCategories) {
        const serviceName = sc.name || sc; // Handle object or string

        // Find or Create Service
        // Using upsert for service is tricky without unique ID if specific logic needed, 
        // but schema says Name is unique. catch potential race condition with simple logic or upsert
        let service = await tx.services.findUnique({
          where: { name: serviceName }
        })

        if (!service) {
          service = await tx.services.create({
            data: {
              name: serviceName,
              // We might need to link to a Category (parent) if we knew it.
              // Frontend sends 'category' (parent name). Find that UUID?
              // For now, let's leave category_id null or try to find it.
              // It's a bit complex to find category ID dynamically here without another query.
              // We'll skip parent category linkage for auto-created services for now to avoid errors.
            }
          })
        }

        await tx.memberService.create({
          data: {
            member_id: member.id,
            service_id: service.id,
            is_preferred: !!sc.mandatory, // Using 'mandatory' as 'preferred' proxy? Or just store boolean
            is_active: true,
            relevant_years_experience: Number(sc.years) || 0 // Assuming sc has years, or 0
          }
        })
      }
    })

    // Update Supabase Auth Metadata (Side effect, non-critical if DB succeeds)
    await supabase.auth.updateUser({
      data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        linkedin_url: profileData.linkedinUrl || '',
        profile_completed: true,
        profile_completed_at: new Date().toISOString()
      }
    })

    return NextResponse.json({
      message: 'Profile saved successfully',
      profileCompleted: true
    })

  } catch (error: any) {
    console.error('Error in profile save API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}