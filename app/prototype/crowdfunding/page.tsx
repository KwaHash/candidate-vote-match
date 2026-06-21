'use client'

/**
 * 【プロトタイプ】政治家向け クラウドファンディング作成画面
 *
 * 目的: 政治家が「政策単位」でプロジェクト（クラファン）を立ち上げる。
 *       目標金額・支出計画・成果目標を登録し、寄付トレーサビリティ（Campaign ID）の起点になる。
 *
 * 注意: 動く仕様書（プロトタイプ）。
 *   - 保存は localStorage（本番では campaigns / expense_plans テーブルへ）
 *   - 政策テーマの標準地域配分は app/prototype/_data.ts より（本番は policies マスタ）
 */

import { POLICY_THEMES, REGION_LEVELS, SUPPORT_TYPES, type RegionLevel } from '../_data'
import { useEffect, useMemo, useState } from 'react'

interface ExpenseRow {
  id: number
  purpose: string
  amount: number | ''
}

type Visibility = 'public' | 'limited'
type LegalStatus = 'unconfirmed' | 'in_review' | 'approved'

const STORAGE_KEY = 'proto_crowdfunding_v1'

const LEGAL_OPTIONS: { value: LegalStatus; label: string; cls: string }[] = [
  { value: 'unconfirmed', label: '未確認', cls: 'bg-gray-100 text-gray-600' },
  { value: 'in_review', label: '確認中', cls: 'bg-amber-100 text-amber-700' },
  { value: 'approved', label: '承認済み', cls: 'bg-emerald-100 text-emerald-700' },
]

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

export default function CrowdfundingPrototypePage() {
  const [title, setTitle] = useState('')
  const [themeId, setThemeId] = useState(POLICY_THEMES[0].id)
  const [regionLevel, setRegionLevel] = useState<RegionLevel>('prefecture')
  const [regionName, setRegionName] = useState('')
  const [goal, setGoal] = useState<number | ''>('')
  const [rows, setRows] = useState<ExpenseRow[]>([
    { id: 1, purpose: '', amount: '' },
  ])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [outcome, setOutcome] = useState('')
  const [supportTypes, setSupportTypes] = useState<string[]>(['寄付'])
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [legal, setLegal] = useState<LegalStatus>('unconfirmed')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [aiNeed, setAiNeed] = useState('')

  // 復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      setTitle(d.title ?? '')
      setThemeId(d.themeId ?? POLICY_THEMES[0].id)
      setRegionLevel(d.regionLevel ?? 'prefecture')
      setRegionName(d.regionName ?? '')
      setGoal(d.goal ?? '')
      setRows(d.rows?.length ? d.rows : [{ id: 1, purpose: '', amount: '' }])
      setStartDate(d.startDate ?? '')
      setEndDate(d.endDate ?? '')
      setOutcome(d.outcome ?? '')
      setSupportTypes(d.supportTypes ?? ['寄付'])
      setVisibility(d.visibility ?? 'public')
      setLegal(d.legal ?? 'unconfirmed')
      setSavedAt(d.savedAt ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  const theme = useMemo(
    () => POLICY_THEMES.find((t) => t.id === themeId) ?? POLICY_THEMES[0],
    [themeId]
  )

  const planTotal = useMemo(
    () => rows.reduce((sum, r) => sum + (typeof r.amount === 'number' ? r.amount : 0), 0),
    [rows]
  )
  const goalNum = typeof goal === 'number' ? goal : 0
  const diff = planTotal - goalNum

  const updateRow = (id: number, patch: Partial<ExpenseRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const addRow = () =>
    setRows((prev) => [...prev, { id: Math.max(0, ...prev.map((r) => r.id)) + 1, purpose: '', amount: '' }])
  const removeRow = (id: number) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))

  const toggleSupport = (t: string) =>
    setSupportTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    )

  const canSave = title.trim() !== '' && goalNum > 0

  const handleSave = () => {
    const now = new Date().toLocaleString('ja-JP')
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        title, themeId, regionLevel, regionName, goal, rows,
        startDate, endDate, outcome, supportTypes, visibility, legal, savedAt: now,
      })
    )
    setSavedAt(now)
  }

  // クラファン作成AI: テーマ＋困りごとから 下書き（タイトル/目標/支出計画/成果/支援タイプ）を生成
  const aiFill = () => {
    const need = aiNeed.trim() || `${theme.name}の課題`
    const where = regionName || theme.name
    setTitle(`${where}の「${need}」を解決する政策提言プロジェクト`)
    setGoal(3000000)
    setRows([
      { id: 1, purpose: '政策調査', amount: 500000 },
      { id: 2, purpose: '専門家ヒアリング', amount: 300000 },
      { id: 3, purpose: '動画広報', amount: 500000 },
      { id: 4, purpose: '議会質問・提言書作成', amount: 700000 },
      { id: 5, purpose: '地域説明会', amount: 500000 },
      { id: 6, purpose: '運営費', amount: 500000 },
    ])
    setOutcome(`${need}に関する都道府県・市区町村への提言、議会質問、地域説明会の開催`)
    setSupportTypes(['寄付', 'スキル提供', '人的支援（ボランティア）'])
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'
  const cardCls = 'rounded-xl border border-gray-200 bg-white p-5'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-32'>
      {/* ヘッダー */}
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>クラウドファンディング作成</h1>
        <p className='mt-1 text-sm text-gray-500'>
          政策単位でプロジェクトを立ち上げます。ここで集めた寄付は、政策テーマ・地域・支出計画に紐づいて追跡されます。
        </p>
      </div>

      {/* クラファン作成AI */}
      <div className='mb-5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4'>
        <div className='mb-2 flex items-center gap-2'>
          <span className='text-base'>🤖</span>
          <span className='text-sm font-bold text-indigo-900'>クラファン作成AI</span>
        </div>
        <p className='mb-2 text-xs text-indigo-700'>テーマ（上の政策テーマ）と困りごとを入れると、下書き（タイトル・目標・支出計画・成果・支援タイプ）を自動で埋めます。</p>
        <div className='flex gap-2'>
          <input
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none'
            placeholder='困りごと（例: 避難所の電源が足りない）'
            value={aiNeed}
            onChange={(e) => setAiNeed(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') aiFill() }}
          />
          <button onClick={aiFill} className='shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'>AIで下書き</button>
        </div>
        <p className='mt-2 text-[11px] text-indigo-400'>※ プロトはテンプレ生成。本番はLLMでストーリー・金額・KPI・透明化項目まで提案。</p>
      </div>

      <div className='space-y-5'>
        {/* 基本情報 */}
        <div className={cardCls}>
          <div className='mb-4'>
            <label className={labelCls}>プロジェクト名</label>
            <input
              className={inputCls}
              placeholder='例: 東京都の避難所に蓄電池・通信・トイレを整備する政策提言'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className='mb-4'>
            <label className={labelCls}>政策テーマ</label>
            <select className={inputCls} value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {POLICY_THEMES.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className={labelCls}>対象地域レベル</label>
              <select
                className={inputCls}
                value={regionLevel}
                onChange={(e) => setRegionLevel(e.target.value as RegionLevel)}
              >
                {REGION_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>地域名（任意）</label>
              <input
                className={inputCls}
                placeholder='例: 東京都 / 渋谷区'
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
              />
            </div>
          </div>

          {/* 政策テーマの標準地域配分（透明化の素） */}
          <div className='mt-4 rounded-lg bg-indigo-50 p-3'>
            <p className='mb-2 text-xs font-medium text-indigo-700'>
              「{theme.name}」の標準地域配分（寄付配分の目安）
            </p>
            <div className='flex h-3 w-full overflow-hidden rounded-full'>
              <div className='bg-indigo-600' style={{ width: `${theme.allocation.municipality}%` }} />
              <div className='bg-indigo-400' style={{ width: `${theme.allocation.prefecture}%` }} />
              <div className='bg-indigo-300' style={{ width: `${theme.allocation.national}%` }} />
            </div>
            <div className='mt-1.5 flex justify-between text-[11px] text-indigo-600'>
              <span>市区町村 {theme.allocation.municipality}%</span>
              <span>都道府県 {theme.allocation.prefecture}%</span>
              <span>国会 {theme.allocation.national}%</span>
            </div>
          </div>
        </div>

        {/* 目標金額・支出計画 */}
        <div className={cardCls}>
          <label className={labelCls}>目標金額（円）</label>
          <input
            type='number'
            min={0}
            className={`${inputCls} mb-4`}
            placeholder='例: 3000000'
            value={goal}
            onChange={(e) => setGoal(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <label className={labelCls}>支出計画（何に使うか）</label>
          <div className='space-y-2'>
            {rows.map((r) => (
              <div key={r.id} className='flex gap-2'>
                <input
                  className={`${inputCls} flex-1`}
                  placeholder='用途（例: 政策調査）'
                  value={r.purpose}
                  onChange={(e) => updateRow(r.id, { purpose: e.target.value })}
                />
                <input
                  type='number'
                  min={0}
                  className={`${inputCls} w-36`}
                  placeholder='金額'
                  value={r.amount}
                  onChange={(e) =>
                    updateRow(r.id, { amount: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                />
                <button
                  type='button'
                  onClick={() => removeRow(r.id)}
                  className='shrink-0 rounded-lg px-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-rose-500'
                  aria-label='行を削除'
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            type='button'
            onClick={addRow}
            className='mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700'
          >
            ＋ 項目を追加
          </button>

          {/* 合計 vs 目標 */}
          <div className='mt-4 rounded-lg bg-gray-50 p-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>支出計画 合計</span>
              <span className='font-semibold text-gray-900'>{yen(planTotal)}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>目標金額</span>
              <span className='font-semibold text-gray-900'>{yen(goalNum)}</span>
            </div>
            {goalNum > 0 && (
              <div
                className={`mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold ${
                  diff === 0 ? 'text-emerald-600' : diff > 0 ? 'text-rose-600' : 'text-amber-600'
                }`}
              >
                <span>{diff === 0 ? '一致' : diff > 0 ? '計画が超過' : '未割当'}</span>
                <span>{diff === 0 ? '✓' : yen(Math.abs(diff))}</span>
              </div>
            )}
          </div>
        </div>

        {/* 期間・成果・支援タイプ */}
        <div className={cardCls}>
          <div className='mb-4 grid grid-cols-2 gap-3'>
            <div>
              <label className={labelCls}>開始日</label>
              <input type='date' className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>終了日</label>
              <input type='date' className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className='mb-4'>
            <label className={labelCls}>成果目標</label>
            <textarea
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder='例: 都議会への質問・提言書の作成、地域説明会の開催'
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>募集する支援タイプ</label>
            <div className='flex flex-wrap gap-2'>
              {SUPPORT_TYPES.map((t) => {
                const active = supportTypes.includes(t)
                return (
                  <button
                    key={t}
                    type='button'
                    onClick={() => toggleSupport(t)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {t}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 公開範囲・法務確認 */}
        <div className={cardCls}>
          <div className='mb-4'>
            <label className={labelCls}>公開範囲</label>
            <div className='flex gap-2'>
              {([['public', '一般公開'], ['limited', '限定公開']] as const).map(([v, l]) => (
                <button
                  key={v}
                  type='button'
                  onClick={() => setVisibility(v)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    visibility === v
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>法務確認状況</label>
            <div className='flex gap-2'>
              {LEGAL_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type='button'
                  onClick={() => setLegal(o.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                    legal === o.value ? o.cls + ' ring-2 ring-offset-1 ring-indigo-300' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <p className='mt-2 text-xs text-gray-400'>
              ※ 政治資金規正法・公職選挙法の確認は本番で必須（PROTOTYPE_LOG.md / BACKLOG.md 参照）
            </p>
          </div>
        </div>
      </div>

      {/* 保存バー */}
      <div className='fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3'>
          <div className='text-xs text-gray-500'>
            <span className='font-medium text-gray-700'>{theme.name}</span>
            <span className='mx-1.5'>·</span>
            目標 {yen(goalNum)}
            <span className='mx-1.5'>·</span>
            {savedAt ? `最終保存 ${savedAt}` : '未保存'}
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className='rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            プロジェクトを保存
          </button>
        </div>
      </div>
    </div>
  )
}
