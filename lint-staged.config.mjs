export default {
  '*.go': 'gofmt -w',
  'web/default/**/*.{ts,tsx,js,mjs}': (files) => {
    const rel = files.map((f) => f.replace(/^web\/default\//, ''))
    if (rel.length === 0) return []
    return `cd web/default && bunx eslint --fix ${rel.map((f) => `"${f}"`).join(' ')}`
  },
  'web/default/**/*.{json,css,md}': (files) => {
    const rel = files.map((f) => f.replace(/^web\/default\//, ''))
    if (rel.length === 0) return []
    return `cd web/default && bunx prettier --write ${rel.map((f) => `"${f}"`).join(' ')}`
  },
}
