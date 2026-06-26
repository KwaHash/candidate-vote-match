'use client'

/**
 * 【プロトタイプ】政治家向け AIエージェント / 自動化センター
 *
 * 目的: 自律エージェントと裏方自動化を一覧・ON/OFFし、「AIが下書き・実行した項目」を
 *       承認/却下する司令塔。設計3原則=①LLMはバッチ＋キャッシュ ②政治コンテンツは人が承認 ③イベント駆動。
 *
 * 注意: 動く仕様書（プロトタイプ）。実処理はせず、ON/OFFと承認操作のみ。
 *   本番はスケジューラ＋イベント駆動＋承認フロー。横森さんの既存スクレイピング/通知基盤と連携。
 */

import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

type Kind = '裏方自動化' | 'AIエージェント' | '連携'

interface Agent {
  id: string
  name: string
  kind: Kind
  desc: string
  schedule: string
  lastRun: string
  defaultOn: boolean
}

const AGENTS: Agent[] = [
  { id: 'ingest', name: '候補者データ取込エージェント', kind: '裏方自動化', desc: '告示・選管情報をスクレイピング→正規化→DB登録', schedule: '告示時＋日次', lastRun: '本日 06:00', defaultOn: true },
  { id: 'transparency', name: '透明化集計エージェント', kind: '裏方自動化', desc: '寄付(DON)→支出(EXP)→成果(IMP)を自動連結しダッシュボード反映', schedule: '1時間ごと', lastRun: '12:00', defaultOn: true },
  { id: 'sanbo', name: '選対参謀エージェント', kind: 'AIエージェント', desc: '情勢を分析し「あと何票・次の一手」を毎朝提案', schedule: '毎朝 07:00', lastRun: '本日 07:00', defaultOn: true },
  { id: 'community', name: 'コミュニティ運営エージェント', kind: 'AIエージェント', desc: '投稿を自動下書き→スケジュール→承認→配信', schedule: '毎日', lastRun: '本日 09:00', defaultOn: true },
  { id: 'avatar', name: '有権者対応エージェント（分身AI）', kind: 'AIエージェント', desc: '有権者の質問に24h応答、難問は人にエスカレーション', schedule: '常時', lastRun: '稼働中', defaultOn: true },
  { id: 'matching', name: '支援マッチングエージェント', kind: 'AIエージェント', desc: '支援者と募集を自動マッチ→両者へ通知', schedule: 'イベント駆動', lastRun: '11:20', defaultOn: false },
  { id: 'compliance', name: 'コンプラ監視エージェント', kind: 'AIエージェント', desc: '不正・関連当事者取引・法令リスクを自動検知→admin通知', schedule: '常時', lastRun: '稼働中', defaultOn: true },
  { id: 'notify', name: '通知連携（Chatwork / LINE）', kind: '連携', desc: '重要イベントを既存の通知基盤へ転送', schedule: 'イベント駆動', lastRun: '11:21', defaultOn: true },
]

interface FeedItem {
  id: number
  agent: string
  action: string
  detail: string
  tone: 'draft' | 'risk'
}

const INITIAL_FEED: FeedItem[] = [
  { id: 1, agent: 'コミュニティ運営', action: '明日のLINE投稿を下書き', detail: '「7/3 防災勉強会のご案内」— 承認すると予約配信されます', tone: 'draft' },
  { id: 2, agent: '選対参謀', action: '次の一手を提案', detail: '子育て層へのリーチが弱め。今週末、◯◯駅前で街頭＋子育て政策の発信を推奨', tone: 'draft' },
  { id: 3, agent: 'コンプラ監視', action: 'リスク検知', detail: '支出「会場費」が関連当事者の可能性。承認前に確認してください', tone: 'risk' },
  { id: 4, agent: '寄付サンクス', action: '新規寄付3件にお礼を下書き', detail: '寄付者3名へのサンクスメッセージを自動生成。承認で送信', tone: 'draft' },
  { id: 5, agent: '支援マッチング', action: 'マッチを提案', detail: '「動画編集」の募集に、スキル登録済みの支援者2名が該当。打診しますか？', tone: 'draft' },
]

const KIND_CLS: Record<Kind, string> = {
  '裏方自動化': 'bg-slate-100 text-slate-700',
  'AIエージェント': 'bg-indigo-100 text-indigo-700',
  '連携': 'bg-emerald-100 text-emerald-700',
}

export default function AutomationPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})
  const [feed, setFeed] = useState<FeedItem[]>(INITIAL_FEED)
  const [processed, setProcessed] = useState(0)

  useEffect(() => {
    const d = loadJSON<{ enabled?: Record<string, boolean> } | null>(STORE_KEYS.automation, null)
    const base: Record<string, boolean> = {}
    AGENTS.forEach((a) => { base[a.id] = a.defaultOn })
    setEnabled(d?.enabled ? { ...base, ...d.enabled } : base)
  }, [])

  const toggle = (id: string) => {
    const next = { ...enabled, [id]: !enabled[id] }
    setEnabled(next)
    saveJSON(STORE_KEYS.automation, { enabled: next })
  }

  const act = (id: number) => { setFeed((p) => p.filter((f) => f.id !== id)); setProcessed((n) => n + 1) }

  const onCount = useMemo(() => Object.values(enabled).filter(Boolean).length, [enabled])

  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-12'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>AIエージェント / 自動化センター</h1>
        <p className='mt-1 text-sm text-gray-500'>
          自律エージェントと裏方自動化を管理し、AIが下書き・実行した項目を承認します。
        </p>
      </div>

      {/* サマリー */}
      <div className='mb-5 grid grid-cols-3 gap-3'>
        <div className={card}><p className='text-xs text-gray-500'>稼働中エージェント</p><p className='mt-1 text-lg font-bold text-indigo-600'>{onCount}/{AGENTS.length}</p></div>
        <div className={card}><p className='text-xs text-gray-500'>承認待ち</p><p className='mt-1 text-lg font-bold text-amber-600'>{feed.length}件</p></div>
        <div className={card}><p className='text-xs text-gray-500'>本日処理</p><p className='mt-1 text-lg font-bold text-emerald-600'>{processed}件</p></div>
      </div>

      {/* 承認待ちフィード */}
      <div className='mb-6'>
        <h2 className='mb-2 text-sm font-bold text-gray-900'>承認待ち（AIが下書き・実行した項目）</h2>
        {feed.length === 0 ? (
          <p className='rounded-xl border border-dashed border-gray-300 py-8 text-center text-sm text-gray-400'>承認待ちはありません。</p>
        ) : (
          <div className='space-y-2'>
            {feed.map((f) => (
              <div key={f.id} className={`rounded-xl border p-4 ${f.tone === 'risk' ? 'border-rose-200 bg-rose-50/60' : 'border-gray-200 bg-white'}`}>
                <div className='mb-1 flex items-center gap-2'>
                  <span className='text-base'>{f.tone === 'risk' ? '⚠️' : '🤖'}</span>
                  <span className='text-xs font-bold text-gray-700'>{f.agent}</span>
                  <span className='text-xs text-gray-400'>— {f.action}</span>
                </div>
                <p className='mb-3 pl-6 text-sm text-gray-700'>{f.detail}</p>
                <div className='flex justify-end gap-2'>
                  <button onClick={() => act(f.id)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50'>{f.tone === 'risk' ? '対応済み' : '却下'}</button>
                  <button onClick={() => act(f.id)} className='rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700'>{f.tone === 'risk' ? '確認する' : '承認'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* エージェント一覧 */}
      <h2 className='mb-2 text-sm font-bold text-gray-900'>エージェント一覧</h2>
      <div className='space-y-2'>
        {AGENTS.map((a) => {
          const on = enabled[a.id] ?? a.defaultOn
          return (
            <div key={a.id} className={`${card} flex items-start gap-3`}>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-sm font-bold text-gray-900'>{a.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${KIND_CLS[a.kind]}`}>{a.kind}</span>
                </div>
                <p className='mt-0.5 text-xs text-gray-500'>{a.desc}</p>
                <p className='mt-1 text-[11px] text-gray-400'>実行: {a.schedule} ・ 最終: {on ? a.lastRun : '停止中'}</p>
              </div>
              <button
                onClick={() => toggle(a.id)}
                className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-indigo-600' : 'bg-gray-300'}`}
                aria-label='ON/OFF'
              >
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          )
        })}
      </div>

      <div className='mt-5 rounded-xl bg-gray-50 p-4 text-xs leading-relaxed text-gray-500'>
        <p className='mb-1 font-semibold text-gray-700'>設計の3原則</p>
        ① LLMはリアルタイムで呼ばずバッチ＋キャッシュ（コスト）／ ② 政治コンテンツは必ず人が承認（炎上防止）／ ③ イベント駆動（告示→取込・寄付→サンクス・締切→リマインド）。
        本番はスケジューラ＋承認フロー＋横森さんの既存スクレイピング・Chatwork/LINE通知基盤と連携。
      </div>
    </div>
  )
}
