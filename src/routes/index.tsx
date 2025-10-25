import { getTags } from '@/lib/api/tags'
import { Tag } from '@/types/tags'
import { createFileRoute } from '@tanstack/react-router'
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
