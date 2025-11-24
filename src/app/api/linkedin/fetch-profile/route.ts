import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// You'll need to set this environment variable with your n8n webhook URL
const N8N_WEBHOOK_URL = process.env.N8N_LINKEDIN_WEBHOOK_URL

export async function POST(request: NextRequest) {
  try {
    const { profileUrl, email, userId } = await request.json()

    if (!profileUrl) {
      return NextResponse.json(
        { error: 'LinkedIn profile URL is required' },
        { status: 400 }
      )
    }

    // Verify the user is authenticated (optional, for security)
    if (email && userId) {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user || user.id !== userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    if (!N8N_WEBHOOK_URL) {
      return NextResponse.json(
        { error: 'LinkedIn integration not configured' },
        { status: 503 }
      )
    }

    // Call n8n webhook to fetch LinkedIn data with profileUrl
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileUrl
      })
    })

    if (!n8nResponse.ok) {
      console.error('n8n webhook failed:', n8nResponse.status, n8nResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch LinkedIn data' },
        { status: 502 }
      )
    }

    const linkedinResponse = await n8nResponse.json()

    // n8n returns an array with a single object, extract it
    const linkedinData = Array.isArray(linkedinResponse) ? linkedinResponse[0] : linkedinResponse

    if (!linkedinData) {
      return NextResponse.json(
        { error: 'No data returned from LinkedIn' },
        { status: 404 }
      )
    }

    // Find current company (where endDate is "Present")
    const currentExperience = linkedinData.experience?.find((exp: any) =>
      exp.endDate?.text === 'Present' || exp.endDate?.text === 'present'
    )

    // Parse location data
    const locationParsed = linkedinData.location?.parsed || {}

    // Helper function to format dates as YYYY-MM
    const formatMonthYear = (dateObj: any) => {
      if (!dateObj) return ''
      if (dateObj.text === 'Present' || dateObj.text === 'present') return 'Present'

      const month = dateObj.month
      const year = dateObj.year

      if (!year) return ''
      if (!month) return String(year)

      // Convert month name to number (Jan -> 01, Feb -> 02, etc.)
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      }
      const monthNum = monthMap[month] || '01'
      return `${year}-${monthNum}`
    }

    // Transform the data to match our profile structure
    const profileData = {
      firstName: linkedinData.firstName || '',
      lastName: linkedinData.lastName || '',
      linkedinUrl: linkedinData.linkedinUrl || profileUrl,
      email: linkedinData.email || '',
      phone: linkedinData.phone || '',

      // Current organization details
      organisationName: currentExperience?.companyName || linkedinData.currentPosition?.[0]?.companyName || '',
      designation: linkedinData.headline || currentExperience?.position || '',
      currentOrgFromDate: currentExperience ? formatMonthYear(currentExperience.startDate) : '',
      currentOrgToDate: currentExperience?.endDate?.text === 'Present' ? 'Present' : '',

      // Location data from parsed object
      country: locationParsed.country || locationParsed.countryFull || '',
      state: locationParsed.state || '',
      city: locationParsed.city || locationParsed.text?.split(',')[0]?.trim() || '',

      // About/bio
      about: linkedinData.about || '',
      detailedProfileText: linkedinData.about || '',

      // Profile photo
      photo: linkedinData.photo || linkedinData.profilePicture?.url || '',

      // Debug: Raw data
      raw: linkedinData,

      // Group experiences by company and map to new structure
      experiences: (() => {
        const allExperiences = linkedinData.experience || []
        const pastExperiences = allExperiences.filter((exp: any) =>
          exp.endDate?.text !== 'Present' && exp.endDate?.text !== 'present'
        )

        // Helper function to format dates as YYYY-MM
        const formatMonthYear = (dateObj: any) => {
          if (!dateObj) return ''
          if (dateObj.text === 'Present' || dateObj.text === 'present') return 'Present'

          const month = dateObj.month
          const year = dateObj.year

          if (!year) return ''
          if (!month) return String(year)

          // Convert month name to number
          const monthMap: Record<string, string> = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
          }
          const monthNum = monthMap[month] || '01'
          return `${year}-${monthNum}`
        }

        // Group by company
        const companyMap = new Map<string, any>()

        pastExperiences.forEach((exp: any) => {
          const key = exp.companyId || exp.companyName || 'Unknown'

          if (!companyMap.has(key)) {
            companyMap.set(key, {
              company: exp.companyName || '',
              companyId: exp.companyId || '',
              firmSize: '',
              numPartners: 0,
              roles: []
            })
          }

          companyMap.get(key).roles.push({
            title: exp.position || '',
            startDate: formatMonthYear(exp.startDate),
            endDate: formatMonthYear(exp.endDate),
            description: exp.description || '',
            _sortYear: exp.startDate?.year || 0,
            _sortMonth: exp.startDate?.month || 'Jan'
          })
        })

        // Sort roles within each company by date (most recent first)
        const monthMap: Record<string, number> = {
          'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
          'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
          'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        }

        companyMap.forEach(company => {
          company.roles.sort((a: any, b: any) => {
            const yearDiff = b._sortYear - a._sortYear
            if (yearDiff !== 0) return yearDiff
            return (monthMap[b._sortMonth] || 0) - (monthMap[a._sortMonth] || 0)
          })
          // Remove sort fields
          company.roles = company.roles.map(({ _sortYear, _sortMonth, ...role }: any) => role)
        })

        // Convert to array and sort companies by most recent role
        return Array.from(companyMap.values()).sort((a, b) => {
          const aNewest = a.roles[0]?.startDate || ''
          const bNewest = b.roles[0]?.startDate || ''
          return bNewest.localeCompare(aNewest)
        })
      })(),

      // Map certifications/licenses
      licenses: (linkedinData.certifications || []).map((cert: any) => ({
        name: cert.name || cert.title || '',
        issuer: cert.issuer || cert.organization || cert.issuedBy || '',
        issueDate: cert.issueDate || cert.issuedAt || cert.date || '',
        credentialId: cert.credentialId || cert.id || ''
      })),

      // Map honors and awards
      awards: (linkedinData.honorsAndAwards || []).map((award: any) => ({
        title: award.title || award.name || '',
        date: award.issuedAt || award.date || '',
        description: award.description || award.associatedWith || ''
      }))
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