import { createFileRoute } from '@tanstack/react-router'

let cachedSitemap: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 3600000

export const Route = createFileRoute('/sitemap_snippets.xml')({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = 'https://snippyst.com'
        const apiBaseUrl = 'http://app:443/v1'

        try {
          const now = Date.now()
          if (cachedSitemap && now - cacheTimestamp < CACHE_DURATION) {
            return new Response(cachedSitemap, {
              headers: {
                'Content-Type': 'application/xml; charset=utf-8',
                'Cache-Control': 'public, max-age=3600',
                'X-Cache': 'HIT',
              },
            })
          }

          const response = await fetch(`${apiBaseUrl}/snippets/sitemap`)

          if (!response.ok) {
            throw new Error('Failed to fetch snippets from API')
          }

          const snippets = await response.json()

          const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${snippets
  .map((snippet: any) => {
    const loc = `${baseUrl}/snippets/${snippet.id}`
    const lastmod = snippet.lastUpdatedAt.split('T')[0]
    const changefreq = 'monthly'
    const priority = '0.8'
    const svgImage = snippet.image
    const previewImage = `${snippet.image}/preview`

    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <image:image>
      <image:loc>${previewImage}</image:loc>
    </image:image>
    <image:image>
      <image:loc>${svgImage}</image:loc>
    </image:image>
  </url>`
  })
  .join('\n')}
</urlset>`

          cachedSitemap = sitemap
          cacheTimestamp = now

          return new Response(sitemap, {
            headers: {
              'Content-Type': 'application/xml; charset=utf-8',
              'Cache-Control': 'public, max-age=3600',
              'X-Cache': 'MISS',
            },
          })
        } catch (error) {
          console.error('Error generating sitemap:', error)
          return new Response('Error generating sitemap', { status: 500 })
        }
      },
    },
  },
})

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
