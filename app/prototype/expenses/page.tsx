'use client'

/**
 * 【プロトタイプ】政治家向け 支出・証憑登録（政治資金透明化）画面
 *
 * 目的: 収入・支出を証憑つきで登録し、収支・残高を可視化する。
 *       国民向け seijiselect.jp の透明化ダッシュボードの素データ（Expense ID）になる。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（本番では incomes / expenses / receipts テーブルへ）。
 *   証憑は「ファイル名のみ」を保持（本番はストレージへアップロード）。
 *   政治資金規正法・公職選挙法のチェックは本番で必須（BACKLOG.md 8章）。
 */

import { useEffect, useMemo, useState } from 'react'

type TxType = 'income' | 'expense'

const INCOME_CATEGORIES = ['寄付', '会費', '政治資金パーティー', 'クラウドファンディング', '自己資金', '政党支部からの資金', 'その他'] as const
const EXPENSE_CATEGORIES = ['広報費', 'チラシ', 'Web広告', '動画制作', '事務所費', '人件費', '交通費', '会場費', '調査費', '政策立案費', 'システム利用料', '法務・会計費'] as const

interface Tx {
  id: number
  type: TxType
  category: string
  amount: number
  date: string
  counterpart: string // 支出先 / 寄付元
  receiptName: string // 証憑ファイル名
  isPublic: boolean
  isRelatedParty: boolean // 関連当事者取引フラグ
}

const STORAGE_KEY = 'proto_expenses_v1'
const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

export default function ExpensesPrototypePage() {
  const [txs, setTxs] = useState<Tx[]>([])
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // 入力フォーム
  const [type, setType] = useState<TxType>('expense')
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0])
  const [amount, setAmount] = useState<number | ''>('')
  const [date, setDate] = useState('')
  const [counterpart, setCounterpart] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isRelatedParty, setIsRelatedParty] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const d = JSON.parse(raw)
      setTxs(d.txs ?? [])
      setSavedAt(d.savedAt ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: Tx[]) => {
    const now = new Date().toLocaleString('ja-JP')
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ txs: next, savedAt: now }))
    setSavedAt(now)
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const switchType = (t: TxType) => {
    setType(t)
    setCategory((t === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0])
  }

  const canAdd = typeof amount === 'number' && amount > 0 && date !== ''

  const addTx = () => {
    if (!canAdd) return
    const next: Tx[] = [
      {
        id: Math.max(0, ...txs.map((t) => t.id)) + 1,
        type, category, amount: amount as number, date, counterpart,
        receiptName, isPublic, isRelatedParty,
      },
      ...txs,
    ]
    setTxs(next)
    persist(next)
    // フォームリセット（種別・公開設定は維持）
    setAmount(''); setDate(''); setCounterpart(''); setReceiptName(''); setIsRelatedParty(false)
  }

  const removeTx = (id: number) => {
    const next = txs.filter((t) => t.id !== id)
    setTxs(next)
    persist(next)
  }

  const { income, expense } = useMemo(() => {
    let income = 0, expense = 0
    for (const t of txs) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }, [txs])
  const balance = income - expense

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
        <h1 className='text-2xl font-bold text-gray-900'>支出・証憑登録（政治資金透明化）</h1>
        <p className='mt-1 text-sm text-gray-500'>
          収入・支出を証憑つきで登録します。公開設定した項目が、国民向けの透明化ダッシュボードに反映されます。
        </p>
      </div>

      {/* 収支サマリー */}
      <div className='mb-6 grid grid-cols-3 gap-3'>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <p className='text-xs text-gray-500'>収入計</p>
          <p className='mt-1 text-lg font-bold text-emerald-600'>{yen(income)}</p>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <p className='text-xs text-gray-500'>支出計</p>
          <p className='mt-1 text-lg font-bold text-rose-600'>{yen(expense)}</p>
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-4'>
          <p className='text-xs text-gray-500'>残高</p>
          <p className={`mt-1 text-lg font-bold ${balance < 0 ? 'text-rose-600' : 'text-gray-900'}`}>{yen(balance)}</p>
        </div>
      </div>

      {/* 登録フォーム */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-4 text-sm font-bold text-gray-900'>明細を登録</h2>

        {/* 収入 / 支出 */}
        <div className='mb-4 flex gap-2'>
          {([['income', '収入'], ['expense', '支出']] as const).map(([v, l]) => (
            <button
              key={v}
              type='button'
              onClick={() => switchType(v)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                type === v
                  ? v === 'income'
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-rose-400 bg-rose-50 text-rose-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className='mb-4 grid grid-cols-2 gap-3'>
          <div>
            <label className={labelCls}>分類</label>
            <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>金額（円）</label>
            <input
              type='number' min={0} className={inputCls} placeholder='例: 50000'
              value={amount}
              onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </div>
          <div>
            <label className={labelCls}>日付</label>
            <input type='date' className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{type === 'income' ? '寄付元 / 相手先' : '支出先'}</label>
            <input className={inputCls} placeholder='例: 〇〇印刷株式会社' value={counterpart} onChange={(e) => setCounterpart(e.target.value)} />
          </div>
        </div>

        {/* 証憑 */}
        <div className='mb-4'>
          <label className={labelCls}>証憑（領収書・請求書・契約書）</label>
          <div className='flex items-center gap-3'>
            <label className='cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50'>
              ファイルを選択
              <input
                type='file'
                className='hidden'
                onChange={(e) => setReceiptName(e.target.files?.[0]?.name ?? '')}
                accept='image/*,application/pdf'
              />
            </label>
            <span className='text-sm text-gray-500'>
              {receiptName ? `📎 ${receiptName}` : '未選択'}
            </span>
          </div>
        </div>

        {/* 公開可否・関連当事者 */}
        <div className='mb-4 flex flex-wrap items-center gap-4'>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input type='checkbox' className='h-4 w-4 accent-indigo-600' checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            透明化ダッシュボードに公開する
          </label>
          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input type='checkbox' className='h-4 w-4 accent-amber-500' checked={isRelatedParty} onChange={(e) => setIsRelatedParty(e.target.checked)} />
            関連当事者取引
          </label>
        </div>

        <button
          onClick={addTx}
          disabled={!canAdd}
          className='w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'
        >
          明細を追加
        </button>
      </div>

      {/* 台帳 */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>登録済み明細（{txs.length}件）</h2>
          <span className='text-xs text-gray-400'>{savedAt ? `最終保存 ${savedAt}` : ''}</span>
        </div>
        {txs.length === 0 ? (
          <p className='py-8 text-center text-sm text-gray-400'>まだ明細がありません</p>
        ) : (
          <div className='space-y-2'>
            {txs.map((t) => (
              <div key={t.id} className='flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5'>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {t.type === 'income' ? '収入' : '支出'}
                </span>
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate text-sm font-medium text-gray-800'>{t.category}</span>
                    {t.receiptName && <span className='shrink-0 text-xs text-gray-400'>📎</span>}
                    {!t.isPublic && <span className='shrink-0 rounded bg-gray-100 px-1.5 text-[10px] text-gray-500'>非公開</span>}
                    {t.isRelatedParty && <span className='shrink-0 rounded bg-amber-100 px-1.5 text-[10px] text-amber-700'>関連当事者</span>}
                  </div>
                  <p className='truncate text-xs text-gray-400'>{t.date}{t.counterpart ? ` · ${t.counterpart}` : ''}</p>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {t.type === 'income' ? '+' : '−'}{yen(t.amount)}
                </span>
                <button type='button' onClick={() => removeTx(t.id)} className='shrink-0 rounded px-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ 政治資金規正法・公職選挙法の確認、収支報告用CSV出力は本番で実装（BACKLOG.md 参照）
      </p>
    </div>
  )
}
