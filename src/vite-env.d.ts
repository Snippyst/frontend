/// <reference types="vite/client" />

declare module '*.wasm?url' {
  const content: string
  export default content
}

declare module '@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm?url' {
  const content: string
  export default content
}

declare module '@myriaddreamin/typst-ts-renderer/pkg/typst_ts_renderer_bg.wasm?url' {
  const content: string
  export default content
}
