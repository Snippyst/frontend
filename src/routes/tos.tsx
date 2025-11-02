import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import tosContent from '@/lib/md/tos.md?raw'
import { Container } from '@/components/ui'

export const Route = createFileRoute('/tos')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Container className="py-8 px-4">
      <article className="max-w-4xl mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-4xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3"
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2"
                {...props}
              />
            ),
            h5: ({ node, ...props }) => (
              <h5
                className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2"
                {...props}
              />
            ),
            h6: ({ node, ...props }) => (
              <h6
                className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-7" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                {...props}
              />
            ),
            ul: ({ node, ...props }) => (
              <ul
                className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300"
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300"
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4 leading-7" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-blue-500 dark:border-blue-600 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-r"
                {...props}
              />
            ),
            code: ({ node, className, children, ...props }: any) => {
              const isInline = !className?.includes('language-')
              return isInline ? (
                <code
                  className="bg-gray-200 dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg overflow-x-auto font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              )
            },
            pre: ({ node, ...props }) => (
              <pre
                className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto my-4"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table
                  className="min-w-full border-collapse border border-gray-300 dark:border-gray-700"
                  {...props}
                />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
            ),
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => (
              <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-semibold text-gray-900 dark:text-gray-100"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-gray-700 dark:text-gray-300"
                {...props}
              />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-gray-900 dark:text-gray-100" {...props} />
            ),
            em: ({ node, ...props }) => <em className="italic" {...props} />,
          }}
        >
          {tosContent}
        </ReactMarkdown>
      </article>
    </Container>
  )
}
