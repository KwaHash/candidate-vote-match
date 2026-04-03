

import { type IconType } from 'react-icons'
import { FiHeart, FiTarget } from 'react-icons/fi'
import { HiOutlineTrendingUp } from 'react-icons/hi'
import { LuUsersRound } from 'react-icons/lu'

interface IFeatureItem {
  icon: IconType
  title: string
  description: string
}

interface IHowItWorksStep {
  number: number
  title: string
  description: string
  bgColor: string
}

export const FEATURES: IFeatureItem[] = [
  {
    icon: FiHeart,
    title: '感情的なつながり',
    description: '政策だけでなく、政治家の人柄やストーリーを知ることで、より深い共感と応援の気持ちが生まれます。',
  },
  {
    icon: FiTarget,
    title: '価値観マッチング',
    description: '診断を通じて、あなたの価値観に本当に合った政治家を見つけることができます。',
  },
  {
    icon: LuUsersRound,
    title: 'コミュニティ形成',
    description: '同じ推しを持つ仲間と出会い、一緒に応援することで、政治参加がもっと楽しくなります。',
  },
  {
    icon: HiOutlineTrendingUp,
    title: '直接支援',
    description: 'クラウドファンディングを通じて、推し政治家のプロジェクトを直接支援できます。',
  },
]

export const HOW_IT_WORKS_STEPS: IHowItWorksStep[] = [
  {
    number: 1,
    title: '診断',
    description: '価値観診断で、あなたの考えや理想を明確にします。環境、経済、教育など、様々なテーマについての質問に答えるだけ。',
    bgColor: 'bg-primary',
  },
  {
    number: 2,
    title: '推し発見',
    description: '診断結果をもとに、あなたにぴったりの政治家をマッチング。相性スコアやプロフィールを見て、推しを見つけましょう。',
    bgColor: 'bg-secondary',
  },
  {
    number: 3,
    title: '応援',
    description: '推しボタンを押して応援、総選挙に投票、クラウドファンディングで支援。様々な方法で推し政治家をサポートできます。',
    bgColor: 'bg-accent',
  },
]

export const FAIRNESS_ITEMS: string[] = [
  '政治家の登録は審査制で、本人確認を徹底',
  'マッチングアルゴリズムは透明性を重視',
  'ランキングは推し数と活動実績で公平に算出',
]