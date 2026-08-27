import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { setAnalyticsUser, trackEvent } from '../lib/analytics'

const CLICKABLE_SELECTOR = 'a,button,[role="button"],input[type="submit"],input[type="button"]'
const SCROLL_MARKS = [25, 50, 75, 90]

function safeDestination(raw) {
  if (!raw) return ''
  try {
    const url = new URL(raw, window.location.origin)
    return url.origin === window.location.origin ? url.pathname : url.hostname
  } catch {
    return ''
  }
}

function elementIdentity(element) {
  const explicit = element.dataset.analyticsId
  if (explicit) return explicit
  if (element.id) return element.id
  if (element.getAttribute('name')) return element.getAttribute('name')
  const stableClass = [...element.classList].find(name =>
    !name.includes('--') && !['active', 'ativo', 'selected', 'open', 'disabled'].includes(name)
  )
  return stableClass || element.tagName.toLowerCase()
}

export default function AnalyticsTracker() {
  const location = useLocation()
  const { user, perfil } = useAuth()
  const scrollMarksRef = useRef(new Set())

  useEffect(() => {
    setAnalyticsUser(user, perfil)
  }, [user?.id, perfil?.tier])

  useEffect(() => {
    scrollMarksRef.current = new Set()
  }, [location.pathname, location.search])

  useEffect(() => {
    const handleClick = event => {
      const element = event.target.closest?.(CLICKABLE_SELECTOR)
      if (!element) return
      const href = element.getAttribute('href') || element.closest('a')?.getAttribute('href') || ''
      const destination = safeDestination(href)
      const isExternal = Boolean(href && destination && !href.startsWith('/') && !href.startsWith('#') && !href.startsWith(window.location.origin))

      trackEvent('ui_click', {
        element_type: element.tagName.toLowerCase(),
        element_id: elementIdentity(element),
        component: element.dataset.analyticsComponent || element.closest('[data-analytics-component]')?.dataset.analyticsComponent || 'page',
        destination,
        link_type: isExternal ? 'outbound' : href ? 'internal' : 'action',
        page_path: window.location.pathname,
      })
    }

    const handleSubmit = event => {
      const form = event.target
      trackEvent('form_submit', {
        form_id: form.dataset.analyticsId || form.id || form.getAttribute('name') || form.classList[0] || 'form',
        page_path: window.location.pathname,
      })
    }

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      if (scrollable <= 0) return
      const percent = Math.round((window.scrollY / scrollable) * 100)
      SCROLL_MARKS.forEach(mark => {
        if (percent >= mark && !scrollMarksRef.current.has(mark)) {
          scrollMarksRef.current.add(mark)
          trackEvent('scroll_depth', { percent_scrolled: mark, page_path: window.location.pathname })
        }
      })
    }

    document.addEventListener('click', handleClick, true)
    document.addEventListener('submit', handleSubmit, true)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('submit', handleSubmit, true)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}
