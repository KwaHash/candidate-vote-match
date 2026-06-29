'use client'

/**
 * 【プロトタイプ 保存処理の集約モジュール】
 *
 * 政治家向けプロトの各画面は、保存を全てこの2関数経由で行います。
 * 本番化（Supabase化）のときは、**このファイルの中身だけを差し替えれば**全画面が本番DBに繋がります。
 * 呼び出し側（各画面）のコードは変更不要です。
 *
 * ── 現在: ブラウザの localStorage に保存 ──
 *
 * ── 本番化の手順（作業者向け）──
 * 1. Supabase クライアントを用意（@supabase/supabase-js）。
 * 2. 下の loadJSON / saveJSON を、key に対応するテーブルへの select / upsert に書き換える。
 * 3. 呼び出し側は触らない。
 *
 * ── key → Supabase テーブル 対応表 ──
 *   proto_policy_stance_v1      → policy_positions
 *   proto_candidate_profile_v1  → candidates
 *   proto_crowdfunding_v1       → campaigns / expense_plans
 *   proto_expenses_v1           → finances
 *   proto_supporter_crm_v1      → supporters
 *   proto_impact_score_v1       → activities
 *   proto_support_request_v1    → support_requests
 *   proto_campaign_tasks_v1     → tasks
 *
 * ※ プロトは「1キー＝1つのJSONオブジェクト」で保存しています。本番では
 *    そのオブジェクトを各テーブルの行に展開して保存してください（SQLは発注文参照）。
 */

// プロトで使う保存キー（一覧・型補完用）
export const STORE_KEYS = {
  policyStance: 'proto_policy_stance_v1',
  candidateProfile: 'proto_candidate_profile_v1',
  crowdfunding: 'proto_crowdfunding_v1',
  expenses: 'proto_expenses_v1',
  supporterCrm: 'proto_supporter_crm_v1',
  impactScore: 'proto_impact_score_v1',
  supportRequest: 'proto_support_request_v1',
  tasks: 'proto_campaign_tasks_v1',
  aiAvatar: 'proto_ai_avatar_v1', // → candidate_avatars（AIアバター設定）
  donorReport: 'proto_donor_report_v1', // → impact_reports（寄付者への成果報告）
  aiTools: 'proto_ai_tools_v1', // → ai_tool_integrations（外部AIツールのAPI連携・プラン）
  automation: 'proto_automation_v1', // → automation_agents（エージェントON/OFF設定）
  recurringDonation: 'proto_recurring_donation_v1', // → recurring_plans / donation_campaigns（定期献金・献金キャンペーン）
  publicAnswers: 'proto_public_answers_v1', // → candidate_question_answers（公開質問ボードへの回答。国民側ボード・運営adminと連携）
} as const

/** 読み込み。データが無い/壊れている場合は fallback を返す。 */
export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

/** 保存。 */
export function saveJSON<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

/*
 * ── 本番化の例（Supabase。コメントのまま。実装時に上の2関数と差し替え）──
 *
 * import { createClient } from '@supabase/supabase-js'
 * const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
 *
 * export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
 *   const table = KEY_TO_TABLE[key]
 *   const { data: { user } } = await supabase.auth.getUser()
 *   const { data } = await supabase.from(table).select('*').eq('candidate_id', user!.id)
 *   return (data as T) ?? fallback   // ※ 行→画面の形へ整形が必要
 * }
 * export async function saveJSON<T>(key: string, value: T): Promise<void> {
 *   const table = KEY_TO_TABLE[key]
 *   const { data: { user } } = await supabase.auth.getUser()
 *   await supabase.from(table).upsert({ candidate_id: user!.id, ... }) // ※ 画面→行へ整形が必要
 * }
 *
 * ※ 関数を async にする場合、各画面の呼び出しに await を付ける必要があります。
 *    その手間を避けたい場合は、画面側で useEffect 内のロードのみ async ラッパーにするのが簡単です。
 */
