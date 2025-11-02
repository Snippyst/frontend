'use client'

import { useEffect, useRef, useState } from 'react'
import type { TypstCompiler, TypstRenderer } from '@myriaddreamin/typst.ts'
import { useContentZoom } from '@/hooks/useContentZoom'
import { CompileFormatEnum } from '@myriaddreamin/typst.ts/compiler'

let createTypstCompiler: any
let createTypstRenderer: any
let FetchAccessModel: any
let preloadRemoteFonts: any
let compilerWasm: string
let rendererWasm: string

interface TypstPreviewProps {
  code: string
  className?: string
}

export function TypstPreview({ code, className = '' }: TypstPreviewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [compiler, setCompiler] = useState<TypstCompiler | null>(null)
  const [renderer, setRenderer] = useState<TypstRenderer | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)

  const {
    scale,
    position,
    isDragging,
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useContentZoom()

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined')
  }, [])

  useEffect(() => {
    if (!isBrowser) return

    let isMounted = true

    const initializeTypst = async () => {
      try {
        const typstModule = await import('@myriaddreamin/typst.ts')
        createTypstCompiler = typstModule.createTypstCompiler
        createTypstRenderer = typstModule.createTypstRenderer
        FetchAccessModel = typstModule.FetchAccessModel
        preloadRemoteFonts = typstModule.preloadRemoteFonts

        const { withAccessModel, withPackageRegistry } = typstModule.initOptions
        const { MemoryAccessModel } = typstModule
        const { FetchPackageRegistry } = typstModule

        const compilerWasmModule = await import(
          '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url'
        )
        compilerWasm = compilerWasmModule.default

        const rendererWasmModule = await import(
          '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url'
        )
        rendererWasm = rendererWasmModule.default

        const memoryAccessModel = new MemoryAccessModel()
        const comp = createTypstCompiler()
        await comp.init({
          beforeBuild: [
            withAccessModel(memoryAccessModel),
            withPackageRegistry(new FetchPackageRegistry(memoryAccessModel)),
          ],
          getModule: () => compilerWasm,
        })

        const rend = createTypstRenderer()
        await rend.init({
          beforeBuild: [],
          getModule: () => rendererWasm,
        })

        if (isMounted) {
          setCompiler(comp)
          setRenderer(rend)
          setIsInitialized(true)
        }
      } catch (err) {
        console.error('Failed to initialize Typst:', err)
        if (isMounted) {
          setError('Failed to initialize Typst compiler and renderer')
        }
      }
    }

    initializeTypst()

    return () => {
      isMounted = false
    }
  }, [isBrowser])

  useEffect(() => {
    if (
      !isInitialized ||
      !compiler ||
      !renderer ||
      !svgContainerRef.current ||
      !code.trim()
    ) {
      return
    }

    const hasPageSetup = /^\s*#set\s+page\s*\(/.test(code)
    const finalContent = hasPageSetup
      ? code
      : `#set page(width: auto, height: auto, margin: 10pt)\n${code}`

    const compileAndRender = async () => {
      setIsCompiling(true)
      setError(null)

      try {
        compiler.addSource('/main.typ', finalContent)

        const result = await compiler.compile({
          mainFilePath: '/main.typ',
          format: CompileFormatEnum.vector,
        })

        if (!result.result) {
          throw new Error('Compilation failed: no result')
        }

        if (result.diagnostics && result.diagnostics.length > 0) {
          const errorDiags = result.diagnostics.filter(
            (d: any) => d.severity === 'error',
          )
          if (errorDiags.length > 0) {
            setError(
              `Compilation errors: ${errorDiags.map((d: any) => d.message).join(', ')}`,
            )
          }
        }

        const svg = await renderer.runWithSession(async (session) => {
          renderer.manipulateData({
            renderSession: session,
            action: 'reset',
            data: result.result!,
          })
          return renderer.renderSvg({
            renderSession: session,
          })
        })

        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svg
        }
      } catch (err) {
        console.error('Compilation/rendering error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsCompiling(false)
      }
    }

    const timeoutId = setTimeout(() => {
      compileAndRender()
    }, 500)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [code, isInitialized, compiler, renderer])

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {!isBrowser && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-gray-600">Loading preview...</p>
          </div>
        </div>
      )}

      {isBrowser && !isInitialized && (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-600">
              Initializing Typst compiler. This may take a moment...
            </p>
          </div>
        </div>
      )}

      {isInitialized && (
        <>
          {isCompiling && (
            <div className="border-b border-gray-300 bg-blue-50 px-4 py-2">
              <p className="text-sm text-blue-700">Compiling...</p>
            </div>
          )}

          {error && (
            <div className="border-b border-red-300 bg-red-50 px-4 py-2">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div
            ref={containerRef}
            className="flex-1 overflow-hidden bg-white relative"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              minHeight: '100%',
              touchAction: 'none',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="inline-block p-4"
            >
              <div ref={svgContainerRef} style={{ pointerEvents: 'none' }} />
            </div>
          </div>
        </>
      )}

      {!isInitialized && isBrowser && (
        <div
          ref={containerRef}
          className="flex-1 overflow-auto p-4 bg-white"
          style={{ minHeight: '100%' }}
        />
      )}
    </div>
  )
}
