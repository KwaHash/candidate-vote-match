'use client'

/**
 * 【プロトタイプ】政治家向け AI政策秘書（収益機能）
 *
 * 目的: 議会質問案・公約・SNS投稿・想定問答などの作成を支援する候補者向け有料AI機能。
 *
 * 注意: 動く仕様書（プロトタイプ）。生成はテンプレートによるサンプル出力で、実際のLLMは呼んでいません。
 *   本番は候補者ごとに従量課金で生成（国民向けの無料機能とは別。コスト方針）。
 */

import { useState } from 'react'

type ToolKey = 'question' | 'pledge' | 'sns' | 'flyer' | 'qa' | 'report'

const TOOLS: { key: ToolKey; label: string; emoji: string; placeholder: string }[] = [
  { key: 'question', label: '議会質問案', emoji: '🏛️', placeholder: '例: 避難所の蓄電池配備' },
  { key: 'pledge', label: '公約案', emoji: '📜', placeholder: '例: 子育て世帯の負担軽減' },
  { key: 'sns', label: 'SNS投稿案', emoji: '📱', placeholder: '例: 防災訓練に参加しました' },
  { key: 'flyer', label: 'チラシ文章', emoji: '📰', placeholder: '例: 入札の透明化' },
  { key: 'qa', label: '想定問答', emoji: '💬', placeholder: '例: 増税への賛否' },
  { key: 'report', label: '活動レポート', emoji: '📊', placeholder: '例: 6月の議会活動' },
]

function generate(tool: ToolKey, topic: string): string {
  const t = topic.trim() || '（テーマ）'
  switch (tool) {
    case 'question':
      return `【議会質問案：${t}】\n\n1. 現状認識\n　${t}について、現場ではどのような課題が生じているか、当局の認識を伺います。\n\n2. これまでの取り組み\n　これまでの対応と、その効果・限界をどう評価しているかお聞きします。\n\n3. 具体的提案\n　${t}に関し、財源・期限・手順を明確にした上で、次の3点を提案します。\n　①…　②…　③…\n\n4. 答弁を求める点\n　いつまでに、何を、どの部署が実施するのか、明確な答弁を求めます。`
    case 'pledge':
      return `【公約案：${t}】\n\nめざす姿：${t}を実現し、暮らしの安心につなげます。\n\n・実行すること：…\n・財源：歳出の見直し／国・県の補助の活用\n・期限：任期内に着手、2年以内に成果\n・検証：実装スコアと成果報告で進捗を公開`
    case 'sns':
      return `【SNS投稿案：${t}】\n\n本日、${t}に取り組みました。\n現場の声をしっかり受け止め、政策につなげます。\n\n「${t}」で、暮らしを一歩前へ。\n#わたしの政治 #seijiselect`
    case 'flyer':
      return `【チラシ文章：${t}】\n\n━━━━━━━━━━━━\n${t}を、前へ。\n━━━━━━━━━━━━\n\nいま必要なのは、わかりやすい説明と、確かな実行力です。\n${t}について、財源と期限を明確にして取り組みます。\n\n▶ あなたの一票が、${t}を動かします。`
    case 'qa':
      return `【想定問答：${t}】\n\nQ. ${t}について、賛成ですか反対ですか？\nA. 結論から申し上げると…。理由は3点あります。①… ②… ③…\n\nQ. 財源はどうするのですか？\nA. まず歳出の見直しで…。不足分は…で対応します。\n\nQ. いつ実現するのですか？\nA. 任期内に着手し、2年以内の成果をめざします。`
    case 'report':
      return `【活動レポート：${t}】\n\n■ 今期の主な活動\n・議会質問：${t} ほか\n・行政要望：…\n・地域活動：…\n\n■ 成果\n・…が予算化されました\n・…の改善につながりました\n\n■ 次の取り組み\n・…を進めます`
  }
}

export default function AiSecretaryPage() {
  const [tool, setTool] = useState<ToolKey>('question')
  const [topic, setTopic] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const current = TOOLS.find((t) => t.key === tool)!

  const run = () => {
    setOutput(generate(tool, topic))
    setCopied(false)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>AI政策秘書</h1>
        <p className='mt-1 text-sm text-gray-500'>
          議会質問案・公約・SNS投稿・想定問答などの作成を支援します（候補者向けの有料機能）。
        </p>
      </div>

      {/* ツール選択 */}
      <div className='mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6'>
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTool(t.key); setOutput('') }}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
              tool === t.key ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className='text-xl'>{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* 入力 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <label className='mb-1.5 block text-sm font-medium text-gray-700'>{current.label}のテーマ・キーワード</label>
        <div className='flex gap-2'>
          <input
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
            placeholder={current.placeholder}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') run() }}
          />
          <button onClick={run} className='shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700'>
            生成
          </button>
        </div>
      </div>

      {/* 出力 */}
      {output && (
        <div className='rounded-xl border border-gray-200 bg-white p-5'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-bold text-gray-900'>生成結果</h2>
            <button onClick={copy} className='rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50'>
              {copied ? 'コピーしました' : 'コピー'}
            </button>
          </div>
          <pre className='whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-800'>{output}</pre>
        </div>
      )}

      <p className='mt-4 text-center text-xs text-gray-400'>
        ※ プロトタイプの生成はテンプレートによるサンプルです。本番は候補者ごとの従量課金でAI生成（国民向けの無料機能とは分離）。
      </p>
    </div>
  )
}
