import { getTags } from '@/lib/api/tags'
import { Tag } from '@/types/tags'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import TagComp from '@/components/snippet/TagComp'
import { Container } from '@/components/ui/Container'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['tags'],
      queryFn: () => getTags({ page: 1, perPage: 100 }),
    })
  },
  component: App,
})

function App() {
  const { data: tagsData, isLoading: tagsLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => getTags({ page: 1, perPage: 100 }),
  })

  return (
    <div className="min-h-screen">
      <Container maxWidth="full">
        <section className="py-12 mb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
              Welcome to Snippyst
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Discover, share, and explore Typst snippets created by the community.
              Find ready-to-use code for your next document or contribute your own creations.
            </p>
            <Link
              to="/snippets"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              Browse All Snippets →
            </Link>
          </div>
        </section>

        <h2 className="text-2xl font-bold mb-4">Most popular tags</h2>
        <section className="py-4">
          {tagsLoading ? (
            <p className="text-text-secondary">Loading tags...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tagsData?.data.map((tag: Tag) => (
                <TagComp key={tag.id} tag={tag} />
              ))}
            </div>
          )}
        </section>
      </Container>
    </div>
  )
}
