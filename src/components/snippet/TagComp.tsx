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

    const saturation = 60 + (hash % 20)

    const lightness = 75 + (hash % 15)

    const h = hue / 360
    const s = saturation / 100
    const l = lightness / 100

    const hslToRgb = (h: number, s: number, l: number) => {
      let r, g, b
      if (s === 0) {
        r = g = b = l
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1
          if (t > 1) t -= 1
          if (t < 1 / 6) return p + (q - p) * 6 * t
          if (t < 1 / 2) return q
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
          return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
      }
      return [r * 255, g * 255, b * 255]
    }

    const [r, g, b] = hslToRgb(h, s, l)

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

    const isDarkText = luminance > 0.5

    return {
      bg: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      text: isDarkText ? 'text-gray-900' : 'text-white',
      textSecondary: isDarkText ? 'text-gray-700' : 'text-gray-200',
    }
  }

  const colors = calculatedColorsFromId(tag.id)

  return (
    <>
      <Link to="/snippets" search={{ tags: [tag.id] }}>
        <div
          key={tag.id}
          style={{ backgroundColor: colors.bg }}
          className={`rounded px-2 py-1 text-xs hover:scale-101 transition-transform cursor-pointer h-full ${colors.text}`}
        >
          <div className="font-medium">{tag.name}</div>
          <div className={colors.textSecondary}>{tag.description}</div>
          <span
            className={`inline-flex items-center gap-1 mt-1 ${colors.textSecondary}`}
          >
            <BookMarked size={14} /> {tag.numberOfSnippets ?? 0} Snippets
          </span>
        </div>
      </Link>
    </>
  )
}
