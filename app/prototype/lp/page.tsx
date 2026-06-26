'use client'

/**
 * 【プロトタイプ】政治家向けプラットフォーム 公開トップページ（HP案 / ランディングページ）
 *
 * 目的: AIツール（6種）とプラットフォーム機能を訴求する、登録前の公開LP。
 *       「事前に作るウェブ画面」のたたき台。CTAから登録・各AIツールへ誘導。
 *
 * 注意: 動く仕様書（プロトタイプ）。マーケ用LP案。文言・価格はサンプル。
 */

import Link from 'next/link'

const TOOLS = [
  { no: '00', name: '参謀AI', tagline: 'あなたの選対本部長', desc: '「あと何票で勝てるか」「対立候補にどう差をつけるか」を分析し、勝つ計画にまとめます。' },
  { no: '01', name: '自己分析AI', tagline: 'すべての出発点', desc: '50の質問で、あなたの強み・人柄・支持の核を言葉に。' },
  { no: '02', name: '世論調査AI', tagline: '反応を、公開前に試す', desc: 'AIの“仮想有権者”に政策をぶつけ、公開前に賛否を確かめられます。' },
  { no: '03', name: '政策ブレーンAI', tagline: '政策を磨く', desc: '公約の穴や想定反論を24時間チェック。一人でも政策を鍛えられます。' },
  { no: '04', name: '分身AI', tagline: '夜中でも、有権者に応える', desc: 'あなたの考えを学んだAIが、有権者の質問に24時間対応。' },
  { no: '05', name: '適法チェックAI', tagline: '「やってOK？」を確かめる', desc: '気になる活動が公選法・制度の上で大丈夫か確認できます。' },
]

const PAINS = ['政策に自信が持てない', '資金が集まらない', '支援者の管理が大変', '発信が続かない', '公選法・適法性が不安', '一人で時間が足りない']

const FEATURES = [
  { icon: '🧑‍🤝‍🧑', title: 'ヒト・モノ・カネを集める', desc: '支援者CRM・物品/会場の募集・クラファン・定期献金まで一元管理。' },
  { icon: '🔍', title: '政治資金の透明化', desc: '寄付→支出→成果を自動で可視化。信頼が、次の支援を生みます。' },
  { icon: '🤖', title: 'AIエージェント・自動化', desc: '投稿・リマインド・コンプラ監視を自動化。あなたは承認するだけ。' },
  { icon: '🗳️', title: '有権者とつながる', desc: '政策マッチング・候補者比較で、あなたを支持する有権者に届きます。' },
]

export default function LandingPage() {
  return (
    <div className='-mt-20'>
      {/* Hero */}
      <section className='bg-gradient-to-b from-slate-900 to-slate-800 px-4 pb-16 pt-28 text-center text-white'>
        <div className='mx-auto max-w-2xl'>
          <span className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium'>
            政治家・候補者のためのAIプラットフォーム
          </span>
          <h1 className='mt-4 text-3xl font-bold leading-tight sm:text-4xl'>
            一人でも、戦える。<br />あなたの選挙に、<span className='text-rose-400'>AIの選対本部</span>を。
          </h1>
          <p className='mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-300'>
            政策づくりから、資金集め、支援者管理、有権者対応まで。
            <strong className='text-white'>6つのAIと自動化</strong>が、あなたの政治活動を24時間支えます。
          </p>
          <div className='mt-7 flex flex-col justify-center gap-3 sm:flex-row'>
            <Link href='/prototype/dashboard' className='rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-600'>無料で始める</Link>
            <Link href='/prototype/ai-tools' className='rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10'>AIツールを見る</Link>
          </div>
          <p className='mt-3 text-[11px] text-slate-400'>初期費用・月額0円から。プロプランで全AI解放。</p>
        </div>
      </section>

      {/* 課題提起 */}
      <section className='bg-white px-4 py-14'>
        <div className='mx-auto max-w-3xl text-center'>
          <h2 className='text-xl font-bold text-gray-900'>こんな悩み、ありませんか？</h2>
          <div className='mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {PAINS.map((p) => (
              <div key={p} className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700'>{p}</div>
            ))}
          </div>
          <p className='mt-6 text-sm text-gray-500'>そのすべてを、AIと自動化が肩代わりします。</p>
        </div>
      </section>

      {/* AIツール */}
      <section className='bg-slate-50 px-4 py-16'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-8 text-center'>
            <p className='text-xs font-bold uppercase tracking-wider text-rose-500'>AI TOOLS</p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>6つのAIが、あなたの選対本部に。</h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {TOOLS.map((t) => (
              <div key={t.no} className='rounded-2xl border border-gray-200 bg-white p-5'>
                <div className='flex items-baseline gap-2'>
                  <span className='font-mono text-lg font-bold text-rose-300'>{t.no}</span>
                  <h3 className='text-base font-bold text-gray-900'>{t.name}</h3>
                </div>
                <p className='mt-1 text-xs font-medium text-rose-500'>{t.tagline}</p>
                <p className='mt-2 text-sm leading-relaxed text-gray-600'>{t.desc}</p>
              </div>
            ))}
          </div>
          <div className='mt-8 text-center'>
            <Link href='/prototype/ai-tools' className='inline-block rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700'>AIツールを連携して使う →</Link>
          </div>
        </div>
      </section>

      {/* プラットフォーム機能 */}
      <section className='bg-white px-4 py-16'>
        <div className='mx-auto max-w-4xl'>
          <div className='mb-8 text-center'>
            <p className='text-xs font-bold uppercase tracking-wider text-rose-500'>PLATFORM</p>
            <h2 className='mt-1 text-2xl font-bold text-gray-900'>AIだけじゃない。選挙のすべてを、ここで。</h2>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            {FEATURES.map((f) => (
              <div key={f.title} className='flex gap-4 rounded-2xl border border-gray-200 p-5'>
                <div className='text-3xl'>{f.icon}</div>
                <div>
                  <h3 className='text-base font-bold text-gray-900'>{f.title}</h3>
                  <p className='mt-1 text-sm text-gray-600'>{f.desc}</p>
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
                <li>✓ 支援者CRM・タスク管理</li>
                <li>✓ 自己分析AI</li>
                <li>✓ クラファン・透明化</li>
              </ul>
              <Link href='/prototype/dashboard' className='mt-5 block rounded-xl border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50'>無料で始める</Link>
            </div>
            <div className='rounded-2xl border-2 border-rose-400 bg-white p-6'>
              <div className='flex items-center gap-2'>
                <h3 className='text-lg font-bold text-gray-900'>プロ</h3>
                <span className='rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600'>おすすめ</span>
              </div>
              <p className='mt-1 text-3xl font-bold text-gray-900'>要問合せ<span className='text-sm font-normal text-gray-400'>/月</span></p>
              <ul className='mt-4 space-y-2 text-sm text-gray-600'>
                <li>✓ 無料のすべて</li>
                <li>✓ <strong>6つのAIすべて解放</strong>（参謀/世論調査/政策ブレーン/分身/適法チェック）</li>
                <li>✓ AIエージェント・自動化</li>
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
        <p className='mx-auto mt-3 max-w-md text-sm text-slate-300'>まずは無料で、ダッシュボードと自己分析AIから始めてみてください。</p>
        <div className='mt-6 flex flex-col justify-center gap-3 sm:flex-row'>
          <Link href='/prototype/dashboard' className='rounded-xl bg-rose-500 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-600'>無料で始める</Link>
          <Link href='/prototype' className='rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10'>機能一覧を見る</Link>
        </div>
        <p className='mt-6 text-[11px] text-slate-500'>※ プロトタイプのLP案です。文言・価格・実績はサンプルです。</p>
      </section>
    </div>
  )
}
