export type PolicyImportance = 'high' | 'mid' | 'low'

export const ELECTION_LEVELS = [
  { value: '衆議院', label: '衆議院' },
  { value: '参議院', label: '参議院' },
  { value: '都道府県', label: '都道府県' },
  { value: '市区町村', label: '市区町村' },
] as const

export const POSITION_OPTIONS = [
  { value: '現職', label: '現職' },
  { value: '新人', label: '新人' },
] as const

export const WEBSITE_FIELD_LABELS: Record<string, string> = {
  homepage: '公式サイト',
  facebook: 'Facebook',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  line: 'LINE',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
}

export type ProfileQuestionAnswer = {
  question: string
  answer: string
  importance?: PolicyImportance | ''
  evidence_url?: string
  note?: string
}

export type ProfileWebsiteLink = {
  label: string
  url: string
}

export type WebsiteLinkEntry = ProfileWebsiteLink & { id: string }

export type ProfileCustomItem = {
  label: string
  value: string
}

export type CustomItemEntry = ProfileCustomItem & { id: string }
export type AchievementEntry = { id: string; text: string }

export interface ICandidateProfile {
  kanji_name: string
  hiragana_name: string
  avatar: string
  party: string
  birth_date: string
  election_level: string
  district: string
  position: string
  education?: string
  career?: string
  political_career?: string
  achievements?: string[]
  website?: ProfileWebsiteLink[]
  custom_items?: ProfileCustomItem[]
}

export interface IFormValues extends Omit<ICandidateProfile, 'achievements' | 'website' | 'custom_items'> {}