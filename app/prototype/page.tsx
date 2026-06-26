import Link from 'next/link'

const PROTOTYPES = [
  {
    href: '/prototype/dashboard',
    title: 'ダッシュボード（ホーム）',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      'ログイン後のホーム・司令塔。タスク・クラファン進捗・支援者・政策実装スコア・注目度を集約し、「今日やること」をAIが助言する。',
    notes: [
      '各画面のデータを集約表示・要対応を可視化',
      'AIアシスト（今日やること）。本番は各テーブル集計＋LLM',
    ],
  },
  {
    href: '/prototype/policy-stance',
    title: '政策スタンス入力',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '政治家（政党）が各争点への立場・重要度・根拠URLを登録する画面。有権者向け「政策で選ぶ」マッチングの元データになる。',
    notes: [
      '14争点に対し立場を1つ選択',
      '重要度（高/中/低）・根拠URL・ひとことコメントを入力',
      'データは localStorage に仮保存（本番: policy_positions テーブル）',
    ],
  },
  {
    href: '/prototype/crowdfunding',
    title: 'クラウドファンディング作成',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '政治家が「政策単位」でプロジェクトを立ち上げる画面。目標金額・支出計画・成果目標を登録し、寄付トレーサビリティ（Campaign ID）の起点になる。',
    notes: [
      '政策テーマ・対象地域・目標金額・支出計画（明細）を入力',
      '政策テーマごとの標準地域配分（市区町村/都道府県/国会）を表示',
      '公開範囲・法務確認状況を設定（本番: campaigns テーブル）',
    ],
  },
  {
    href: '/prototype/candidate-profile',
    title: '候補者プロフィール管理',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '候補者の基本情報・経歴・実績・SNS・支援募集可否を登録する画面。国民向けサイトの候補者ページと政策マッチングの土台（Candidate ID）になる。',
    notes: [
      '顔写真・氏名・所属・選挙区・現職/新人を登録',
      '経歴（学歴/職歴/政治歴）・実績（複数）・SNS・公式サイト',
      '寄付受付可否・お金以外の支援募集（本番: candidates テーブル）',
    ],
  },
  {
    href: '/prototype/expenses',
    title: '支出・証憑登録（政治資金透明化）',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '収入・支出を証憑つきで登録し、収支・残高を可視化する画面。公開設定した項目が国民向けの透明化ダッシュボードに反映される（Expense ID）。',
    notes: [
      '収入/支出の分類・金額・日付・相手先・証憑を登録',
      '公開可否・関連当事者取引フラグを設定',
      '収入計/支出計/残高を自動集計（本番: expenses テーブル＋収支報告CSV）',
    ],
  },
  {
    href: '/prototype/supporter-crm',
    title: '支援者CRM',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '応援者を管理する画面。支援タイプ・関心政策・接触履歴・次回アクションを記録し、関係づくりに使う（Support ID / User ID）。',
    notes: [
      '個人/団体・支援タイプ・関心政策・地域・公開設定を登録',
      '接触履歴・次回アクションを記録、支援タイプで絞り込み',
      '要対応（次回アクションあり）を集計（本番: supporters テーブル）',
    ],
  },
  {
    href: '/prototype/support-request',
    title: '支援募集作成',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      'お金以外の支援（チラシ配布・動画編集・会場・車両など）を募集する画面。作成した募集は支援者サイト（assist）に表示される想定。',
    notes: [
      'タイトル・政策テーマ・必要な支援・期間・報酬・公開範囲を設定',
      '作成した募集を一覧管理（本番: support_requests テーブル）',
    ],
  },
  {
    href: '/prototype/impact-score',
    title: '政策実装スコア',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '活動実績を点数化する画面。議会質問30点・条例案提出50点・予算化70点などを記録し、合計スコアとランクを表示。一部は国民向けの実績として公開される想定。',
    notes: [
      '活動の種類・日付・メモを記録して自動加点',
      '合計スコア・ランク・種別内訳を表示（本番: activities テーブル）',
    ],
  },
  {
    href: '/prototype/ai-secretary',
    title: 'AI政策秘書',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '議会質問案・公約・SNS投稿・想定問答などの作成を支援する候補者向け有料AI機能。',
    notes: [
      '6種類のツールからテーマを入力して生成',
      'プロトの生成はテンプレ（LLM不使用）。本番は候補者ごと従量課金',
    ],
  },
  {
    href: '/prototype/tasks',
    title: '選挙活動タスク管理',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '選挙・政策活動のタスクを未着手/進行中/完了で管理する画面（低優先）。',
    notes: [
      'タスク追加・カテゴリ・期限・ステータス切替・進捗バー',
      '本番: tasks テーブル',
    ],
  },
  {
    href: '/prototype/policy-ai',
    title: 'AI政策室（政策立案AI）',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      'テーマ・地域・課題などを入力すると、政策案を12項目（政策名/課題/データ/他国比較/解決策/役割分担/予算/KPI/反対意見/SNS/クラファン文/議会質問）で構造化するバーティカルAIの中核。',
    notes: [
      '8項目の入力→12項目の政策案を生成',
      'プロトはテンプレ。本番は地域データ＋LLM・候補者ごと従量課金',
    ],
  },
  {
    href: '/prototype/community',
    title: 'LINE・SNSコミュニティ管理',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      'LINE/X/Facebook の投稿案AI生成・セグメント配信・リマインダーで、コミュニティ運営を仕組み化する画面。',
    notes: [
      'チャネル・セグメント別の投稿案を生成、今日の投稿候補',
      'リマインダー一覧（本番: community_posts / reminders、炎上チェック・承認フロー）',
    ],
  },
  {
    href: '/prototype/ai-avatar',
    title: '候補者AIアバター設定',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      'プロフィール・政策スタンスを土台に、有権者の質問へ答えるAIアバターを設定する。トーン・重点メッセージを設定し回答をプレビュー。国民向けで有権者対応する想定。',
    notes: [
      'トーン/重点メッセージ/未回答時の対応を設定',
      'プレビューQ&A（政策テーマを含むと政策スタンスを踏まえて回答）。プロトはテンプレ',
    ],
  },
  {
    href: '/prototype/donor-report',
    title: '寄付者への成果報告',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '「集めた寄付 → 使い道 → 成果」を寄付者に返す報告を作成する。透明化の出口・継続支援につながる（DON→IMP）。',
    notes: [
      'Before/使い道/成果/メッセージを入力、AIで下書き',
      '送信済み報告を一覧。本番は寄付ID→成果IDを紐づけ配信',
    ],
  },
  {
    href: '/prototype/ai-tools',
    title: 'AIツール連携（外部AI・API）',
    target: '政治家向け',
    targetColor: 'bg-violet-100 text-violet-700',
    status: '作業中',
    statusColor: 'bg-amber-100 text-amber-700',
    description:
      '外部の選挙AIツール（参謀AI/自己分析AI/世論調査AI/政策ブレーンAI/分身AI/適法チェックAI）をAPIキーで連携。一部はプロプランで解放。分身AIは候補者AIアバターに対応。',
    notes: [
      'APIキー設定＋プラン（無料/プロ）で解放制御',
      '6ツールを連携。本番はAPIキー暗号化保存＋課金制御',
    ],
  },
]

// 国民向け（seijiselect.jp）のプロトタイプは別リポジトリ next-vote-match に移設。
// 政策マッチング診断 /prototype/match、候補者一覧 /prototype/candidates

export default function PrototypeIndexPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10'>
      {/* ヘッダー */}
      <div className='mb-8'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ一覧
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>
          実装前プロトタイプ
        </h1>
        <p className='mt-2 text-sm text-gray-500 leading-relaxed'>
          本実装前の「動く仕様書」です。UIとデータフローの確認用で、データは
          localStorage に保存されます。開発者はコードを参考に本番品質で実装し直してください。
        </p>
      </div>

      {/* 注意書き */}
      <div className='mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
        <span className='font-semibold'>注意:</span>{' '}
        このセクションは認証なしでアクセスできます。本番環境へのデプロイ時は
        <code className='mx-1 rounded bg-amber-100 px-1 font-mono text-xs'>/prototype</code>
        ルートを除外するか、認証ガードを有効にしてください。
      </div>

      {/* プロトタイプカード一覧 */}
      <div className='space-y-4'>
        {PROTOTYPES.map((proto) => (
          <Link
            key={proto.href}
            href={proto.href}
            className='block rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md'
          >
            <div className='mb-3 flex flex-wrap items-center gap-2'>
              <h2 className='text-base font-bold text-gray-900'>
                {proto.title}
              </h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${proto.targetColor}`}
              >
                {proto.target}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${proto.statusColor}`}
              >
                {proto.status}
              </span>
            </div>

            <p className='mb-3 text-sm text-gray-600 leading-relaxed'>
              {proto.description}
            </p>

            <ul className='space-y-1'>
              {proto.notes.map((note) => (
                <li
                  key={note}
                  className='flex items-start gap-2 text-xs text-gray-500'
                >
                  <span className='mt-0.5 text-gray-300'>•</span>
                  {note}
                </li>
              ))}
            </ul>

            <div className='mt-4 flex items-center gap-1 text-xs font-medium text-indigo-600'>
              画面を見る
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 16 16'
                fill='currentColor'
                className='h-3.5 w-3.5'
              >
                <path
                  fillRule='evenodd'
                  d='M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* フッターメモ */}
      <div className='mt-10 rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 text-xs text-gray-500 leading-relaxed'>
        <p className='mb-1 font-semibold text-gray-700'>開発者向けメモ</p>
        <p>
          プロトタイプ画面は <code className='rounded bg-gray-100 px-1 font-mono'>app/prototype/</code> 配下に集約しています。
          追加するときはこのファイルの <code className='rounded bg-gray-100 px-1 font-mono'>PROTOTYPES</code> 配列にエントリを追加してください。
          詳細は <code className='rounded bg-gray-100 px-1 font-mono'>PROTOTYPE_LOG.md</code> を参照。
        </p>
      </div>
    </div>
  )
}
