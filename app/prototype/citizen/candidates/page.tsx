'use client'

/**
 * 【プロトタイプ】国民向け seijiselect.jp 候補者一覧・検索
 *
 * 目的: 有権者が選挙種別・地域・政党・現職新人などで候補者を絞り込み、
 *       政策診断との一致率・透明化スコアつきで比較できる。
 *
 * 設計メモ（開発者向け）:
 *   本番は politicians（人）× elections（選挙: 種別・階層・地域）× candidacies（出馬）の3テーブル。
 *   データ更新は3層ハイブリッド: ①公式スクレイピング取込（土台）②政治家本人の入力（candidate.seijiselect.jp）③本人確認。
 *   一致率は診断結果（proto_citizen_match_v1）× 候補者の注力テーマで算出（LLM不使用）。
 */

import { ELECTION_TYPES, POLICY_THEMES, SAMPLE_CANDIDATES, type PrototypeCandidate } from '../../_data'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

const MATCH_RESULT_KEY = 'proto_citizen_match_v1'
const themeName = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.name ?? id
const themeEmoji = (id: string) => POLICY_THEMES.find((t) => t.id === id)?.emoji ?? '•'
const typeLabel = (v: string) => ELECTION_TYPES.find((e) => e.value === v)?.label ?? v
const typeLevel = (v: string) => ELECTION_TYPES.find((e) => e.value === v)?.level ?? 'national'

const LEVEL_COLOR: Record<string, string> = {
  national: 'bg-indigo-100 text-indigo-700',
  prefecture: 'bg-teal-100 text-teal-700',
  municipality: 'bg-amber-100 text-amber-700',
}

export default function CitizenCandidatesPage() {
  const [weights, setWeights] = useState<Record<string, number> | null>(null)
  const [q, setQ] = useState('')
  const [etype, setEtype] = useState('all')
  const [party, setParty] = useState('all')
  const [status, setStatus] = useState('all')

  // 診断結果を読み込み（あれば一致率を算出）
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MATCH_RESULT_KEY)
      if (raw) setWeights(JSON.parse(raw).weights ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  const matchPct = (c: PrototypeCandidate): number | null => {
    if (!weights) return null
    const max = 3 * c.themes.length
    if (max === 0) return null
    const score = c.themes.reduce((s, t) => s + (weights[t] ?? 0), 0)
    return Math.round((score / max) * 100)
  }

  const partyOptions = useMemo(
    () => Array.from(new Set(SAMPLE_CANDIDATES.map((c) => c.party))),
    []
  )

  const list = useMemo(() => {
    const filtered = SAMPLE_CANDIDATES.filter((c) => {
      if (etype !== 'all' && c.electionType !== etype) return false
      if (party !== 'all' && c.party !== party) return false
      if (status !== 'all' && c.status !== status) return false
      if (q.trim()) {
        const hay = `${c.name}${c.party}${c.region}${c.district}`
        if (!hay.includes(q.trim())) return false
      }
      return true
    })
    // 診断済みなら一致率順、未診断なら透明化スコア順
    return filtered.sort((a, b) => {
      if (weights) return (matchPct(b) ?? 0) - (matchPct(a) ?? 0)
      return b.transparency - a.transparency
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, etype, party, status, weights])

  const selectCls =
    'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400'
  const chip = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8'>
      <div className='mb-5'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-blue-500' />
          プロトタイプ / 国民向け seijiselect.jp
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>候補者一覧・検索</h1>
        <p className='mt-1 text-sm text-gray-500'>
          選挙種別・地域・政党で絞り込み、政策の一致率・透明化スコアで比較できます。
        </p>
      </div>

      {/* 診断連動バナー */}
      <div className={`mb-5 rounded-xl border p-3 text-sm ${weights ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
        {weights ? (
          <span>✓ 診断結果から「あなたとの政策一致率」を表示中。一致率の高い順に並んでいます。</span>
        ) : (
          <span>
            <Link href='/prototype/citizen/match' className='font-semibold text-blue-600 underline'>政策マッチング診断</Link>
            を受けると、あなたとの一致率が表示されます。
          </span>
        )}
      </div>

      {/* 検索・フィルタ */}
      <div className='mb-5 space-y-3'>
        <input
          className={`${selectCls} w-full`}
          placeholder='氏名・政党・地域で検索'
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className='flex flex-wrap gap-2'>
          <select className={selectCls} value={etype} onChange={(e) => setEtype(e.target.value)}>
            <option value='all'>すべての選挙</option>
            {ELECTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <select className={selectCls} value={party} onChange={(e) => setParty(e.target.value)}>
            <option value='all'>すべての政党</option>
            {partyOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className='flex flex-wrap gap-2'>
          {['all', '現職', '新人', '元職'].map((s) => (
            <button key={s} type='button' onClick={() => setStatus(s)} className={chip(status === s)}>
              {s === 'all' ? 'すべて' : s}
            </button>
          ))}
        </div>
      </div>

      {/* 件数 */}
      <p className='mb-3 text-xs text-gray-400'>{list.length}名の候補者</p>

      {/* 一覧 */}
      {list.length === 0 ? (
        <p className='py-10 text-center text-sm text-gray-400'>条件に合う候補者がいません</p>
      ) : (
        <div className='space-y-3'>
          {list.map((c) => {
            const pct = matchPct(c)
            const level = typeLevel(c.electionType)
            return (
              <div key={c.id} className='rounded-xl border border-gray-200 bg-white p-4'>
                <div className='flex items-start gap-3'>
                  {/* アバター（注力テーマの絵文字） */}
                  <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-50 text-2xl'>
                    {themeEmoji(c.themes[0])}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='text-base font-bold text-gray-900'>{c.name}</span>
                      <span className='text-xs text-gray-500'>{c.party}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${LEVEL_COLOR[level]}`}>{typeLabel(c.electionType)}</span>
                      <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500'>{c.status}</span>
                    </div>
                    <p className='mt-0.5 text-xs text-gray-400'>📍 {c.region}{c.district !== c.region ? ` · ${c.district}` : ''}</p>

                    {/* テーマ */}
                    <div className='mt-2 flex flex-wrap gap-1'>
                      {c.themes.map((t) => (
                        <span key={t} className='rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600'>{themeName(t)}</span>
                      ))}
                    </div>

                    {/* 透明化スコア・出どころ */}
                    <div className='mt-2 flex items-center gap-3 text-[11px] text-gray-400'>
                      <span className='flex items-center gap-1'>
                        透明化
                        <span className='inline-block h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 align-middle'>
                          <span className='block h-full rounded-full bg-emerald-400' style={{ width: `${c.transparency}%` }} />
                        </span>
                        {c.transparency}
                      </span>
                      <span className={c.source === 'self' ? 'text-blue-500' : 'text-gray-400'}>
                        {c.source === 'self' ? '本人入力済み' : '公式取込'}
                      </span>
                    </div>
                  </div>

                  {/* 一致率 */}
                  {pct !== null && (
                    <div className='shrink-0 text-center'>
                      <div className='text-lg font-bold text-blue-600'>{pct}%</div>
                      <div className='text-[10px] text-gray-400'>一致率</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className='mt-5 text-center text-xs text-gray-400'>
        ※ サンプルデータ（架空の氏名）。本番は politicians × elections × candidacies で全選挙種別を管理。
      </p>
    </div>
  )
}
