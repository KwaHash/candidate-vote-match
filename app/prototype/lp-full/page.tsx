'use client'

/**
 * 【プロトタイプ】政治家向けプラットフォーム 全機能LP（HP案・包括版）
 *
 * 目的: 政治家向けの全17機能を5カテゴリに整理して訴求する公開LP。
 *       各機能カードから実際のプロト画面に遷移できる＝動く製品ツアーも兼ねる。
 *
 * 注意: 動く仕様書（プロトタイプ）。マーケ用LP案。文言・価格はサンプル。
 */

import Link from 'next/link'

interface Feature { name: string; desc: string; href: string }
interface Category { key: string; emoji: string; label: string; lead: string; accent: string; features: Feature[] }

const CATEGORIES: Category[] = [
  {
    key: 'policy', emoji: '🧠', label: '政策をつくる・磨く', lead: '一人でも、政策を鍛えられる。', accent: '#6366f1',
    features: [
      { name: '政策スタンス入力', desc: '各争点への立場・重要度・根拠を登録。有権者マッチングの素に。', href: '/prototype/policy-stance' },
      { name: 'AI政策室（政策立案AI）', desc: 'テーマと課題から、政策案を12項目で構造化。', href: '/prototype/policy-ai' },
      { name: 'AI政策秘書', desc: '議会質問・公約・SNS・想定問答の作成を支援。', href: '/prototype/ai-secretary' },
      { name: '政策実装スコア', desc: '議会質問・条例・予算化などの実績を点数化。', href: '/prototype/impact-score' },
    ],
  },
  {
    key: 'money', emoji: '💴', label: '資金を集める・透明にする', lead: '集めて、見せて、信頼に変える。', accent: '#f43f5e',
    features: [
      { name: 'クラウドファンディング作成', desc: '政策単位でプロジェクトを立ち上げ（AI下書き付き）。', href: '/prototype/crowdfunding' },
      { name: '定期献金・献金のお願い管理', desc: '月額サブスクと献金キャンペーンを管理。MRRも可視化。', href: '/prototype/donation-manage' },
      { name: '支出・証憑登録（透明化）', desc: '収支を証憑つきで記録。公開して信頼を得る。', href: '/prototype/expenses' },
      { name: '寄付者への成果報告', desc: '集めた寄付→使い道→成果を寄付者に返す。', href: '/prototype/donor-report' },
    ],
  },
  {
    key: 'people', emoji: '🤝', label: 'ヒト・モノを集める', lead: 'お金以外の力も、味方にする。', accent: '#10b981',
    features: [
      { name: '候補者プロフィール入力', desc: '経歴・実績・SNS・支援募集可否を一元管理。', href: '/prototype/candidate-profile' },
      { name: '支援者CRM', desc: '応援者・支援タイプ・接触履歴・次回アクションを管理。', href: '/prototype/supporter-crm' },
      { name: '支援募集作成', desc: 'チラシ配布・動画編集・会場・車両などを募集。', href: '/prototype/support-request' },
    ],
  },
  {
    key: 'voter', emoji: '🗳️', label: '有権者に届く・応える', lead: '24時間、有権者とつながる。', accent: '#0ea5e9',
    features: [
      { name: '候補者AIアバター', desc: 'あなたの考えを学んだAIが、質問に24時間対応。', href: '/prototype/ai-avatar' },
      { name: 'LINE・SNSコミュニティ管理', desc: '投稿案AI・セグメント配信・リマインダーで運営を仕組み化。', href: '/prototype/community' },
    ],
  },
  {
    key: 'auto', emoji: '⚙️', label: '回す・自動化する', lead: '事務作業は、AIに任せる。', accent: '#8b5cf6',
    features: [
      { name: 'ダッシュボード', desc: '全体を一望し、AIが「今日やること」を助言する司令塔。', href: '/prototype/dashboard' },
      { name: '選挙活動タスク', desc: '未着手/進行中/完了で活動タスクを管理。', href: '/prototype/tasks' },
      { name: 'AIエージェント / 自動化センター', desc: '参謀・投稿・コンプラ監視などを自動化。人は承認のみ。', href: '/prototype/automation' },
      { name: 'AIツール連携', desc: '外部の選挙AI6種をAPI連携。プロで全解放。', href: '/prototype/ai-tools' },
    ],
  },
]

export default function FullLandingPage() {
  return (
    <div className='-mt-20'>
      {/* Hero */}
      <section className='bg-gradient-to-b from-slate-900 to-slate-800 px-4 pb-16 pt-28 text-center text-white'>
        <div className='mx-auto max-w-2xl'>
          <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium'>政治家・候補者のためのAIプラットフォーム</span>
          <h1 className='mt-4 text-3xl font-bold leading-tight sm:text-4xl'>選挙活動の、<span className='text-rose-400'>すべてを一つに。</span></h1>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300'>
            政策・資金・支援者・有権者対応・自動化まで。<strong className='text-white'>17の機能と6つのAI</strong>が、あなたの政治活動を支えます。
          </p>
          <div className='mt-7 flex flex-col justify-center gap-3 sm:flex-row'>
            <Link href='/prototype/dashboard' className='rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600'>無料で始める</Link>
            <a href='#features' className='rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10'>機能を見る</a>
          </div>
          <p className='mt-3 text-[11px] text-slate-400'>初期費用・月額0円から。プロプランで全AI・自動化を解放。</p>
        </div>
      </section>

      {/* カテゴリ別 全機能 */}
      <section id='features' className='bg-white px-4 py-14'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-2 text-center'>
            <p className='text-xs font-bold uppercase tracking-wider text-rose-500'>ALL FEATURES</p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>必要なものは、すべてここに。</h2>
            <p className='mt-2 text-sm text-gray-500'>各機能はそのまま体験できます（クリックで画面へ）。</p>
          </div>

          <div className='mt-8 space-y-10'>
            {CATEGORIES.map((c) => (
              <div key={c.key}>
                <div className='mb-3 flex items-center gap-3'>
                  <span className='flex h-10 w-10 items-center justify-center rounded-xl text-xl' style={{ backgroundColor: `${c.accent}1a` }}>{c.emoji}</span>
                  <div>
                    <h3 className='text-lg font-bold text-gray-900'>{c.label}</h3>
                    <p className='text-xs text-gray-500'>{c.lead}</p>
                  </div>
                </div>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {c.features.map((f) => (
                    <Link key={f.href} href={f.href} className='group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md'>
                      <span className='mt-1 h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: c.accent }} />
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-bold text-gray-900'>{f.name}</p>
                        <p className='mt-0.5 text-xs leading-relaxed text-gray-500'>{f.desc}</p>
                      </div>
                      <span className='shrink-0 text-xs font-medium text-gray-300 group-hover:text-rose-500'>見る →</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金 */}
      <section className='bg-slate-50 px-4 py-16'>
        <div className='mx-auto max-w-3xl'>
          <h2 className='mb-8 text-center text-2xl font-bold text-gray-900'>料金プラン</h2>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='rounded-2xl border border-gray-200 bg-white p-6'>
              <h3 className='text-lg font-bold text-gray-900'>無料</h3>
              <p className='mt-1 text-3xl font-bold text-gray-900'>¥0<span className='text-sm font-normal text-gray-400'>/月</span></p>
              <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                <li>✓ プロフィール・政策スタンス</li>
                <li>✓ 支援者CRM・タスク・クラファン</li>
                <li>✓ 政治資金の透明化</li>
                <li>✓ 自己分析AI</li>
              </ul>
              <Link href='/prototype/dashboard' className='mt-5 block rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>無料で始める</Link>
            </div>
            <div className='rounded-2xl border-2 border-rose-400 bg-white p-6'>
              <div className='flex items-center gap-2'><h3 className='text-lg font-bold text-gray-900'>プロ</h3><span className='rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600'>おすすめ</span></div>
              <p className='mt-1 text-3xl font-bold text-gray-900'>要問合せ<span className='text-sm font-normal text-gray-400'>/月</span></p>
              <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                <li>✓ 無料のすべて</li>
                <li>✓ <strong>6つのAIすべて解放</strong>（参謀/世論調査/政策ブレーン/分身/適法チェック）</li>
                <li>✓ AIエージェント・自動化センター</li>
                <li>✓ 定期献金・優先サポート</li>
              </ul>
              <Link href='/prototype/ai-tools' className='mt-5 block rounded-xl bg-rose-500 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-600'>プロを見る</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className='bg-gradient-to-b from-slate-800 to-slate-900 px-4 py-16 text-center text-white'>
        <h2 className='text-2xl font-bold'>あなたの挑戦を、AIが支えます。</h2>
        <p className='mx-auto mt-3 max-w-md text-sm text-slate-300'>まずは無料で、ダッシュボードから始めてみてください。</p>
        <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
          <Link href='/prototype/dashboard' className='rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600'>無料で始める</Link>
          <Link href='/prototype' className='rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10'>機能一覧（管理）を見る</Link>
        </div>
        <p className='mt-6 text-[11px] text-slate-500'>※ プロトタイプのLP案です。文言・価格・実績はサンプルです。本サービスは特定政党を推奨しません。</p>
      </section>
    </div>
  )
}
