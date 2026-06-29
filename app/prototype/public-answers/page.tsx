'use client'

/**
 * 【プロトタイプ】政治家向け 公開質問への回答（国民側「公開質問ボード」連携）
 *
 * 連携の流れ:
 *   国民側 seijiselect.jp「公開質問ボード」で有権者が質問を投稿・投票
 *   → 運営admin が投票上位を整理し、全候補者へ同一条件で送付（候補者へ送付済み）
 *   → 政治家（本画面）が回答 → 提出（運営確認へ）
 *   → 運営確認後、国民側ボードに「回答済み」として公開（未回答は「未回答」と表示）
 *
 * データ構造は3アプリ共通（_qboard.ts / docs/データ構造_公開質問ボード_共通仕様.md）。
 *   質問ID(question_id) と election_id は国民側・運営adminと同一値。回答は candidate_question_answers に対応。
 *
 * 注意: 動く仕様書。データはサンプル。保存は _store（本番は candidate_question_answers、自分の回答のみRLS）。
 *       全候補者同一条件。提出は運営確認を経て公開。電子メールでの選挙運動は不可。
 */

import { type AnswerStatus, themeName } from '../_qboard'
import { STORE_KEYS, loadJSON, saveJSON } from '../_store'
import Link from 'next/link'
import { useEffect, useState } from 'react'

// ログイン中の候補者（プロト）。本番は candidates / auth.uid()
const ME_ID = '区民 一郎'
const ME_NAME = '区民 一郎'
const ELECTION_ID = 'suginami-chiji'
const ELECTION_NAME = '杉並区長選挙'

// 運営adminから送付された上位質問（question_id・election_id は国民側と同一値）
interface SentQuestion { id: string; electionId: string; themeKey: string; title: string; body: string; votes: number; deadline: string }
const SENT_QUESTIONS: SentQuestion[] = [
  { id: 'q-seed-1', electionId: ELECTION_ID, themeKey: 'zaisei', title: '杉並区の財政をどう評価し、どう改善しますか？', body: '今後4年間で、どの支出を増やし、どの支出を見直すか具体的に教えてください。', votes: 142, deadline: '2026-07-02' },
  { id: 'q-seed-2', electionId: ELECTION_ID, themeKey: 'bosai', title: '災害時の死者を減らすため、最初の1年で何を優先しますか？', body: '避難所環境・高齢者避難・要支援者支援の優先順位を教えてください。', votes: 98, deadline: '2026-07-02' },
  { id: 'q-seed-3', electionId: ELECTION_ID, themeKey: 'kosodate', title: '最初の1年で実行する子育て政策は何ですか？', body: '財源とあわせて、最優先の施策を教えてください。', votes: 76, deadline: '2026-07-05' },
]

// candidate_question_answers に対応（question_id をキーに保存）
interface AnswerData { answerText: string; sourceUrl: string; answeredAt: string; status: AnswerStatus }

export default function PublicAnswersPage() {
  const [answers, setAnswers] = useState<Record<string, AnswerData>>({})
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  useEffect(() => { setAnswers(loadJSON<Record<string, AnswerData>>(STORE_KEYS.publicAnswers, {})) }, [])

  const get = (id: string): AnswerData => answers[id] ?? { answerText: '', sourceUrl: '', answeredAt: '', status: '未回答' }
  const update = (id: string, patch: Partial<AnswerData>) => setAnswers((p) => { const next = { ...p, [id]: { ...get(id), ...patch } }; saveJSON(STORE_KEYS.publicAnswers, next); return next })
  const today = () => { try { return new Date().toISOString().slice(0, 10) } catch { return '' } }
  const flash = (m: string) => { setSavedMsg(m); setTimeout(() => setSavedMsg((x) => (x === m ? null : x)), 2500) }

  const saveDraft = (id: string) => { update(id, { status: '下書き' }); flash('下書きを保存しました') }
  const submit = (id: string) => { const a = get(id); if (!a.answerText.trim()) { flash('回答本文を入力してください'); return } update(id, { status: '提出済み（運営確認中）', answeredAt: today() }); flash('回答を提出しました（運営確認後に国民側へ公開）') }
  const decline = (id: string) => { update(id, { status: '回答辞退', answeredAt: today() }); flash('回答辞退として記録しました') }

  const answeredCount = SENT_QUESTIONS.filter((q) => { const s = get(q.id).status; return s === '提出済み（運営確認中）' || s === '回答済み（公開）' }).length
  const statusCls = (s: AnswerStatus) => s === '回答済み（公開）' ? 'bg-slate-800 text-white' : s === '提出済み（運営確認中）' ? 'bg-emerald-50 text-emerald-700' : s === '下書き' ? 'bg-amber-50 text-amber-700' : s === '回答辞退' ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500'

  return (
    <div className='mx-auto w-full max-w-2xl px-4 py-8'>
      <div className='mb-4'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'><span className='h-1.5 w-1.5 rounded-full bg-rose-500' />プロトタイプ / 政治家向け</div>
        <h1 className='text-2xl font-bold text-gray-900'>公開質問への回答</h1>
        <p className='mt-1 text-sm text-gray-500'>{ELECTION_NAME}・{ME_NAME} 様。有権者の<strong className='text-gray-700'>公開質問ボード</strong>で投票上位となった質問が、運営から<strong className='text-gray-700'>全候補者へ同一条件</strong>で届いています。</p>
      </div>

      {/* 連携の説明 */}
      <div className='mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[11px] leading-relaxed text-blue-800'>
        <span className='font-semibold'>国民側「公開質問ボード」と連携：</span> 回答を提出すると<strong>運営確認後</strong>、国民側ボードに「回答済み」として公開されます（未回答は「未回答」と表示）。全候補者同一条件・中立運用です。
      </div>

      {savedMsg && <div className='mb-4 rounded-lg bg-slate-900 px-4 py-2 text-center text-sm text-white'>{savedMsg}</div>}

      <div className='mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-sm'>
        <span className='text-gray-500'>回答状況</span>
        <span className='font-bold text-gray-900'>{answeredCount} / {SENT_QUESTIONS.length} 件 提出済み</span>
      </div>

      <div className='space-y-3'>
        {SENT_QUESTIONS.map((q) => {
          const a = get(q.id)
          return (
            <div key={q.id} className='rounded-xl border border-gray-200 bg-white p-4'>
              <div className='flex flex-wrap items-center gap-1.5'>
                <span className='rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500'>{themeName(q.themeKey)}</span>
                <span className='text-[10px] text-gray-400'>👍 {q.votes}票</span>
                <span className='text-[10px] text-gray-400'>回答期限 {q.deadline}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusCls(a.status)}`}>{a.status}</span>
              </div>
              <p className='mt-1.5 text-sm font-bold text-gray-900'>{q.title}</p>
              <p className='mt-0.5 text-xs text-gray-500'>{q.body}</p>

              <textarea value={a.answerText} onChange={(e) => update(q.id, { answerText: e.target.value })} placeholder='回答本文（中立・具体的に。財源や期限・KPIも書くと有権者に伝わります）' className='mt-3 h-24 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-rose-400 focus:outline-none' />
              <input value={a.sourceUrl} onChange={(e) => update(q.id, { sourceUrl: e.target.value })} placeholder='公式リンク・添付資料URL（任意）' className='mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs' />

              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <button onClick={() => saveDraft(q.id)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'>下書き保存</button>
                <button onClick={() => submit(q.id)} className='rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700'>回答を提出（運営確認へ）</button>
                <button onClick={() => decline(q.id)} className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50'>回答を辞退</button>
                {a.answeredAt && <span className='text-[10px] text-gray-400'>回答日 {a.answeredAt}</span>}
              </div>
            </div>
          )
        })}
      </div>

      <p className='mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800'>
        ※ 回答は運営確認後に公開されます。誹謗中傷・虚偽・特定有権者への利益供与を示唆する内容は公開されません。
        選挙運動期間・方法（公職選挙法）にご注意ください。電子メールでの選挙運動はできません。
      </p>

      <div className='mt-5'>
        <Link href='/prototype' className='text-xs text-gray-400 hover:text-gray-600'>← メニューに戻る</Link>
      </div>
    </div>
  )
}
