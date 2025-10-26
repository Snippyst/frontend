import { createFileRoute } from '@tanstack/react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import privacyContent from '@/lib/md/privacy.md?raw'
import { Container } from '@/components/ui'

export const Route = createFileRoute('/privacy')({
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
                className="text-4xl font-bold text-text-primary mt-8 mb-4"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-3xl font-bold text-text-primary mt-8 mb-4"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className="text-2xl font-semibold text-text-primary mt-6 mb-3"
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className="text-xl font-semibold text-text-primary mt-4 mb-2"
                {...props}
              />
            ),
            h5: ({ node, ...props }) => (
              <h5
                className="text-lg font-semibold text-text-primary mt-4 mb-2"
                {...props}
              />
            ),
            h6: ({ node, ...props }) => (
              <h6
                className="text-base font-semibold text-text-primary mt-4 mb-2"
                {...props}
              />
            ),
            p: ({ node, ...props }) => (
              <p className="text-text-secondary mb-4 leading-7" {...props} />
            ),
            a: ({ node, ...props }) => (
              <a
                className="text-primary-400 hover:text-primary-300 underline transition-colors"
                {...props}
              />
            ),
            ul: ({ node, ...props }) => (
              <ul
                className="list-disc list-inside mb-4 space-y-2 text-text-secondary"
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className="list-decimal list-inside mb-4 space-y-2 text-text-secondary"
                {...props}
              />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4 leading-7" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-muted bg-bg-secondary rounded-r"
                {...props}
              />
            ),
            code: ({ node, className, children, ...props }: any) => {
              const isInline = !className?.includes('language-')
              return isInline ? (
                <code
                  className="bg-bg-secondary text-primary-300 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <code
                  className="block bg-bg-secondary text-text-secondary p-4 rounded-lg overflow-x-auto font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              )
            },
            pre: ({ node, ...props }) => (
              <pre
                className="bg-bg-secondary rounded-lg overflow-x-auto my-4"
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-6">
                <table
                  className="min-w-full border-collapse border border-border-primary"
                  {...props}
                />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-bg-secondary" {...props} />
            ),
            tbody: ({ node, ...props }) => <tbody {...props} />,
            tr: ({ node, ...props }) => (
              <tr className="border-b border-border-primary" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-border-primary px-4 py-2 text-left font-semibold text-text-primary"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className="border border-border-primary px-4 py-2 text-text-secondary"
                {...props}
              />
            ),
            hr: ({ node, ...props }) => (
              <hr className="my-8 border-border-primary" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-text-primary" {...props} />
            ),
            em: ({ node, ...props }) => <em className="italic" {...props} />,
          }}
        >
          {privacyContent}
        </ReactMarkdown>
      </article>
    </Container>
  )
}
