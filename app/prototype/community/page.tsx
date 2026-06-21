'use client'

/**
 * 【プロトタイプ】政治家向け LINE・SNSコミュニティ管理
 *
 * 目的: LINE/X/Facebook の投稿案をAI生成し、カレンダー・リマインダー・セグメント配信で運用する。
 *       属人的なLINE投稿を「AI補助付きのコミュニティ運営」に変える。
 *
 * 注意: 動く仕様書（プロトタイプ）。投稿案はテンプレート（実LLM未使用）。本番は community_posts / reminders。
 */

import { useState } from 'react'

const CHANNELS = ['LINE', 'X', 'Facebook'] as const
const SEGMENTS = ['全員', '防災関心者', '寄付者', 'ボランティア', '子育て世帯', '地域別'] as const

const TODAY_IDEAS = ['防災政策の進捗報告', '支援者へのお礼', '週末イベント案内', '政策アンケート依頼', 'クラファン残り7日告知']

const REMINDERS = [
  { when: '明日 19:00', what: 'LINEで政策アンケートを投稿' },
  { when: '3日後', what: '支援者向け活動報告' },
  { when: '7日後', what: 'クラファン中間報告' },
  { when: '毎週月曜', what: '今週の活動予定を投稿' },
  { when: '毎月末', what: '収支・成果報告を投稿' },
]

function draft(channel: string, topic: string, segment: string): string {
  const t = topic.trim() || '活動報告'
  const seg = segment === '全員' ? '' : `（${segment}向け）`
  if (channel === 'LINE') return `${seg}\nこんにちは。本日は「${t}」についてお知らせします。\n\n・ポイント1\n・ポイント2\n\nご意見はこのトークにお返事ください。今週もよろしくお願いします。`
  if (channel === 'X') return `【${t}】${seg}\n本日取り組みました。財源と期限を明確にして前へ。\n詳しくはプロフィールのリンクから。 #わたしの政治 #seijiselect`
  return `${seg}\n${t}についてご報告します。\n\n地域の声を受け止め、政策につなげています。コメント・シェアで応援いただけると励みになります。`
}

export default function CommunityPage() {
  const [channel, setChannel] = useState<string>('LINE')
  const [segment, setSegment] = useState<string>('全員')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const run = () => { setOutput(draft(channel, topic, segment)); setCopied(false) }
  const copy = async () => { try { await navigator.clipboard.writeText(output); setCopied(true) } catch { /* ignore */ } }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const chip = (active: boolean) => `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>LINE・SNSコミュニティ管理</h1>
        <p className='mt-1 text-sm text-gray-500'>投稿案のAI生成・セグメント配信・リマインダーで、コミュニティ運営を仕組み化します。</p>
      </div>

      {/* 今日の投稿候補 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-4'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>今日の投稿候補</h2>
        <div className='flex flex-wrap gap-2'>
          {TODAY_IDEAS.map((idea) => (
            <button key={idea} onClick={() => setTopic(idea)} className='rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100'>{idea}</button>
          ))}
        </div>
      </div>

      {/* 投稿案AI */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>投稿案AI</h2>
        <div className='mb-3'>
          <p className='mb-1 text-xs font-medium text-gray-600'>チャネル</p>
          <div className='flex gap-2'>{CHANNELS.map((c) => (<button key={c} onClick={() => setChannel(c)} className={chip(channel === c)}>{c}</button>))}</div>
        </div>
        <div className='mb-3'>
          <p className='mb-1 text-xs font-medium text-gray-600'>配信セグメント</p>
          <div className='flex flex-wrap gap-2'>{SEGMENTS.map((s) => (<button key={s} onClick={() => setSegment(s)} className={chip(segment === s)}>{s}</button>))}</div>
        </div>
        <div className='flex gap-2'>
          <input className={inputCls} placeholder='テーマ（例: 防災政策の進捗報告）' value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run() }} />
          <button onClick={run} className='shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700'>生成</button>
        </div>
        {output && (
          <div className='mt-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-medium text-gray-400'>{channel} 投稿案</span>
              <button onClick={copy} className='rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50'>{copied ? 'コピー済' : 'コピー'}</button>
            </div>
            <pre className='whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800'>{output}</pre>
            <p className='mt-2 text-[11px] text-gray-400'>※ 本番は投稿前の炎上リスクチェック・承認フロー（候補者本人が承認）を通します。</p>
          </div>
        )}
      </div>

      {/* リマインダー */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>リマインダー</h2>
        <div className='space-y-2'>
          {REMINDERS.map((r, idx) => (
            <div key={idx} className='flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2.5'>
              <span className='shrink-0 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-600'>{r.when}</span>
              <span className='text-sm text-gray-700'>{r.what}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
