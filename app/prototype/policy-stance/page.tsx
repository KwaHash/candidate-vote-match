'use client'

/**
 * 【プロトタイプ】政治家向け 政策スタンス入力画面
 *
 * 目的: 政治家（政党）が各争点への立場を登録する。
 *       ここで入力されたデータが、有権者向け「①政策で選ぶ」マッチングの素になる。
 *
 * 注意: これは動く仕様書（プロトタイプ）です。
 *   - データは localStorage に保存（本番では policy_positions テーブルへ）
 *   - 認証・本番DB接続は開発者が実装版で作り直します
 */

import { policyQuestions } from '@/constants/policy'
import { parties } from '@/constants/parties'
import { loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

type Importance = 'high' | 'mid' | 'low'

interface IssueStance {
  position: string // 選んだ立場（policyQuestions の option value）
  importance: Importance
  evidenceUrl: string
  comment: string
}

type StanceMap = Record<number, IssueStance>

const STORAGE_KEY = 'proto_policy_stance_v1'

const IMPORTANCE_OPTIONS: { value: Importance; label: string; color: string }[] = [
  { value: 'high', label: '高', color: '#e11d48' },
  { value: 'mid', label: '中', color: '#f59e0b' },
  { value: 'low', label: '低', color: '#9ca3af' },
]

export default function PolicyStancePrototypePage() {
  const [partyId, setPartyId] = useState<number>(1)
  const [stances, setStances] = useState<StanceMap>({})
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // 復元
  useEffect(() => {
    const parsed = loadJSON<{ partyId?: number; stances?: StanceMap; savedAt?: string | null } | null>(STORAGE_KEY, null)
    if (parsed) {
      setPartyId(parsed.partyId ?? 1)
      setStances(parsed.stances ?? {})
      setSavedAt(parsed.savedAt ?? null)
    }
  }, [])

  const total = policyQuestions.length
  const answered = useMemo(
    () => Object.values(stances).filter((s) => s?.position).length,
    [stances]
  )
  const progress = Math.round((answered / total) * 100)

  const updateStance = (id: number, patch: Partial<IssueStance>) => {
    setStances((prev) => ({
      ...prev,
      [id]: {
        position: '',
        importance: 'mid',
        evidenceUrl: '',
        comment: '',
        ...prev[id],
        ...patch,
      },
    }))
  }

  const handleSave = () => {
    const now = new Date().toLocaleString('ja-JP')
    saveJSON(STORAGE_KEY, { partyId, stances, savedAt: now })
    setSavedAt(now)
  }

  const partyName =
    parties.find((p) => p.id === partyId)?.label ?? '未選択'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-32'>
      {/* ヘッダー */}
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>政策スタンス入力</h1>
        <p className='mt-1 text-sm text-gray-500'>
          各争点へのあなたの立場を登録してください。ここで入力した内容が、有権者の「政策で選ぶ」診断の判定に使われます。
        </p>
      </div>

      {/* 政党選択 */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-white p-4'>
        <label className='mb-1.5 block text-sm font-medium text-gray-700'>
          所属政党
        </label>
        <select
          value={partyId}
          onChange={(e) => setPartyId(Number(e.target.value))}
          className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400'
        >
          {parties
            .filter((p) => p.id !== 0)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
        </select>
      </div>

      {/* 進捗バー */}
      <div className='sticky top-20 z-10 mb-6 rounded-xl border border-gray-200 bg-white/95 p-4 backdrop-blur'>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium text-gray-700'>
            回答済み {answered} / {total} 件
          </span>
          <span className='font-semibold text-rose-600'>{progress}%</span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
          <div
            className='h-full rounded-full bg-rose-500 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 争点カード一覧 */}
      <div className='space-y-4'>
        {policyQuestions.map((q, index) => {
          const stance = stances[q.id]
          const done = Boolean(stance?.position)
          return (
            <div
              key={q.id}
              className={`rounded-xl border bg-white p-5 transition-colors ${
                done ? 'border-rose-200' : 'border-gray-200'
              }`}
            >
              <div className='mb-3 flex items-start gap-3'>
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {done ? '✓' : index + 1}
                </span>
                <h3 className='text-[15px] font-semibold leading-relaxed text-gray-900'>
                  {q.question}
                </h3>
              </div>

              {/* 立場の選択 */}
              <div className='mb-4 space-y-2 pl-10'>
                {q.options.map((opt) => {
                  const selected = stance?.position === opt.value
                  return (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selected
                          ? 'border-rose-400 bg-rose-50 text-rose-900'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type='radio'
                        name={`q-${q.id}`}
                        checked={selected}
                        onChange={() =>
                          updateStance(q.id, { position: opt.value })
                        }
                        className='accent-rose-500'
                      />
                      {opt.label}
                    </label>
                  )
                })}
              </div>

              {/* 詳細入力（立場を選んだら表示） */}
              {done && (
                <div className='ml-10 space-y-3 rounded-lg bg-gray-50 p-3'>
                  {/* 重要度 */}
                  <div className='flex items-center gap-3'>
                    <span className='text-xs font-medium text-gray-600'>
                      重要度
                    </span>
                    <div className='flex gap-1.5'>
                      {IMPORTANCE_OPTIONS.map((imp) => {
                        const active = stance?.importance === imp.value
                        return (
                          <button
                            key={imp.value}
                            type='button'
                            onClick={() =>
                              updateStance(q.id, { importance: imp.value })
                            }
                            className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                              active
                                ? 'text-white'
                                : 'bg-white text-gray-500 ring-1 ring-gray-200'
                            }`}
                            style={
                              active ? { backgroundColor: imp.color } : undefined
                            }
                          >
                            {imp.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 根拠URL */}
                  <div>
                    <label className='mb-1 block text-xs font-medium text-gray-600'>
                      根拠URL（公約・発言など / 任意）
                    </label>
                    <input
                      type='url'
                      placeholder='https://...'
                      value={stance?.evidenceUrl ?? ''}
                      onChange={(e) =>
                        updateStance(q.id, { evidenceUrl: e.target.value })
                      }
                      className='w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-rose-400 focus:outline-none'
                    />
                  </div>

                  {/* コメント */}
                  <div>
                    <label className='mb-1 block text-xs font-medium text-gray-600'>
                      ひとこと（有権者に伝えたい補足 / 任意）
                    </label>
                    <textarea
                      rows={2}
                      placeholder='例: 食料品の軽減税率はゼロにすべきと考えます。'
                      value={stance?.comment ?? ''}
                      onChange={(e) =>
                        updateStance(q.id, { comment: e.target.value })
                      }
                      className='w-full resize-none rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm focus:border-rose-400 focus:outline-none'
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 保存バー（下部固定） */}
      <div className='fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3'>
          <div className='text-xs text-gray-500'>
            <span className='font-medium text-gray-700'>{partyName}</span>
            <span className='mx-1.5'>·</span>
            {savedAt ? `最終保存 ${savedAt}` : '未保存'}
          </div>
          <button
            onClick={handleSave}
            disabled={answered === 0}
            className='rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            スタンスを保存
          </button>
        </div>
      </div>
    </div>
  )
}
