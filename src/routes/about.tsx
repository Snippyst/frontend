import { createFileRoute } from '@tanstack/react-router'
import { Container } from '@/components/ui'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container className="py-8 px-4">
      <article className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Who's behind Snippyst?
            </h1>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              Hey,
            </p>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              My name is Finn Dittmar and I love Typst.{' '}
              <a
                href="https://dittmar-ldk.de"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 transition-colors"
              >
                dittmar-ldk.de
              </a>
            </p>

            <br />

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              JL710 introduced me to Typst and I instantly fell in love with the
              capabilities. Because I wanted to share, but also hope to find new
              snippets many people can reuse, I created Snippyst.
            </p>

            <br />

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              This platform is built with passion for the Typst community, to
              make it easier for everyone to discover, share, and collaborate on
              useful code snippets.
            </p>
          </div>
        </div>
      </article>
    </Container>
  )
}
