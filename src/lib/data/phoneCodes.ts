// Minimal phone country codes list. For full list, we can generate from
// the `country-codes-list` package at runtime, but including a core set here
// ensures a working dropdown even if the package fails.
export type PhoneCode = { code: string; dial: string; label: string }

export const fallbackPhoneCodes: PhoneCode[] = [
  { code: 'US', dial: '+1', label: 'United States (+1)' },
  { code: 'CA', dial: '+1', label: 'Canada (+1)' },
  { code: 'GB', dial: '+44', label: 'United Kingdom (+44)' },
  { code: 'IN', dial: '+91', label: 'India (+91)' },
  { code: 'AE', dial: '+971', label: 'United Arab Emirates (+971)' },
  { code: 'AU', dial: '+61', label: 'Australia (+61)' },
  { code: 'DE', dial: '+49', label: 'Germany (+49)' },
  { code: 'FR', dial: '+33', label: 'France (+33)' },
  { code: 'SG', dial: '+65', label: 'Singapore (+65)' },
  { code: 'JP', dial: '+81', label: 'Japan (+81)' },
]