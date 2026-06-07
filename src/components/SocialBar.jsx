import './SocialBar.css'

const SOCIAL_LINKS = [
  {
    label: 'X (Twitter)',
    href: 'https://x.com/IllusionFightIF',
    path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@illusionfight',
    path: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.562 9.08a4.81 4.81 0 0 1-2.92-1.02v4.69a4.69 4.69 0 1 1-4.01-4.63v2.6a2.13 2.13 0 1 0 1.77 2.08V5.21h2.56a4.77 4.77 0 0 0 2.6 3.87z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@illusionfightIF',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
]

export default function SocialBar({ size = 'medium' }) {
  return (
    <div className={`social-bar social-bar--${size}`}>
      {SOCIAL_LINKS.map(s => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className="social-bar__link"
          aria-label={s.label}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={s.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}
