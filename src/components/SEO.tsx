interface SEOProps {
  title: string
  description: string
  image?: string
  url: string
}

export function generateSEOMeta({ title, description, image, url }: SEOProps) {
  return [
    { title },
    { name: 'description', content: description },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Snippyst' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:url', content: url },
    { name: 'keywords', content: 'Typst, Snippyst, Snippets, Sharing' },
    ...(image
      ? [
          { property: 'og:image', content: image },
          { name: 'twitter:image', content: image },
        ]
      : []),
  ]
}
