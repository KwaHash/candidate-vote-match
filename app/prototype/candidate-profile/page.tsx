'use client'

/**
 * 【プロトタイプ】政治家向け 候補者プロフィール管理画面
 *
 * 目的: 候補者の基本情報・経歴・実績・SNS・支援募集可否を登録する。
 *       国民向け seijiselect.jp の候補者ページ・マッチングの土台になる（Candidate ID）。
 *
 * 注意: 動く仕様書（プロトタイプ）。保存は localStorage（本番では candidates / candidate_profiles テーブルへ）。
 */

import { parties } from '@/constants/parties'
import { REGION_LEVELS, type RegionLevel } from '../_data'
import { loadJSON, saveJSON } from '../_store'
import { useEffect, useMemo, useState } from 'react'

interface AchievementRow {
  id: number
  text: string
}

const STORAGE_KEY = 'proto_candidate_profile_v1'

const SUPPORT_NEEDS = ['資金', '人（ボランティア）', '物品', '場所', '専門家'] as const

export default function CandidateProfilePrototypePage() {
  const [avatar, setAvatar] = useState('')
  const [kanjiName, setKanjiName] = useState('')
  const [kanaName, setKanaName] = useState('')
  const [partyId, setPartyId] = useState<number>(1)
  const [electionLevel, setElectionLevel] = useState<RegionLevel>('prefecture')
  const [district, setDistrict] = useState('')
  const [incumbent, setIncumbent] = useState<'incumbent' | 'newcomer'>('newcomer')
  const [education, setEducation] = useState('')
  const [career, setCareer] = useState('')
  const [politicalCareer, setPoliticalCareer] = useState('')
  const [achievements, setAchievements] = useState<AchievementRow[]>([{ id: 1, text: '' }])
  const [sns, setSns] = useState({ x: '', youtube: '', instagram: '', tiktok: '' })
  const [website, setWebsite] = useState('')
  const [acceptDonation, setAcceptDonation] = useState(true)
  const [supportNeeds, setSupportNeeds] = useState<string[]>(['資金'])
  const [savedAt, setSavedAt] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = loadJSON<any>(STORAGE_KEY, null)
    if (d) {
      setAvatar(d.avatar ?? '')
      setKanjiName(d.kanjiName ?? '')
      setKanaName(d.kanaName ?? '')
      setPartyId(d.partyId ?? 1)
      setElectionLevel(d.electionLevel ?? 'prefecture')
      setDistrict(d.district ?? '')
      setIncumbent(d.incumbent ?? 'newcomer')
      setEducation(d.education ?? '')
      setCareer(d.career ?? '')
      setPoliticalCareer(d.politicalCareer ?? '')
      setAchievements(d.achievements?.length ? d.achievements : [{ id: 1, text: '' }])
      setSns(d.sns ?? { x: '', youtube: '', instagram: '', tiktok: '' })
      setWebsite(d.website ?? '')
      setAcceptDonation(d.acceptDonation ?? true)
      setSupportNeeds(d.supportNeeds ?? ['資金'])
      setSavedAt(d.savedAt ?? null)
    }
  }, [])

  // 入力完成度（主要項目）
  const completeness = useMemo(() => {
    const checks = [
      kanjiName.trim() !== '',
      avatar.trim() !== '',
      district.trim() !== '',
      education.trim() !== '' || career.trim() !== '',
      achievements.some((a) => a.text.trim() !== ''),
      Object.values(sns).some((v) => v.trim() !== '') || website.trim() !== '',
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [kanjiName, avatar, district, education, career, achievements, sns, website])

  const updateAchievement = (id: number, text: string) =>
    setAchievements((prev) => prev.map((a) => (a.id === id ? { ...a, text } : a)))
  const addAchievement = () =>
    setAchievements((prev) => [...prev, { id: Math.max(0, ...prev.map((a) => a.id)) + 1, text: '' }])
  const removeAchievement = (id: number) =>
    setAchievements((prev) => (prev.length > 1 ? prev.filter((a) => a.id !== id) : prev))

  const toggleNeed = (n: string) =>
    setSupportNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]))

  const canSave = kanjiName.trim() !== ''

  const handleSave = () => {
    const now = new Date().toLocaleString('ja-JP')
    saveJSON(STORAGE_KEY, {
      avatar, kanjiName, kanaName, partyId, electionLevel, district, incumbent,
      education, career, politicalCareer, achievements, sns, website,
      acceptDonation, supportNeeds, savedAt: now,
    })
    setSavedAt(now)
  }

  const inputCls =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400'
  const labelCls = 'mb-1.5 block text-sm font-medium text-gray-700'
  const cardCls = 'rounded-xl border border-gray-200 bg-white p-5'

  return (
    <div className='mx-auto w-full max-w-3xl px-4 py-8 pb-32'>
      <div className='mb-6'>
        <div className='mb-2 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600'>
          <span className='h-1.5 w-1.5 rounded-full bg-rose-500' />
          プロトタイプ / 政治家向け
        </div>
        <h1 className='text-2xl font-bold text-gray-900'>候補者プロフィール管理</h1>
        <p className='mt-1 text-sm text-gray-500'>
          ここで登録した情報が、国民向けサイトの候補者ページ・政策マッチングの土台になります。
        </p>
      </div>

      {/* 完成度 */}
      <div className='mb-6 rounded-xl border border-gray-200 bg-white p-4'>
        <div className='mb-2 flex items-center justify-between text-sm'>
          <span className='font-medium text-gray-700'>プロフィール完成度</span>
          <span className='font-semibold text-indigo-600'>{completeness}%</span>
        </div>
        <div className='h-2 w-full overflow-hidden rounded-full bg-gray-100'>
          <div className='h-full rounded-full bg-indigo-500 transition-all duration-300' style={{ width: `${completeness}%` }} />
        </div>
      </div>

      <div className='space-y-5'>
        {/* 基本情報 */}
        <div className={cardCls}>
          <div className='mb-4 flex items-center gap-4'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className='flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-400'>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt='顔写真' className='h-full w-full object-cover' />
              ) : (
                '写真'
              )}
            </div>
            <div className='flex-1'>
              <label className={labelCls}>顔写真URL</label>
              <input className={inputCls} placeholder='https://... または /images/...' value={avatar} onChange={(e) => setAvatar(e.target.value)} />
            </div>
          </div>

          <div className='mb-4 grid grid-cols-2 gap-3'>
            <div>
              <label className={labelCls}>氏名（漢字）</label>
              <input className={inputCls} placeholder='山田 太郎' value={kanjiName} onChange={(e) => setKanjiName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>ふりがな</label>
              <input className={inputCls} placeholder='やまだ たろう' value={kanaName} onChange={(e) => setKanaName(e.target.value)} />
            </div>
          </div>

          <div className='mb-4'>
            <label className={labelCls}>所属</label>
            <select className={inputCls} value={partyId} onChange={(e) => setPartyId(Number(e.target.value))}>
              {parties.filter((p) => p.id !== 0).map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className={labelCls}>対象選挙</label>
              <select className={inputCls} value={electionLevel} onChange={(e) => setElectionLevel(e.target.value as RegionLevel)}>
                {REGION_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>選挙区</label>
              <input className={inputCls} placeholder='例: 東京都第1区' value={district} onChange={(e) => setDistrict(e.target.value)} />
            </div>
          </div>

          <div className='mt-4'>
            <label className={labelCls}>立場</label>
            <div className='flex gap-2'>
              {([['incumbent', '現職'], ['newcomer', '新人']] as const).map(([v, l]) => (
                <button
                  key={v}
                  type='button'
                  onClick={() => setIncumbent(v)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    incumbent === v ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 経歴 */}
        <div className={cardCls}>
          <h2 className='mb-3 text-sm font-bold text-gray-900'>経歴</h2>
          <div className='space-y-3'>
            <div>
              <label className={labelCls}>学歴</label>
              <textarea rows={2} className={`${inputCls} resize-none`} value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>職歴</label>
              <textarea rows={2} className={`${inputCls} resize-none`} value={career} onChange={(e) => setCareer(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>政治歴</label>
              <textarea rows={2} className={`${inputCls} resize-none`} value={politicalCareer} onChange={(e) => setPoliticalCareer(e.target.value)} />
            </div>
          </div>
        </div>

        {/* 実績 */}
        <div className={cardCls}>
          <h2 className='mb-1 text-sm font-bold text-gray-900'>実績</h2>
          <p className='mb-3 text-xs text-gray-400'>議会質問・条例・提言・活動などを1件ずつ</p>
          <div className='space-y-2'>
            {achievements.map((a) => (
              <div key={a.id} className='flex gap-2'>
                <input className={`${inputCls} flex-1`} placeholder='例: 2025年 都議会で防災予算の拡充を提言' value={a.text} onChange={(e) => updateAchievement(a.id, e.target.value)} />
                <button type='button' onClick={() => removeAchievement(a.id)} className='shrink-0 rounded-lg px-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-rose-500' aria-label='削除'>✕</button>
              </div>
            ))}
          </div>
          <button type='button' onClick={addAchievement} className='mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700'>＋ 実績を追加</button>
        </div>

        {/* SNS・サイト */}
        <div className={cardCls}>
          <h2 className='mb-3 text-sm font-bold text-gray-900'>SNS・公式サイト</h2>
          <div className='grid grid-cols-2 gap-3'>
            <div><label className={labelCls}>X (Twitter)</label><input className={inputCls} placeholder='https://x.com/...' value={sns.x} onChange={(e) => setSns({ ...sns, x: e.target.value })} /></div>
            <div><label className={labelCls}>YouTube</label><input className={inputCls} placeholder='https://youtube.com/...' value={sns.youtube} onChange={(e) => setSns({ ...sns, youtube: e.target.value })} /></div>
            <div><label className={labelCls}>Instagram</label><input className={inputCls} placeholder='https://instagram.com/...' value={sns.instagram} onChange={(e) => setSns({ ...sns, instagram: e.target.value })} /></div>
            <div><label className={labelCls}>TikTok</label><input className={inputCls} placeholder='https://tiktok.com/...' value={sns.tiktok} onChange={(e) => setSns({ ...sns, tiktok: e.target.value })} /></div>
          </div>
          <div className='mt-3'>
            <label className={labelCls}>公式サイト</label>
            <input className={inputCls} placeholder='https://...' value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>
        </div>

        {/* 支援募集 */}
        <div className={cardCls}>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='text-sm font-bold text-gray-900'>寄付受付</h2>
              <p className='text-xs text-gray-400'>国民向けサイトに寄付ボタンを表示するか</p>
            </div>
            <button
              type='button'
              onClick={() => setAcceptDonation((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition-colors ${acceptDonation ? 'bg-indigo-600' : 'bg-gray-300'}`}
              aria-label='寄付受付切替'
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${acceptDonation ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <label className={labelCls}>募集する支援（お金以外も含む）</label>
          <div className='flex flex-wrap gap-2'>
            {SUPPORT_NEEDS.map((n) => {
              const active = supportNeeds.includes(n)
              return (
                <button key={n} type='button' onClick={() => toggleNeed(n)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}</button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 保存バー */}
      <div className='fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur'>
        <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3'>
          <div className='text-xs text-gray-500'>
            <span className='font-medium text-gray-700'>{kanjiName || '（氏名未入力）'}</span>
            <span className='mx-1.5'>·</span>
            完成度 {completeness}%
            <span className='mx-1.5'>·</span>
            {savedAt ? `最終保存 ${savedAt}` : '未保存'}
          </div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className='rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300'
          >
            プロフィールを保存
          </button>
        </div>
      </div>
    </div>
  )
}
