'use client'

/**
 * 【プロトタイプ】政治家向け 寄付者への成果報告
 *
 * 目的: 「集めた寄付 → こう使った → こんな成果」を寄付者に返す報告を作成する。
 *       透明化の"出口"を作り、継続支援につなげる（寄付ID DON → 成果ID IMP の橋渡し）。
 *
 * 注意: 動く仕様書（プロトタイプ）。AI下書きはテンプレート（実LLM未使用）。保存は proto_donor_report_v1。
 */

import { POLICY_THEMES } from '../_data'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import { useEffect, useState } from 'react'

interface Report {
  id: number
  title: string
  themeId: string
  before: string
  action: string
  impact: string
  message: string
  date: string
}

export default function DonorReportPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [title, setTitle] = useState('')
  const [themeId, setThemeId] = useState(POLICY_THEMES[0].id)
  const [before, setBefore] = useState('')
  const [action, setAction] = useState('')
  const [impact, setImpact] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const d = loadJSON<{ reports?: Report[] } | null>(STORE_KEYS.donorReport, null)
    if (d?.reports) setReports(d.reports)
  }, [])

  const persist = (next: Report[]) => { setReports(next); saveJSON(STORE_KEYS.donorReport, { reports: next }) }

  const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id

  // AI下書き（テーマから雛形を生成）
  const aiDraft = () => {
    const t = themeName(themeId)
    setTitle(`【${t}】活動報告とお礼`)
    setBefore(`${t}について、現場では課題が続いていました。`)
    setAction('いただいた寄付で、政策調査・専門家ヒアリング・広報を行いました。')
    setImpact('都道府県・市区町村への提言、議会質問につながりました（成果ID: IMP-2026-000001）。')
    setMessage('ご支援いただいた皆さまのおかげで前進できました。引き続きよろしくお願いします。')
  }

  const canSave = title.trim() !== ''
  const create = () => {
    if (!canSave) return
    const next = [{ id: Math.max(0, ...reports.map((r) => r.id)) + 1, title, themeId, before, action, impact, message, date: new Date().toISOString().slice(0, 10) }, ...reports]
    persist(next)
    setTitle(''); setBefore(''); setAction(''); setImpact(''); setMessage('')
  }
  const remove = (id: number) => persist(reports.filter((r) => r.id !== id))

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1 block text-xs font-medium text-gray-600'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8 pb-12'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>寄付者への成果報告</h1>
        <p className='mt-1 text-sm text-gray-500'>「集めた寄付 → 使い道 → 成果」を寄付者に報告します。透明化の出口・継続支援につながります。</p>
      </div>

      {/* 作成 */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-5'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-bold text-gray-900'>報告を作成</h2>
          <button onClick={aiDraft} className='rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700'>🤖 AIで下書き</button>
        </div>
        <div className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div><label className={labelCls}>タイトル</label><input className={inputCls} placeholder='例: 【防災】活動報告とお礼' value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className={labelCls}>政策テーマ</label><select className={inputCls} value={themeId} onChange={(e) => setThemeId(e.target.value)}>{POLICY_THEMES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          </div>
          <div><label className={labelCls}>Before（現状の課題）</label><textarea rows={2} className={`${inputCls} resize-none`} value={before} onChange={(e) => setBefore(e.target.value)} /></div>
          <div><label className={labelCls}>使い道（寄付で行ったこと）</label><textarea rows={2} className={`${inputCls} resize-none`} value={action} onChange={(e) => setAction(e.target.value)} /></div>
          <div><label className={labelCls}>成果（After / IMP）</label><textarea rows={2} className={`${inputCls} resize-none`} value={impact} onChange={(e) => setImpact(e.target.value)} /></div>
          <div><label className={labelCls}>寄付者へのメッセージ</label><textarea rows={2} className={`${inputCls} resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        </div>
        <button onClick={create} disabled={!canSave} className='mt-4 w-full rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'>
          報告を作成して送信（プロト）
        </button>
      </div>

      {/* 送信済み報告（＝寄付者に見える形） */}
      <div className='rounded-xl border border-gray-200 bg-white p-5'>
        <h2 className='mb-3 text-sm font-bold text-gray-900'>送信済みの報告（{reports.length}件）</h2>
        {reports.length === 0 ? (
          <p className='py-8 text-center text-sm text-gray-400'>まだ報告がありません</p>
        ) : (
          <div className='space-y-3'>
            {reports.map((r) => (
              <div key={r.id} className='rounded-lg border border-gray-100 p-4'>
                <div className='mb-1 flex items-start justify-between'>
                  <span className='text-sm font-bold text-gray-900'>{r.title}</span>
                  <button onClick={() => remove(r.id)} className='shrink-0 rounded px-1.5 text-gray-300 hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
                </div>
                <p className='mb-2 text-[11px] text-gray-400'>{themeName(r.themeId)} · {r.date}</p>
                <div className='space-y-1 text-xs text-gray-600'>
                  {r.before && <p><span className='font-semibold text-rose-600'>課題:</span> {r.before}</p>}
                  {r.action && <p><span className='font-semibold text-blue-600'>使い道:</span> {r.action}</p>}
                  {r.impact && <p><span className='font-semibold text-emerald-600'>成果:</span> {r.impact}</p>}
                  {r.message && <p className='mt-1 rounded bg-gray-50 p-2 text-gray-500'>{r.message}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className='mt-4 text-center text-xs text-gray-400'>※ プロトは画面内保存。本番は寄付ID(DON)→成果ID(IMP)を紐づけ、寄付者に配信・透明化ダッシュボードに反映。</p>
    </div>
  )
}
