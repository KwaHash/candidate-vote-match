export interface ISupportResource {
  id: number
  assistant_id: number
  provider_type: string
  provider_name: string
  contact_email: string
  contact_phone: string | null
  prefecture: string
  municipality: string | null
  content: string
  price_type: string
  availability: string
  coverage_area: string[] | null
  created_at: Date
}

export interface CreateSupportResourceBody {
  user_id: number
  provider_type: string
  provider_name: string
  contact_email: string
  contact_phone?: string
  prefecture: string
  municipality?: string
  content: string
  price_type: string
  availability: string
  coverage_area?: string[]
}
