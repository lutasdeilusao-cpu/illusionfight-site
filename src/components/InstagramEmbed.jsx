import { useEffect, useRef } from 'react'

export default function InstagramEmbed({ embedUrl }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = ''

    const postId = embedUrl.replace('/embed', '').replace(/\/+$/, '')
    const blockquote = document.createElement('blockquote')
    blockquote.className = 'instagram-media'
    blockquote.setAttribute('data-instgrm-captioned', '')
    blockquote.setAttribute('data-instgrm-permalink', postId)
    blockquote.setAttribute('data-instgrm-version', '14')

    const anchor = document.createElement('a')
    anchor.href = postId
    blockquote.appendChild(anchor)
    ref.current.appendChild(blockquote)

    if (window.instgrm) {
      window.instgrm.Embeds.process()
    } else {
      const script = document.createElement('script')
      script.src = '//www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
    }
  }, [embedUrl])

  return <div ref={ref} className="instagram-embed-container" />
}
