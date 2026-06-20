'use client'

/**
 * 【プロトタイプ】政治家向け 支援者CRM画面
 *
 * 目的: 候補者が応援者（支援者）を管理する。支援タイプ・関心政策・接触履歴・次回アクションを記録。
 *       将来 assist.seijiselect.jp の支援者・支援募集とも連携する（Support ID / User ID）。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（本番では supporters / contacts テーブルへ）。
 *   公開設定（非公開/匿名/公開）は本番で個人情報保護の対象。
 */

import { POLICY_THEMES } from '../_data'
import { useEffect, useMemo, useState } from 'react'

type Kind = 'individual' | 'org'
type Visibility = 'private' | 'anonymous' | 'public'

const SUPPORT_TYPES = ['寄付', 'ボランティア', '紹介', '物品', '会場', 'スキル提供'] as const

interface Supporter {
  id: number
  name: string
  kind: Kind
  supportTypes: string[]
  interests: string[] // 政策テーマ名
  region: string
  contactNote: string // 接触履歴メモ
  nextAction: string
  visibility: Visibility
}

const STORAGE_KEY = 'proto_supporter_crm_v1'

const VIS_META: Record<Visibility, { label: string; cls: string }> = {
  private: { label: '非公開', cls: 'bg-gray-100 text-gray-600' },
  anonymous: { label: '匿名', cls: 'bg-sky-100 text-sky-700' },
  public: { label: '公開', cls: 'bg-emerald-100 text-emerald-700' },
}

export default function SupporterCrmPrototypePage() {
  const [supporters, setSupporters] = useState<Supporter[]>([])
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  // フォーム
  const [name, setName] = useState('')
  const [kind, setKind] = useState<Kind>('individual')
  const [supportTypes, setSupportTypes] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [region, setRegion] = useState('')
  const [contactNote, setContactNote] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('private')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      setSupporters(d.supporters ?? [])
      setSavedAt(d.savedAt ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: Supporter[]) => {
    const now = new Date().toLocaleString('ja-JP')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ supporters: next, savedAt: now }))
    setSavedAt(now)
  }

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const canAdd = name.trim() !== ''

  const addSupporter = () => {
    if (!canAdd) return
    const next: Supporter[] = [
      { id: Math.max(0, ...supporters.map((s) => s.id)) + 1, name, kind, supportTypes, interests, region, contactNote, nextAction, visibility },
      ...supporters,
    ]
    setSupporters(next)
    persist(next)
    setName(''); setSupportTypes([]); setInterests([]); setRegion(''); setContactNote(''); setNextAction(''); setVisibility('private'); setKind('individual')
  }

  const removeSupporter = (id: number) => {
    const next = supporters.filter((s) => s.id !== id)
    setSupporters(next)
    persist(next)
  }

  const filtered = useMemo(
    () => (filter === 'all' ? supporters : supporters.filter((s) => s.supportTypes.includes(filter))),
    [supporters, filter]
  )
  const needsAction = useMemo(() => supporters.filter((s) => s.nextAction.trim() !== '').length, [supporters])

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>支援者CRM</h1>
        <p className='mt-1 text-sm text-gray-500'>
          応援者を管理します。支援タイプ・関心政策・接触履歴・次回アクションを記録し、関係づくりに使います。
        </p>
      </div>

      {/* サマリー */}
      <div className='mb-6 grid grid-cols-2 gap-3'>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <p className='text-xs text-gray-500'>支援者数</p>
          <p className='mt-1 text-lg font-bold text-gray-900'>{supporters.length}名</p>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <p className='text-xs text-gray-500'>要対応（次回アクションあり）</p>
          <p className='mt-1 text-lg font-bold text-amber-600'>{needsAction}件</p>
        </div>
      </div>

      {/* 登録フォーム */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-4 text-sm font-bold text-gray-900'>支援者を登録</h2>

        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>支援者名</label>
            <input className={inputCls} placeholder='例: 山田 花子 / 〇〇商工会' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>区分</label>
            <div className='flex gap-2'>
              {([['individual', '個人'], ['org', '団体']] as const).map(([v, l]) => (
                <button key={v} type='button' onClick={() => setKind(v)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${kind === v ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <div className='mb-4'>
          <label className={labelCls}>支援タイプ</label>
          <div className='flex flex-wrap gap-2'>
            {SUPPORT_TYPES.map((t) => (
              <button key={t} type='button' onClick={() => toggle(supportTypes, setSupportTypes, t)} className={chip(supportTypes.includes(t))}>{t}</button>
            ))}
          </div>
        </div>

        <div className='mb-4'>
          <label className={labelCls}>関心政策</label>
          <div className='flex flex-wrap gap-2'>
            {POLICY_THEMES.map((t) => (
              <button key={t.id} type='button' onClick={() => toggle(interests, setInterests, t.name)} className={chip(interests.includes(t.name))}>{t.name}</button>
            ))}
          </div>
        </div>

        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>地域</label>
            <input className={inputCls} placeholder='例: 東京都渋谷区' value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>公開設定</label>
            <select className={inputCls} value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
              <option value='private'>非公開</option>
              <option value='anonymous'>匿名</option>
              <option value='public'>公開</option>
            </select>
          </div>
        </div>

        <div className='mb-4'>
          <label className={labelCls}>接触履歴（面談・メール・電話・イベント等）</label>
          <textarea rows={2} className={`${inputCls} resize-none`} placeholder='例: 2026/6/10 防災勉強会で名刺交換。動画編集の協力可能とのこと。' value={contactNote} onChange={(e) => setContactNote(e.target.value)} />
        </div>

        <div className='mb-4'>
          <label className={labelCls}>次回アクション</label>
          <input className={inputCls} placeholder='例: 来週、動画編集の依頼を連絡' value={nextAction} onChange={(e) => setNextAction(e.target.value)} />
        </div>

        <button onClick={addSupporter} disabled={!canAdd} className='w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
          支援者を追加
        </button>
      </div>

      {/* 一覧 */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>支援者一覧（{filtered.length}名）</h2>
          <span className='text-xs text-gray-400'>{savedAt ? `最終保存 ${savedAt}` : ''}</span>
        </div>

        {/* フィルタ */}
        <div className='mb-4 flex flex-wrap gap-2'>
          <button type='button' onClick={() => setFilter('all')} className={chip(filter === 'all')}>すべて</button>
          {SUPPORT_TYPES.map((t) => (
            <button key={t} type='button' onClick={() => setFilter(t)} className={chip(filter === t)}>{t}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className='py-8 text-center text-sm text-gray-400'>{supporters.length === 0 ? 'まだ支援者がいません' : '該当する支援者がいません'}</p>
        ) : (
          <div className='space-y-3'>
            {filtered.map((s) => (
              <div key={s.id} className='rounded-lg border border-gray-100 p-4'>
                <div className='mb-2 flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-bold text-gray-900'>{s.name}</span>
                    <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500'>{s.kind === 'individual' ? '個人' : '団体'}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${VIS_META[s.visibility].cls}`}>{VIS_META[s.visibility].label}</span>
                  </div>
                  <button type='button' onClick={() => removeSupporter(s.id)} className='shrink-0 rounded px-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
                </div>

                {s.supportTypes.length > 0 && (
                  <div className='mb-2 flex flex-wrap gap-1'>
                    {s.supportTypes.map((t) => (
                      <span key={t} className='rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600'>{t}</span>
                    ))}
                  </div>
                )}

                <div className='space-y-0.5 text-xs text-gray-500'>
                  {s.region && <p>📍 {s.region}</p>}
                  {s.interests.length > 0 && <p>関心: {s.interests.join('、')}</p>}
                  {s.contactNote && <p className='text-gray-400'>履歴: {s.contactNote}</p>}
                </div>

                {s.nextAction && (
                  <div className='mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800'>
                    <span className='font-semibold'>次回:</span> {s.nextAction}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ 公開設定は個人情報保護の対象。assist.seijiselect.jp の支援者・支援募集との連携は将来フェーズ（BACKLOG.md 参照）
      </p>
    </div>
  )
}
