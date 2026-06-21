'use client'

/**
 * 【プロトタイプ】政治家向け 政策実装スコア
 *
 * 目的: 候補者の活動実績を数値化する。議会質問・条例提出・予算化などの行動を点数化し、
 *       合計スコアを表示。一部は国民向け（候補者一覧の透明化/実績）に公開される想定。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（本番: activities / impact_scores テーブル）。
 */

import { loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

const ACTIVITY_TYPES: { label: string; points: number }[] = [
  { label: '政策アンケート回答', points: 5 },
  { label: '賛同表明', points: 10 },
  { label: '勉強会参加', points: 10 },
  { label: '成果報告提出', points: 20 },
  { label: '議会質問', points: 30 },
  { label: '行政要望', points: 30 },
  { label: '条例案提出', points: 50 },
  { label: '予算化に貢献', points: 70 },
  { label: '法案・制度改正に貢献', points: 100 },
]

const LEVELS = [
  { min: 0, label: 'ブロンズ', color: '#b45309' },
  { min: 100, label: 'シルバー', color: '#6b7280' },
  { min: 300, label: 'ゴールド', color: '#d97706' },
  { min: 600, label: 'プラチナ', color: '#0ea5e9' },
]

interface Activity {
  id: number
  label: string
  points: number
  date: string
  memo: string
}

const STORAGE_KEY = 'proto_impact_score_v1'

export default function ImpactScorePage() {
  const [items, setItems] = useState<Activity[]>([])
  const [type, setType] = useState(ACTIVITY_TYPES[4].label) // 議会質問
  const [date, setDate] = useState('')
  const [memo, setMemo] = useState('')

  useEffect(() => {
    const d = loadJSON<{ items?: Activity[] } | null>(STORAGE_KEY, null)
    if (d) setItems(d.items ?? [])
  }, [])

  const persist = (next: Activity[]) => saveJSON(STORAGE_KEY, { items: next })

  const total = useMemo(() => items.reduce((s, i) => s + i.points, 0), [items])
  const level = useMemo(() => [...LEVELS].reverse().find((l) => total >= l.min) ?? LEVELS[0], [total])
  const nextLevel = useMemo(() => LEVELS.find((l) => l.min > total), [total])

  // 種別ごとの内訳
  const breakdown = useMemo(() => {
    const map: Record<string, { count: number; points: number }> = {}
    for (const i of items) {
      map[i.label] = map[i.label] ?? { count: 0, points: 0 }
      map[i.label].count += 1
      map[i.label].points += i.points
    }
    return Object.entries(map).sort((a, b) => b[1].points - a[1].points)
  }, [items])

  const add = () => {
    const at = ACTIVITY_TYPES.find((a) => a.label === type)!
    const next = [
      { id: Math.max(0, ...items.map((i) => i.id)) + 1, label: at.label, points: at.points, date, memo },
      ...items,
    ]
    setItems(next)
    persist(next)
    setDate(''); setMemo('')
  }

  const remove = (id: number) => {
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    persist(next)
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>政策実装スコア</h1>
        <p className='mt-1 text-sm text-gray-500'>
          活動実績を記録すると点数化されます。スコアの一部は国民向けサイトの実績として公開されます。
        </p>
      </div>

      {/* スコアカード */}
      <div className='mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-center'>
        <p className='text-xs text-gray-500'>政策実装スコア</p>
        <p className='mt-1 text-4xl font-bold text-gray-900'>{total}</p>
        <span className='mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold text-white' style={{ backgroundColor: level.color }}>
          {level.label}
        </span>
        {nextLevel && (
          <p className='mt-2 text-xs text-gray-400'>次のランク「{nextLevel.label}」まであと {nextLevel.min - total} 点</p>
        )}
        {breakdown.length > 0 && (
          <div className='mt-4 space-y-1.5 text-left'>
            {breakdown.map(([label, v]) => (
              <div key={label} className='flex items-center justify-between text-sm'>
                <span className='text-gray-600'>{label} <span className='text-gray-400'>×{v.count}</span></span>
                <span className='font-semibold text-gray-800'>{v.points}点</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 活動を記録 */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-4 text-sm font-bold text-gray-900'>活動を記録</h2>
        <div className='mb-3 grid grid-cols-2 gap-3'>
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>活動の種類</label>
            <select className={inputCls} value={type} onChange={(e) => setType(e.target.value)}>
              {ACTIVITY_TYPES.map((a) => (<option key={a.label} value={a.label}>{a.label}（{a.points}点）</option>))}
            </select>
          </div>
          <div>
            <label className='mb-1.5 block text-sm font-medium text-gray-700'>日付</label>
            <input type='date' className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className='mb-3'>
          <label className='mb-1.5 block text-sm font-medium text-gray-700'>メモ（任意）</label>
          <input className={inputCls} placeholder='例: 都議会で避難所の蓄電池配備を質問' value={memo} onChange={(e) => setMemo(e.target.value)} />
        </div>
        <button onClick={add} className='w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700'>
          活動を追加（+{ACTIVITY_TYPES.find((a) => a.label === type)?.points}点）
        </button>
      </div>

      {/* 履歴 */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>活動履歴（{items.length}件）</h2>
        {items.length === 0 ? (
          <p className='py-8 text-center text-sm text-gray-400'>まだ活動がありません</p>
        ) : (
          <div className='space-y-2'>
            {items.map((i) => (
              <div key={i.id} className='flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5'>
                <span className='shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-600'>+{i.points}</span>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-medium text-gray-800'>{i.label}</p>
                  <p className='truncate text-xs text-gray-400'>{i.date}{i.memo ? ` · ${i.memo}` : ''}</p>
                </div>
                <button onClick={() => remove(i.id)} className='shrink-0 rounded px-1.5 text-gray-300 hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
