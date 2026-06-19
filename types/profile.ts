export const MAX_PROFILE_AVATAR_SIZE_BYTES = 2 * 1024 * 1024
export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
export function isProfileAvatarValue(value: string | undefined | null): boolean {
  if (!value?.trim()) return false
  const v = value.trim()
  return (
    v.startsWith('data:image/') ||
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('/')
  )
}

export type ProfileQuestionAnswer = {
  question: string
  answer: string
}

export type ProfileWebsiteLink = {
  label: string
  url: string
}

export type ProfileCustomItem = {
  label: string
  value: string
}

export interface ICandidateProfile {
  kanji_name: string
  hiragana_name: string
  party: string
  birth_date: string
  avatar: string
  title?: string
  origin?: string
  biography?: string
  question_answers?: ProfileQuestionAnswer[]
  website?: ProfileWebsiteLink[]
  custom_items?: ProfileCustomItem[]
}

export interface IProfileForm extends Omit<ICandidateProfile, 'question_answers' | 'website'> {}