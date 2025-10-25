import { Link } from '@tanstack/react-router'

export default function Footer() {
  return (
    <>
      <footer className="p-4 bg-gray-900 text-white shadow-lg text-sm">
        <div className="max-w-4xl w-full mx-auto">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <h1 className="text-xl font-semibold">
              <Link to="/">Snippyst</Link>
            </h1>
            <div className="text-xs text-gray-400 md:hidden">
              Snippyst is not affiliated with Typst
            </div>
          </div>

          <div className="hidden md:flex items-center justify-between">
            <div className="text-xs text-gray-400 flex-1">
              Snippyst is not affiliated with Typst
            </div>
            <nav className="flex space-x-4 flex-1 justify-end">
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link to="/tos" className="hover:underline">
                Terms of Service
              </Link>
              <a
                href="https://dittmar-ldk.de/about/impressum"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Imprint
              </a>
            </nav>
          </div>

          <nav className="md:hidden flex flex-col space-y-2 mt-4 text-xs">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/tos" className="hover:underline">
              Terms of Service
            </Link>
            <a
              href="https://dittmar-ldk.de/about/impressum"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Imprint
            </a>
          </nav>
        </div>
      </footer>
    </>
  )
}
