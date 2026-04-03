import { FaHome, FaLine, FaTiktok } from 'react-icons/fa'
import { FaFacebook, FaLinkedin, FaSquareInstagram, FaXTwitter, FaYoutube } from 'react-icons/fa6'

const sizeClass = 'h-7 w-7'

export const WEBSITE_ICONS: Record<string, React.ReactNode> = {
  homepage: <FaHome className={sizeClass} style={{ color: '#4b5563' }} />,
  facebook: <FaFacebook className={sizeClass} style={{ color: '#1877F2' }} />,
  twitter: <FaXTwitter className={sizeClass} style={{ color: '#000000' }} />,
  youtube: <FaYoutube className={sizeClass} style={{ color: '#FF0000' }} />,
  line: <FaLine className={sizeClass} style={{ color: '#00C300' }} />,
  instagram: <FaSquareInstagram className={sizeClass} style={{ color: '#E4405F' }} />,
  tiktok: <FaTiktok className={sizeClass} style={{ color: '#000000' }} />,
  linkedin: <FaLinkedin className={sizeClass} style={{ color: '#0A66C2' }} />,
}