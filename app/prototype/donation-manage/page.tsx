'use client'

/**
 * 【プロトタイプ】政治家向け 定期献金・献金キャンペーン管理
 *
 * 目的: 定期献金（サブスク）と「献金のお願い」キャンペーンを管理する。
 *       受け取りは B案（プラットフォーム集約=決済代行モデル）を前提。集約→手数料控除→政治団体口座へ振込。
 *
 * 注意: 動く仕様書（プロトタイプ）。決済はせず、設定・キャンペーン・支援者の管理のみ。
 *   本番は決済代行（クレカ定期課金）＋政治資金規正法対応（本人確認/上限/国籍/収支報告データ）。
 *   ※ MVPは政策ファンド/会費/クラファンから。候補者直接献金は法務整理後。
 */

import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`
const FEE_RATE = 0.05 // 決済手数料5%（vonnector参考）
const TRANSFER_FEE = 500 // 振込手数料/回

const PLAN_TIERS = [500, 1000, 3000, 10000]

interface Campaign {
  id: number
  title: string
  message: string
  goal: number
  deadline: string
  channels: string[]
  sent: number
  newSupporters: number
}

interface Supporter {
  name: string
  amount: number
  months: number
  next: string
  active: boolean
}

const SAMPLE_SUPPORTERS: Supporter[] = [
  { name: '山田 花子', amount: 1000, months: 8, next: '2026-07-31', active: true },
  { name: '佐藤 太郎', amount: 3000, months: 14, next: '2026-07-31', active: true },
  { name: '〇〇商店', amount: 10000, months: 3, next: '2026-07-31', active: true },
  { name: '鈴木 一郎', amount: 500, months: 2, next: '—', active: false },
]

const SAMPLE_CAMPAIGNS: Campaign[] = [
  { id: 1, title: '防災政策・月1,000円の継続支援のお願い', message: '避難所の備えを進めるため、毎月のご支援をお願いします。', goal: 300000, deadline: '2026-08-31', channels: ['LINE', 'メール'], sent: 420, newSupporters: 12 },
]

const CHANNELS = ['LINE', 'メール', 'X', 'Facebook'] as const

export default function DonationManagePage() {
  const [offered, setOffered] = useState<number[]>([1000, 3000])
  const [campaigns, setCampaigns] = useState<Campaign[]>(SAMPLE_CAMPAIGNS)
  // フォーム
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [goal, setGoal] = useState<number | ''>('')
  const [deadline, setDeadline] = useState('')
  const [channels, setChannels] = useState<string[]>(['LINE'])

  useEffect(() => {
    const d = loadJSON<{ offered?: number[]; campaigns?: Campaign[] } | null>(STORE_KEYS.recurringDonation, null)
    if (d) { setOffered(d.offered ?? [1000, 3000]); setCampaigns(d.campaigns ?? SAMPLE_CAMPAIGNS) }
  }, [])

  const persist = (next: { offered: number[]; campaigns: Campaign[] }) => saveJSON(STORE_KEYS.recurringDonation, next)

  const active = SAMPLE_SUPPORTERS.filter((s) => s.active)
  const mrr = active.reduce((a, s) => a + s.amount, 0)
  const payout = useMemo(() => Math.max(0, Math.round(mrr * (1 - FEE_RATE)) - TRANSFER_FEE), [mrr])

  const toggleTier = (t: number) => {
    const next = offered.includes(t) ? offered.filter((x) => x !== t) : [...offered, t]
    setOffered(next); persist({ offered: next, campaigns })
  }
  const toggleChannel = (c: string) => setChannels((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p, c])

  const aiDraft = () => {
    setTitle('月1,000円の継続支援のお願い')
    setMessage('いつも応援ありがとうございます。政策を前に進めるため、毎月のご支援をお願いできれば幸いです。少額でも継続が大きな力になります。')
    setGoal(300000)
  }

  const canCreate = title.trim() !== ''
  const create = () => {
    if (!canCreate) return
    const next = [{ id: Math.max(0, ...campaigns.map((c) => c.id)) + 1, title, message, goal: typeof goal === 'number' ? goal : 0, deadline, channels, sent: 0, newSupporters: 0 }, ...campaigns]
    setCampaigns(next); persist({ offered, campaigns: next })
    setTitle(''); setMessage(''); setGoal(''); setDeadline('')
  }
  const remove = (id: number) => { const next = campaigns.filter((c) => c.id !== id); setCampaigns(next); persist({ offered, campaigns: next }) }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-600'
  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>定期献金・献金のお願い管理</h1>
        <p className='mt-1 text-sm text-gray-500'>
          毎月の定期支援（サブスク）と「献金のお願い」を管理します。受け取りはプラットフォーム集約（決済代行）方式。
        </p>
      </div>

      {/* サマリー */}
      <div className='mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className={card}><p className='text-xs text-gray-500'>月間定期収入(MRR)</p><p className='mt-1 text-lg font-bold text-gray-900'>{yen(mrr)}</p></div>
        <div className={card}><p className='text-xs text-gray-500'>定期支援者</p><p className='mt-1 text-lg font-bold text-gray-900'>{active.length}名</p></div>
        <div className={card}><p className='text-xs text-gray-500'>今月の停止</p><p className='mt-1 text-lg font-bold text-rose-600'>{SAMPLE_SUPPORTERS.length - active.length}名</p></div>
        <div className={card}><p className='text-xs text-gray-500'>振込見込み</p><p className='mt-1 text-lg font-bold text-emerald-600'>{yen(payout)}</p></div>
      </div>

      <div className='mb-5 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs text-indigo-800'>
        💳 受け取り方式: <strong>プラットフォーム集約（決済代行）</strong> ／ 手数料モデル例: 決済 {FEE_RATE * 100}% ＋ 振込 {yen(TRANSFER_FEE)}/回 ／ 月末締め・翌月末に政治団体口座へ振込（vonnector参考）。
      </div>

      {/* 定期献金プラン */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>定期献金プラン（提供する月額）</h2>
        <div className='flex flex-wrap gap-2'>
          {PLAN_TIERS.map((t) => (
            <button key={t} onClick={() => toggleTier(t)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${offered.includes(t) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>月額 {yen(t)}</button>
          ))}
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>選んだ月額が国民向けの「月額で応援」に表示されます。</p>
      </div>

      {/* 献金のお願い 作成 */}
      <div className={`${card} mb-5`}>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>献金のお願いを作成</h2>
          <button onClick={aiDraft} className='rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700'>🤖 AIで下書き</button>
        </div>
        <div className='space-y-3'>
          <div><label className={labelCls}>タイトル</label><input className={inputCls} placeholder='例: 月1,000円の継続支援のお願い' value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><label className={labelCls}>メッセージ</label><textarea rows={2} className={`${inputCls} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className='grid grid-cols-2 gap-3'>
            <div><label className={labelCls}>目標額</label><input type='number' className={inputCls} placeholder='300000' value={goal} onChange={(e) => setGoal(e.target.value === '' ? '' : Number(e.target.value))} /></div>
            <div><label className={labelCls}>期限</label><input type='date' className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>配信先</label>
            <div className='flex flex-wrap gap-2'>
              {CHANNELS.map((c) => (<button key={c} onClick={() => toggleChannel(c)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${channels.includes(c) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c}</button>))}
            </div>
          </div>
        </div>
        <button onClick={create} disabled={!canCreate} className='mt-4 w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'>キャンペーンを作成・配信（プロト）</button>
      </div>

      {/* キャンペーン一覧 */}
      <div className={`${card} mb-5`}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>献金のお願い（{campaigns.length}件）</h2>
        {campaigns.length === 0 ? <p className='py-6 text-center text-sm text-gray-400'>まだありません</p> : (
          <div className='space-y-2'>
            {campaigns.map((c) => (
              <div key={c.id} className='rounded-lg border border-gray-100 p-3'>
                <div className='flex items-start justify-between gap-2'>
                  <span className='text-sm font-semibold text-gray-900'>{c.title}</span>
                  <button onClick={() => remove(c.id)} className='shrink-0 rounded px-1.5 text-gray-300 hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
                </div>
                {c.message && <p className='mt-0.5 text-xs text-gray-500'>{c.message}</p>}
                <div className='mt-1.5 flex flex-wrap gap-1.5 text-[11px] text-gray-400'>
                  {c.goal > 0 && <span className='rounded bg-gray-100 px-1.5'>目標 {yen(c.goal)}</span>}
                  {c.deadline && <span className='rounded bg-gray-100 px-1.5'>〜{c.deadline}</span>}
                  {c.channels.map((ch) => <span key={ch} className='rounded bg-gray-100 px-1.5'>{ch}</span>)}
                  <span className='rounded bg-blue-50 px-1.5 text-blue-600'>配信 {c.sent} ・ 新規支援 {c.newSupporters}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 定期支援者 */}
      <div className={card}>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>定期支援者</h2>
        <div className='space-y-1.5'>
          {SAMPLE_SUPPORTERS.map((s) => (
            <div key={s.name} className='flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2 text-sm'>
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className='min-w-0 flex-1 font-medium text-gray-800'>{s.name}</span>
              <span className='text-gray-600'>{yen(s.amount)}/月</span>
              <span className='hidden text-xs text-gray-400 sm:inline'>継続{s.months}ヶ月</span>
              <span className='text-xs text-gray-400'>{s.active ? `次回 ${s.next}` : '停止'}</span>
            </div>
          ))}
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>※ サンプル。本番は決済代行のサブスク状態（課金成功/失敗/解約）を同期。</p>
      </div>

      <p className='mt-5 text-center text-xs text-gray-400'>※ 本番は決済代行＋政治資金規正法対応（本人確認/寄付上限/国籍確認/収支報告データ）。MVPは政策ファンド・会費から。</p>
    </div>
  )
}
