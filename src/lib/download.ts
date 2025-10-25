export const downloadSvg = async (imageUrl: string, title: string) => {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error('Failed to download image')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fallbackName = title || 'snippet'
  const sanitizedName = fallbackName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  link.href = url
  link.download = `${sanitizedName || 'snippet'}.svg`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadPng = async (imageUrl: string, title: string) => {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error('Failed to fetch image')
  }

  const svgText = await response.text()

  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
  const svgElement = svgDoc.querySelector('svg')

  if (!svgElement) {
    throw new Error('Invalid SVG')
  }

  let width = parseFloat(svgElement.getAttribute('width') || '0')
  let height = parseFloat(svgElement.getAttribute('height') || '0')

  if (!width || !height) {
    const viewBox = svgElement.getAttribute('viewBox')
    if (viewBox) {
      const viewBoxValues = viewBox.split(' ').map(Number)
      width = viewBoxValues[2]
      height = viewBoxValues[3]
    }
  }

  // Just a fallback. As the worker controlls the SVG this should never happen.
  if (!width || !height) {
    width = 1024
    height = 1024
  }

  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Failed to get canvas context')
  }

  const img = new Image()
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const svgUrl = URL.createObjectURL(svgBlob)

  await new Promise((resolve, reject) => {
    img.onload = () => {
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(svgUrl)
      resolve(null)
    }
    img.onerror = () => {
      URL.revokeObjectURL(svgUrl)
      reject(new Error('Failed to load SVG'))
    }
    img.src = svgUrl
  })

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create PNG blob'))
        }
      },
      'image/png',
      1.0,
    )
  })

  const url = URL.createObjectURL(pngBlob)
  const link = document.createElement('a')
  const fallbackName = title || 'snippet'
  const sanitizedName = fallbackName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  link.href = url
  link.download = `${sanitizedName || 'snippet'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
