import { useMemo, useState } from 'react'

interface Package {
  namespace: string
  name: string
  version: string
}

export function usePackageDetection(code: string) {
  const [removedPackages, setRemovedPackages] = useState<Set<string>>(new Set())

  const detectedPackages = useMemo(() => {
    const packageRegex = /^[ \t]*#?import\s+"@([^/]+)\/([^:]+):([^"]+)"/gm
    const packages: Package[] = []
    const seen = new Set<string>()
    let match: RegExpExecArray | null

    while ((match = packageRegex.exec(code)) !== null) {
      const pkgKey = `${match[1]}/${match[2]}:${match[3]}`
      if (!removedPackages.has(pkgKey) && !seen.has(pkgKey)) {
        seen.add(pkgKey)
        packages.push({
          namespace: match[1],
          name: match[2],
          version: match[3],
        })
      }
    }

    return packages
  }, [code, removedPackages])

  const removePackage = (pkg: Package) => {
    const pkgKey = `${pkg.namespace}/${pkg.name}:${pkg.version}`
    setRemovedPackages((prev) => new Set(prev).add(pkgKey))
  }

  const clearRemovedPackages = () => {
    setRemovedPackages(new Set())
  }

  return {
    detectedPackages,
    removePackage,
    clearRemovedPackages,
  }
}
