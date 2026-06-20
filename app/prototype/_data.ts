/**
 * 【プロトタイプ共通データ】政治家向け candidate.seijiselect.jp
 * 政策テーマと地域階層・初期配分。
 * 本番では DB の policies / regions テーブルへ。
 *
 * 注: 国民向け（seijiselect.jp）の選挙種別・サンプル候補者は別リポジトリ next-vote-match に移設。
 */

export interface PolicyTheme {
  id: string
  name: string
  // 政策別の初期配分（%）: 市区町村 / 都道府県 / 国会（全体構想 6章より）
  allocation: { municipality: number; prefecture: number; national: number }
}

export const POLICY_THEMES: PolicyTheme[] = [
  { id: 'bosai', name: '防災・災害死ゼロ', allocation: { municipality: 40, prefecture: 35, national: 25 } },
  { id: 'nettyusho', name: '高齢者熱中症対策', allocation: { municipality: 50, prefecture: 30, national: 20 } },
  { id: 'kotsu', name: '交通事故削減', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'kosodate', name: '子育て・教育', allocation: { municipality: 40, prefecture: 30, national: 30 } },
  { id: 'nyusatsu', name: '入札透明化', allocation: { municipality: 45, prefecture: 35, national: 20 } },
  { id: 'ai-gyosei', name: 'AI行政改革', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'jinken', name: '人権外交', allocation: { municipality: 5, prefecture: 10, national: 85 } },
  { id: 'energy', name: 'エネルギー・蓄電池', allocation: { municipality: 20, prefecture: 30, national: 50 } },
  { id: 'chiho-zaisei', name: '地方財政改革', allocation: { municipality: 30, prefecture: 30, national: 40 } },
  { id: 'kanko', name: '観光・温泉振興', allocation: { municipality: 35, prefecture: 35, national: 30 } },
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
