import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    // Validate required fields for the extended profile
    const required = [
      'firstName',
      'lastName',
      'emailComm',
      'phoneWhatsapp',
      'city',
      'state',
      'country',
      'category',
      // subCategories is a list of selected subcategories with metadata
      'subCategories',
      'yearsExperience',
      // 'yearsRelevantExperience' is optional and no longer required
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

    // If LinkedIn URL is missing, require detailed profile text or resume upload
    if (!profileData.linkedinUrl && !profileData.detailedProfileText && !profileData.resumeUrl) {
      return NextResponse.json(
        { error: 'Provide LinkedIn URL or detailed profile or upload resume' },
        { status: 400 }
      )
    }

    // Verify the user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Validate subCategories constraints: 1 mandatory + up to 2 optional (max 3 total)
    const subCategories = Array.isArray(profileData.subCategories) ? profileData.subCategories : []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mandatoryCount = subCategories.filter((sc: any) => !!sc.mandatory).length
    if (subCategories.length < 1 || subCategories.length > 3 || mandatoryCount < 1) {
      return NextResponse.json(
        { error: 'Select 1-3 subcategories with at least 1 mandatory' },
        { status: 400 }
      )
    }

    // Compose WhatsApp phone with country code if provided
    const phoneWhatsapp = profileData.whatsappCountryCode
      ? `${profileData.whatsappCountryCode}${profileData.phoneWhatsapp}`
      : profileData.phoneWhatsapp

    // Sanitize experiences: ensure firmSize is non-empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedExperiences = (profileData.experiences || []).map((exp: any) => {
      const firmSize = exp.firmSize && exp.firmSize.trim() ? exp.firmSize : 'N/A';
      return { ...exp, firmSize };
    });

    // Upsert into user_profiles table
    const upsertPayload = {
      user_id: user.id,
      full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
      email_comm: profileData.emailComm,
      phone_whatsapp: phoneWhatsapp,
      address: profileData.address || '',
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      category: profileData.category,
      // For backward compatibility, store the mandatory subcategory name in sub_category
      sub_category:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (subCategories.find((sc: any) => !!sc.mandatory)?.name || subCategories[0]?.name || ''),
      // Store full selection with per-subcategory years in JSONB
      sub_categories: subCategories,
      years_experience: Number(profileData.yearsExperience) || 0,
      years_relevant_experience: Number(profileData.yearsRelevantExperience) || 0,
      linkedin_url: profileData.linkedinUrl || '',
      detailed_profile_text: profileData.detailedProfileText || '',
      resume_url: profileData.resumeUrl || '',

      experiences: sanitizedExperiences,
      licenses: profileData.licenses || [],
      awards: profileData.awards || [],
      organisation_name: profileData.organisationName || '',
      designation: profileData.designation || '',
      firm_size: profileData.firmSize || '',
      num_partners: Number(profileData.numPartners) || 0,
      why_join: profileData.whyJoin || '',
      expectations: profileData.expectations || '',
      anything_else: profileData.anythingElse || '',
      documents: profileData.documents || [],
      accepted_rules: !!profileData.acceptedRules,
      accepted_privacy: !!profileData.acceptedPrivacy
    }

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert(upsertPayload, { onConflict: 'user_id' })

    if (upsertError) {
      console.error('Error upserting user_profiles:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save profile data' },
        { status: 500 }
      )
    }

    // Update minimal metadata on auth.users for quick checks
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        linkedin_url: profileData.linkedinUrl || '',
        profile_completed: true,
        profile_completed_at: new Date().toISOString()
      }
    })

    if (updateError) {
      console.error('Error updating auth.users metadata:', updateError)
      return NextResponse.json(
        { error: 'Failed to finalize profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Profile saved successfully',
      profileCompleted: true
    })

  } catch (error) {
    console.error('Error in profile save API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}