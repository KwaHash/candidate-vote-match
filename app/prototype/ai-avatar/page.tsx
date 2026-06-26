'use client'

/**
 * 【プロトタイプ】政治家向け 候補者AIアバター設定
 *
 * 目的: 候補者が、有権者の質問に答える「AIアバター」を設定する。
 *       プロフィール・政策スタンスを土台に、トーンと重点メッセージを設定し、回答をプレビューできる。
 *       設定したアバターは国民向けサイトで有権者対応する想定（構想の差別化機能）。
 *
 * 注意: 動く仕様書（プロトタイプ）。回答はテンプレート（実LLM未使用）。保存は proto_ai_avatar_v1。
 */

import { POLICY_THEMES } from '../_data'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

type Tone = 'polite' | 'friendly' | 'passionate'
const TONES: { value: Tone; label: string }[] = [
  { value: 'polite', label: '丁寧・誠実' },
  { value: 'friendly', label: '親しみやすい' },
  { value: 'passionate', label: '熱意がある' },
]

interface Avatar {
  tone: Tone
  keyMessage: string
  fallback: string
}

interface QA { q: string; a: string }

export default function AiAvatarPage() {
  const [tone, setTone] = useState<Tone>('polite')
  const [keyMessage, setKeyMessage] = useState('')
  const [fallback, setFallback] = useState('いただいたご質問は事務所で確認し、改めて回答します。')
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // プレビュー用
  const [question, setQuestion] = useState('')
  const [log, setLog] = useState<QA[]>([])

  // 土台データ（プロフィール・政策スタンス）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = useMemo<any>(() => loadJSON<any>(STORE_KEYS.candidateProfile, {}), [])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stances = useMemo<any>(() => loadJSON<any>(STORE_KEYS.policyStance, { stances: {} }), [])
  const name = profile?.kanjiName || '候補者'

  useEffect(() => {
    const d = loadJSON<(Avatar & { savedAt?: string }) | null>(STORE_KEYS.aiAvatar, null)
    if (d) { setTone(d.tone ?? 'polite'); setKeyMessage(d.keyMessage ?? ''); setFallback(d.fallback ?? fallback); setSavedAt(d.savedAt ?? null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = () => {
    const now = new Date().toLocaleString('ja-JP')
    saveJSON(STORE_KEYS.aiAvatar, { tone, keyMessage, fallback, savedAt: now })
    setSavedAt(now)
  }

  const greet = () => (tone === 'friendly' ? 'こんにちは！' : tone === 'passionate' ? 'ご質問ありがとうございます！' : 'ご質問ありがとうございます。')

  const answer = (q: string): string => {
    // 質問に政策テーマ名が含まれるか
    const theme = POLICY_THEMES.find((t) => q.includes(t.name) || q.includes(t.name.split('・')[0]))
    const head = `${greet()}${name}のAIアバターです。`
    if (theme) {
      // 政策スタンスにコメントがあれば使う
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const s = Object.values(stances?.stances ?? {}).find((x: any) => x?.comment) as { comment?: string } | undefined
      const body = s?.comment
        ? `「${theme.name}」については、${s.comment}`
        : `「${theme.name}」は重点政策の一つです。財源と期限を明確にして取り組みます。`
      return `${head}\n${body}\n詳しくは政策ページもご覧ください。`
    }
    if (keyMessage.trim()) return `${head}\n${keyMessage.trim()}`
    return `${head}\n${fallback}`
  }

  const ask = () => {
    if (!question.trim()) return
    setLog((p) => [...p, { q: question.trim(), a: answer(question.trim()) }])
    setQuestion('')
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>候補者AIアバター設定</h1>
        <p className='mt-1 text-sm text-gray-500'>
          あなたのプロフィール・政策スタンスを土台に、有権者の質問へ答えるAIアバターを設定します。
        </p>
      </div>

      {/* 設定 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-4'>
          <label className={labelCls}>話し方のトーン</label>
          <div className='flex flex-wrap gap-2'>
            {TONES.map((t) => (
              <button key={t.value} onClick={() => setTone(t.value)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${tone === t.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t.label}</button>
            ))}
          </div>
        </div>
        <div className='mb-4'>
          <label className={labelCls}>重点メッセージ（政策外の質問への基本回答）</label>
          <textarea rows={2} className={`${inputCls} resize-none`} placeholder='例: 私は「命を守る区政」を最優先に、防災と子育てに力を入れます。' value={keyMessage} onChange={(e) => setKeyMessage(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>答えられないときの返答</label>
          <input className={inputCls} value={fallback} onChange={(e) => setFallback(e.target.value)} />
        </div>
        <button onClick={save} className='mt-4 w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700'>
          アバターを保存
        </button>
        {savedAt && <p className='mt-2 text-center text-[11px] text-gray-400'>最終保存 {savedAt}</p>}
      </div>

      {/* プレビュー */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-1 text-sm font-bold text-gray-900'>プレビュー（有権者として質問）</h2>
        <p className='mb-3 text-xs text-gray-400'>政策テーマ名（例: 防災、子育て）を含めると、政策スタンスを踏まえて答えます。</p>
        <div className='mb-3 space-y-3'>
          {log.map((m, i) => (
            <div key={i}>
              <div className='flex justify-end'><div className='max-w-[80%] rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-800'>{m.q}</div></div>
              <div className='mt-1.5 flex justify-start'><div className='max-w-[85%] whitespace-pre-wrap rounded-2xl bg-indigo-600 px-3 py-2 text-sm text-white'>{m.a}</div></div>
            </div>
          ))}
          {log.length === 0 && <p className='py-6 text-center text-xs text-gray-400'>下の入力欄から質問してみてください。</p>}
        </div>
        <div className='flex gap-2'>
          <input className={inputCls} placeholder='例: 防災にどう取り組みますか？' value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') ask() }} />
          <button onClick={ask} className='shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700'>質問</button>
        </div>
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>※ プロトの回答はテンプレート。本番はプロフィール・政策・実績を学習したLLMで応答（候補者ごと従量課金）。</p>
    </div>
  )
}
