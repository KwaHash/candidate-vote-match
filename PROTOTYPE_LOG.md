# プロトタイプ開発ログ（政治家向け / candidate-vote-match）

このファイルは、横森（プロトタイプ担当）が `prototype` ブランチで作成したプロトタイプの
**開発履歴**を、実装担当の開発者が追えるようにまとめたものです。

## 運用ルール（開発者向け）

- **ブランチ:** プロトタイプ作業はすべて `prototype` ブランチで行います（`main` は触りません）。
- **置き場所:** プロトタイプ画面は `app/prototype/` 配下にまとめています。本番ルートとは分離。
- **データ:** プロトタイプはDBを使わず `localStorage` 等で動かします（本番はDBへ）。
- **コミット規約:** プロトタイプ関連のコミットは `proto:` を接頭辞に付けます（`git log --grep "proto:"` で一覧可）。
- **ハンドオフ:** バージョンが固まったらタグ（`proto-v1` 等）を打ち、ハンドオフIssueで連絡します。
- **位置づけ:** これは「動く仕様書」です。コードの流用は任意で、本番は本品質で実装し直してください。

## 変更履歴

| 日付 | バージョン | 画面 / 変更 | 場所 | 状態 |
|---|---|---|---|---|
| 2026-06-18 | proto-v1 (作業中) | 政策スタンス入力画面 | `app/prototype/policy-stance/page.tsx` | 作業中 |
| 2026-06-18 | - | プロトタイプを認証なしで閲覧可にする調整 | `providers/auth-provider.tsx`（`AUTH_PATHS`に`/prototype`追加） | 作業中 |
| 2026-06-20 | - | プロトタイプ一覧ページ / 保存ボタン色調整（遠隔セッション） | `app/prototype/page.tsx`, `policy-stance`（保存ボタン indigo化） | 作業中 |
| 2026-06-20 | proto-v1 (作業中) | クラウドファンディング作成画面 | `app/prototype/crowdfunding/page.tsx` | 作業中 |
| 2026-06-20 | - | 全体構想を BACKLOG 化（3サイト・全機能） | `BACKLOG.md`, `app/prototype/_data.ts` | 作業中 |
| 2026-06-20 | proto-v1 (作業中) | 候補者プロフィール管理画面 | `app/prototype/candidate-profile/page.tsx` | 作業中 |
| 2026-06-20 | proto-v1 (作業中) | 支出・証憑登録（政治資金透明化）画面 | `app/prototype/expenses/page.tsx` | 作業中 |
| 2026-06-20 | proto-v1 (作業中) | 支援者CRM画面（政治家向けMVP高優先5機能 完了） | `app/prototype/supporter-crm/page.tsx` | 作業中 |
| 2026-06-20 | - | 【移設】国民向け（診断・候補者一覧）を next-vote-match へ移動 | `app/prototype/citizen/` を削除。国民向けは seijiselect.jp=next-vote-match が正 | 完了 |

## 各プロトタイプの詳細

### クラウドファンディング作成画面（`/prototype/crowdfunding`）

**目的:** 政治家が「政策単位」でプロジェクト（クラファン）を立ち上げる。寄付トレーサビリティ（Campaign ID）の起点。

**実装内容:**
- 政策テーマ（`app/prototype/_data.ts` の `POLICY_THEMES`）・対象地域レベル・地域名・目標金額を入力。
- 支出計画を明細（用途＋金額）で複数行入力 → 合計を自動計算し、目標金額との差分（一致 / 未割当 / 超過）を表示。
- 選択中の政策テーマの「標準地域配分（市区町村/都道府県/国会）」をバー表示（全体構想6章の配分表に対応）。
- 募集する支援タイプ（複数選択）・公開範囲・法務確認状況を設定。
- 保存は `localStorage`（キー: `proto_crowdfunding_v1`）。

**本番実装で作り直す箇所（開発者向けメモ）:**
- 保存先を `campaigns` / `expense_plans` テーブルへ（Campaign ID 採番）。
- 政策テーマ・地域を DB マスタ化（`policies` / `regions`）。現状は `_data.ts` のハードコード。
- 法務確認（政治資金規正法・公職選挙法）のワークフロー化。MVPでは政治寄付を直接扱わない方針（BACKLOG.md 8章）。
- 地域配分は「目安表示」のみ。実配分ロジックは Phase2（トレーサビリティ）で実装。

### 政策スタンス入力画面（`/prototype/policy-stance`）

### 政策スタンス入力画面（`/prototype/policy-stance`）

**目的:** 政治家（政党）が各争点への立場を登録する。ここで入力されたデータが、
有権者向け「①政策で選ぶ」マッチングの素（`policy_positions`）になる。

**実装内容:**
- 既存 `constants/policy.ts` の14争点を使用。各争点に対し立場を1つ選択。
- 立場選択後に「重要度（高/中/低）・根拠URL・ひとことコメント」を入力（→ `policy_positions` の stance/weight/evidence_url に対応）。
- 進捗バー（回答済み件数 / %）、所属政党の選択。
- 保存は `localStorage`（キー: `proto_policy_stance_v1`）。

**本番実装で作り直す箇所（開発者向けメモ）:**
- 保存先を `policy_positions` テーブルへ（party_id, issue_id, stance_code, weight, evidence_url, updated_at）。
- 認証必須化（現状は `/prototype` を認証ガードから除外しているだけ）。
- 争点（issues）のマスタ化（現状は `policy.ts` のハードコード）。
- 入力内容の「下書き / 公開」状態管理。

**関連ドキュメント:** リポジトリ外の `開発者ハンドオフ_v1.md`（3切り口・データモデル全体）。
