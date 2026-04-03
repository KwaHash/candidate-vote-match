import { IPolitician } from './politician'

export interface ICandidate extends Omit<IPolitician, 'id' | 'created_at'> {
  id: number
  politician_id: number
  tickets: number
  created_at: string
}