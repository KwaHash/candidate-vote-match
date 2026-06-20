/**
 * 【プロトタイプ共通データ】
 * seijiselect.jp の政策テーマと地域階層・初期配分。
 * 本番では DB の policies / regions テーブルへ。
 */

export interface PolicyTheme {
  id: string
  name: string
  emoji: string // 国民向け表示用アイコン
  animal: string // 診断結果の「あなたのタイプ」動物キャラ（構想の方針）
  summary: string // 課題の一言説明
  question: string // 診断での問いかけ（この課題は重要か）
  // 政策別の初期配分（%）: 市区町村 / 都道府県 / 国会（全体構想 6章より）
  allocation: { municipality: number; prefecture: number; national: number }
}

export const POLICY_THEMES: PolicyTheme[] = [
  { id: 'bosai', name: '防災・災害死ゼロ', emoji: '🛟', animal: 'ビーバー', summary: '災害で命を落とさない社会へ', question: '防災・災害対策に力を入れてほしい', allocation: { municipality: 40, prefecture: 35, national: 25 } },
  { id: 'nettyusho', name: '高齢者熱中症対策', emoji: '🌡️', animal: 'コアラ', summary: '高齢者を熱中症から守る', question: '高齢者の熱中症・健康対策を進めてほしい', allocation: { municipality: 50, prefecture: 30, national: 20 } },
  { id: 'kotsu', name: '交通事故削減', emoji: '🚸', animal: 'カメ', summary: '交通事故ゼロをめざす', question: '交通事故を減らす取り組みを強めてほしい', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'kosodate', name: '子育て・教育', emoji: '🎒', animal: 'ペンギン', summary: '子育て・教育を社会で支える', question: '子育て・教育支援を拡充してほしい', allocation: { municipality: 40, prefecture: 30, national: 30 } },
  { id: 'nyusatsu', name: '入札透明化', emoji: '🔍', animal: 'タカ', summary: '税金の使い道を透明に', question: '政治とお金・入札の透明化を進めてほしい', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'ai-gyosei', name: 'AI行政改革', emoji: '🤖', animal: 'フクロウ', summary: 'AIで行政を効率化', question: 'AIやデジタルで行政を効率化してほしい', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'jinken', name: '人権外交', emoji: '🕊️', animal: 'ハト', summary: '人権を大切にする外交', question: '人権を重視した外交を進めてほしい', allocation: { municipality: 5, prefecture: 10, national: 85 } },
  { id: 'energy', name: 'エネルギー・蓄電池', emoji: '🔋', animal: 'リス', summary: 'エネルギーの安定と脱炭素', question: 'エネルギー・蓄電池に投資してほしい', allocation: { municipality: 20, prefecture: 30, national: 50 } },
  { id: 'chiho-zaisei', name: '地方財政改革', emoji: '🏛️', animal: 'アリ', summary: '地方の財政を立て直す', question: '地方財政の改革を進めてほしい', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'kanko', name: '観光・温泉振興', emoji: '♨️', animal: 'イルカ', summary: '観光・温泉で地域を元気に', question: '観光・温泉で地域を元気にしてほしい', allocation: { municipality: 35, prefecture: 35, national: 30 } },
]

export type RegionLevel = 'national' | 'prefecture' | 'municipality'

export const REGION_LEVELS: { value: RegionLevel; label: string }[] = [
  { value: 'national', label: '国会・国政' },
  { value: 'prefecture', label: '都道府県' },
  { value: 'municipality', label: '市区町村' },
]

// 支援タイプ（クラファン・支援募集で共通）
export const SUPPORT_TYPES = [
  '寄付',
  '物品貸与',
  '場所提供',
  'スキル提供',
  '人的支援（ボランティア）',
  '紹介',
  'SNS拡散',
] as const
