import { Info } from 'lucide-react'
import { AVAILABLE_TYPST_VERSIONS } from '../../../lib/constants/versions'

interface VersionSelectorProps {
  selectedVersions: string[]
  onChange: (versions: string[]) => void
}

export function VersionSelector({
  selectedVersions,
  onChange,
}: VersionSelectorProps) {
  const handleVersionToggle = (version: string) => {
    if (selectedVersions.includes(version)) {
      if (selectedVersions.length > 1) {
        onChange(selectedVersions.filter((v) => v !== version))
      }
    } else {
      onChange([...selectedVersions, version])
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        Typst Versions
      </h2>
      <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
        Select one or more Typst versions to validate your snippet against. At
        least one version must be selected. The selected version is not
        reflected in the editor. The preview renders with the latest available
        version of Typst. If your snippet only works with an older version, you
        may submit it with compilation errors.
      </p>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_TYPST_VERSIONS.map((version) => {
          const isSelected = selectedVersions.includes(version)
          const isDisabled = selectedVersions.length === 1 && isSelected

          return (
            <button
              key={version}
              type="button"
              onClick={() => handleVersionToggle(version)}
              disabled={isDisabled}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              } ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              title={isDisabled ? 'At least one version must be selected' : ''}
            >
              {version}
            </button>
          )
        })}
      </div>
      {selectedVersions.length > 1 && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span className="text-xs text-blue-700 dark:text-blue-300">
              Selecting multiple versions will increase validation time as your
              snippet will be checked against each version.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
