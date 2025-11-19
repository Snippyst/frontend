import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import Header from '../components/Header'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import Footer from '@/components/Footer'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Snippyst - Typst Snippet Sharing Platform',
      },
      {
        name: 'description',
        content:
          'Share, discover, and explore Typst code snippets. A community-driven platform for Typst developers to share reusable code.',
      },
    ],
    links: [
      {
        rel: 'preload',
        href: appCss,
        as: 'style',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50 dark:bg-slate-900">
        <Header />
        <main className="bg-linear-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-900 dark:via-slate-900/97 dark:to-slate-900 min-h-[calc(100vh-4rem)] text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto p-4">{children}</div>
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
