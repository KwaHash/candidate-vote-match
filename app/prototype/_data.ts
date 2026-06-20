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

// 選挙種別（全種別を level=地域階層に紐づける。本番は elections テーブル）
export const ELECTION_TYPES: { value: string; label: string; level: RegionLevel }[] = [
  { value: 'shugiin', label: '衆議院議員', level: 'national' },
  { value: 'sangiin', label: '参議院議員', level: 'national' },
  { value: 'chiji', label: '都道府県知事', level: 'prefecture' },
  { value: 'kengi', label: '都道府県議会議員', level: 'prefecture' },
  { value: 'shucho', label: '市区町村長', level: 'municipality' },
  { value: 'shigi', label: '市区町村議会議員', level: 'municipality' },
]

export type CandidateStatus = '現職' | '新人' | '元職'
export type DataSource = 'official' | 'self' // 公式取込 / 本人入力済み

// サンプル候補者（架空の氏名・実在政党。本番は politicians × candidacies × elections）
export interface PrototypeCandidate {
  id: number
  name: string
  party: string
  electionType: string // ELECTION_TYPES の value
  region: string
  district: string
  status: CandidateStatus
  themes: string[] // 注力する政策テーマ id（POLICY_THEMES）
  transparency: number // 透明化スコア 0-100
  source: DataSource
}

export const SAMPLE_CANDIDATES: PrototypeCandidate[] = [
  { id: 1, name: '田中 一郎', party: '自民党', electionType: 'shugiin', region: '東京都', district: '東京1区', status: '現職', themes: ['bosai', 'ai-gyosei'], transparency: 72, source: 'official' },
  { id: 2, name: '鈴木 美咲', party: '中道改革', electionType: 'shugiin', region: '東京都', district: '東京2区', status: '新人', themes: ['kosodate', 'nyusatsu'], transparency: 60, source: 'self' },
  { id: 3, name: '井上 拓海', party: '国民民主党', electionType: 'shugiin', region: '大阪府', district: '大阪5区', status: '元職', themes: ['ai-gyosei', 'energy'], transparency: 67, source: 'official' },
  { id: 4, name: '佐藤 健太', party: '国民民主党', electionType: 'sangiin', region: '比例', district: '比例代表', status: '現職', themes: ['energy', 'chiho-zaisei'], transparency: 85, source: 'self' },
  { id: 5, name: '高橋 由美', party: 'みらい', electionType: 'sangiin', region: '神奈川県', district: '神奈川県選挙区', status: '新人', themes: ['kosodate', 'jinken'], transparency: 55, source: 'official' },
  { id: 6, name: '渡辺 隆', party: '無所属', electionType: 'chiji', region: '北海道', district: '北海道', status: '現職', themes: ['bosai', 'kanko'], transparency: 90, source: 'self' },
  { id: 7, name: '伊藤 さやか', party: '日本維新', electionType: 'chiji', region: '大阪府', district: '大阪府', status: '新人', themes: ['ai-gyosei', 'chiho-zaisei'], transparency: 68, source: 'official' },
  { id: 8, name: '山本 大輔', party: '自民党', electionType: 'kengi', region: '愛知県', district: '名古屋市北区', status: '現職', themes: ['kotsu', 'bosai'], transparency: 64, source: 'official' },
  { id: 9, name: '中村 香織', party: 'れいわ新選', electionType: 'kengi', region: '福岡県', district: '福岡市東区', status: '新人', themes: ['jinken', 'kosodate'], transparency: 58, source: 'self' },
  { id: 10, name: '木村 彩', party: '中道改革', electionType: 'kengi', region: '東京都', district: '世田谷区', status: '新人', themes: ['nyusatsu', 'ai-gyosei'], transparency: 59, source: 'self' },
  { id: 11, name: '小林 誠', party: '参政党', electionType: 'shucho', region: '静岡県', district: '熱海市', status: '現職', themes: ['kanko', 'nettyusho'], transparency: 76, source: 'self' },
  { id: 12, name: '加藤 真理', party: '無所属', electionType: 'shucho', region: '長野県', district: '軽井沢町', status: '新人', themes: ['kanko', 'energy'], transparency: 62, source: 'official' },
  { id: 13, name: '吉田 翔', party: '社民党', electionType: 'shigi', region: '東京都', district: '渋谷区', status: '現職', themes: ['kosodate', 'jinken'], transparency: 70, source: 'official' },
  { id: 14, name: '松本 直子', party: '日本保守党', electionType: 'shigi', region: '東京都', district: '世田谷区', status: '新人', themes: ['bosai', 'nettyusho'], transparency: 53, source: 'self' },
]
