import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@/components/ui'
import { MessageSquare, Mail } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container className="py-8 px-4">
      <article className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Support
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              If you need support or have requests such as higher computation
              time, just ask here.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="shrink-0">
                  <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Discord
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    You can directly contact me on Discord via DM{' '}
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">
                      @vito0912
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Just write me a DM. You can do that if you are on the
                    official Typst Discord server.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="shrink-0">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Email
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    You can also write an email to
                  </p>
                  <a
                    href="mailto:contact@snippyst.com"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline underline-offset-4 transition-colors"
                  >
                    contact@snippyst.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Container>
  )
}
