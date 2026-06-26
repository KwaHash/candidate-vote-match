'use client'

/**
 * 【プロトタイプ】政治家向け AIツール連携（外部AI・API連携・プラン）
 *
 * 目的: 別システムの参謀AI等の外部AIツールを、APIキーで連携して使えるようにする。
 *       一部は有料プラン（プロ）で解放。分身AIは本サイトの「候補者AIアバター」に対応。
 *
 * 注意: 動く仕様書（プロトタイプ）。実際のAPI呼び出しはせず、連携状態のみを保持。
 *   本番は APIキーを暗号化保存し、各ツールのAPIに接続。課金で解放を制御。
 */

import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface Tool {
  id: string
  no: string
  name: string
  tagline: string
  desc: string
  pro: boolean
  internalHref?: string // 本サイト内に実装済みのもの（分身AI=AIアバター）
}

const TOOLS: Tool[] = [
  { id: 'sanbo', no: '00', name: '参謀AI', tagline: 'あなたの選対本部長', desc: '選挙区で「あと何票で勝てるか」「対立候補にどう差をつけるか」「どう訴えれば届くか」を分析し、勝つための計画にまとめます。', pro: true },
  { id: 'jiko', no: '01', name: '自己分析AI', tagline: 'すべての出発点', desc: '50の質問で、あなたの強み・人柄・支持の核を言葉に。ここから、すべてが始まります。', pro: false },
  { id: 'yoron', no: '02', name: '世論調査AI', tagline: '反応を、公開前に試す', desc: 'AIの“仮想有権者”に政策やメッセージをぶつけ、公開する前に賛否や反応を確かめられます。', pro: true },
  { id: 'brain', no: '03', name: '政策ブレーンAI', tagline: '政策を磨く', desc: '公約の穴や想定される反論を、24時間いつでもチェック。一人でも政策を鍛えられます。', pro: true },
  { id: 'bunshin', no: '04', name: '分身AI', tagline: '夜中でも、有権者に応える', desc: 'あなたの考え方を学んだAIの分身が、有権者からの質問に24時間対応。', pro: true, internalHref: '/prototype/ai-avatar' },
  { id: 'tekiho', no: '05', name: '適法チェックAI', tagline: '「やってOK？」を確かめる', desc: '気になる活動が公選法・制度の上で大丈夫か、具体的なケースごとに確認できます。', pro: true },
]

type Plan = 'free' | 'pro'

export default function AiToolsPage() {
  const [apiKey, setApiKey] = useState('')
  const [plan, setPlan] = useState<Plan>('free')
  const [connected, setConnected] = useState<string[]>([])
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    const d = loadJSON<{ apiKey?: string; plan?: Plan; connected?: string[]; savedAt?: string } | null>(STORE_KEYS.aiTools, null)
    if (d) { setApiKey(d.apiKey ?? ''); setPlan(d.plan ?? 'free'); setConnected(d.connected ?? []); setSavedAt(d.savedAt ?? null) }
  }, [])

  const persist = (next: { apiKey: string; plan: Plan; connected: string[] }) => {
    const now = new Date().toLocaleString('ja-JP')
    saveJSON(STORE_KEYS.aiTools, { ...next, savedAt: now })
    setSavedAt(now)
  }

  const saveSettings = () => persist({ apiKey, plan, connected })
  const toggleConnect = (id: string) => {
    const next = connected.includes(id) ? connected.filter((x) => x !== id) : [...connected, id]
    setConnected(next); persist({ apiKey, plan, connected: next })
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>AIツール連携</h1>
        <p className='mt-1 text-sm text-gray-500'>
          外部の選挙AIツールをAPIで連携して使えます。一部は<strong className='text-indigo-600'>プロプラン</strong>で解放されます。
        </p>
      </div>

      {/* API連携設定（プロフィール/設定の一部） */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>API連携設定</h2>
        <label className='mb-1 block text-xs font-medium text-gray-600'>APIキー</label>
        <input className={`${inputCls} mb-3 font-mono`} type='password' placeholder='sk-... （外部AIツール発行のキー）' value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        <label className='mb-1 block text-xs font-medium text-gray-600'>プラン</label>
        <div className='mb-3 flex gap-2'>
          {([['free', '無料'], ['pro', 'プロ（全ツール解放）']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setPlan(v)} className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${plan === v ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}</button>
          ))}
        </div>
        <button onClick={saveSettings} className='w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700'>設定を保存</button>
        <p className='mt-2 text-[11px] text-gray-400'>{savedAt ? `最終保存 ${savedAt} ・ ` : ''}※ 本番はAPIキーを暗号化保存し、課金状態で解放を制御。</p>
      </div>

      {/* ツール一覧 */}
      <div className='space-y-3'>
        {TOOLS.map((t) => {
          const locked = t.pro && plan !== 'pro'
          const isConnected = connected.includes(t.id)
          return (
            <div key={t.id} className={`rounded-xl border p-5 ${locked ? 'border-gray-200 bg-gray-50' : 'border-gray-200 bg-white'}`}>
              <div className='flex items-start gap-3'>
                <span className='shrink-0 font-mono text-lg font-bold text-indigo-300'>{t.no}</span>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h3 className='text-base font-bold text-gray-900'>{t.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.pro ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.pro ? 'プロ' : '無料'}</span>
                    {t.internalHref && <span className='rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700'>本サイト実装済み</span>}
                    {isConnected && !t.internalHref && <span className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700'>連携済み</span>}
                  </div>
                  <p className='mt-0.5 text-xs font-medium text-indigo-600'>{t.tagline}</p>
                  <p className='mt-1 text-sm text-gray-600'>{t.desc}</p>

                  <div className='mt-3'>
                    {t.internalHref ? (
                      <Link href={t.internalHref} className='inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700'>使う（候補者AIアバター）</Link>
                    ) : locked ? (
                      <button onClick={() => setPlan('pro')} className='rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700'>🔒 プロで解放する</button>
                    ) : !apiKey ? (
                      <span className='text-xs text-gray-400'>↑ APIキーを設定すると連携できます</span>
                    ) : (
                      <button onClick={() => toggleConnect(t.id)} className={`rounded-lg px-4 py-2 text-xs font-semibold ${isConnected ? 'border border-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                        {isConnected ? '連携を解除' : '連携して使う'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className='mt-5 text-center text-xs text-gray-400'>
        ※ プロトは連携状態のみ保持。本番は各ツールのAPIに接続し、課金（プロ）で解放を制御。分身AIは本サイトの候補者AIアバターに対応。
      </p>
    </div>
  )
}
