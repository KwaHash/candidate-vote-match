export interface IPolitician {
  id: number
  kanji_name: string
  hiragana_name?: string
  party?: string
  district?: string
  proportional?: string
  rank?: number
  shu_count?: number
  san_count?: number
  birth_date?: string
  avatar?: string
  title?: string
  biography?: string
  vote_count: number
  vote_result: number
  origin?: string
  shin?: string
  questions_answers?: string
  website?: string
  created_at?: Date | string
}
