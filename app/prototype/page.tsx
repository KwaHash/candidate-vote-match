import Link from 'next/link'

// ── MVP 5メニュー（ChatGPT再設計指示に基づく絞り込み）──
interface Item { name: string; href: string; note?: string }
interface Menu { n: number; icon: string; title: string; lead: string; items: Item[] }

const MENU: Menu[] = [
  {
    n: 1, icon: '🎯', title: '今日やること', lead: '次に何をすればいいかが一目で。', items: [
      { name: 'ダッシュボード（ホーム）', href: '/prototype/dashboard', note: '選挙活動タスクを統合・AIが今日やることを提案' },
    ],
  },
  {
    n: 2, icon: '🧠', title: '政策をつくる', lead: '一人でも、政策を鍛える。', items: [
      { name: '政策スタンス入力', href: '/prototype/policy-stance' },
      { name: 'AI政策秘書', href: '/prototype/ai-secretary', note: 'AI政策室を統合。政策案・1枚政策カード' },
    ],
  },
  {
    n: 3, icon: '📣', title: '発信をつくる', lead: 'AIが下書き、人が承認。', items: [
      { name: 'AI政策秘書（発信）', href: '/prototype/ai-secretary', note: 'SNS/議会質問/想定問答/お礼文' },
      { name: 'LINE・SNS発信', href: '/prototype/community', note: '投稿案・配信文（複雑なセグメントは後回し）' },
    ],
  },
  {
    n: 4, icon: '🤝', title: '支援者を管理する', lead: 'バラバラな支援者情報を一元化。', items: [
      { name: '支援者CRM', href: '/prototype/supporter-crm', note: '支援募集を統合・今日連絡すべき人をAI抽出' },
    ],
  },
  {
    n: 5, icon: '💴', title: '資金・成果を報告する', lead: '集めて、見せて、信頼に変える。', items: [
      { name: '政策応援ページ作成', href: '/prototype/crowdfunding', note: '旧クラウドファンディング（名称変更）' },
      { name: '定期献金・献金管理', href: '/prototype/donation-manage', note: '法務注意つき' },
      { name: '支出・証憑登録（簡易）', href: '/prototype/expenses' },
      { name: '寄付者への成果報告', href: '/prototype/donor-report' },
    ],
  },
]

const SUB: Item[] = [
  { name: 'プロフィール設定', href: '/prototype/candidate-profile' },
]

const PUBLIC_PAGES: Item[] = [
  { name: '公開LP（全機能）', href: '/prototype/lp-full' },
  { name: '公開LP（AI訴求）', href: '/prototype/lp' },
]

const DEFERRED: Item[] = [
  { name: '候補者AIアバター', href: '/prototype/ai-avatar', note: '誤回答・炎上リスクのため後回し' },
  { name: 'AIエージェント・自動化センター', href: '/prototype/automation', note: '後回し' },
  { name: 'AIツール連携', href: '/prototype/ai-tools', note: '後回し' },
  { name: '政策実装スコア', href: '/prototype/impact-score', note: '後回し' },
  { name: '選挙活動タスク（単体）', href: '/prototype/tasks', note: 'ダッシュボードに統合' },
]

export default function PrototypeIndexPage() {
  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-10'>
      <div className='mb-6'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け（MVP再設計版）
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>政治活動を、ひとつの画面で回す。</h1>
        <p className='mt-2 text-sm leading-relaxed text-gray-500'>
          政策づくり・発信・支援者管理・資金/成果報告まで。政治家の毎日を支えるAI司令塔です。
          初期リリースは下記の<strong className='text-gray-700'>5メニュー</strong>に絞り込んでいます。
        </p>
      </div>

      {/* コンプライアンス注意 */}
      <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800'>
        <p><span className='font-semibold'>コンプライアンス注意:</span>{' '}
        本サービスは政治活動・選挙運動・献金管理を支援するものです。実際の公開・送信・献金募集・収支報告にあたっては、政治資金規正法、公職選挙法、各選挙管理委員会のルールを確認してください。</p>
        <p className='mt-2 font-semibold'>特に献金・寄付では以下に注意（実決済は本人確認・法務確認後に提供）:</p>
        <ul className='mt-1 list-disc space-y-0.5 pl-4'>
          <li><span className='font-semibold'>外国人・外国法人からの寄付は禁止</span>。受領側が罰せられるため、寄付受付には本人確認・<span className='font-semibold'>国籍確認</span>が必要。</li>
          <li><span className='font-semibold'>匿名寄付・他人名義（借名）寄付は禁止</span>。匿名で寄付できる導線は作りません。</li>
          <li>候補者<span className='font-semibold'>本人への直接の金銭寄付は原則禁止</span>。政党・後援会・資金管理団体を通すのが原則。</li>
          <li><span className='font-semibold'>企業・団体献金</span>は宛先・上限が制限。当面は導線を出しません。</li>
          <li>候補者・後援会が<span className='font-semibold'>選挙区内の人へ寄付・物品・飲食を提供することは禁止</span>（公選法199の2・139）。</li>
          <li>AIが作成したメールでの<span className='font-semibold'>選挙運動は不可</span>。発信は「下書き→本人承認」、メールでの投票依頼は送りません。</li>
        </ul>
        <p className='mt-2 text-[11px]'>※ 一般的な注意喚起です。機能の実装前に選挙法・政治資金規正法に詳しい弁護士・選挙管理委員会にご確認ください。</p>
      </div>

      {/* 5メニュー */}
      <div className='space-y-4'>
        {MENU.map((m) => (
          <div key={m.n} className='rounded-2xl border border-gray-200 bg-white p-5'>
            <div className='mb-3 flex items-center gap-3'>
              <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-xl'>{m.icon}</span>
              <div>
                <h2 className='text-base font-bold text-gray-900'>{m.n}. {m.title}</h2>
                <p className='text-xs text-gray-500'>{m.lead}</p>
              </div>
            </div>
            <div className='grid gap-2 sm:grid-cols-2'>
              {m.items.map((it) => (
                <Link key={it.href + it.name} href={it.href} className='group flex items-start gap-2 rounded-xl border border-gray-200 p-3 transition-shadow hover:shadow-md'>
                  <span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-400' />
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-medium text-gray-900'>{it.name}</p>
                    {it.note && <p className='mt-0.5 text-[11px] leading-relaxed text-gray-400'>{it.note}</p>}
                  </div>
                  <span className='shrink-0 text-xs text-gray-300 group-hover:text-rose-500'>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* サブメニュー */}
      <div className='mt-6'>
        <h3 className='mb-2 text-xs font-bold uppercase tracking-wide text-gray-400'>サブメニュー</h3>
        <div className='flex flex-wrap gap-2'>
          {SUB.concat(PUBLIC_PAGES).map((it) => (
            <Link key={it.href} href={it.href} className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50'>{it.name}</Link>
          ))}
        </div>
      </div>

      {/* 後回し（初期リリースでは非表示） */}
      <div className='mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50/60 p-4'>
        <h3 className='mb-1 text-xs font-bold text-gray-500'>後回し機能（初期リリースでは非表示）</h3>
        <p className='mb-3 text-[11px] text-gray-400'>機能過多・リスク回避のため、MVPメニューから外しています（プロトは確認用に残置）。</p>
        <div className='flex flex-wrap gap-2'>
          {DEFERRED.map((it) => (
            <Link key={it.href} href={it.href} className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-400 hover:text-gray-600' title={it.note}>{it.name}</Link>
          ))}
        </div>
      </div>

      <p className='mt-6 text-center text-[11px] text-gray-400'>AIは「下書き→確認→編集→公開/送信」。AIが勝手に公開・送信する機能は初期では作りません。</p>
    </div>
  )
}
