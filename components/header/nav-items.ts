import type { IconType } from 'react-icons'
import { FaListUl, FaUser } from 'react-icons/fa'
import { FaListCheck } from 'react-icons/fa6'
import { HiOutlineBookOpen } from 'react-icons/hi'
import { MdPolicy } from 'react-icons/md'
import { RiInformation2Line, RiLogoutCircleRLine, RiMessage3Line, RiRobot2Line } from 'react-icons/ri'

export type NavItem = {
  href: string
  label: string
  icon: IconType
}

export type NavGroup = {
  label: string
  icon: IconType
  subItems: NavItem[]
}

export type NavEntry = NavItem | NavGroup

export const isNavGroup = (entry: NavEntry): entry is NavGroup =>
  'subItems' in entry

export const navItems: NavEntry[] = [
  { href: '/ai-chat', label: 'AIチャット', icon: RiRobot2Line },
  {
    label: '衆議院議員選挙',
    icon: FaListCheck,
    subItems: [
      { href: '/politicians', label: '第51回政治家一覧', icon: FaListUl },
      { href: '/candidates/district', label: '第51回小選挙区', icon: FaListCheck },
      { href: '/candidates/proportion', label: '第51回比例代表', icon: FaListCheck },
    ],
  },
  { href: '/messages', label: 'メッセージ', icon: RiMessage3Line },
  {
    label: '情報',
    icon: RiInformation2Line,
    subItems: [
      { href: '/profile', label: 'プロフィール', icon: FaUser },
      { href: '/policy-stance', label: '政策スタンス', icon: MdPolicy },
      { href: '/support-resource', label: '支援リソース', icon: HiOutlineBookOpen },
    ],
  },
  { href: '/logout', label: 'ログアウト', icon: RiLogoutCircleRLine },
]
