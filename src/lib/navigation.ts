// src/lib/navigation.ts
export function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
      // Update URL without reload
      window.history.pushState({}, '', `#${id}`)
    }
  }
  
  export function prefetchRoutes() {
    if (typeof window !== 'undefined') {
      // Prefetch main pages
      const links = ['/', '/blog', '/projects']
      links.forEach(href => {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = href
        document.head.appendChild(link)
      })
    }
  }