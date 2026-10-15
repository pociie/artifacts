#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = argv[i + 1]
    if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`)
    args[key] = value
    i++
  }
  return args
}

async function walk(root, extensions, out = []) {
  for (const entry of await fs.readdir(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name)
    if (entry.isDirectory()) await walk(full, extensions, out)
    else if (extensions.some(ext => entry.name.endsWith(ext))) out.push(full)
  }
  return out
}

function compileMatcher(spec = {}) {
  const exact = new Set(spec.exact ?? [])
  const prefixes = spec.prefix ?? []
  const regexes = (spec.regex ?? []).map(pattern => new RegExp(pattern))
  return relativePath => exact.has(relativePath) || prefixes.some(prefix => relativePath.startsWith(prefix)) || regexes.some(regex => regex.test(relativePath))
}

function scriptKind(file) {
  if (file.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (file.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

export async function analyzeCodebase({ sourceRoot, config }) {
  const scanRoot = path.resolve(sourceRoot, config.sourceSubdirectory ?? '.')
  const extensions = config.includeExtensions ?? ['.ts', '.tsx']
  const files = await walk(scanRoot, extensions)
  const groups = (config.groups ?? []).map(group => ({ ...group, matches: compileMatcher(group.match) }))
  const fallbackGroup = config.fallbackGroup ?? 'other'
  const pressureMatchers = Object.fromEntries((config.lexicalPressures ?? []).map(item => [item.id, new RegExp(item.pattern, item.flags ?? 'i')]))
  const callCallees = new Map((config.callExpressions ?? []).map(item => [item.callee, item.id]))
  const textMatchers = (config.textOccurrences ?? []).map(item => ({ ...item, regex: new RegExp(item.pattern, item.flags ?? 'g') }))
  const groupIds = [...groups.map(group => group.id), fallbackGroup]
  const emptyPressure = () => Object.fromEntries(Object.keys(pressureMatchers).map(key => [key, 0]))
  const emptyCalls = () => Object.fromEntries([...callCallees.values()].map(id => [id, 0]))
  const emptyOccurrences = () => Object.fromEntries(textMatchers.map(item => [item.id, 0]))
  const emptySyntax = () => ({
    functions: 0,
    asyncFunctions: 0,
    generators: 0,
    asyncGenerators: 0,
    awaitExpressions: 0,
    yieldExpressions: 0,
  })
  const result = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceRoot: path.resolve(sourceRoot),
    scanRoot,
    total: { files: 0, lines: 0, bytes: 0, calls: emptyCalls(), occurrences: emptyOccurrences() },
    syntax: emptySyntax(),
    groups: Object.fromEntries(groupIds.map(id => [id, {
      files: 0,
      lines: 0,
      bytes: 0,
      commentLines: 0,
      pressure: emptyPressure(),
      calls: emptyCalls(),
      occurrences: emptyOccurrences(),
      syntax: emptySyntax(),
    }])),
    largestFiles: [],
  }
  const fileStats = []
  for (const file of files) {
    const relative = path.relative(scanRoot, file).split(path.sep).join('/')
    const groupId = groups.find(group => group.matches(relative))?.id ?? fallbackGroup
    const text = await fs.readFile(file, 'utf8')
    const lines = text.split('\n')
    const bytes = Buffer.byteLength(text)
    result.total.files++
    result.total.lines += lines.length - 1
    result.total.bytes += bytes
    result.groups[groupId].files++
    result.groups[groupId].lines += lines.length - 1
    result.groups[groupId].bytes += bytes
    fileStats.push({ path: relative, group: groupId, lines: lines.length - 1, bytes })
    for (const item of textMatchers) {
      const count = (text.match(item.regex) ?? []).length
      result.total.occurrences[item.id] += count
      result.groups[groupId].occurrences[item.id] += count
    }
    const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file))
    const visit = node => {
      const functionLike = ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node) || ts.isSetAccessorDeclaration(node) || ts.isConstructorDeclaration(node)
      if (functionLike) {
        const isAsync = node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.AsyncKeyword) ?? false
        const isGenerator = Boolean(node.asteriskToken)
        result.syntax.functions++
        result.groups[groupId].syntax.functions++
        if (isAsync) result.syntax.asyncFunctions++
        if (isAsync) result.groups[groupId].syntax.asyncFunctions++
        if (isGenerator) result.syntax.generators++
        if (isGenerator) result.groups[groupId].syntax.generators++
        if (isAsync && isGenerator) result.syntax.asyncGenerators++
        if (isAsync && isGenerator) result.groups[groupId].syntax.asyncGenerators++
      }
      if (ts.isAwaitExpression(node)) result.syntax.awaitExpressions++
      if (ts.isAwaitExpression(node)) result.groups[groupId].syntax.awaitExpressions++
      if (ts.isYieldExpression(node)) result.syntax.yieldExpressions++
      if (ts.isYieldExpression(node)) result.groups[groupId].syntax.yieldExpressions++
      if (ts.isCallExpression(node)) {
        const id = callCallees.get(node.expression.getText(sourceFile))
        if (id) {
          result.total.calls[id]++
          result.groups[groupId].calls[id]++
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
    for (const line of lines) {
      if (!/^\s*(\/\/|\/\*|\*|\*\/)/.test(line)) continue
      result.groups[groupId].commentLines++
      for (const [id, regex] of Object.entries(pressureMatchers)) if (regex.test(line)) result.groups[groupId].pressure[id]++
    }
  }
  result.largestFiles = fileStats.sort((a, b) => b.lines - a.lines).slice(0, config.largestFileLimit ?? 40)
  return result
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.source || !args.config || !args.output) {
    throw new Error('Usage: typescript-architecture-metrics.mjs --source <codebase> --config <json> --output <json>')
  }
  const config = JSON.parse(await fs.readFile(path.resolve(args.config), 'utf8'))
  const result = await analyzeCodebase({ sourceRoot: path.resolve(args.source), config })
  const output = path.resolve(args.output)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(result, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify({ output, files: result.total.files, lines: result.total.lines }, null, 2)}\n`)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) await main()
