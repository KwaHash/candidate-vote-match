'use client'

/**
 * 【プロトタイプ】政治家向け 選挙活動タスク管理
 *
 * 目的: 選挙・政策活動のタスクを「未着手/進行中/完了」で管理する。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（proto_campaign_tasks_v1 / 本番: tasks テーブル）。
 */

import { useEffect, useMemo, useState } from 'react'

type Status = 'todo' | 'doing' | 'done'

const STATUS_META: Record<Status, { label: string; cls: string; next: Status }> = {
  todo: { label: '未着手', cls: 'bg-gray-100 text-gray-600', next: 'doing' },
  doing: { label: '進行中', cls: 'bg-amber-100 text-amber-700', next: 'done' },
  done: { label: '完了', cls: 'bg-emerald-100 text-emerald-700', next: 'todo' },
}

const CATEGORIES = ['告示準備', '広報', '街頭活動', '事務所', 'SNS', '政策', 'その他'] as const

interface Task {
  id: number
  title: string
  category: string
  due: string
  status: Status
}

const STORAGE_KEY = 'proto_campaign_tasks_v1'

const SEED: Task[] = [
  { id: 1, title: 'ポスター掲示の手配', category: '広報', due: '', status: 'doing' },
  { id: 2, title: '街頭演説のスケジュール確定', category: '街頭活動', due: '', status: 'todo' },
  { id: 3, title: '政策チラシの原稿作成', category: '政策', due: '', status: 'done' },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [due, setDue] = useState('')
  const [filter, setFilter] = useState<'all' | Status>('all')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      setTasks(raw ? (JSON.parse(raw).tasks ?? SEED) : SEED)
    } catch {
      setTasks(SEED)
    }
  }, [])

  const persist = (next: Task[]) => {
    setTasks(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: next }))
  }

  const add = () => {
    if (!title.trim()) return
    persist([{ id: Math.max(0, ...tasks.map((t) => t.id)) + 1, title, category, due, status: 'todo' }, ...tasks])
    setTitle(''); setDue('')
  }
  const cycle = (id: number) => persist(tasks.map((t) => t.id === id ? { ...t, status: STATUS_META[t.status].next } : t))
  const remove = (id: number) => persist(tasks.filter((t) => t.id !== id))

  const counts = useMemo(() => ({
    todo: tasks.filter((t) => t.status === 'todo').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks])
  const progress = tasks.length ? Math.round((counts.done / tasks.length) * 100) : 0
  const shown = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter)

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>選挙活動タスク管理</h1>
        <p className='mt-1 text-sm text-gray-500'>選挙・政策活動のタスクを未着手/進行中/完了で管理します。</p>
      </div>

      {/* 進捗 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-4'>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium text-gray-700'>完了 {counts.done} / {tasks.length} 件</span>
          <span className='font-semibold text-indigo-600'>{progress}%</span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
          <div className='h-full rounded-full bg-indigo-500 transition-all' style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* 追加 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-4'>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <input className={`${inputCls} flex-1`} placeholder='タスクを入力' value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add() }} />
          <select className={`${inputCls} sm:w-32`} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <input type='date' className={`${inputCls} sm:w-40`} value={due} onChange={(e) => setDue(e.target.value)} />
          <button onClick={add} className='shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700'>追加</button>
        </div>
      </div>

      {/* フィルタ */}
      <div className='mb-3 flex flex-wrap gap-2'>
        {(['all', 'todo', 'doing', 'done'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? `すべて(${tasks.length})` : `${STATUS_META[f].label}(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* 一覧 */}
      <div className='space-y-2'>
        {shown.map((t) => (
          <div key={t.id} className='flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5'>
            <button onClick={() => cycle(t.id)} className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${STATUS_META[t.status].cls}`}>
              {STATUS_META[t.status].label}
            </button>
            <div className='min-w-0 flex-1'>
              <p className={`text-sm font-medium ${t.status === 'done' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.title}</p>
              <p className='text-[11px] text-gray-400'>{t.category}{t.due ? ` · 期限 ${t.due}` : ''}</p>
            </div>
            <button onClick={() => remove(t.id)} className='shrink-0 rounded px-1.5 text-gray-300 hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
          </div>
        ))}
        {shown.length === 0 && <p className='py-8 text-center text-sm text-gray-400'>タスクがありません</p>}
      </div>
      <p className='mt-2 text-center text-[11px] text-gray-400'>ステータスのバッジをタップすると 未着手→進行中→完了 と切り替わります。</p>
    </div>
  )
}
