'use client'

/**
 * 【プロトタイプ】政治家向け 支援募集作成
 *
 * 目的: 候補者が「お金以外の支援」（チラシ配布・動画編集・会場・車両など）を募集する。
 *       ここで作った募集が assist.seijiselect.jp の支援案件一覧に表示される想定。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（本番: support_requests テーブル）。
 */

import { POLICY_THEMES } from '../_data'
import { useEffect, useState } from 'react'

const SUPPORT_NEEDS = [
  'チラシ配布', 'SNS拡散', '動画編集', 'デザイン', '法務相談', '会計相談',
  '政策調査', '街頭演説の場所', 'ポスター掲示', '事務所スペース', '車両貸与', '音響機材貸与',
] as const

type Reward = '無償' | '有償' | '要相談'
type Visibility = '支援者限定' | '一般公開'

interface SupportRequest {
  id: number
  title: string
  themeId: string
  need: string
  detail: string
  period: string
  reward: Reward
  visibility: Visibility
}

const STORAGE_KEY = 'proto_support_request_v1'
const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

export default function SupportRequestPage() {
  const [items, setItems] = useState<SupportRequest[]>([])
  const [savedAt, setSavedAt] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [themeId, setThemeId] = useState(POLICY_THEMES[0].id)
  const [need, setNeed] = useState<string>(SUPPORT_NEEDS[0])
  const [detail, setDetail] = useState('')
  const [period, setPeriod] = useState('')
  const [reward, setReward] = useState<Reward>('無償')
  const [visibility, setVisibility] = useState<Visibility>('支援者限定')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      setItems(d.items ?? [])
      setSavedAt(d.savedAt ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: SupportRequest[]) => {
    const now = new Date().toLocaleString('ja-JP')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: next, savedAt: now }))
    setSavedAt(now)
  }

  const canAdd = title.trim() !== ''

  const add = () => {
    if (!canAdd) return
    const next = [
      { id: Math.max(0, ...items.map((i) => i.id)) + 1, title, themeId, need, detail, period, reward, visibility },
      ...items,
    ]
    setItems(next)
    persist(next)
    setTitle(''); setDetail(''); setPeriod('')
  }

  const remove = (id: number) => {
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    persist(next)
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>支援募集作成</h1>
        <p className='mt-1 text-sm text-gray-500'>
          お金以外の支援（チラシ配布・動画編集・会場・車両など）を募集します。作成した募集は支援者サイトに表示されます。
        </p>
      </div>

      {/* 作成フォーム */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-4'>
          <label className={labelCls}>募集タイトル</label>
          <input className={inputCls} placeholder='例: 防災政策の紹介動画の編集者を募集' value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>政策テーマ</label>
            <select className={inputCls} value={themeId} onChange={(e) => setThemeId(e.target.value)}>
              {POLICY_THEMES.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
            </select>
          </div>
          <div>
            <label className={labelCls}>必要な支援</label>
            <select className={inputCls} value={need} onChange={(e) => setNeed(e.target.value)}>
              {SUPPORT_NEEDS.map((n) => (<option key={n} value={n}>{n}</option>))}
            </select>
          </div>
        </div>
        <div className='mb-4'>
          <label className={labelCls}>内容</label>
          <textarea rows={2} className={`${inputCls} resize-none`} placeholder='例: 3分程度の動画を2本。素材はこちらで用意します。' value={detail} onChange={(e) => setDetail(e.target.value)} />
        </div>
        <div className='mb-4 grid grid-cols-3 gap-3'>
          <div>
            <label className={labelCls}>期間</label>
            <input className={inputCls} placeholder='例: 2週間' value={period} onChange={(e) => setPeriod(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>報酬</label>
            <select className={inputCls} value={reward} onChange={(e) => setReward(e.target.value as Reward)}>
              <option value='無償'>無償</option>
              <option value='有償'>有償</option>
              <option value='要相談'>要相談</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>公開範囲</label>
            <select className={inputCls} value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
              <option value='支援者限定'>支援者限定</option>
              <option value='一般公開'>一般公開</option>
            </select>
          </div>
        </div>
        <button onClick={add} disabled={!canAdd} className='w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
          募集を作成
        </button>
      </div>

      {/* 一覧 */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>作成した募集（{items.length}件）</h2>
          <span className='text-xs text-gray-400'>{savedAt ? `最終保存 ${savedAt}` : ''}</span>
        </div>
        {items.length === 0 ? (
          <p className='py-8 text-center text-sm text-gray-400'>まだ募集がありません</p>
        ) : (
          <div className='space-y-2'>
            {items.map((i) => (
              <div key={i.id} className='rounded-lg border border-gray-100 p-3'>
                <div className='flex items-start justify-between gap-2'>
                  <span className='text-sm font-semibold text-gray-900'>{i.title}</span>
                  <button onClick={() => remove(i.id)} className='shrink-0 rounded px-1.5 text-gray-300 hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
                </div>
                <div className='mt-1 flex flex-wrap gap-1.5'>
                  <span className='rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600'>{i.need}</span>
                  <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>{themeName(i.themeId)}</span>
                  <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>{i.reward}</span>
                  <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>{i.visibility}</span>
                  {i.period && <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500'>{i.period}</span>}
                </div>
                {i.detail && <p className='mt-1.5 text-xs text-gray-500'>{i.detail}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
