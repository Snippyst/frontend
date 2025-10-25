import { Tag } from '@/types/tags'
import { Link } from '@tanstack/react-router'
import { BookMarked } from 'lucide-react'

export default function TagComp({ tag }: { tag: Tag }) {
  const calculatedColorsFromId = (id: string) => {
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash)
    }
    const hue = hash % 360
    const saturation = 70 + (hash % 30)
    const lightness = 50 + (hash % 20)
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const bgColor = calculatedColorsFromId(tag.id)

  return (
    <>
      {/* TODO fix this. Probablyneeds to be completley rewritten */}
      <Link to="/snippets" search={{ tags: [tag.id] }}>
        <div
          key={tag.id}
          style={{ backgroundColor: bgColor }}
          className="rounded px-2 py-1 text-xs hover:scale-101 transition-transform cursor-pointer h-full"
        >
          <div>{tag.name}</div>
          <div className="text-black/75">{tag.description}</div>
          <span className="inline-flex items-center gap-1 text-black/75 mt-1">
            <BookMarked size={14} /> {tag.numberOfSnippets ?? 0} Snippets
          </span>
        </div>
      </Link>
    </>
  )
}
