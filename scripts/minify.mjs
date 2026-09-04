// 对 tsc 产出的 dist/ 内所有 JS 做压缩（缩短标识符、去除空白），原地覆盖
// import 说明符（#config、#lib/*、裸包名）原样保留，由运行时解析
import { readdirSync } from 'node:fs'
import { build } from 'esbuild'

const files = readdirSync('dist', { recursive: true })
  .filter((f) => f.endsWith('.js'))
  .map((f) => `dist/${f}`)

if (files.length === 0) {
  console.error('dist/ 里没有 JS 文件，请先运行 tsc 编译')
  process.exit(1)
}

await build({
  entryPoints: files,
  outdir: 'dist',
  allowOverwrite: true,
  minify: true,
  format: 'esm',
  target: 'es2023'
})

console.log(`已压缩 ${files.length} 个文件`)
