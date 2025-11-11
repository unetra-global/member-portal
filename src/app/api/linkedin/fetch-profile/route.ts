import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// You'll need to set this environment variable with your n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_LINKEDIN_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      )
    }

    // Verify the user is authenticated
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'LinkedIn integration not configured' },
        { status: 503 }
      )
    }

    // Call n8n webhook to fetch LinkedIn data
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        userId,
        action: 'fetch_linkedin_profile'
      })
    })

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, n8nResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn data' },
        { status: 502 }
      )
    }

    const linkedinData = await n8nResponse.json()

    // Transform the data to match our profile structure
    const profileData = {
      firstName: linkedinData.firstName || linkedinData.first_name || '',
      lastName: linkedinData.lastName || linkedinData.last_name || '',
      company: linkedinData.company || linkedinData.currentCompany || '',
      jobTitle: linkedinData.jobTitle || linkedinData.headline || linkedinData.position || '',
      location: linkedinData.location || linkedinData.geo || '',
      bio: linkedinData.summary || linkedinData.bio || linkedinData.about || '',
      linkedinUrl: linkedinData.profileUrl || linkedinData.linkedin_url || linkedinData.url || ''
    }

    return NextResponse.json(profileData)

  } catch (error) {
    console.error('Error in LinkedIn fetch API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Optional: Add a GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'LinkedIn profile fetch endpoint',
    configured: !!N8N_WEBHOOK_URL
  })
}