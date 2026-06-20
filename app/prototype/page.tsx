import Link from 'next/link'

const PROTOTYPES = [
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
]

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
