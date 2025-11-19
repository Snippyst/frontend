interface SEOProps {
  title: string
  description: string
  image?: string
  url: string
  type?: 'website' | 'article'
  author?: string
  tags?: string[]
  datePublished?: string
  dateModified?: string
  noindex?: boolean
}

export function generateSEOMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  author,
  tags,
  datePublished,
  dateModified,
  noindex = false,
}: SEOProps) {
  const meta = [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: 'Snippyst' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:url', content: url },
    {
      name: 'keywords',
      content: tags?.length
        ? `Typst, Snippyst, Snippets, ${tags.join(', ')}`
        : 'Typst, Snippyst, Snippets, Sharing',
    },
  ]

  if (noindex) {
    meta.push({ name: 'robots', content: 'noindex, nofollow' })
  }

  if (image) {
    meta.push(
      { property: 'og:image', content: image },
      { property: 'og:image:secure_url', content: image },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:alt', content: title },
      { name: 'twitter:image', content: image },
      { name: 'twitter:image:alt', content: title },
    )
  }

  if (type === 'article') {
    if (datePublished) {
      meta.push({
        property: 'article:published_time',
        content: datePublished,
      })
    }
    if (dateModified) {
      meta.push({ property: 'article:modified_time', content: dateModified })
    }
    if (author) {
      meta.push({ property: 'article:author', content: author })
    }
    if (tags?.length) {
      tags.forEach((tag) => {
        meta.push({ property: 'article:tag', content: tag })
      })
    }
  }

  return meta
}

export function generateStructuredData(snippet: {
  id: string
  title: string
  description?: string
  image?: string
  author?: string
  createdBy?: string
  createdAt: string
  updatedAt?: string
  tags?: Array<{ name: string }>
  code?: string
}) {
  const baseUrl = 'https://snippyst.com'
  const snippetUrl = `${baseUrl}/snippets/${snippet.id}`
  const imageUrl = snippet.image ? `${snippet.image}/preview` : undefined

  const codeSnippetData = {
    '@context': 'https://schema.org',
    '@type': 'Code',
    name: snippet.title,
    description:
      snippet.description ||
      `A Typst snippet: ${snippet.title}${snippet.tags?.length ? `. Tags: ${snippet.tags.map((t) => t.name).join(', ')}` : ''}`,
    url: snippetUrl,
    datePublished: snippet.createdAt,
    dateModified: snippet.updatedAt || snippet.createdAt,
    author: {
      '@type': 'Person',
      name: snippet.author || snippet.createdBy || 'Unknown',
    },
    creator: {
      '@type': 'Person',
      name: snippet.createdBy || 'Unknown',
    },
    programmingLanguage: {
      '@type': 'ComputerLanguage',
      name: 'Typst',
      url: 'https://typst.app',
    },
    ...(snippet.code && { codeValue: snippet.code }),
    ...(imageUrl && { image: imageUrl }),
    ...(snippet.tags?.length && {
      keywords: snippet.tags.map((t) => t.name).join(', '),
    }),
  }

  const imageData = imageUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: imageUrl,
        url: imageUrl,
        name: snippet.title,
        description: `Preview image for ${snippet.title}`,
        encodingFormat: 'image/png',
        author: {
          '@type': 'Person',
          name: snippet.author || 'Unknown',
        },
        creator: {
          '@type': 'Person',
          name: snippet.createdBy || 'Unknown',
        },
        copyrightNotice: `© ${snippet.createdBy || 'Snippyst'}`,
        creditText: snippet.createdBy || 'Snippyst',
        acquireLicensePage: `${baseUrl}/tos`,
        license: `${baseUrl}/tos`,
      }
    : null

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Snippets',
        item: `${baseUrl}/snippets`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: snippet.title,
        item: snippetUrl,
      },
    ],
  }

  const structuredData: any[] = [codeSnippetData, breadcrumbData]
  if (imageData) {
    structuredData.push(imageData)
  }

  return {
    tag: 'script',
    attrs: {
      type: 'application/ld+json',
    },
    children: JSON.stringify(structuredData),
  }
}
