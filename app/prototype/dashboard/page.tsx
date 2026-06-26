'use client'

/**
 * 【プロトタイプ】政治家向け ダッシュボード（ログイン後のホーム・司令塔）
 *
 * 目的: タスク・クラファン・支援者・政策実装スコア・注目度を1画面に集約し、
 *       「今日やること」をAIが助言する。各画面への入口にもなる。
 *
 * 注意: 動く仕様書（プロトタイプ）。他画面が localStorage に保存したデータを集約表示。
 *   本番は各テーブルの集計。AI助言はルールベース（実LLM未使用）。
 */

import { STORE_KEYS, loadJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const yen = (n: number) => `¥${n.toLocaleString('ja-JP')}`

interface Summary {
  name: string
  tasksTodo: number
  tasksDone: number
  tasksTotal: number
  supporters: number
  needsAction: number
  score: number
  stanceAnswered: number
  cfTitle: string
  cfGoal: number
}

export default function CandidateDashboardPage() {
  const [s, setS] = useState<Summary | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = loadJSON<any>(STORE_KEYS.candidateProfile, {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tasksData = loadJSON<any>(STORE_KEYS.tasks, { tasks: [] })
    const tasks = tasksData?.tasks ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const crmData = loadJSON<any>(STORE_KEYS.supporterCrm, { supporters: [] })
    const supporters = crmData?.supporters ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreData = loadJSON<any>(STORE_KEYS.impactScore, { items: [] })
    const score = (scoreData?.items ?? []).reduce((a: number, i: { points: number }) => a + (i.points ?? 0), 0)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stanceData = loadJSON<any>(STORE_KEYS.policyStance, { stances: {} })
    const stanceAnswered = Object.values(stanceData?.stances ?? {}).filter((v) => (v as { position?: string })?.position).length
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cf = loadJSON<any>(STORE_KEYS.crowdfunding, {})

    setS({
      name: profile?.kanjiName || '候補者',
      tasksTodo: tasks.filter((t: { status: string }) => t.status === 'todo').length,
      tasksDone: tasks.filter((t: { status: string }) => t.status === 'done').length,
      tasksTotal: tasks.length,
      supporters: supporters.length,
      needsAction: supporters.filter((x: { nextAction?: string }) => (x.nextAction ?? '').trim()).length,
      score,
      stanceAnswered,
      cfTitle: cf?.title || '',
      cfGoal: typeof cf?.goal === 'number' ? cf.goal : 0,
    })
  }, [])

  if (!s) return <div className='p-8 text-center text-sm text-gray-400'>読み込み中…</div>

  // 今日やること（AI助言・ルールベース）
  const todos: string[] = []
  if (s.tasksTodo > 0) todos.push(`未着手のタスクが ${s.tasksTodo} 件あります。`)
  if (s.needsAction > 0) todos.push(`要対応の支援者が ${s.needsAction} 件。連絡・依頼を進めましょう。`)
  if (s.stanceAnswered < 14) todos.push(`政策スタンスが未完成（${s.stanceAnswered}/14）。埋めると有権者マッチングの精度が上がります。`)
  if (!s.cfTitle) todos.push('クラウドファンディングが未作成です。政策単位で立ち上げると支援が集まりやすくなります。')
  if (todos.length === 0) todos.push('緊急の対応事項はありません。活動報告を投稿して支援者との接点を増やしましょう。')

  const card = 'rounded-xl border border-gray-200 bg-white p-4'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>{s.name} さんのダッシュボード</h1>
        <p className='mt-1 text-sm text-gray-500'>活動の全体像と「今日やること」を一望できます。</p>
      </div>

      {/* AI助言: 今日やること */}
      <div className='mb-5 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4'>
        <div className='mb-2 flex items-center gap-2'>
          <span className='text-base'>🤖</span>
          <span className='text-sm font-bold text-indigo-900'>AIアシスト：今日やること</span>
        </div>
        <ul className='space-y-1.5'>
          {todos.map((t, i) => (
            <li key={i} className='flex items-start gap-2 text-sm text-indigo-900'><span className='shrink-0 text-indigo-400'>•</span>{t}</li>
          ))}
        </ul>
        <p className='mt-2 text-[11px] text-indigo-400'>※ プロトはルールベース。本番はLLMで活動データから提案。</p>
      </div>

      {/* サマリー */}
      <div className='mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <Link href='/prototype/tasks' className={`${card} transition-shadow hover:shadow-md`}>
          <p className='text-xs text-gray-500'>タスク</p>
          <p className='mt-1 text-lg font-bold text-gray-900'>{s.tasksDone}/{s.tasksTotal}</p>
          <p className='text-[11px] text-amber-600'>未着手 {s.tasksTodo}</p>
        </Link>
        <Link href='/prototype/supporter-crm' className={`${card} transition-shadow hover:shadow-md`}>
          <p className='text-xs text-gray-500'>支援者</p>
          <p className='mt-1 text-lg font-bold text-gray-900'>{s.supporters}名</p>
          <p className='text-[11px] text-amber-600'>要対応 {s.needsAction}</p>
        </Link>
        <Link href='/prototype/impact-score' className={`${card} transition-shadow hover:shadow-md`}>
          <p className='text-xs text-gray-500'>政策実装スコア</p>
          <p className='mt-1 text-lg font-bold text-indigo-600'>{s.score}</p>
          <p className='text-[11px] text-gray-400'>点</p>
        </Link>
        <Link href='/prototype/policy-stance' className={`${card} transition-shadow hover:shadow-md`}>
          <p className='text-xs text-gray-500'>政策スタンス</p>
          <p className='mt-1 text-lg font-bold text-gray-900'>{s.stanceAnswered}/14</p>
          <p className='text-[11px] text-gray-400'>回答済み</p>
        </Link>
      </div>

      {/* クラファン */}
      <Link href='/prototype/crowdfunding' className={`${card} mb-5 block transition-shadow hover:shadow-md`}>
        <p className='text-xs text-gray-500'>クラウドファンディング</p>
        {s.cfTitle ? (
          <>
            <p className='mt-1 text-sm font-bold text-gray-900'>{s.cfTitle}</p>
            <p className='text-xs text-gray-400'>目標 {yen(s.cfGoal)}</p>
          </>
        ) : (
          <p className='mt-1 text-sm text-gray-400'>未作成 — タップして政策単位で立ち上げる →</p>
        )}
      </Link>

      {/* 注目度（サンプル） */}
      <div className={`${card} mb-5`}>
        <p className='mb-2 text-xs font-bold text-gray-700'>有権者からの注目度（サンプル）</p>
        <div className='grid grid-cols-3 gap-2 text-center'>
          <div><p className='text-lg font-bold text-blue-600'>1,240</p><p className='text-[11px] text-gray-400'>プロフィール閲覧</p></div>
          <div><p className='text-lg font-bold text-blue-600'>312</p><p className='text-[11px] text-gray-400'>診断でマッチ</p></div>
          <div><p className='text-lg font-bold text-blue-600'>48</p><p className='text-[11px] text-gray-400'>応援表明</p></div>
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>※ 本番は国民向けサイトの実データを集計。</p>
      </div>

      {/* ヒト・モノ・カネを集める仕組み */}
      <div className={`${card} mb-5`}>
        <p className='mb-3 text-xs font-bold text-gray-700'>支援を集める（ヒト・モノ・カネ）</p>
        <div className='grid grid-cols-3 gap-2 text-center'>
          {[
            { icon: '🧑‍🤝‍🧑', label: 'ヒト', href: '/prototype/supporter-crm', sub: '支援者CRM・募集' },
            { icon: '📦', label: 'モノ', href: '/prototype/support-request', sub: '物品・会場・車両' },
            { icon: '💴', label: 'カネ', href: '/prototype/crowdfunding', sub: 'クラファン・寄付' },
          ].map((x) => (
            <Link key={x.label} href={x.href} className='rounded-lg border border-gray-100 p-3 transition-colors hover:bg-gray-50'>
              <div className='text-2xl'>{x.icon}</div>
              <p className='mt-1 text-sm font-bold text-gray-900'>{x.label}</p>
              <p className='text-[10px] text-gray-400'>{x.sub}</p>
            </Link>
          ))}
        </div>
        <p className='mt-2 text-[11px] text-gray-400'>※ 3つとも実装済み。モノ・人の募集は支援者サイト(assist)に連携。</p>
      </div>

      {/* クイックリンク */}
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {[
          ['AI政策室', '/prototype/policy-ai'],
          ['自動化センター', '/prototype/automation'],
          ['AIツール連携', '/prototype/ai-tools'],
          ['候補者AIアバター', '/prototype/ai-avatar'],
          ['寄付者への成果報告', '/prototype/donor-report'],
          ['コミュニティ管理', '/prototype/community'],
          ['プロフィール', '/prototype/candidate-profile'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className='rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50'>{label}</Link>
        ))}
      </div>
    </div>
  )
}
