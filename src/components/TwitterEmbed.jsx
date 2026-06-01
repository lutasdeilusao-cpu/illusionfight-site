import { useEffect, useRef } from 'react'

export default function TwitterEmbed({ tweetUrl }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = ''

    const blockquote = document.createElement('blockquote')
    blockquote.className = 'twitter-tweet'
    blockquote.setAttribute('data-theme', 'dark')
    blockquote.setAttribute('data-lang', 'pt')

    const anchor = document.createElement('a')
    anchor.href = tweetUrl
    blockquote.appendChild(anchor)
    ref.current.appendChild(blockquote)

    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(ref.current)
    } else {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    }
  }, [tweetUrl])

  return <div ref={ref} className="twitter-embed-container" />
}
