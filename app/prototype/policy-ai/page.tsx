'use client'

/**
 * 【プロトタイプ】政治家向け AI政策室（政策立案AI）
 *
 * 目的: テーマ・地域・課題などを入力すると、政策案を12項目で構造化して出力する。
 *       バーティカルAI（政策立案/他国比較/財源/KPI/議会質問/SNS/クラファン文）の中核。
 *
 * 注意: 動く仕様書（プロトタイプ）。生成はテンプレート（実LLM未使用）。
 *   本番は地域データ基盤＋LLMで生成。候補者ごと従量課金（国民向け無料機能とは分離＝コスト方針）。
 */

import { POLICY_THEMES } from '../_data'
import { useState } from 'react'

interface Inputs {
  themeId: string
  region: string
  challenge: string
  target: string
  problem: string
  country: string
  finance: string
  kpi: string
}

interface Output {
  title: string
  challenge: string
  data: string
  country: string
  solution: string
  roles: string
  budget: string
  kpi: string
  objections: string
  sns: string
  crowdfunding: string
  question: string
}

function generate(i: Inputs): Output {
  const theme = POLICY_THEMES.find((t) => t.id === i.themeId)?.name ?? '政策'
  const region = i.region || '対象地域'
  const challenge = i.challenge || `${theme}の課題`
  const country = i.country || '海外先進事例'
  return {
    title: `${region}で「${challenge}」を解決する${theme}プロジェクト`,
    challenge: `${region}では、${i.problem || challenge}が深刻化しています。特に${i.target || '住民'}への影響が大きく、早期の対応が求められています。`,
    data: `${theme}に関する現状データ（発生件数・被害規模・予算規模など）を提示。プロト段階では本番で政府統計・自治体データに接続して自動挿入します。`,
    country: `${country}の事例を参考に、${region}に合う形へ調整。「真似るべき点」と「日本独自に進めるべき点」を区別して導入します。`,
    solution: `${challenge}に対し、①予防 ②現場対応 ③検証 の3段階で取り組みます。${i.target || '対象者'}に届く形で施策を設計します。`,
    roles: `市区町村: 現場の整備・住民周知 ／ 都道府県: 広域調整・財政支援 ／ 国会: 制度・財源の枠組み整備。役割を分けて重複を避けます。`,
    budget: `初期費用と運営費を分けて積算。財源は「${i.finance || '歳出の見直し・補助金の活用'}」を基本とし、説明可能性を担保します。`,
    kpi: `${i.kpi || `${theme}の改善指標`}を主要KPIに設定。現状値→目標値→達成年限を明示し、透明化ダッシュボードで進捗を公開します。`,
    objections: `想定反対: ①財源が不明 ②実施主体が不明 ③地方負担が大きい。→ それぞれに財源案・役割分担・国の支援で回答します。`,
    sns: `【${theme}】${region}の「${challenge}」に取り組みます。財源と期限を明確にして前へ。 #わたしの政治 #seijiselect`,
    crowdfunding: `${region}の${challenge}を解決するため、政策調査・提言・広報の費用を募ります。集まった資金の使途と成果はすべて公開します。`,
    question: `${region}における${challenge}について、当局の現状認識と、財源・期限・実施主体を明確にした対応方針を伺います。`,
  }
}

const OUT_SECTIONS: { key: keyof Output; label: string }[] = [
  { key: 'title', label: '1. 政策名' },
  { key: 'challenge', label: '2. 課題整理' },
  { key: 'data', label: '3. 現状データ' },
  { key: 'country', label: '4. 他国比較' },
  { key: 'solution', label: '5. 解決策' },
  { key: 'roles', label: '6. 役割分担（市区町村・都道府県・国会）' },
  { key: 'budget', label: '7. 必要予算' },
  { key: 'kpi', label: '8. KPI' },
  { key: 'objections', label: '9. 想定反対意見' },
  { key: 'sns', label: '10. SNS発信用要約' },
  { key: 'crowdfunding', label: '11. クラファン文案' },
  { key: 'question', label: '12. 議会質問案' },
]

export default function PolicyAiPage() {
  const [i, setI] = useState<Inputs>({ themeId: POLICY_THEMES[0].id, region: '', challenge: '', target: '', problem: '', country: '', finance: '', kpi: '' })
  const [out, setOut] = useState<Output | null>(null)

  const set = (k: keyof Inputs, v: string) => setI((p) => ({ ...p, [k]: v }))
  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-600'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>AI政策室</h1>
        <p className='mt-1 text-sm text-gray-500'>テーマと課題を入力すると、政策案を12項目で構造化します（政策立案AI）。</p>
      </div>

      {/* 入力 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>政策テーマ</label>
            <select className={inputCls} value={i.themeId} onChange={(e) => set('themeId', e.target.value)}>
              {POLICY_THEMES.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div><label className={labelCls}>対象地域</label><input className={inputCls} placeholder='例: 東京都渋谷区' value={i.region} onChange={(e) => set('region', e.target.value)} /></div>
          <div className='col-span-2'><label className={labelCls}>解決したい課題</label><input className={inputCls} placeholder='例: 避難所の電源不足' value={i.challenge} onChange={(e) => set('challenge', e.target.value)} /></div>
          <div><label className={labelCls}>対象者</label><input className={inputCls} placeholder='例: 高齢者・子育て世帯' value={i.target} onChange={(e) => set('target', e.target.value)} /></div>
          <div><label className={labelCls}>現在の問題</label><input className={inputCls} placeholder='例: 停電時に情報が届かない' value={i.problem} onChange={(e) => set('problem', e.target.value)} /></div>
          <div><label className={labelCls}>参考にしたい国</label><input className={inputCls} placeholder='例: エストニア' value={i.country} onChange={(e) => set('country', e.target.value)} /></div>
          <div><label className={labelCls}>財源の考え方</label><input className={inputCls} placeholder='例: 歳出見直し＋国補助' value={i.finance} onChange={(e) => set('finance', e.target.value)} /></div>
          <div className='col-span-2'><label className={labelCls}>実現したいKPI</label><input className={inputCls} placeholder='例: 災害関連死を10年で半減' value={i.kpi} onChange={(e) => set('kpi', e.target.value)} /></div>
        </div>
        <button onClick={() => setOut(generate(i))} className='mt-4 w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700'>
          AIで政策案を生成
        </button>
      </div>

      {/* 出力 */}
      {out && (
        <div className='space-y-3'>
          <p className='text-xs font-medium text-gray-400'>生成結果（12項目）</p>
          {OUT_SECTIONS.map((s) => (
            <div key={s.key} className='rounded-xl border border-gray-200 bg-white p-4'>
              <h3 className='mb-1 text-xs font-bold text-indigo-600'>{s.label}</h3>
              <p className='whitespace-pre-wrap text-sm leading-relaxed text-gray-700'>{out[s.key]}</p>
            </div>
          ))}
          <p className='text-center text-[11px] text-gray-400'>※ プロトの生成はテンプレート。本番は地域データ＋LLMで生成、候補者ごと従量課金。</p>
        </div>
      )}
    </div>
  )
}
