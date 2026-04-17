import { useEffect } from 'react'

interface HeadOptions {
  title: string
  description?: string
  canonical?: string
  noIndex?: boolean
}

/**
 * Lightweight per-route head manager.
 * Sets document.title + meta description + canonical + robots without a router dep.
 */
export function useDocumentHead({ title, description, canonical, noIndex }: HeadOptions) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title

    const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const setLink = (rel: string, href: string) => {
      let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
    }

    if (description) {
      setMeta('description', description)
      setMeta('og:description', description, 'property')
      setMeta('twitter:description', description)
    }

    setMeta('og:title', title, 'property')
    setMeta('twitter:title', title)

    if (canonical) {
      setLink('canonical', canonical)
      setMeta('og:url', canonical, 'property')
    }

    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')

    return () => {
      document.title = prevTitle
    }
  }, [title, description, canonical, noIndex])
}
