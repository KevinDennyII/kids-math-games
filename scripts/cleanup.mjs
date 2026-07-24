#!/usr/bin/env node
/**
 * Cleanup script for kids-math-games
 * Inspired by Joy of React practices + Responsive Typography tokens.
 *
 * Usage: npm run clean
 */
import { existsSync, rmSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()

const DEAD_PATHS = [
  'src/assets/hero.png',
  'public/icons.svg',
  'dist',
  'dist-ssr',
  'node_modules/.vite',
  'node_modules/.tmp',
]

function removePath(rel) {
  const full = join(root, rel)
  if (!existsSync(full)) {
    console.log(`  skip  ${rel}`)
    return
  }
  rmSync(full, { recursive: true, force: true })
  console.log(`  removed ${rel}`)
}

function listEmptyDirs(dir, found = []) {
  if (!existsSync(dir)) return found
  const entries = readdirSync(dir)
  if (entries.length === 0) {
    found.push(dir)
    return found
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === '.git') continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) listEmptyDirs(full, found)
  }
  return found
}

console.log('\n🧹 kids-math-games cleanup\n')

console.log('1) Removing dead / generated paths')
for (const p of DEAD_PATHS) removePath(p)

console.log('\n2) Removing empty src asset dirs (if empty)')
const empty = listEmptyDirs(join(root, 'src')).filter((d) =>
  relative(root, d).startsWith('src/assets'),
)
for (const d of empty) {
  rmSync(d, { recursive: true, force: true })
  console.log(`  removed ${relative(root, d)}`)
}
if (empty.length === 0) console.log('  none')

console.log('\n3) Running lint')
const lint = spawnSync('npm', ['run', 'lint'], { stdio: 'inherit' })
if (lint.status !== 0) {
  console.error('\nLint failed — fix issues before deploy.')
  process.exit(lint.status ?? 1)
}

console.log('\n4) Running tests')
const test = spawnSync('npm', ['run', 'test'], { stdio: 'inherit' })
if (test.status !== 0) {
  console.error('\nTests failed — fix issues before deploy.')
  process.exit(test.status ?? 1)
}

console.log('\n5) Production build check')
const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' })
if (build.status !== 0) {
  console.error('\nBuild failed — fix issues before deploy.')
  process.exit(build.status ?? 1)
}

console.log(`
✅ Cleanup complete. Ready for Netlify.

Deploy:
  • Push to GitHub, then "Add new site" → import repo in Netlify
  • Or: npx netlify deploy --prod

Build settings (already in netlify.toml):
  command: npm run build
  publish: dist
`)
