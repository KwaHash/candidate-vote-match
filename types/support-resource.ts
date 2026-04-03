export interface SupportResourceRow {
  id: number
  provider_type: string
  provider_name: string
  contact_email: string
  contact_phone: string | null
  website_url: string | null
  prefecture: string
  municipality: string | null
  content: string
  price_type: string
  availability: string
  coverage_area: string[] | null
  created_at: Date
}

export interface CreateSupportResourceBody {
  provider_type: string
  provider_name: string
  contact_email: string
  contact_phone?: string
  website_url?: string
  prefecture: string
  municipality?: string
  content: string
  price_type: string
  availability: string
  coverage_area?: string[]
}
