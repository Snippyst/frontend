import { Package, X } from 'lucide-react'

interface PackageItem {
  namespace: string
  name: string
  version: string
}

interface PackagesListProps {
  packages: PackageItem[]
  onRemovePackage: (pkg: PackageItem) => void
}

export function PackagesList({ packages, onRemovePackage }: PackagesListProps) {
  if (packages.length === 0) {
    return null
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Detected Packages
      </h3>
      <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
        Automatically extracted from import statements
      </p>
      <div className="flex flex-wrap gap-2">
        {packages.map((pkg, index) => (
          <div
            key={index}
            className="group flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
          >
            <Package className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
              @{pkg.namespace}/{pkg.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              v{pkg.version}
            </span>
            <button
              type="button"
              onClick={() => onRemovePackage(pkg)}
              className="ml-1 rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
              title="Remove this package"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
