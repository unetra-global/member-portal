import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()

    // Validate required fields
    const { firstName, lastName, company, jobTitle } = profileData
    if (!firstName || !lastName || !company || !jobTitle) {
      return NextResponse.json(
        { error: 'First name, last name, company, and job title are required' },
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

    // Update the user's metadata in auth.users table
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        company: profileData.company,
        job_title: profileData.jobTitle,
        location: profileData.location || '',
        bio: profileData.bio || '',
        linkedin_url: profileData.linkedinUrl || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        profile_completed: true,
        profile_completed_at: new Date().toISOString()
      }
    })

    if (updateError) {
      console.error('Error updating user profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save profile data' },
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